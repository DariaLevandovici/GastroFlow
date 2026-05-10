using System;

namespace Restaurant.Domain.Entities;

public enum DeliveryStatus
{
    Pending,
    PickedUp,
    InTransit,
    Delivered,
    Failed
}

public class Delivery
{
    public int Id { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public DateTime EstimatedDeliveryTime { get; set; }
    public DateTime? ActualDeliveryTime { get; set; }
    public string? DeliveryNotes { get; set; }

    // Foreign keys
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int? DeliveryPersonId { get; set; }
    public User? DeliveryPerson { get; set; }

    // Nullable: address row may not exist for free-text delivery addresses
    public int? AddressId { get; set; }
    public Address? Address { get; set; }
}
