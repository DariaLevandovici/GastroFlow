using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> GetAll()
    {
        var reservations = await _context.Reservations
            .Include(r => r.Client)
            .Include(r => r.Table)
            .OrderByDescending(r => r.ReservationDate)
            .Select(r => new ReservationResponseDto
            {
                Id = r.Id,
                ReservationDate = r.ReservationDate,
                NumberOfGuests = r.NumberOfGuests,
                SpecialRequests = r.SpecialRequests,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                ClientId = r.ClientId,
                ClientName = r.Client == null ? null : (r.Client.FirstName + " " + r.Client.LastName).Trim(),
                ClientEmail = r.Client == null ? null : r.Client.Email,
                TableId = r.TableId,
                TableNumber = r.Table == null ? null : r.Table.TableNumber,
                TableCapacity = r.Table == null ? null : r.Table.Capacity
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Waiter,Client")]
    public async Task<IActionResult> GetById(int id)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Client)
            .Include(r => r.Table)
            .Where(r => r.Id == id)
            .Select(r => new ReservationResponseDto
            {
                Id = r.Id,
                ReservationDate = r.ReservationDate,
                NumberOfGuests = r.NumberOfGuests,
                SpecialRequests = r.SpecialRequests,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                ClientId = r.ClientId,
                ClientName = r.Client == null ? null : (r.Client.FirstName + " " + r.Client.LastName).Trim(),
                ClientEmail = r.Client == null ? null : r.Client.Email,
                TableId = r.TableId,
                TableNumber = r.Table == null ? null : r.Table.TableNumber,
                TableCapacity = r.Table == null ? null : r.Table.Capacity
            })
            .FirstOrDefaultAsync();

        if (reservation == null) return NotFound();
        return Ok(reservation);
    }

    [HttpGet("table-blocks")]
    [Authorize(Roles = "Admin,Waiter,Client")]
    public async Task<IActionResult> GetTableBlocks([FromQuery] DateTime? date = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var selectedDate = NormalizeReservationDate(date ?? DateTime.UtcNow);
        var start = selectedDate.Date;
        var end = start.AddDays(1);

        var blocks = await _context.Reservations
            .Include(r => r.Client)
            .Include(r => r.Table)
            .Where(r =>
                r.TableId.HasValue &&
                (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                r.ReservationDate >= start &&
                r.ReservationDate < end)
            .OrderBy(r => r.ReservationDate)
            .Select(r => new ReservationTableBlockDto
            {
                Id = r.Id,
                ReservationDate = r.ReservationDate,
                NumberOfGuests = r.NumberOfGuests,
                Status = r.Status.ToString(),
                ClientId = r.ClientId,
                IsMine = r.ClientId == userId.Value,
                ClientName = r.Client == null ? null : (r.Client.FirstName + " " + r.Client.LastName).Trim(),
                ClientEmail = r.Client == null ? null : r.Client.Email,
                TableId = r.TableId,
                TableNumber = r.Table == null ? null : r.Table.TableNumber,
                TableCapacity = r.Table == null ? null : r.Table.Capacity
            })
            .ToListAsync();

        return Ok(blocks);
    }

    [HttpPost]
    [Authorize(Roles = "Client,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var reservationDate = NormalizeReservationDate(request.ReservationDate);
        var reservationEnd = reservationDate.AddHours(2);
        var conflictStart = reservationDate.AddHours(-2);
        var reservedTableIds = await _context.Reservations
            .Where(r =>
                r.TableId.HasValue &&
                (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                r.ReservationDate > conflictStart &&
                r.ReservationDate < reservationEnd)
            .Select(r => r.TableId!.Value)
            .ToListAsync();

        var needsCurrentFreeTable = reservationDate <= DateTime.UtcNow.AddHours(2);
        var table = await _context.Tables
            .Where(t =>
                t.Capacity >= request.NumberOfGuests &&
                !reservedTableIds.Contains(t.Id) &&
                (!needsCurrentFreeTable || !t.IsOccupied))
            .OrderBy(t => t.Capacity)
            .ThenBy(t => t.TableNumber)
            .FirstOrDefaultAsync();

        if (table == null)
        {
            return BadRequest(new { message = "No available table for selected date, time and number of guests." });
        }

        var reservation = new Reservation
        {
            ClientId = userId.Value,
            TableId = table.Id,
            ReservationDate = reservationDate,
            NumberOfGuests = request.NumberOfGuests,
            SpecialRequests = request.SpecialRequests ?? string.Empty,
            Status = ReservationStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        var created = await BuildReservationQuery()
            .FirstAsync(r => r.Id == reservation.Id);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    private int? GetCurrentUserId()
    {
        var userIdString =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
            User.FindFirst("sub")?.Value;

        return int.TryParse(userIdString, out var userId) ? userId : null;
    }

    private static DateTime NormalizeReservationDate(DateTime reservationDate)
    {
        if (reservationDate.Kind == DateTimeKind.Utc)
        {
            return reservationDate;
        }

        if (reservationDate.Kind == DateTimeKind.Local)
        {
            return reservationDate.ToUniversalTime();
        }

        return DateTime.SpecifyKind(reservationDate, DateTimeKind.Utc);
    }

    private IQueryable<ReservationResponseDto> BuildReservationQuery()
    {
        return _context.Reservations
            .Include(r => r.Client)
            .Include(r => r.Table)
            .Select(r => new ReservationResponseDto
            {
                Id = r.Id,
                ReservationDate = r.ReservationDate,
                NumberOfGuests = r.NumberOfGuests,
                SpecialRequests = r.SpecialRequests,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt,
                ClientId = r.ClientId,
                ClientName = r.Client == null ? null : (r.Client.FirstName + " " + r.Client.LastName).Trim(),
                ClientEmail = r.Client == null ? null : r.Client.Email,
                TableId = r.TableId,
                TableNumber = r.Table == null ? null : r.Table.TableNumber,
                TableCapacity = r.Table == null ? null : r.Table.Capacity
            });
    }
}

public class ReservationResponseDto
{
    public int Id { get; set; }
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string SpecialRequests { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public int? TableId { get; set; }
    public int? TableNumber { get; set; }
    public int? TableCapacity { get; set; }
}

public class ReservationTableBlockDto
{
    public int Id { get; set; }
    public DateTime ReservationDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public bool IsMine { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public int? TableId { get; set; }
    public int? TableNumber { get; set; }
    public int? TableCapacity { get; set; }
}

public class CreateReservationRequest
{
    [Required]
    public DateTime ReservationDate { get; set; }

    [Range(1, 20)]
    public int NumberOfGuests { get; set; }

    public string? SpecialRequests { get; set; }
    public int? TableId { get; set; }
}
