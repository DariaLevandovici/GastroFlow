using System;
using System.Threading.Tasks;
using Restaurant.DataAccess.Context;
using Restaurant.DataAccess.Repositories;
using Restaurant.DataAccess.Repositories.Interfaces;
using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess;

public class DbSession : IDisposable
{
    private readonly AppDbContext _context;
    
    // Repositories
    private IOrderRepository? _orders;
    private IRepository<Product>? _products;
    private IRepository<Table>? _tables;
    private IRepository<Recipe>? _recipes;
    private IRepository<Ingredient>? _ingredients;
    private IRepository<Category>? _categories;

    public DbSession(AppDbContext context)
    {
        _context = context;
    }
    
    public AppDbContext Context => _context;

    public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
    public IRepository<Product> Products => _products ??= new Repository<Product>(_context);
    public IRepository<Table> Tables => _tables ??= new Repository<Table>(_context);
    public IRepository<Recipe> Recipes => _recipes ??= new Repository<Recipe>(_context);
    public IRepository<Ingredient> Ingredients => _ingredients ??= new Repository<Ingredient>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);

    public Task<int> SaveChangesAsync()
    {
        return _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
