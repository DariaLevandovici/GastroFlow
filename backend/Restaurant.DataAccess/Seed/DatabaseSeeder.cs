using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Always ensure ingredients have correct units and defaults
        await SeedIngredientsAsync(db);

        // Always ensure image URLs are correct for the current environment
        await FixImageUrlsAsync(db);
        
        // Repair products with missing images
        await RepairProductsAsync(db);

        // Only seed if there are no products yet
        if (await db.Products.AnyAsync()) 
        {
            // Even if products exist, seed ingredients links if missing
            if (!await db.ProductIngredients.AnyAsync())
                await SeedProductIngredientsAsync(db);
            return;
        }

        // Load all images keyed by filename (e.g. "EggsBenedict.webp")
        var images = await db.Images.ToListAsync();
        var imageMap = images.ToDictionary(i => i.Filename, i => i.Id);

        async Task<Guid> GetImageIdAsync(string filename)
        {
            if (imageMap.TryGetValue(filename, out var id)) return id;
            
            // Auto-register from filesystem if missing in DB but exists on disk
            var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", filename);
            if (File.Exists(wwwrootPath))
            {
                var newId = Guid.NewGuid();
                var ext = Path.GetExtension(filename);
                var uniqueName = $"{newId}{ext}";
                var targetPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", uniqueName);
                
                File.Copy(wwwrootPath, targetPath, true);

                var newImage = new Image
                {
                    Id = newId,
                    Url = $"http://localhost:5224/images/{uniqueName}",
                    Path = uniqueName,
                    Filename = filename,
                    MimeType = "image/webp",
                    Size = (int)new FileInfo(wwwrootPath).Length,
                    CreatedAt = DateTime.UtcNow
                };

                db.Images.Add(newImage);
                await db.SaveChangesAsync();
                
                imageMap[filename] = newId;
                return newId;
            }

            throw new InvalidOperationException(
                $"Image '{filename}' not found in the Images table or wwwroot/images folder. " +
                "Please ensure the image exists in backend/Restaurant.Api/wwwroot/images/");
        }

        var products = new List<Product>
        {
            // ── Breakfast ─────────────────────────────────────────────────
            new() { Name = "Eggs Benedict",     Price = 95m,  Category = "Breakfast",   Dietary = "[\"egg\"]",                         ImageId = await GetImageIdAsync("EggsBenedict.webp") },
            new() { Name = "Avocado Toast",     Price = 75m,  Category = "Breakfast",   Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("AvocadoToast.webp") },
            new() { Name = "Pancake Stack",     Price = 85m,  Category = "Breakfast",   Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("PancakeStack.webp") },
            new() { Name = "English Breakfast", Price = 110m, Category = "Breakfast",   Dietary = "[]",                               ImageId = await GetImageIdAsync("EnglishBreakfast.webp") },
            new() { Name = "French Toast",      Price = 80m,  Category = "Breakfast",   Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("FrenchToast.webp") },
            new() { Name = "Smoothie Bowl",     Price = 90m,  Category = "Breakfast",   Dietary = "[\"vegan\",\"gluten-free\"]",       ImageId = await GetImageIdAsync("SmoothieBowl.webp") },

            // ── Starters ──────────────────────────────────────────────────
            new() { Name = "Bruschetta Classica", Price = 85m,  Category = "Starters", Dietary = "[\"vegan\"]",                       ImageId = await GetImageIdAsync("BruschettaClassica.webp") },
            new() { Name = "Caesar Salad",        Price = 95m,  Category = "Starters", Dietary = "[]",                               ImageId = await GetImageIdAsync("CaesarSalad.webp") },
            new() { Name = "Hummus Platter",      Price = 70m,  Category = "Starters", Dietary = "[\"vegan\"]",                       ImageId = await GetImageIdAsync("HummusPlatter.webp") },
            new() { Name = "Calamari Fritti",     Price = 135m, Category = "Starters", Dietary = "[]",                               ImageId = await GetImageIdAsync("CalamariFritti.webp") },
            new() { Name = "Caprese Salad",       Price = 110m, Category = "Starters", Dietary = "[\"vegetarian\",\"gluten-free\"]",  ImageId = await GetImageIdAsync("CapreseSalad.webp") },
            new() { Name = "Beef Carpaccio",      Price = 165m, Category = "Starters", Dietary = "[\"gluten-free\"]",                 ImageId = await GetImageIdAsync("BeefCarpaccio.webp") },

            // ── Vegan ─────────────────────────────────────────────────────
            new() { Name = "Buddha Bowl",      Price = 125m, Category = "Vegan", Dietary = "[\"vegan\",\"gluten-free\"]",  ImageId = await GetImageIdAsync("BuddhaBowl.webp") },
            new() { Name = "Vegan Burger",     Price = 145m, Category = "Vegan", Dietary = "[\"vegan\"]",                 ImageId = await GetImageIdAsync("VeganBurger.webp") },
            new() { Name = "Mushroom Risotto", Price = 155m, Category = "Vegan", Dietary = "[\"vegan\",\"gluten-free\"]", ImageId = await GetImageIdAsync("MushroomRisotto.webp") },
            new() { Name = "Vegan Tacos",      Price = 120m, Category = "Vegan", Dietary = "[\"vegan\",\"gluten-free\"]", ImageId = await GetImageIdAsync("VeganTacos.webp") },
            new() { Name = "Zucchini Noodles", Price = 115m, Category = "Vegan", Dietary = "[\"vegan\",\"gluten-free\"]", ImageId = await GetImageIdAsync("ZucchiniNoodles.webp") },
            new() { Name = "Vegan Brownie",    Price = 70m,  Category = "Vegan", Dietary = "[\"vegan\",\"gluten-free\"]", ImageId = await GetImageIdAsync("VeganBrownie.webp") },

            // ── Main Dishes ───────────────────────────────────────────────
            new() { Name = "Ribeye Steak",       Price = 385m, Category = "Main Dishes", Dietary = "[\"gluten-free\"]", ImageId = await GetImageIdAsync("RibeyeSteak.webp") },
            new() { Name = "Spaghetti Carbonara",Price = 165m, Category = "Main Dishes", Dietary = "[]",               ImageId = await GetImageIdAsync("SpaghettiCarbonara.webp") },
            new() { Name = "Grilled Salmon",     Price = 295m, Category = "Main Dishes", Dietary = "[\"gluten-free\"]", ImageId = await GetImageIdAsync("GrilledSalmon.webp") },
            new() { Name = "Lobster Linguine",   Price = 425m, Category = "Main Dishes", Dietary = "[]",               ImageId = await GetImageIdAsync("LobsterLinguine.webp") },
            new() { Name = "Chicken Parmesan",   Price = 185m, Category = "Main Dishes", Dietary = "[]",               ImageId = await GetImageIdAsync("ChickenParmesan.webp") },
            new() { Name = "Rack of Lamb",       Price = 450m, Category = "Main Dishes", Dietary = "[\"gluten-free\"]", ImageId = await GetImageIdAsync("RackofLamb.webp") },
            new() { Name = "Duck Breast",        Price = 360m, Category = "Main Dishes", Dietary = "[\"gluten-free\"]", ImageId = await GetImageIdAsync("DuckBreast.webp") },
            new() { Name = "Seafood Paella",     Price = 395m, Category = "Main Dishes", Dietary = "[]",               ImageId = await GetImageIdAsync("SeafoodPaella.webp") },

            // ── Desserts ──────────────────────────────────────────────────
            new() { Name = "Tiramisu",          Price = 75m, Category = "Desserts", Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("Tiramisu.webp") },
            new() { Name = "Chocolate Fondant", Price = 85m, Category = "Desserts", Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("ChocolateFondant.webp") },
            new() { Name = "Cheesecake",        Price = 80m, Category = "Desserts", Dietary = "[\"vegetarian\"]",                  ImageId = await GetImageIdAsync("Cheesecake.webp") },
            new() { Name = "Panna Cotta",       Price = 85m, Category = "Desserts", Dietary = "[\"gluten-free\"]",                 ImageId = await GetImageIdAsync("PannaCotta.webp") },
            new() { Name = "Creme Brulee",      Price = 95m, Category = "Desserts", Dietary = "[\"vegetarian\",\"gluten-free\"]",  ImageId = await GetImageIdAsync("CremeBrulee.webp") },
            new() { Name = "Gelato Selection",  Price = 65m, Category = "Desserts", Dietary = "[\"vegetarian\",\"gluten-free\"]",  ImageId = await GetImageIdAsync("GelatoSelection.webp") },

            // ── Drinks ────────────────────────────────────────────────────
            new() { Name = "Fresh Orange Juice", Price = 35m, Category = "Drinks", Dietary = "[\"vegan\",\"gluten-free\"]",      ImageId = await GetImageIdAsync("FreshOrangeJuice.webp") },
            new() { Name = "Espresso",           Price = 25m, Category = "Drinks", Dietary = "[\"vegan\",\"gluten-free\"]",      ImageId = await GetImageIdAsync("Espresso.webp") },
            new() { Name = "Craft Beer",         Price = 45m, Category = "Drinks", Dietary = "[]",                              ImageId = await GetImageIdAsync("CraftBeer.webp") },
            new() { Name = "House Wine",         Price = 55m, Category = "Drinks", Dietary = "[\"vegan\",\"gluten-free\"]",     ImageId = await GetImageIdAsync("HouseWine.webp") },
            new() { Name = "Iced Matcha Latte",  Price = 55m, Category = "Drinks", Dietary = "[\"vegetarian\",\"gluten-free\"]",ImageId = await GetImageIdAsync("IcedMatchaLatte.webp") },
            new() { Name = "Sparkling Water",    Price = 30m, Category = "Drinks", Dietary = "[\"vegan\",\"gluten-free\"]",     ImageId = await GetImageIdAsync("SparklingWater.webp") },
            new() { Name = "Mojito Mocktail",    Price = 45m, Category = "Drinks", Dietary = "[\"vegan\",\"gluten-free\"]",     ImageId = await GetImageIdAsync("MojitoMocktail.webp") },
        };

        // Set Description for each product
        products[0].Description  = "Poached eggs, Canadian bacon, hollandaise sauce on English muffin";
        products[1].Description  = "Smashed avocado, cherry tomatoes, feta cheese on sourdough";
        products[2].Description  = "Fluffy pancakes with maple syrup, berries, and whipped cream";
        products[3].Description  = "Traditional full English breakfast with sausages, beans, and eggs";
        products[4].Description  = "Brioche bread soaked in egg and milk, served with cinnamon and syrup";
        products[5].Description  = "Berry smoothie base topped with granola, coconut flakes, and fresh fruit";
        products[6].Description  = "Toasted bread with tomatoes, garlic, basil and olive oil";
        products[7].Description  = "Romaine lettuce, parmesan, croutons, Caesar dressing";
        products[8].Description  = "Creamy hummus with pita bread, olives, and vegetables";
        products[9].Description  = "Crispy fried squid rings served with garlic aioli and lemon";
        products[10].Description = "Fresh mozzarella, ripe tomatoes, sweet basil, and balsamic reduction";
        products[11].Description = "Thinly sliced raw beef topped with arugula, parmesan shavings, and capers";
        products[12].Description = "Quinoa, roasted vegetables, avocado, tahini dressing";
        products[13].Description = "Plant-based patty, lettuce, tomato, vegan mayo, sweet potato fries";
        products[14].Description = "Creamy arborio rice with wild mushrooms and herbs";
        products[15].Description = "Corn tortillas filled with jackfruit, pico de gallo, and avocado";
        products[16].Description = "Zoodles tossed in a rich tomato and walnut pesto sauce";
        products[17].Description = "Fudgy chocolate brownie made with sweet potato and almond flour";
        products[18].Description = "Premium 350g ribeye, grilled vegetables, truffle sauce";
        products[19].Description = "Classic Roman pasta with guanciale, eggs, pecorino";
        products[20].Description = "Atlantic salmon, asparagus, lemon butter sauce";
        products[21].Description = "Fresh lobster, cherry tomatoes, white wine, garlic";
        products[22].Description = "Breaded chicken breast, marinara sauce, mozzarella, pasta";
        products[23].Description = "Herb-crusted rack of lamb with garlic mashed potatoes and red wine reduction";
        products[24].Description = "Pan-seared duck breast with cherry sauce and roasted root vegetables";
        products[25].Description = "Traditional Spanish rice dish with saffron, mussels, shrimp, and chorizo";
        products[26].Description = "Classic Italian coffee-flavored dessert";
        products[27].Description = "Warm chocolate cake with molten center, vanilla ice cream";
        products[28].Description = "New York style cheesecake with berry compote";
        products[29].Description = "Vanilla bean panna cotta topped with a vibrant passion fruit coulis";
        products[30].Description = "Classic French custard dessert with a hard caramel top";
        products[31].Description = "Three scoops of artisanal Italian gelato (chocolate, pistachio, strawberry)";
        products[32].Description = "Freshly squeezed orange juice";
        products[33].Description = "Strong Italian coffee";
        products[34].Description = "Local craft beer selection";
        products[35].Description = "Red or white wine selection";
        products[36].Description = "Premium ceremonial grade matcha over milk and ice";
        products[37].Description = "San Pellegrino sparkling water with a slice of lemon";
        products[38].Description = "Refreshing blend of lime, fresh mint, sugar, and soda water";

        db.Products.AddRange(products);
        await db.SaveChangesAsync();

        System.Console.WriteLine($"[Seed] Inserted {products.Count} products successfully.");

        await SeedProductIngredientsAsync(db);
    }

    private static async Task SeedIngredientsAsync(AppDbContext db)
    {
        var existing = await db.Ingredients.ToListAsync();
        var existingMap = existing.ToDictionary(i => i.Name.ToLower(), i => i);

        var data = new List<(string name, string unit, decimal qty, decimal min, string cat)>
        {
            ("Eggs", "pcs", 100, 20, "Dairy"),
            ("Bacon", "g", 5000, 1000, "Meat"),
            ("Butter", "g", 2000, 500, "Dairy"),
            ("Lemon", "pcs", 50, 10, "Produce"),
            ("English Muffin", "pcs", 40, 10, "Bakery"),
            ("Avocado", "pcs", 30, 5, "Produce"),
            ("Tomatoes", "g", 10000, 2000, "Produce"),
            ("Feta", "g", 2000, 500, "Dairy"),
            ("Bread", "g", 5000, 1000, "Bakery"),
            ("Flour", "g", 20000, 5000, "Dry Goods"),
            ("Milk", "ml", 15000, 3000, "Dairy"),
            ("Berries", "g", 3000, 500, "Produce"),
            ("Maple Syrup", "ml", 2000, 500, "Dry Goods"),
            ("Sausages", "pcs", 100, 20, "Meat"),
            ("Baked Beans", "g", 5000, 1000, "Canned"),
            ("Toast", "pcs", 100, 20, "Bakery"),
            ("Mushrooms", "g", 3000, 500, "Produce"),
            ("Brioche", "pcs", 30, 5, "Bakery"),
            ("Cinnamon", "g", 500, 100, "Spices"),
            ("Mixed Berries", "g", 3000, 500, "Produce"),
            ("Banana", "pcs", 40, 10, "Produce"),
            ("Granola", "g", 2000, 500, "Dry Goods"),
            ("Coconut", "g", 1000, 200, "Produce"),
            ("Almond Milk", "ml", 5000, 1000, "Dairy"),
            ("Garlic", "g", 1000, 200, "Produce"),
            ("Basil", "g", 500, 100, "Produce"),
            ("Olive Oil", "ml", 5000, 1000, "Dry Goods"),
            ("Lettuce", "g", 3000, 500, "Produce"),
            ("Parmesan", "g", 2000, 500, "Dairy"),
            ("Croutons", "g", 1000, 200, "Bakery"),
            ("Anchovies", "g", 500, 100, "Canned"),
            ("Chickpeas", "g", 5000, 1000, "Canned"),
            ("Tahini", "g", 1000, 200, "Dry Goods"),
            ("Pita", "pcs", 50, 10, "Bakery"),
            ("Squid", "g", 5000, 1000, "Seafood"),
            ("Mayonnaise", "ml", 2000, 500, "Dry Goods"),
            ("Mozzarella", "g", 5000, 1000, "Dairy"),
            ("Balsamic Vinegar", "ml", 1000, 200, "Dry Goods"),
            ("Beef", "g", 15000, 3000, "Meat"),
            ("Arugula", "g", 1000, 200, "Produce"),
            ("Capers", "g", 500, 100, "Canned"),
            ("Quinoa", "g", 5000, 1000, "Dry Goods"),
            ("Sweet Potato", "g", 10000, 2000, "Produce"),
            ("Plant Protein", "g", 5000, 1000, "Dry Goods"),
            ("Vegan Mayo", "ml", 1000, 200, "Dry Goods"),
            ("Arborio Rice", "g", 5000, 1000, "Dry Goods"),
            ("White Wine", "ml", 5000, 1000, "Alcohol"),
            ("Vegetable Stock", "ml", 10000, 2000, "Dry Goods"),
            ("Herbs", "g", 500, 100, "Produce"),
            ("Jackfruit", "g", 3000, 500, "Produce"),
            ("Corn Tortillas", "pcs", 100, 20, "Bakery"),
            ("Onions", "g", 5000, 1000, "Produce"),
            ("Zucchini", "g", 5000, 1000, "Produce"),
            ("Walnuts", "g", 1000, 200, "Produce"),
            ("Cocoa Powder", "g", 1000, 200, "Dry Goods"),
            ("Almond Flour", "g", 2000, 500, "Dry Goods"),
            ("Vegetables", "g", 10000, 2000, "Produce"),
            ("Truffle", "g", 200, 50, "Specialty"),
            ("Pasta", "g", 10000, 2000, "Dry Goods"),
            ("Guanciale", "g", 2000, 500, "Meat"),
            ("Pecorino", "g", 1000, 200, "Dairy"),
            ("Black Pepper", "g", 500, 100, "Spices"),
            ("Salmon", "g", 5000, 1000, "Seafood"),
            ("Asparagus", "g", 3000, 500, "Produce"),
            ("Dill", "g", 200, 50, "Produce"),
            ("Lobster", "g", 3000, 500, "Seafood"),
            ("Chicken", "g", 10000, 2000, "Meat"),
            ("Tomato Sauce", "ml", 5000, 1000, "Canned"),
            ("Lamb", "g", 5000, 1000, "Meat"),
            ("Potatoes", "pcs", 100, 20, "Produce"),
            ("Red Wine", "ml", 5000, 1000, "Alcohol"),
            ("Duck", "g", 3000, 500, "Meat"),
            ("Cherries", "g", 1000, 200, "Produce"),
            ("Carrots", "g", 3000, 500, "Produce"),
            ("Parsnips", "g", 2000, 500, "Produce"),
            ("Rice", "g", 5000, 1000, "Dry Goods"),
            ("Saffron", "g", 50, 10, "Spices"),
            ("Mussels", "g", 3000, 500, "Seafood"),
            ("Shrimp", "g", 3000, 500, "Seafood"),
            ("Chorizo", "g", 2000, 500, "Meat"),
            ("Mascarpone", "g", 2000, 500, "Dairy"),
            ("Coffee", "ml", 5000, 1000, "Drinks"),
            ("Ladyfingers", "pcs", 100, 20, "Bakery"),
            ("Cocoa", "g", 1000, 200, "Dry Goods"),
            ("Chocolate", "g", 3000, 500, "Dry Goods"),
            ("Vanilla Ice Cream", "g", 2000, 500, "Dairy"),
            ("Cream Cheese", "g", 2000, 500, "Dairy"),
            ("Sugar", "g", 10000, 2000, "Dry Goods"),
            ("Graham Crackers", "g", 1000, 200, "Bakery"),
            ("Cream", "ml", 5000, 1000, "Dairy"),
            ("Gelatin", "g", 500, 100, "Dry Goods"),
            ("Vanilla Bean", "pcs", 20, 5, "Produce"),
            ("Passion Fruit", "pcs", 30, 5, "Produce"),
            ("Egg Yolks", "pcs", 50, 10, "Dairy"),
            ("Vanilla", "ml", 500, 100, "Dry Goods"),
            ("Pistachios", "g", 1000, 200, "Produce"),
            ("Strawberries", "g", 2000, 500, "Produce"),
            ("Oranges", "pcs", 100, 20, "Produce"),
            ("Coffee Beans", "g", 2000, 500, "Dry Goods"),
            ("Malt", "g", 5000, 1000, "Dry Goods"),
            ("Hops", "g", 1000, 200, "Dry Goods"),
            ("Yeast", "g", 500, 100, "Dry Goods"),
            ("Water", "ml", 100000, 10000, "Drinks"),
            ("Grapes", "g", 5000, 1000, "Produce"),
            ("Matcha Powder", "g", 500, 100, "Dry Goods"),
            ("Ice", "g", 20000, 5000, "Drinks"),
            ("Mineral Water", "ml", 50000, 5000, "Drinks"),
            ("Lime", "pcs", 50, 10, "Produce"),
            ("Mint", "g", 500, 100, "Produce"),
            ("Soda Water", "ml", 50000, 5000, "Drinks"),
        };

        foreach (var item in data)
        {
            if (existingMap.TryGetValue(item.name.ToLower(), out var ing))
            {
                ing.Unit = item.unit;
                ing.Quantity = item.qty;
                ing.MinStock = item.min;
                ing.Category = item.cat;
            }
            else
            {
                db.Ingredients.Add(new Ingredient
                {
                    Name = item.name,
                    Unit = item.unit,
                    Quantity = item.qty,
                    MinStock = item.min,
                    Category = item.cat
                });
            }
        }

        await db.SaveChangesAsync();
        System.Console.WriteLine($"[Seed] Updated {data.Count} ingredients with units and stock.");
    }

    private static async Task SeedProductIngredientsAsync(AppDbContext db)
    {
        // Build lookup maps
        var products = await db.Products.ToDictionaryAsync(p => p.Name, p => p.Id);
        var ingredients = await db.Ingredients.ToDictionaryAsync(i => i.Name.ToLower(), i => i.Id);

        int GetIngId(string name)
        {
            if (ingredients.TryGetValue(name.ToLower(), out var id)) return id;
            System.Console.WriteLine($"[Seed] WARNING: Ingredient '{name}' not found, skipping.");
            return -1;
        }

        // Map: product name -> list of (ingredient name, amount)
        var map = new Dictionary<string, (string name, decimal amount)[]>
        {
            ["Eggs Benedict"]      = [("Eggs", 2), ("Bacon", 50), ("Butter", 30), ("Lemon", 0.2m), ("English Muffin", 1)],
            ["Avocado Toast"]      = [("Avocado", 0.5m), ("Tomatoes", 50), ("Feta", 30), ("Bread", 100)],
            ["Pancake Stack"]      = [("Flour", 150), ("Milk", 200), ("Eggs", 2), ("Berries", 50), ("Maple Syrup", 30)],
            ["English Breakfast"]  = [("Sausages", 2), ("Eggs", 2), ("Baked Beans", 100), ("Toast", 2), ("Mushrooms", 50)],
            ["French Toast"]       = [("Brioche", 2), ("Eggs", 2), ("Milk", 100), ("Cinnamon", 5), ("Maple Syrup", 30)],
            ["Smoothie Bowl"]      = [("Mixed Berries", 100), ("Banana", 1), ("Granola", 50), ("Coconut", 20), ("Almond Milk", 200)],
            ["Bruschetta Classica"]= [("Bread", 100), ("Tomatoes", 100), ("Garlic", 10), ("Basil", 5), ("Olive Oil", 15)],
            ["Caesar Salad"]       = [("Lettuce", 150), ("Parmesan", 30), ("Croutons", 50), ("Anchovies", 10), ("Eggs", 1)],
            ["Hummus Platter"]     = [("Chickpeas", 150), ("Tahini", 50), ("Lemon", 0.5m), ("Garlic", 10), ("Pita", 2)],
            ["Calamari Fritti"]    = [("Squid", 200), ("Flour", 50), ("Lemon", 0.5m), ("Garlic", 10), ("Mayonnaise", 30)],
            ["Caprese Salad"]      = [("Mozzarella", 125), ("Tomatoes", 150), ("Basil", 10), ("Balsamic Vinegar", 20), ("Olive Oil", 20)],
            ["Beef Carpaccio"]     = [("Beef", 100), ("Arugula", 30), ("Parmesan", 20), ("Capers", 10), ("Olive Oil", 15)],
            ["Buddha Bowl"]        = [("Quinoa", 100), ("Sweet Potato", 150), ("Chickpeas", 100), ("Avocado", 0.5m), ("Tahini", 30)],
            ["Vegan Burger"]       = [("Plant Protein", 150), ("Lettuce", 30), ("Tomato", 50), ("Vegan Mayo", 20), ("Sweet Potato", 150)],
            ["Mushroom Risotto"]   = [("Arborio Rice", 120), ("Mushrooms", 100), ("White Wine", 50), ("Vegetable Stock", 300), ("Herbs", 10)],
            ["Vegan Tacos"]        = [("Jackfruit", 150), ("Corn Tortillas", 3), ("Tomatoes", 100), ("Onions", 50), ("Avocado", 0.5m)],
            ["Zucchini Noodles"]   = [("Zucchini", 250), ("Tomatoes", 100), ("Walnuts", 30), ("Basil", 10), ("Garlic", 10)],
            ["Vegan Brownie"]      = [("Sweet Potato", 200), ("Cocoa Powder", 50), ("Almond Flour", 150), ("Maple Syrup", 100)],
            ["Ribeye Steak"]       = [("Beef", 350), ("Vegetables", 200), ("Truffle", 10), ("Butter", 30)],
            ["Spaghetti Carbonara"]= [("Pasta", 150), ("Guanciale", 80), ("Eggs", 2), ("Pecorino", 40), ("Black Pepper", 5)],
            ["Grilled Salmon"]     = [("Salmon", 200), ("Asparagus", 150), ("Lemon", 0.5m), ("Butter", 20), ("Dill", 5)],
            ["Lobster Linguine"]   = [("Lobster", 150), ("Pasta", 150), ("Tomatoes", 100), ("White Wine", 50), ("Garlic", 15)],
            ["Chicken Parmesan"]   = [("Chicken", 200), ("Mozzarella", 50), ("Tomato Sauce", 100), ("Pasta", 150), ("Parmesan", 20)],
            ["Rack of Lamb"]       = [("Lamb", 300), ("Potatoes", 2), ("Garlic", 15), ("Herbs", 10), ("Red Wine", 100)],
            ["Duck Breast"]        = [("Duck", 250), ("Cherries", 50), ("Carrots", 100), ("Parsnips", 100), ("Butter", 20)],
            ["Seafood Paella"]     = [("Rice", 150), ("Saffron", 0.1m), ("Mussels", 100), ("Shrimp", 100), ("Chorizo", 50)],
            ["Tiramisu"]           = [("Mascarpone", 150), ("Coffee", 100), ("Ladyfingers", 6), ("Cocoa", 10), ("Eggs", 1)],
            ["Chocolate Fondant"]  = [("Chocolate", 100), ("Butter", 50), ("Eggs", 2), ("Flour", 30), ("Vanilla Ice Cream", 100)],
            ["Cheesecake"]         = [("Cream Cheese", 200), ("Sugar", 100), ("Eggs", 2), ("Berries", 50), ("Graham Crackers", 100)],
            ["Panna Cotta"]        = [("Cream", 200), ("Sugar", 50), ("Gelatin", 10), ("Vanilla Bean", 1), ("Passion Fruit", 1)],
            ["Creme Brulee"]       = [("Cream", 200), ("Egg Yolks", 3), ("Sugar", 50), ("Vanilla", 10)],
            ["Gelato Selection"]   = [("Milk", 200), ("Sugar", 50), ("Cocoa", 20), ("Pistachios", 20), ("Strawberries", 50)],
            ["Fresh Orange Juice"] = [("Oranges", 3)],
            ["Espresso"]           = [("Coffee Beans", 15)],
            ["Craft Beer"]         = [("Malt", 100), ("Hops", 20), ("Yeast", 10), ("Water", 330)],
            ["House Wine"]         = [("Grapes", 500)],
            ["Iced Matcha Latte"]  = [("Matcha Powder", 10), ("Milk", 200), ("Ice", 100), ("Sugar", 10)],
            ["Sparkling Water"]    = [("Mineral Water", 500), ("Lemon", 0.2m)],
            ["Mojito Mocktail"]    = [("Lime", 1), ("Mint", 10), ("Sugar", 20), ("Soda Water", 200), ("Ice", 100)],
        };

        var links = new List<ProductIngredient>();

        foreach (var (productName, ingredientData) in map)
        {
            if (!products.TryGetValue(productName, out var productId))
            {
                System.Console.WriteLine($"[Seed] WARNING: Product '{productName}' not found, skipping.");
                continue;
            }

            foreach (var (ingName, amount) in ingredientData)
            {
                var ingId = GetIngId(ingName);
                if (ingId == -1) continue;

                links.Add(new ProductIngredient
                {
                    ProductId    = productId,
                    IngredientId = ingId,
                    AmountNeeded = amount
                });
            }
        }

        db.ProductIngredients.AddRange(links);
        await db.SaveChangesAsync();

        System.Console.WriteLine($"[Seed] Inserted {links.Count} product-ingredient links successfully.");
    }

    private static async Task RepairProductsAsync(AppDbContext db)
    {
        var products = await db.Products.Include(p => p.MainImage).ToListAsync();
        var images = await db.Images.ToListAsync();
        var imageMap = images.ToDictionary(i => i.Filename, i => i.Id);
        
        // Mapping of product names to expected filenames (simplified)
        var nameToFilename = new Dictionary<string, string>
        {
            ["Eggs Benedict"] = "EggsBenedict.webp",
            ["Avocado Toast"] = "AvocadoToast.webp",
            ["Pancake Stack"] = "PancakeStack.webp",
            ["English Breakfast"] = "EnglishBreakfast.webp",
            ["French Toast"] = "FrenchToast.webp",
            ["Smoothie Bowl"] = "SmoothieBowl.webp",
            ["Bruschetta Classica"] = "BruschettaClassica.webp",
            ["Caesar Salad"] = "CaesarSalad.webp",
            ["Hummus Platter"] = "HummusPlatter.webp",
            ["Calamari Fritti"] = "CalamariFritti.webp",
            ["Caprese Salad"] = "CapreseSalad.webp",
            ["Beef Carpaccio"] = "BeefCarpaccio.webp",
            ["Buddha Bowl"] = "BuddhaBowl.webp",
            ["Vegan Burger"] = "VeganBurger.webp",
            ["Mushroom Risotto"] = "MushroomRisotto.webp",
            ["Vegan Tacos"] = "VeganTacos.webp",
            ["Zucchini Noodles"] = "ZucchiniNoodles.webp",
            ["Vegan Brownie"] = "VeganBrownie.webp",
            ["Ribeye Steak"] = "RibeyeSteak.webp",
            ["Spaghetti Carbonara"] = "SpaghettiCarbonara.webp",
            ["Grilled Salmon"] = "GrilledSalmon.webp",
            ["Lobster Linguine"] = "LobsterLinguine.webp",
            ["Chicken Parmesan"] = "ChickenParmesan.webp",
            ["Rack of Lamb"] = "RackofLamb.webp",
            ["Duck Breast"] = "DuckBreast.webp",
            ["Seafood Paella"] = "SeafoodPaella.webp",
            ["Tiramisu"] = "Tiramisu.webp",
            ["Chocolate Fondant"] = "ChocolateFondant.webp",
            ["Cheesecake"] = "Cheesecake.webp",
            ["Panna Cotta"] = "PannaCotta.webp",
            ["Creme Brulee"] = "CremeBrulee.webp",
            ["Gelato Selection"] = "GelatoSelection.webp",
            ["Fresh Orange Juice"] = "FreshOrangeJuice.webp",
            ["Espresso"] = "Espresso.webp",
            ["Craft Beer"] = "CraftBeer.webp",
            ["House Wine"] = "HouseWine.webp",
            ["Iced Matcha Latte"] = "IcedMatchaLatte.webp",
            ["Sparkling Water"] = "SparklingWater.webp",
            ["Mojito Mocktail"] = "MojitoMocktail.webp"
        };

        bool changed = false;
        foreach (var p in products)
        {
            bool fileExists = p.MainImage != null && File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", p.MainImage.Path));
            
            if (!fileExists && nameToFilename.TryGetValue(p.Name, out var filename))
            {
                // Try to get or create image ID
                var imageId = await GetOrRegisterImageAsync(db, filename, imageMap);
                if (imageId != Guid.Empty)
                {
                    p.ImageId = imageId;
                    changed = true;
                    System.Console.WriteLine($"[Seed] Fixed/Repaired image for product: {p.Name}");
                }
            }
        }

        if (changed) await db.SaveChangesAsync();
    }

    private static async Task<Guid> GetOrRegisterImageAsync(AppDbContext db, string filename, Dictionary<string, Guid> imageMap)
    {
        if (imageMap.TryGetValue(filename, out var id)) return id;

        var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", filename);
        if (File.Exists(wwwrootPath))
        {
            var newId = Guid.NewGuid();
            var ext = Path.GetExtension(filename);
            var uniqueName = $"{newId}{ext}";
            var targetPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", uniqueName);
            
            File.Copy(wwwrootPath, targetPath, true);

            var newImage = new Image
            {
                Id = newId,
                Url = $"http://localhost:5224/images/{uniqueName}",
                Path = uniqueName,
                Filename = filename,
                MimeType = "image/webp",
                Size = (int)new FileInfo(wwwrootPath).Length,
                CreatedAt = DateTime.UtcNow
            };

            db.Images.Add(newImage);
            await db.SaveChangesAsync();
            
            imageMap[filename] = newId;
            return newId;
        }

        return Guid.Empty;
    }

    private static async Task FixImageUrlsAsync(AppDbContext db)
    {
        var images = await db.Images.ToListAsync();
        bool changed = false;
        foreach (var img in images)
        {
            var expectedUrl = $"http://localhost:5224/images/{img.Path}";
            if (img.Url != expectedUrl)
            {
                img.Url = expectedUrl;
                changed = true;
            }
        }
        if (changed) 
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine($"[Seed] Fixed {images.Count} image URLs.");
        }
    }
}

