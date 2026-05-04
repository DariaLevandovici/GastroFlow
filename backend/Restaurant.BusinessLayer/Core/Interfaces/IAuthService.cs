using System.Threading.Tasks;
using Restaurant.Domain.Models.Auth;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto?> LoginAsync(LoginDto loginDto);
    Task<TokenResponseDto?> RegisterAsync(RegisterDto registerDto);
}
