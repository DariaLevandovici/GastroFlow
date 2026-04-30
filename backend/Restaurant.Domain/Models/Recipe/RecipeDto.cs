using System.ComponentModel.DataAnnotations;

namespace Restaurant.Domain.Models.Recipe;

public class RecipeDto
{
    public int Id { get; set; }
    public string Instructions { get; set; } = string.Empty;
    public string IngredientsList { get; set; } = string.Empty;
    public int PreparationTimeMinutes { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
}

public class CreateRecipeDto
{
    [Required]
    [MinLength(10, ErrorMessage = "Instructions must be at least 10 characters.")]
    public string Instructions { get; set; } = string.Empty;

    public string IngredientsList { get; set; } = string.Empty;

    [Range(1, 600, ErrorMessage = "Preparation time must be between 1 and 600 minutes.")]
    public int PreparationTimeMinutes { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "A valid ProductId is required.")]
    public int ProductId { get; set; }
}
