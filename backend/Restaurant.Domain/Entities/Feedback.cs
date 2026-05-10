using System;

namespace Restaurant.Domain.Entities;

public class Feedback
{
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ServiceRating { get; set; } // 1–5
    public int FoodRating { get; set; }    // 1–5
    public bool IsResolved { get; set; } = false;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public int ClientId { get; set; }
    public User? Client { get; set; }
}
