using Restaurant.Domain.Models.Address;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IAddressService
{
    Task<IEnumerable<AddressDto>> GetAllAddressesAsync();
    Task<AddressDto?> GetAddressByIdAsync(int id);
    Task<IEnumerable<AddressDto>> GetUserAddressesAsync(int userId);
    Task<AddressDto> AddAddressAsync(int userId, CreateAddressDto dto);
    Task DeleteAddressAsync(int userId, int addressId);
}
