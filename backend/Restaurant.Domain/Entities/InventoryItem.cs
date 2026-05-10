using System;

namespace Restaurant.Domain.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty; // e.g. kg, litre, piece
    public decimal Quantity { get; set; }
    public decimal MinimumStockLevel { get; set; }
    public DateTime LastRestockedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
}
