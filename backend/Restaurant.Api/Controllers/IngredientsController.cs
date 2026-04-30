using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IngredientsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Ingredient>>> GetIngredients()
    {
        return await _context.Ingredients.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ingredient>> GetIngredient(int id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);

        if (ingredient == null)
            return NotFound();

        return ingredient;
    }

    [HttpPost]
    public async Task<ActionResult<Ingredient>> CreateIngredient(Ingredient ingredient)
    {
        var nameToFind = ingredient.Name?.Trim().ToLower();
        if (await _context.Ingredients.AnyAsync(i => i.Name.Trim().ToLower() == nameToFind))
        {
            return BadRequest("An ingredient with this name already exists");
        }

        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIngredient), new { id = ingredient.Id }, ingredient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIngredient(int id, Ingredient ingredient)
    {
        if (id != ingredient.Id)
            return BadRequest();

        var nameToFind = ingredient.Name?.Trim().ToLower();
        if (await _context.Ingredients.AnyAsync(i => i.Id != id && i.Name.Trim().ToLower() == nameToFind))
        {
            return BadRequest("An ingredient with this name already exists");
        }

        _context.Entry(ingredient).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIngredient(int id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);

        if (ingredient == null)
            return NotFound();

        _context.Ingredients.Remove(ingredient);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}