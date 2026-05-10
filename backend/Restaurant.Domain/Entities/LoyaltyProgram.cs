using System;

namespace Restaurant.Domain.Entities;

public class LoyaltyProgram
{
    public int Id { get; set; }
    public int Points { get; set; } = 0;
    public int TotalPointsEarned { get; set; } = 0;
    public string Tier { get; set; } = "Bronze"; // Bronze, Silver, Gold
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActivityAt { get; set; }

    // Foreign key
    public int ClientId { get; set; }
    public User? Client { get; set; }
}
