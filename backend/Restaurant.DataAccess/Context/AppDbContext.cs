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
    public DbSet<Image> Images => Set<Image>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProductIngredient>()
            .HasKey(pi => new { pi.ProductId, pi.IngredientId }); // Composite Key

        modelBuilder.Entity<ProductIngredient>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.ProductIngredients)
            .HasForeignKey(pi => pi.ProductId);

        modelBuilder.Entity<ProductIngredient>()
            .HasOne(pi => pi.Ingredient)
            .WithMany(i => i.ProductIngredients)
            .HasForeignKey(pi => pi.IngredientId);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.MainImage)
            .WithOne(i => i.Product)
            .HasForeignKey<Product>(p => p.ImageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}