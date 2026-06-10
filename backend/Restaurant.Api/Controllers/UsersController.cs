using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Auth;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // Only Admin can manage users directly
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        // Prevent sending hashes
        foreach (var u in users) u.PasswordHash = string.Empty;
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        user.PasswordHash = string.Empty;
        return Ok(user);
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterDto dto)
    {
        if (dto == null || !ModelState.IsValid) return BadRequest(new { message = "Invalid data" });
        
        if (!System.Enum.TryParse<Role>(dto.Role.Trim(), true, out var role))
        {
            return BadRequest(new { message = "Invalid data" });
        }

        if (role == Role.Client)
        {
            return BadRequest(new { message = "Invalid data" });
        }

        var firstName = dto.FirstName.Trim();
        var lastName = dto.LastName.Trim();
        var email = dto.Email.Trim().ToLower();

        if (string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Invalid data" });
        }

        if (await _userService.EmailExistsAsync(email))
        {
            return Conflict(new { message = "Email already exists." });
        }

        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Role = role,
            CreatedAt = System.DateTime.UtcNow
        };

        var created = await _userService.CreateUserAsync(user, dto.Password);
        created.PasswordHash = string.Empty;
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteUserAsync(id);
        return NoContent();
    }
}
