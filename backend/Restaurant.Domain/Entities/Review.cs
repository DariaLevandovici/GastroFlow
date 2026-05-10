using System;

namespace Restaurant.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; } // 1–5
    public string Comment { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int ClientId { get; set; }
    public User? Client { get; set; }

    public int? ProductId { get; set; }
    public Product? Product { get; set; }

    public int? OrderId { get; set; }
    public Order? Order { get; set; }
}
