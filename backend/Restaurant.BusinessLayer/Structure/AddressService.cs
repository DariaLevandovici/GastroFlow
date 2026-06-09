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

    private static AddressDto MapToDto(Address address)
    {
        return new AddressDto
        {
            Id = address.Id,
            UserId = address.UserId,
            UserName = address.User == null ? null : $"{address.User.FirstName} {address.User.LastName}".Trim(),
            Street = address.Street,
            City = address.City,
            PostalCode = address.PostalCode,
            Country = address.Country,
            AdditionalInfo = address.AdditionalInfo
        };
    }

    public async Task<IEnumerable<AddressDto>> GetAllAddressesAsync()
    {
        var addresses = await _context.Addresses
            .Include(a => a.User)
            .OrderBy(a => a.Id)
            .ToListAsync();

        return addresses.Select(MapToDto);
    }

    public async Task<AddressDto?> GetAddressByIdAsync(int id)
    {
        var address = await _context.Addresses
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        return address == null ? null : MapToDto(address);
    }

    public async Task<IEnumerable<AddressDto>> GetUserAddressesAsync(int userId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Id)
            .ToListAsync();

        return addresses.Select(MapToDto);
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
            UserId = address.UserId,
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
