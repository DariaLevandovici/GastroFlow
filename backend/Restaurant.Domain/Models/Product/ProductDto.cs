using System.ComponentModel.DataAnnotations;

namespace Restaurant.Domain.Models.Product;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class CreateProductDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Range(0.01, 10000, ErrorMessage = "Price must be strictly positive.")]
    public decimal Price { get; set; }
    
    public string ImageUrl { get; set; } = string.Empty;
    
    [Required]
    public int CategoryId { get; set; }
}

public class UpdateProductDto : CreateProductDto
{
}
