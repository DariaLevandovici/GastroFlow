using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.BusinessLayer.Core.Interfaces;
using Restaurant.Domain.Models.Table;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TablesController : ControllerBase
{
    private readonly ITableService _tableService;

    public TablesController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> GetAll()
    {
        var tables = await _tableService.GetAllTablesAsync();
        return Ok(tables);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> GetById(int id)
    {
        var table = await _tableService.GetTableByIdAsync(id);
        if (table == null) return NotFound();
        return Ok(table);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] TableDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _tableService.CreateTableAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] TableDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        await _tableService.UpdateTableAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _tableService.DeleteTableAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Waiter")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isOccupied)
    {
        await _tableService.UpdateTableStatusAsync(id, isOccupied);
        return NoContent();
    }
}
