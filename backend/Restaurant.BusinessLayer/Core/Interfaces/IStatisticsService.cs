using System.Threading.Tasks;
using Restaurant.Domain.Models.Statistics;

namespace Restaurant.BusinessLayer.Core.Interfaces;

public interface IStatisticsService
{
    Task<StatisticsDto> GetDashboardStatisticsAsync();
}
