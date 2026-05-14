using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.DataAccess;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Models.Statistics;

namespace Restaurant.BusinessLayer.Structure;

public class StatisticsService : IStatisticsService
{
    private readonly DbSession _session;

    public StatisticsService(DbSession session)
    {
        _session = session;
    }

    public async Task<StatisticsDto> GetDashboardStatisticsAsync()
    {
        var totalOrders = await _session.Orders.GetAllAsync();
        var totalClients = await _session.Users.FindAsync(u => u.Role == Role.Client);
        
        var completedOrders = totalOrders.Where(o => o.Status == OrderStatus.Delivered);
        var totalRevenue = completedOrders.Sum(o => o.TotalAmount);
        
        var pendingOrdersCount = totalOrders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Preparing);

        return new StatisticsDto
        {
            TotalOrders = totalOrders.Count(),
            TotalRevenue = totalRevenue,
            TotalClients = totalClients.Count(),
            PendingOrders = pendingOrdersCount
        };
    }
}
