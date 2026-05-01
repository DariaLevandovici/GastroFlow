using System.Collections.Generic;
using System.Threading.Tasks;
using Restaurant.Domain.Models.Table;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface ITableService
{
    Task<IEnumerable<TableDto>> GetAllTablesAsync();
    Task<TableDto?> GetTableByIdAsync(int id);
    Task<TableDto> CreateTableAsync(TableDto dto);
    Task UpdateTableAsync(int id, TableDto dto);
    Task DeleteTableAsync(int id);
    Task UpdateTableStatusAsync(int id, bool isOccupied);
}
