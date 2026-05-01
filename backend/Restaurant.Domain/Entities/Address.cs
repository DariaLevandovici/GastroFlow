namespace Restaurant.Domain.Entities;

public class Address
{
    public int Id { get; set; }
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? AdditionalInfo { get; set; }

    // Foreign key – the User this address belongs to
    public int UserId { get; set; }
    public User? User { get; set; }
}
