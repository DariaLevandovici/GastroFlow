using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.Domain.Models.Address;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyAddresses()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var addresses = await _addressService.GetUserAddressesAsync(userId);
        return Ok(addresses);
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress([FromBody] CreateAddressDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        var created = await _addressService.AddAddressAsync(userId, dto);
        return Ok(created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

        await _addressService.DeleteAddressAsync(userId, id);
        return NoContent();
    }
}