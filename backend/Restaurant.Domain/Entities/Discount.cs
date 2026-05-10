using System;

namespace Restaurant.Domain.Entities;

public class Discount
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal PercentageOff { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public int? MaxUsageCount { get; set; }
    public int UsageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
