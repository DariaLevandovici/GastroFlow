using System;

namespace Restaurant.Domain.Entities;

public class Promotion
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign key (optional – promotion may target a specific product)
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
}
