using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Order;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    Task<IEnumerable<OrderDto>> GetOrdersByClientAsync(int clientId);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto> CreateClientOrderAsync(int clientId, CreateOrderDto dto);
    Task<OrderDto> CreateWaiterOrderAsync(int waiterId, CreateOrderDto dto);
    Task UpdateOrderStatusAsync(int id, UpdateOrderStatusDto dto);
    Task UpdateOrderPaymentAsync(int id, bool isPaid);
}
