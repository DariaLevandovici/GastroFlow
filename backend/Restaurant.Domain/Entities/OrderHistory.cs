using System;

namespace Restaurant.Domain.Entities;

public class OrderHistory
{
    public int Id { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    // Foreign key – the Order this history entry belongs to
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    // Foreign key – the User who made the change (nullable: system changes have no user)
    public int? ChangedByUserId { get; set; }
    public User? ChangedByUser { get; set; }
}
