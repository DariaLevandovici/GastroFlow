using System;

namespace Restaurant.Domain.Entities;

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public class Reservation
{
    public int Id { get; set; }
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string SpecialRequests { get; set; } = string.Empty;
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int ClientId { get; set; }
    public User? Client { get; set; }

    public int? TableId { get; set; }
    public Table? Table { get; set; }
}
