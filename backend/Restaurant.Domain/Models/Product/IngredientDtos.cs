using System.Collections.Generic;

namespace Restaurant.Domain.Entities;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
    public string Category { get; set; } = "Menu";
    public string Image { get; set; } = "";
    public string Ingredients { get; set; } = "[]"; // Keeping for legacy/backward compat if needed
    public string Dietary { get; set; } = "[]";

    public List<ProductIngredientDto> ProductIngredients { get; set; } = new();
}

public class ProductIngredientDto
{
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = "";
    public decimal AmountNeeded { get; set; }
    public string Unit { get; set; } = "";
}

public class ProductCreateUpdateDto
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
    public string Category { get; set; } = "Menu";
    public string Image { get; set; } = "";
    public string Ingredients { get; set; } = "[]";
    public string Dietary { get; set; } = "[]";

    public List<ProductIngredientCreateDto> ProductIngredients { get; set; } = new();
}

public class ProductIngredientCreateDto
{
    public int IngredientId { get; set; }
    public decimal AmountNeeded { get; set; }
}
