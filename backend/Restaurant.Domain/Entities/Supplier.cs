using System.Collections.Generic;

namespace Restaurant.Domain.Entities;

public class Supplier
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
