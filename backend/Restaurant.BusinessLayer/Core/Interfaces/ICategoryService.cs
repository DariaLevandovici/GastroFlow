using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Category;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);
    Task UpdateCategoryAsync(int id, CreateCategoryDto dto);
    Task DeleteCategoryAsync(int id);
}
