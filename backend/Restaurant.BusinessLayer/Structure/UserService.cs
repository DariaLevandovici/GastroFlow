using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;

namespace Restaurant.BusinessLayer.Structure;

public class UserService : IUserService
{
    private readonly DbSession _dbSession;

    public UserService(DbSession dbSession)
    {
        _dbSession = dbSession;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _dbSession.Context.Users.ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _dbSession.Context.Users.FindAsync(id);
    }

    public async Task<User> CreateUserAsync(User user, string password)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        _dbSession.Context.Users.Add(user);
        await _dbSession.SaveChangesAsync();
        return user;
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _dbSession.Context.Users.FindAsync(id);
        if (user != null)
        {
            _dbSession.Context.Users.Remove(user);
            await _dbSession.SaveChangesAsync();
        }
    }
}
