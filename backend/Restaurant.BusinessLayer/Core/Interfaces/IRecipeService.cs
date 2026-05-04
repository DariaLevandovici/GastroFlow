using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Recipe;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IRecipeService
{
    Task<IEnumerable<RecipeDto>> GetAllRecipesAsync();
    Task<RecipeDto?> GetRecipeByIdAsync(int id);
    Task<RecipeDto> CreateRecipeAsync(CreateRecipeDto dto);
    Task UpdateRecipeAsync(int id, CreateRecipeDto dto);
    Task DeleteRecipeAsync(int id);
}
