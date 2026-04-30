namespace Restaurant.Domain.Entities;

public class ProductIngredient
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!;

    public decimal AmountNeeded { get; set; }
}