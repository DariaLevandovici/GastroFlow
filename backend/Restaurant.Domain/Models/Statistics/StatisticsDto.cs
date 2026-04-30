namespace Restaurant.Domain.Models.Statistics;

public class StatisticsDto
{
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalClients { get; set; }
    public int PendingOrders { get; set; }
}
