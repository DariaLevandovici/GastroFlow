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
        return _session.Context.Products.Include(p => p.Category);
    }

    private ProductDto MapToDto(Product p) => new ProductDto
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        ImageUrl = p.ImageUrl,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty
    };

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await GetProductsQuery().ToListAsync();
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
    {
        var products = await GetProductsQuery()
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();
        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var p = await GetProductsQuery().FirstOrDefaultAsync(x => x.Id == id);
        return p == null ? null : MapToDto(p);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
                 Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };
        await _session.Products.AddAsync(product);
        await _session.SaveChangesAsync();

        // Load category to return full Dto
        var created = await GetProductsQuery().FirstOrDefaultAsync(x => x.Id == product.Id);
        return MapToDto(created!);
    }

    public async Task UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var p = await _session.Products.GetByIdAsync(id);
        if (p != null)
        {
            p.Name = dto.Name;
            p.Description = dto.Description;
            p.Price = dto.Price;
            p.ImageUrl = dto.ImageUrl;
            p.CategoryId = dto.CategoryId;
            
            _session.Products.Update(p);
            await _session.SaveChangesAsync();
        }
    }

    public async Task DeleteProductAsync(int id)
    {
        var p = await _session.Products.GetByIdAsync(id);
        if (p != null)
        {
            _session.Products.Remove(p);
            await _session.SaveChangesAsync();
        }
    }
}
