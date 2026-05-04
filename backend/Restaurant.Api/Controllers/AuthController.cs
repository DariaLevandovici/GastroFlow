using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.Domain.Models.Auth;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.LoginAsync(loginDto);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(result);
         }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(registerDto);
        if (result == null)
        {
            return BadRequest(new { message = "Registration failed. Email might already be in use." });
        }

        return Ok(result);
    }
}
