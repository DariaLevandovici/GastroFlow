using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Auth;

namespace Restaurant.BusinessLayer.Structure;

public class AuthService : IAuthService
{
    private readonly DbSession _dbSession;
    private readonly IConfiguration _configuration;

    public AuthService(DbSession dbSession, IConfiguration configuration)
    {
        _dbSession = dbSession;
        _configuration = configuration;
    }

    public async Task<TokenResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _dbSession.Context.Set<User>()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

        if (user == null)
        {
            return null;
        }

        var isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isValidPassword)
        {
            return null;
        }

        return BuildTokenResponse(user);
    }

    public async Task<TokenResponseDto?> RegisterAsync(RegisterDto registerDto)
    {
        var alreadyExists = await _dbSession.Context.Set<User>()
            .AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

        if (alreadyExists)
        {
            return null;
        }

        if (!Enum.TryParse<Role>(registerDto.Role, true, out var role))
        {
            role = Role.Client;
        }

        var user = new User
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        _dbSession.Context.Set<User>().Add(user);
        await _dbSession.SaveChangesAsync();

        return BuildTokenResponse(user);
    }

    private TokenResponseDto BuildTokenResponse(User user)
    {
        var secret = _configuration["JwtConfig:SecretKey"] ?? throw new InvalidOperationException("Missing JwtConfig:SecretKey");
        var issuer = _configuration["JwtConfig:Issuer"] ?? "RestaurantApi";
        var audience = _configuration["JwtConfig:Audience"] ?? "RestaurantApi";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds);

        return new TokenResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Role = user.Role.ToString(),
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }
}
