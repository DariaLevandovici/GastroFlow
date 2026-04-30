using Microsoft.EntityFrameworkCore;
using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess.Seed;

public static class ProductIngredientSeedData
{
    // key = product name, value = ingredient names (exact match cu IngredientSeedData)
    private static readonly Dictionary<string, string[]> _map = new()
    {
        // ── Breakfast ────────────────────────────────────────────────────────
        ["Eggs Benedict"]      = ["eggs", "bacon", "butter", "lemon", "english muffin"],
        ["Avocado Toast"]      = ["avocado", "tomatoes", "feta", "bread"],
        ["Pancake Stack"]      = ["flour", "milk", "eggs", "berries", "maple syrup"],
        ["English Breakfast"]  = ["sausages", "eggs", "baked beans", "toast", "mushrooms"],
        ["French Toast"]       = ["brioche", "eggs", "milk", "cinnamon", "maple syrup"],
        ["Smoothie Bowl"]      = ["mixed berries", "banana", "granola", "coconut", "almond milk"],

        // ── Starters ─────────────────────────────────────────────────────────
        ["Bruschetta Classica"] = ["bread", "tomatoes", "garlic", "basil", "olive oil"],
        ["Caesar Salad"]        = ["lettuce", "parmesan", "croutons", "anchovies", "eggs"],
        ["Hummus Platter"]      = ["chickpeas", "tahini", "lemon", "garlic", "pita"],
        ["Calamari Fritti"]     = ["squid", "flour", "lemon", "garlic", "mayonnaise"],
        ["Caprese Salad"]       = ["mozzarella", "tomatoes", "basil", "balsamic vinegar", "olive oil"],
        ["Beef Carpaccio"]      = ["beef", "arugula", "parmesan", "capers", "olive oil"],

        // ── Vegan ────────────────────────────────────────────────────────────
        ["Buddha Bowl"]      = ["quinoa", "sweet potato", "chickpeas", "avocado", "tahini"],
        ["Vegan Burger"]     = ["plant protein", "lettuce", "tomatoes", "vegan mayo", "sweet potato"],
        ["Mushroom Risotto"] = ["arborio rice", "mushrooms", "white wine", "vegetable stock", "herbs"],
        ["Vegan Tacos"]      = ["jackfruit", "corn tortillas", "tomatoes", "onions", "avocado"],
        ["Zucchini Noodles"] = ["zucchini", "tomatoes", "walnuts", "basil", "garlic"],
        ["Vegan Brownie"]    = ["sweet potato", "cocoa powder", "almond flour", "maple syrup"],

        // ── Main Dishes ──────────────────────────────────────────────────────
        ["Ribeye Steak"]       = ["beef", "vegetables", "truffle", "butter"],
        ["Spaghetti Carbonara"] = ["pasta", "guanciale", "eggs", "pecorino", "black pepper"],
        ["Grilled Salmon"]     = ["salmon", "asparagus", "lemon", "butter", "dill"],
        ["Lobster Linguine"]   = ["lobster", "pasta", "tomatoes", "white wine", "garlic"],
        ["Chicken Parmesan"]   = ["chicken", "mozzarella", "tomato sauce", "pasta", "parmesan"],
        ["Rack of Lamb"]       = ["lamb", "potatoes", "garlic", "herbs", "red wine"],
        ["Duck Breast"]        = ["duck", "cherries", "carrots", "parsnips", "butter"],
        ["Seafood Paella"]     = ["rice", "saffron", "mussels", "shrimp", "chorizo"],

        // ── Desserts ─────────────────────────────────────────────────────────
        ["Tiramisu"]           = ["mascarpone", "coffee", "ladyfingers", "cocoa", "eggs"],
        ["Chocolate Fondant"]  = ["chocolate", "butter", "eggs", "flour", "vanilla ice cream"],
        ["Cheesecake"]         = ["cream cheese", "sugar", "eggs", "berries", "graham crackers"],
        ["Panna Cotta"]        = ["cream", "sugar", "gelatin", "vanilla bean", "passion fruit"],
        ["Creme Brulee"]       = ["cream", "egg yolks", "sugar", "vanilla"],
        ["Gelato Selection"]   = ["milk", "sugar", "cocoa", "pistachios", "strawberries"],

        // ── Drinks ───────────────────────────────────────────────────────────
        ["Fresh Orange Juice"] = ["oranges"],
        ["Espresso"]           = ["coffee beans"],
        ["Craft Beer"]         = ["malt", "hops", "yeast", "water"],
        ["House Wine"]         = ["grapes"],
        ["Iced Matcha Latte"]  = ["matcha powder", "milk", "ice", "sugar"],
        ["Sparkling Water"]    = ["mineral water", "lemon"],
        ["Mojito Mocktail"]    = ["lime", "mint", "sugar", "soda water", "ice"],
    };

    public static async Task SeedAsync(DbContext context)
    {
        // Skip dacă relațiile există deja
        if (await context.Set<ProductIngredient>().AnyAsync())
            return;

        var products = await context.Set<Product>()
            .ToDictionaryAsync(p => p.Name);

        var ingredients = await context.Set<Ingredient>()
            .ToDictionaryAsync(i => i.Name);

        var missing = new List<string>();
        var links   = new List<ProductIngredient>();

        foreach (var (productName, ingredientNames) in _map)
        {
            if (!products.TryGetValue(productName, out var product))
            {
                missing.Add($"[Product] {productName}");
                continue;
            }

            foreach (var ingredientName in ingredientNames)
            {
                if (!ingredients.TryGetValue(ingredientName, out var ingredient))
                {
                    missing.Add($"[Ingredient] {ingredientName} (for product '{productName}')");
                    continue;
                }

                links.Add(new ProductIngredient
                {
                    ProductId    = product.Id,
                    IngredientId = ingredient.Id,
                });
            }
        }

        if (missing.Count > 0)
            throw new InvalidOperationException(
                $"Seed failed — missing entries:\n{string.Join("\n", missing)}");

        await context.Set<ProductIngredient>().AddRangeAsync(links);
        await context.SaveChangesAsync();
    }
}