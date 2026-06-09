using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Order;

namespace Restaurant.BusinessLayer.Structure;

public class OrderService : IOrderService
{
    private readonly DbSession _session;

    public OrderService(DbSession session)
    {
        _session = session;
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _session.Orders.GetAllWithDetailsAsync();
        return orders.Select(MapOrder);
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByClientAsync(int clientId)
    {
        var orders = await _session.Orders.GetByClientIdWithDetailsAsync(clientId);
        return orders.Select(MapOrder);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var o = await _session.Orders.GetByIdWithDetailsAsync(id);
        return o == null ? null : MapOrder(o);
    }

    public async Task<OrderDto> CreateClientOrderAsync(int clientId, CreateOrderDto dto)
    {
        return await CreateOrderInternalAsync(clientId, null, dto);
    }

    public async Task<OrderDto> CreateWaiterOrderAsync(int waiterId, CreateOrderDto dto)
    {
        return await CreateOrderInternalAsync(null, waiterId, dto);
    }

    private async Task<OrderDto> CreateOrderInternalAsync(int? clientId, int? waiterId, CreateOrderDto dto)
    {
        var orderType = ParseOrderType(dto.OrderType);
        var tableId = orderType == OrderType.DineIn ? dto.TableId : null;

        if (dto.Items.Count == 0)
        {
            throw new ArgumentException("Order must contain at least one item.");
        }

        if (orderType == OrderType.Delivery && string.IsNullOrWhiteSpace(dto.DeliveryAddress))
        {
            throw new ArgumentException("Delivery address is required for delivery orders.");
        }

        Table? table = null;
        if (orderType == OrderType.DineIn)
        {
            if (!tableId.HasValue)
            {
                throw new ArgumentException("Please select a table for dine-in orders.");
            }

            table = await _session.Tables.GetByIdAsync(tableId.Value);
            if (table == null)
            {
                throw new ArgumentException("Selected table does not exist.");
            }

            if (table.IsOccupied)
            {
                throw new ArgumentException("Selected table is already occupied.");
            }

            await ValidateTableReservationAccessAsync(table.Id, clientId, waiterId);
        }

        var order = new Order
        {
            CreatedAt = DateTime.UtcNow,
            Status = OrderStatus.Pending,
            OrderType = orderType,
            DeliveryAddress = orderType == OrderType.Delivery ? dto.DeliveryAddress?.Trim() : null,
            ClientId = clientId,
            WaiterId = waiterId,
            TableId = tableId,
            IsPaid = false,
            TotalAmount = 0
        };

        foreach (var itemDto in dto.Items.GroupBy(item => item.ProductId))
        {
            var quantity = itemDto.Sum(item => item.Quantity);
            if (quantity <= 0)
            {
                throw new ArgumentException("Quantity must be at least 1.");
            }

            var product = await _session.Products.GetByIdAsync(itemDto.Key);
            if (product == null)
            {
                throw new ArgumentException($"Product with id {itemDto.Key} was not found.");
            }

            var item = new OrderItem
            {
                ProductId = product.Id,
                Quantity = quantity,
                UnitPrice = product.Price
            };

            order.OrderItems.Add(item);
            order.TotalAmount += item.Quantity * item.UnitPrice;
        }

        if (order.OrderItems.Count == 0 || order.TotalAmount <= 0)
        {
            throw new ArgumentException("Order must contain valid products.");
        }

        await _session.Orders.AddAsync(order);

        if (table != null)
        {
            table.IsOccupied = true;
            _session.Tables.Update(table);
        }

        await _session.SaveChangesAsync();

        var createdOrder = await _session.Orders.GetByIdWithDetailsAsync(order.Id);
        return MapOrder(createdOrder!);
    }

    public async Task UpdateOrderStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        var o = await _session.Orders.GetByIdAsync(id);
        if (o == null)
        {
            throw new ArgumentException("Order was not found.");
        }

        var nextStatus = ParseOrderStatus(dto.Status);
        ValidateStatusTransition(o.Status, nextStatus);
        o.Status = nextStatus;

        if (nextStatus == OrderStatus.Closed)
        {
            o.IsPaid = true;
        }

        if ((nextStatus == OrderStatus.Cancelled || nextStatus == OrderStatus.Closed) && o.TableId.HasValue)
        {
            var table = await _session.Tables.GetByIdAsync(o.TableId.Value);
            if (table != null)
            {
                table.IsOccupied = false;
                _session.Tables.Update(table);
            }
        }

        _session.Orders.Update(o);
        await _session.SaveChangesAsync();
    }

    public async Task UpdateOrderPaymentAsync(int id, bool isPaid)
    {
        var o = await _session.Orders.GetByIdAsync(id);
        if (o == null)
        {
            throw new ArgumentException("Order was not found.");
        }

        o.IsPaid = isPaid;
        if (isPaid)
        {
            o.Status = OrderStatus.Closed;
        }

        _session.Orders.Update(o);

        if (isPaid && o.TableId.HasValue)
        {
            var table = await _session.Tables.GetByIdAsync(o.TableId.Value);
            if (table != null)
            {
                table.IsOccupied = false;
                _session.Tables.Update(table);
            }
        }

        await _session.SaveChangesAsync();
    }

    private static OrderType ParseOrderType(string? value)
    {
        var normalized = (value ?? "Delivery").Trim().ToLowerInvariant();
        return normalized switch
        {
            "delivery" => OrderType.Delivery,
            "takeaway" => OrderType.Takeaway,
            "take-away" => OrderType.Takeaway,
            "dinein" => OrderType.DineIn,
            "dine-in" => OrderType.DineIn,
            "dine_in" => OrderType.DineIn,
            _ => throw new ArgumentException("Invalid order type.")
        };
    }

    private static OrderStatus ParseOrderStatus(string? value)
    {
        var normalized = (value ?? string.Empty).Trim().ToLowerInvariant().Replace("_", string.Empty).Replace("-", string.Empty).Replace(" ", string.Empty);
        return normalized switch
        {
            "pending" => OrderStatus.Pending,
            "draft" => OrderStatus.Pending,
            "confirmed" => OrderStatus.SentToKitchen,
            "sent" => OrderStatus.SentToKitchen,
            "senttokitchen" => OrderStatus.SentToKitchen,
            "preparing" => OrderStatus.Preparing,
            "inpreparation" => OrderStatus.Preparing,
            "ready" => OrderStatus.Ready,
            "delivered" => OrderStatus.Delivered,
            "cancelled" => OrderStatus.Cancelled,
            "canceled" => OrderStatus.Cancelled,
            "closed" => OrderStatus.Closed,
            "paid" => OrderStatus.Closed,
            _ => throw new ArgumentException("Invalid order status.")
        };
    }

    private static void ValidateStatusTransition(OrderStatus currentStatus, OrderStatus nextStatus)
    {
        if (currentStatus == nextStatus)
        {
            return;
        }

        if (currentStatus == OrderStatus.Closed || currentStatus == OrderStatus.Cancelled)
        {
            throw new InvalidOperationException("Closed or cancelled orders cannot be updated.");
        }

        var isValid = (currentStatus, nextStatus) switch
        {
            (OrderStatus.Pending, OrderStatus.SentToKitchen) => true,
            (OrderStatus.SentToKitchen, OrderStatus.Preparing) => true,
            (OrderStatus.Preparing, OrderStatus.Ready) => true,
            (OrderStatus.Ready, OrderStatus.Delivered) => true,
            (OrderStatus.Delivered, OrderStatus.Closed) => true,
            (_, OrderStatus.Cancelled) => true,
            (_, OrderStatus.Closed) => true,
            _ => false
        };

        if (!isValid)
        {
            throw new InvalidOperationException($"Order status cannot change from {currentStatus} to {nextStatus}.");
        }
    }

    private async Task ValidateTableReservationAccessAsync(int tableId, int? clientId, int? waiterId)
    {
        var now = DateTime.UtcNow;
        var windowStart = now.AddHours(-2);
        var windowEnd = now.AddHours(2);

        var activeReservation = await _session.Context.Set<Reservation>()
            .Where(r =>
                r.TableId == tableId &&
                (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                r.ReservationDate > windowStart &&
                r.ReservationDate < windowEnd)
            .OrderBy(r => r.ReservationDate)
            .FirstOrDefaultAsync();

        if (activeReservation == null || waiterId.HasValue)
        {
            return;
        }

        if (!clientId.HasValue || activeReservation.ClientId != clientId.Value)
        {
            throw new ArgumentException("Selected table is reserved for another customer.");
        }
    }

    private static OrderDto MapOrder(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            Status = order.Status.ToString(),
            OrderType = order.OrderType.ToString(),
            DeliveryAddress = order.DeliveryAddress,
            ClientId = order.ClientId,
            ClientName = order.Client == null ? null : $"{order.Client.FirstName} {order.Client.LastName}".Trim(),
            WaiterId = order.WaiterId,
            WaiterName = order.Waiter == null ? null : $"{order.Waiter.FirstName} {order.Waiter.LastName}".Trim(),
            TableId = order.TableId,
            TableNumber = order.Table?.TableNumber,
            TotalAmount = order.TotalAmount,
            IsPaid = order.IsPaid,
            Items = order.OrderItems.Select(item => new OrderItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name ?? string.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        };
    }
}
