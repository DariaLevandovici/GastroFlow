using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Category;

namespace Restaurant.BusinessLayer.Structure;

public class CategoryService : ICategoryService
{
    private readonly DbSession _dbSession;

    public CategoryService(DbSession dbSession)
    {
        _dbSession = dbSession;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _dbSession.Context.Set<Category>()
            .AsNoTracking()
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        return await _dbSession.Context.Set<Category>()
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _dbSession.Context.Set<Category>().Add(category);
        await _dbSession.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };
    }

    public async Task UpdateCategoryAsync(int id, CreateCategoryDto dto)
    {
        var category = await _dbSession.Context.Set<Category>().FirstOrDefaultAsync(c => c.Id == id);
        if (category == null)
        {
            return;
        }

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _dbSession.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _dbSession.Context.Set<Category>().FirstOrDefaultAsync(c => c.Id == id);
        if (category == null)
        {
            return;
        }

        _dbSession.Context.Set<Category>().Remove(category);
        await _dbSession.SaveChangesAsync();
    }
}
