using AutoMapper;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Order;

namespace Restaurant.BusinessLayer.Structure;

public class OrderService : IOrderService
{
    private readonly DbSession _session;
    private readonly IMapper _mapper;

    public OrderService(DbSession session, IMapper mapper)
    {
        _session = session;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await _session.Orders.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<OrderDto>>(orders);
    }

    public async Task<IEnumerable<OrderDto>> GetOrdersByClientAsync(int clientId)
    {
        var orders = await _session.Orders.GetByClientIdWithDetailsAsync(clientId);
        return _mapper.Map<IEnumerable<OrderDto>>(orders);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var o = await _session.Orders.GetByIdWithDetailsAsync(id);
        return o == null ? null : _mapper.Map<OrderDto>(o);
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
        var order = new Order
        {
            CreatedAt = DateTime.UtcNow,
            Status = OrderStatus.Pending,
            ClientId = clientId,
            WaiterId = waiterId,
            TableId = dto.TableId,
            IsPaid = false,
            TotalAmount = 0
        };
