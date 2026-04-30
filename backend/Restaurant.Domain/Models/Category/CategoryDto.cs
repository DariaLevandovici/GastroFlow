using System.ComponentModel.DataAnnotations;

namespace Restaurant.Domain.Models.Category;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateCategoryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Description { get; set; } = string.Empty;
}
