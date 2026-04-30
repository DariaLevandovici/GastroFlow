using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Restaurant.Domain.Entities;

namespace Restaurant.Domain.Models.Order;

public class OrderDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
    
    public int? WaiterId { get; set; }
    public string? WaiterName { get; set; }
    
    public int? TableId { get; set; }
    public int? TableNumber { get; set; }
    
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class CreateOrderDto
{
    public int? TableId { get; set; } // Optional, for waiter orders
    
    [Required]
    [MinLength(1, ErrorMessage = "Order must contain at least one item.")]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}
