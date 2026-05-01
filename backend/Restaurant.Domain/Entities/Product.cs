namespace Restaurant.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
    public string Category { get; set; } = "Menu";
    public string Image { get; set; } = "";
    /// <summary>JSON array string, e.g. ["eggs","bacon","butter"]</summary>
    
     public string Ingredients { get; set; } = "[]";

    /// <summary>JSON array string, e.g. ["vegetarian","gluten-free"]</summary>
    public string Dietary { get; set; } = "[]";

    public ICollection<ProductIngredient> ProductIngredients { get; set; } = new List<ProductIngredient>();
}
