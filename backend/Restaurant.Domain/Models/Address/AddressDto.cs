using System.ComponentModel.DataAnnotations;

namespace Restaurant.Domain.Models.Address;

public class AddressDto
{
    public int Id { get; set; }
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? AdditionalInfo { get; set; }
}

public class CreateAddressDto
{
    [Required]
    public string Street { get; set; } = string.Empty;
    
    [Required]
    public string City { get; set; } = string.Empty;
    
    [Required]
    public string PostalCode { get; set; } = string.Empty;
    
    [Required]
    public string Country { get; set; } = string.Empty;
    
    public string? AdditionalInfo { get; set; }
}