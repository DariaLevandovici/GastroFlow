using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Product;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task UpdateProductAsync(int id, UpdateProductDto dto);
    Task DeleteProductAsync(int id);
}
