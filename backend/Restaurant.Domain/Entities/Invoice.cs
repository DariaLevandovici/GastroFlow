using System;

namespace Restaurant.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsSent { get; set; } = false;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }

    // Foreign keys
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int? ClientId { get; set; }
    public User? Client { get; set; }
}
