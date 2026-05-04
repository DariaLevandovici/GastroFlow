using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.Domain.Models.Order;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Waiter,Chef")]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("my-orders")]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var clientId)) return Unauthorized();

        var orders = await _orderService.GetOrdersByClientAsync(clientId);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        // Add role checks here if needed, allowing all authenticated users to see details for simplicity
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost("client")]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> CreateClientOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var clientId)) return Unauthorized();

        var created = await _orderService.CreateClientOrderAsync(clientId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("waiter")]
    [Authorize(Roles = "Waiter")]
    public async Task<IActionResult> CreateWaiterOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var waiterIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(waiterIdString, out var waiterId)) return Unauthorized();

        var created = await _orderService.CreateWaiterOrderAsync(waiterId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Chef,Waiter")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        await _orderService.UpdateOrderStatusAsync(id, dto);
        return NoContent();
    }

    [HttpPatch("{id}/payment")]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> UpdatePayment(int id, [FromBody] bool isPaid)
    {
        await _orderService.UpdateOrderPaymentAsync(id, isPaid);
        return NoContent();
    }
}
