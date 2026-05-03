using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Product;

namespace Restaurant.BusinessLayer.Structure;

public class ProductService : IProductService
{
    private readonly DbSession _session;

    public ProductService(DbSession session)
    {
        _session = session;
    }

    private IQueryable<Product> GetProductsQuery()
    {
        return _session.Context.Products
            .Include(p => p.MainImage)
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient);
    }

    private ProductDto MapToDto(Product p) => new ProductDto
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Category = p.Category,
        Image = p.MainImage?.Url ?? "",
        Dietary = p.Dietary,
        ProductIngredients = p.ProductIngredients.Select(pi => new ProductIngredientDto
        {
            IngredientId = pi.IngredientId,
            IngredientName = pi.Ingredient?.Name ?? "",
            AmountNeeded = pi.AmountNeeded,
            Unit = pi.Ingredient?.Unit ?? ""
        }).ToList()
    };

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await GetProductsQuery().ToListAsync();
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category)
    {
        var products = await GetProductsQuery()
            .Where(p => p.Category == category)
            .ToListAsync();
        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var p = await GetProductsQuery().FirstOrDefaultAsync(x => x.Id == id);
        return p == null ? null : MapToDto(p);
    }

    public async Task<ProductDto> CreateProductAsync(ProductCreateUpdateDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Category = dto.Category,
            Dietary = dto.Dietary,
            ProductIngredients = dto.ProductIngredients.Select(pi => new ProductIngredient
            {
                IngredientId = pi.IngredientId,
                AmountNeeded = pi.AmountNeeded
            }).ToList()
        };

        await _session.Context.Products.AddAsync(product);
        await _session.SaveChangesAsync();

        var created = await GetProductsQuery().FirstOrDefaultAsync(x => x.Id == product.Id);
        return MapToDto(created!);
    }

    public async Task UpdateProductAsync(int id, ProductCreateUpdateDto dto)
    {
        var p = await GetProductsQuery().FirstOrDefaultAsync(x => x.Id == id);
        if (p != null)
        {
            p.Name = dto.Name;
            p.Description = dto.Description;
            p.Price = dto.Price;
            p.Category = dto.Category;
            p.Dietary = dto.Dietary;

            // Simple replace strategy for ingredients
            p.ProductIngredients.Clear();
            foreach (var pi in dto.ProductIngredients)
            {
                p.ProductIngredients.Add(new ProductIngredient
                {
                    IngredientId = pi.IngredientId,
                    AmountNeeded = pi.AmountNeeded
                });
            }
            
            _session.Context.Products.Update(p);
            await _session.SaveChangesAsync();
        }
    }

    public async Task DeleteProductAsync(int id)
    {
        var p = await _session.Context.Products.FindAsync(id);
        if (p != null)
        {
            _session.Context.Products.Remove(p);
            await _session.SaveChangesAsync();
        }
    }
}
