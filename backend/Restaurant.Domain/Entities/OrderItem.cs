namespace Restaurant.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    
    // The Order this item belongs to
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    
    // The Product ordered
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    // Quantity and snapshot price
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
