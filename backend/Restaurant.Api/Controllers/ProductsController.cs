using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .ToListAsync();

        return products.Select(p => MapToDto(p)).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        return MapToDto(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(ProductCreateUpdateDto dto)
    {
        var nameToFind = dto.Name?.Trim().ToLower();
        if (await _context.Products.AnyAsync(p => p.Name.Trim().ToLower() == nameToFind))
        {
            return BadRequest("A product with this name already exists");
        }

        var product = new Product
        {
            Name = dto.Name!,
            Price = dto.Price,
            Description = dto.Description ?? "",
            Category = dto.Category ?? "Menu",
            Image = dto.Image ?? "",
            Ingredients = dto.Ingredients ?? "[]",
            Dietary = dto.Dietary ?? "[]"
        };

        if (dto.ProductIngredients != null)
        {
            foreach (var pi in dto.ProductIngredients)
            {
                product.ProductIngredients.Add(new ProductIngredient
                {
                    IngredientId = pi.IngredientId,
                    AmountNeeded = pi.AmountNeeded
                });
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        
        // Reload with includes for proper DTO response mapping
        product = await _context.Products
            .Include(p => p.ProductIngredients)
                .ThenInclude(pi => pi.Ingredient)
            .FirstAsync(p => p.Id == product.Id);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapToDto(product));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, ProductCreateUpdateDto dto)
    {
        var product = await _context.Products
            .Include(p => p.ProductIngredients)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        var nameToFind = dto.Name?.Trim().ToLower();
        if (await _context.Products.AnyAsync(p => p.Id != id && p.Name.Trim().ToLower() == nameToFind))
        {
            return BadRequest("A product with this name already exists");
        }

        product.Name = dto.Name!;
        product.Price = dto.Price;
        product.Description = dto.Description ?? "";
        product.Category = dto.Category ?? "Menu";
        product.Image = dto.Image ?? "";
        product.Ingredients = dto.Ingredients ?? "[]";
        product.Dietary = dto.Dietary ?? "[]";

        // Clear missing, add new, update existing
        _context.ProductIngredients.RemoveRange(product.ProductIngredients);
        
        if (dto.ProductIngredients != null)
        {
            foreach (var pi in dto.ProductIngredients)
            {
                product.ProductIngredients.Add(new ProductIngredient
                {
                    ProductId = id,
                    IngredientId = pi.IngredientId,
                    AmountNeeded = pi.AmountNeeded
                });
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description,
            Category = product.Category,
            Image = product.Image,
            Ingredients = product.Ingredients,
            Dietary = product.Dietary,
            ProductIngredients = product.ProductIngredients.Select(pi => new ProductIngredientDto
            {
                IngredientId = pi.IngredientId,
                IngredientName = pi.Ingredient?.Name ?? "",
                AmountNeeded = pi.AmountNeeded,
                Unit = pi.Ingredient?.Unit ?? ""
            }).ToList()
        };
    }
}