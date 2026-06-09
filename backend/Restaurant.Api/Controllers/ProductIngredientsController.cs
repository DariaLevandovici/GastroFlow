using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductIngredientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductIngredientsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var links = await _context.ProductIngredients
            .Include(pi => pi.Product)
            .Include(pi => pi.Ingredient)
            .OrderBy(pi => pi.ProductId)
            .ThenBy(pi => pi.IngredientId)
            .Select(pi => new ProductIngredientResponseDto
            {
                ProductId = pi.ProductId,
                ProductName = pi.Product.Name,
                IngredientId = pi.IngredientId,
                IngredientName = pi.Ingredient.Name,
                AmountNeeded = pi.AmountNeeded,
                Unit = pi.Ingredient.Unit
            })
            .ToListAsync();

        return Ok(links);
    }

    [HttpGet("{productId:int}/{ingredientId:int}")]
    public async Task<IActionResult> GetById(int productId, int ingredientId)
    {
        var link = await _context.ProductIngredients
            .Include(pi => pi.Product)
            .Include(pi => pi.Ingredient)
            .Where(pi => pi.ProductId == productId && pi.IngredientId == ingredientId)
            .Select(pi => new ProductIngredientResponseDto
            {
                ProductId = pi.ProductId,
                ProductName = pi.Product.Name,
                IngredientId = pi.IngredientId,
                IngredientName = pi.Ingredient.Name,
                AmountNeeded = pi.AmountNeeded,
                Unit = pi.Ingredient.Unit
            })
            .FirstOrDefaultAsync();

        if (link == null) return NotFound();
        return Ok(link);
    }
}

public class ProductIngredientResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal AmountNeeded { get; set; }
    public string Unit { get; set; } = string.Empty;
}
