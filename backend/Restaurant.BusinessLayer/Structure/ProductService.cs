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