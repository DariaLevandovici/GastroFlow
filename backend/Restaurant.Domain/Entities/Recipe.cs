namespace Restaurant.Domain.Entities;

public class Recipe
{
    public int Id { get; set; }
    public string Instructions { get; set; } = string.Empty;
    public string IngredientsList { get; set; } = string.Empty; // Store as comma separated or JSON for simplicity
    public int PreparationTimeMinutes { get; set; }
    
    // The Product this recipe makes
    public int ProductId { get; set; }
    public Product? Product { get; set; }
}
