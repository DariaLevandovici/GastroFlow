using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Recipe;

namespace Restaurant.BusinessLayer.Structure;

public class RecipeService : IRecipeService
{
    private readonly DbSession _session;

    public RecipeService(DbSession session)
    {
        _session = session;
    }

    private IQueryable<Recipe> GetRecipesQuery()
    {
        return _session.Context.Recipes.Include(r => r.Product);
    }

    private RecipeDto MapToDto(Recipe r) => new RecipeDto
    {
        Id = r.Id,
        Instructions = r.Instructions,
        IngredientsList = r.IngredientsList,
        PreparationTimeMinutes = r.PreparationTimeMinutes,
        ProductId = r.ProductId,
        ProductName = r.Product?.Name ?? string.Empty
    };

    public async Task<IEnumerable<RecipeDto>> GetAllRecipesAsync()
    {
        var recipes = await GetRecipesQuery().ToListAsync();
        return recipes.Select(MapToDto);
    }

    public async Task<RecipeDto?> GetRecipeByIdAsync(int id)
    {
        var r = await GetRecipesQuery().FirstOrDefaultAsync(x => x.Id == id);
        return r == null ? null : MapToDto(r);
    }

    public async Task<RecipeDto> CreateRecipeAsync(CreateRecipeDto dto)
    {
        var recipe = new Recipe
        {
            Instructions = dto.Instructions,
            IngredientsList = dto.IngredientsList,
            PreparationTimeMinutes = dto.PreparationTimeMinutes,
            ProductId = dto.ProductId
        };
        await _session.Recipes.AddAsync(recipe);
        await _session.SaveChangesAsync();

        var created = await GetRecipesQuery().FirstOrDefaultAsync(x => x.Id == recipe.Id);
        return MapToDto(created!);
    }
    
    public async Task UpdateRecipeAsync(int id, CreateRecipeDto dto)
    {
        var r = await _session.Recipes.GetByIdAsync(id);
        if (r != null)
        {
            r.Instructions = dto.Instructions;
            r.IngredientsList = dto.IngredientsList;
            r.PreparationTimeMinutes = dto.PreparationTimeMinutes;
            r.ProductId = dto.ProductId;
            
            _session.Recipes.Update(r);
            await _session.SaveChangesAsync();
        }
    }

    public async Task DeleteRecipeAsync(int id)
    {
        var r = await _session.Recipes.GetByIdAsync(id);
        if (r != null)
        {
            _session.Recipes.Remove(r);
            await _session.SaveChangesAsync();
        }
    }
}
