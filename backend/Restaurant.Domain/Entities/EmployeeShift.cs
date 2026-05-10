using System;

namespace Restaurant.Domain.Entities;

public class EmployeeShift
{
    public int Id { get; set; }
    public DateTime ShiftStart { get; set; }
    public DateTime ShiftEnd { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsConfirmed { get; set; } = false;

    // Foreign key
    public int EmployeeId { get; set; }
    public User? Employee { get; set; }
}
