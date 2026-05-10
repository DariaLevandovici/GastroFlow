using System;

namespace Restaurant.Domain.Entities;

public enum PaymentMethod
{
    Cash,
    Card,
    OnlineTransfer,
    Voucher
}

public enum PaymentStatus
{
    Pending,
    Completed,
    Refunded,
    Failed
}

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }
    public string? TransactionReference { get; set; }

    // Foreign keys
    public int OrderId { get; set; }
    public Order? Order { get; set; }
}
