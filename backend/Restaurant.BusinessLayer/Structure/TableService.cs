using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Table;

namespace Restaurant.BusinessLayer.Structure;

public class TableService : ITableService
{
    private readonly DbSession _dbSession;

    public TableService(DbSession dbSession)
    {
        _dbSession = dbSession;
    }

    public async Task<IEnumerable<TableDto>> GetAllTablesAsync()
    {
        return await _dbSession.Context.Set<Table>()
            .AsNoTracking()
            .Select(t => new TableDto
            {
                Id = t.Id,
                TableNumber = t.TableNumber,
                Capacity = t.Capacity,
                IsOccupied = t.IsOccupied
            })
            .ToListAsync();
    }

    public async Task<TableDto?> GetTableByIdAsync(int id)
    {
        return await _dbSession.Context.Set<Table>()
            .AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => new TableDto
            {
                Id = t.Id,
                TableNumber = t.TableNumber,
                Capacity = t.Capacity,
                IsOccupied = t.IsOccupied
            })
            .FirstOrDefaultAsync();
    }

    public async Task<TableDto> CreateTableAsync(TableDto dto)
    {
        var table = new Table
        {
            TableNumber = dto.TableNumber,
            Capacity = dto.Capacity,
            IsOccupied = dto.IsOccupied
        };

        _dbSession.Context.Set<Table>().Add(table);
        await _dbSession.SaveChangesAsync();

        dto.Id = table.Id;
        return dto;
    }

    public async Task UpdateTableAsync(int id, TableDto dto)
    {
        var table = await _dbSession.Context.Set<Table>().FirstOrDefaultAsync(t => t.Id == id);
        if (table == null)
        {
            return;
        }

        table.TableNumber = dto.TableNumber;
        table.Capacity = dto.Capacity;
        table.IsOccupied = dto.IsOccupied;

        await _dbSession.SaveChangesAsync();
    }

    public async Task DeleteTableAsync(int id)
    {
        var table = await _dbSession.Context.Set<Table>().FirstOrDefaultAsync(t => t.Id == id);
        if (table == null)
        {
            return;
        }

        _dbSession.Context.Set<Table>().Remove(table);
        await _dbSession.SaveChangesAsync();
    }

    public async Task UpdateTableStatusAsync(int id, bool isOccupied)
    {
        var table = await _dbSession.Context.Set<Table>().FirstOrDefaultAsync(t => t.Id == id);
        if (table == null)
        {
            return;
        }

        table.IsOccupied = isOccupied;
        await _dbSession.SaveChangesAsync();
    }
}
