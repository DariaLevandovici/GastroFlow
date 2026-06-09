using System.IdentityModel.Tokens.Jwt;
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
        var clientId = GetCurrentUserId();
        if (clientId == null) return Unauthorized();

        var orders = await _orderService.GetOrdersByClientAsync(clientId.Value);
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

        var clientId = GetCurrentUserId();
        if (clientId == null) return Unauthorized();

        try
        {
            var created = await _orderService.CreateClientOrderAsync(clientId.Value, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("waiter")]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> CreateWaiterOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var waiterId = GetCurrentUserId();
        if (waiterId == null) return Unauthorized();

        try
        {
            var created = await _orderService.CreateWaiterOrderAsync(waiterId.Value, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Chef,Waiter")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            await _orderService.UpdateOrderStatusAsync(id, dto);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/payment")]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> UpdatePayment(int id, [FromBody] bool isPaid)
    {
        try
        {
            await _orderService.UpdateOrderPaymentAsync(id, isPaid);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdString =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
            User.FindFirst("sub")?.Value;

        return int.TryParse(userIdString, out var userId) ? userId : null;
    }
}
