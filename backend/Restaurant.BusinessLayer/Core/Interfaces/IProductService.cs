using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Product;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(ProductCreateUpdateDto dto);
    Task UpdateProductAsync(int id, ProductCreateUpdateDto dto);
    Task DeleteProductAsync(int id);
}
