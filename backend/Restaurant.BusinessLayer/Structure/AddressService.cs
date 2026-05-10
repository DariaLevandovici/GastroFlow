using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Address;

namespace Restaurant.BusinessLayer.Structure;

public class AddressService : IAddressService
{
    private readonly AppDbContext _context;

    public AddressService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AddressDto>> GetUserAddressesAsync(int userId)
    {
        return await _context.Addresses
            .Where(a => a.UserId == userId)
            .Select(a => new AddressDto
            {
                Id = a.Id,
                Street = a.Street,
                City = a.City,
                PostalCode = a.PostalCode,
                Country = a.Country,
                AdditionalInfo = a.AdditionalInfo
            })
            .ToListAsync();
    }

    public async Task<AddressDto> AddAddressAsync(int userId, CreateAddressDto dto)
    {
        var address = new Address
        {
            UserId = userId,
            Street = dto.Street,
            City = dto.City,
            PostalCode = dto.PostalCode,
            Country = dto.Country,
            AdditionalInfo = dto.AdditionalInfo
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return new AddressDto
        {
            Id = address.Id,
            Street = address.Street,
            City = address.City,
            PostalCode = address.PostalCode,
            Country = address.Country,
            AdditionalInfo = address.AdditionalInfo
        };
    }

    public async Task DeleteAddressAsync(int userId, int addressId)
    {
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

        if (address != null)
        {
            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }
    }
}