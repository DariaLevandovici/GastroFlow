using System;
using System.Collections.Generic;

namespace Restaurant.Domain.Entities;

public enum OrderStatus
{
    Pending,
    Preparing,
    Ready,
    Delivered,
    Cancelled
}

public class Order
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Status
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    // Client who placed the order (null if placed by waiter for table)
    public int? ClientId { get; set; }
    public User? Client { get; set; }
    
    // Waiter who created the order (null if placed by client)
    public int? WaiterId { get; set; }
    public User? Waiter { get; set; }
    
    // Table (null if delivery/takeaway)
    public int? TableId { get; set; }
    public Table? Table { get; set; }
    
    // Order Items
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    
    // Payment
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
}
