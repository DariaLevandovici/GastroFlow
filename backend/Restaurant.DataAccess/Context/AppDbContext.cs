using Microsoft.EntityFrameworkCore;
using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<ProductIngredient> ProductIngredients => Set<ProductIngredient>();

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProductIngredient>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.ProductIngredients)
            .HasForeignKey(pi => pi.ProductId);

        modelBuilder.Entity<ProductIngredient>()
            .HasOne(pi => pi.Ingredient)
            .WithMany()
            .HasForeignKey(pi => pi.IngredientId);
    }
}