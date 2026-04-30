using System;
using System.Threading.Tasks;
using Restaurant.DataAccess.Context;

namespace Restaurant.DataAccess;

public class DbSession : IDisposable
{
    private readonly AppDbContext _context;

    public DbSession(AppDbContext context)
    {
        _context = context;
    }
    
    // Expose DbContext for advanced scenarios that are not covered by generic operations.
    public AppDbContext Context => _context;

    public Task<int> SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

