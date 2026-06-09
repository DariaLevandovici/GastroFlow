using Microsoft.EntityFrameworkCore;
using Restaurant.DataAccess.Context;
using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedAdminUserAsync(db);
        await SeedDemoStaffUsersAsync(db);
        await SeedDemoClientUserAsync(db);
        await SeedCategoriesAsync(db);

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

            await SeedPresentationDataAsync(db);
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
        await SeedPresentationDataAsync(db);
    }

    private static async Task SeedAdminUserAsync(AppDbContext db)
    {
        const string adminEmail = "admin@gastroflow.md";

        var admin = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == adminEmail);
        if (admin == null)
        {
            db.Users.Add(new User
            {
                FirstName = "Admin",
                LastName = "GastroFlow",
                Email = adminEmail,
                PasswordHash = "123456",
                Role = Role.Admin,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            admin.FirstName = string.IsNullOrWhiteSpace(admin.FirstName) ? "Admin" : admin.FirstName;
            admin.LastName = string.IsNullOrWhiteSpace(admin.LastName) ? "GastroFlow" : admin.LastName;
            admin.PasswordHash = "123456";
            admin.Role = Role.Admin;
        }

        await db.SaveChangesAsync();
        System.Console.WriteLine("[Seed] Ensured admin@gastroflow.md user.");
    }

    private static async Task SeedDemoStaffUsersAsync(AppDbContext db)
    {
        var staffUsers = new[]
        {
            new { Email = "waiter@gastroflow.md", FirstName = "Demo", LastName = "Waiter", Role = Role.Waiter },
            new { Email = "cook@gastroflow.md", FirstName = "Demo", LastName = "Cook", Role = Role.Chef },
            new { Email = "bucatar@gastroflow.md", FirstName = "Demo", LastName = "Bucatar", Role = Role.Chef }
        };

        foreach (var staff in staffUsers)
        {
            var email = staff.Email.ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
            {
                db.Users.Add(new User
                {
                    FirstName = staff.FirstName,
                    LastName = staff.LastName,
                    Email = staff.Email,
                    PasswordHash = "123456",
                    Role = staff.Role,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                user.FirstName = string.IsNullOrWhiteSpace(user.FirstName) ? staff.FirstName : user.FirstName;
                user.LastName = string.IsNullOrWhiteSpace(user.LastName) ? staff.LastName : user.LastName;
                user.PasswordHash = "123456";
                user.Role = staff.Role;
            }
        }

        await db.SaveChangesAsync();
        System.Console.WriteLine("[Seed] Ensured demo staff users.");
    }

    private static async Task SeedDemoClientUserAsync(AppDbContext db)
    {
        const string clientEmail = "client@gastroflow.md";

        var client = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == clientEmail);
        if (client == null)
        {
            db.Users.Add(new User
            {
                FirstName = "Demo",
                LastName = "Client",
                Email = clientEmail,
                PasswordHash = "123456",
                Role = Role.Client,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            client.FirstName = string.IsNullOrWhiteSpace(client.FirstName) ? "Demo" : client.FirstName;
            client.LastName = string.IsNullOrWhiteSpace(client.LastName) ? "Client" : client.LastName;
            client.PasswordHash = "123456";
            client.Role = Role.Client;
        }

        await db.SaveChangesAsync();
        System.Console.WriteLine("[Seed] Ensured client@gastroflow.md user.");
    }

    private static async Task SeedCategoriesAsync(AppDbContext db)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        db.Categories.AddRange(
            new Category { Name = "Breakfast", Description = "Morning dishes and brunch favorites." },
            new Category { Name = "Starters", Description = "Small plates and appetizers." },
            new Category { Name = "Vegan", Description = "Plant-based dishes." },
            new Category { Name = "Main Dishes", Description = "Signature plates and entrees." },
            new Category { Name = "Desserts", Description = "Sweet dishes prepared in house." },
            new Category { Name = "Drinks", Description = "Coffee, juices, mocktails, and beverages." }
        );

        await db.SaveChangesAsync();
        System.Console.WriteLine("[Seed] Inserted demo categories.");
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

    private static async Task SeedPresentationDataAsync(AppDbContext db)
    {
        await SeedTablesAsync(db);
        await SeedRecipesAsync(db);
        await SeedOrdersAndOrderItemsAsync(db);
        await SeedReservationsAsync(db);
        await SeedAddressesAsync(db);
    }

    private static async Task SeedTablesAsync(AppDbContext db)
    {
        var existingTables = await db.Tables.ToListAsync();
        var tableDefinitions = new[]
        {
            new { TableNumber = 1, Capacity = 4, IsOccupied = false },
            new { TableNumber = 2, Capacity = 2, IsOccupied = false },
            new { TableNumber = 3, Capacity = 6, IsOccupied = false },
            new { TableNumber = 4, Capacity = 4, IsOccupied = true },
            new { TableNumber = 5, Capacity = 2, IsOccupied = false },
            new { TableNumber = 6, Capacity = 6, IsOccupied = false },
            new { TableNumber = 7, Capacity = 4, IsOccupied = true },
            new { TableNumber = 8, Capacity = 2, IsOccupied = false },
            new { TableNumber = 9, Capacity = 6, IsOccupied = false },
            new { TableNumber = 10, Capacity = 4, IsOccupied = false },
            new { TableNumber = 11, Capacity = 2, IsOccupied = false },
            new { TableNumber = 12, Capacity = 6, IsOccupied = false }
        };

        var changed = false;
        var missingTables = new List<Table>();

        foreach (var definition in tableDefinitions)
        {
            var existing = existingTables.FirstOrDefault(t => t.TableNumber == definition.TableNumber);
            if (existing == null)
            {
                missingTables.Add(new Table
                {
                    TableNumber = definition.TableNumber,
                    Capacity = definition.Capacity,
                    IsOccupied = definition.IsOccupied
                });
                continue;
            }

            if (existing.Capacity != definition.Capacity)
            {
                existing.Capacity = definition.Capacity;
                changed = true;
            }
        }

        if (missingTables.Count > 0)
        {
            db.Tables.AddRange(missingTables);
            changed = true;
        }

        if (changed)
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Ensured 12 restaurant tables with realistic capacities.");
        }
    }

    private static async Task SeedRecipesAsync(AppDbContext db)
    {
        var recipeData = new Dictionary<string, (string ingredients, string instructions, int minutes)>
        {
            ["Eggs Benedict"] = (
                "Eggs, bacon, English muffin, butter, lemon, hollandaise sauce",
                "1. Toast the English muffin and sear the bacon until crisp. 2. Poach the eggs until the whites are set and yolks remain soft. 3. Whisk warm hollandaise with butter and lemon, then assemble and serve immediately.",
                18),
            ["Avocado Toast"] = (
                "Avocado, sourdough bread, tomatoes, feta, lemon, olive oil",
                "1. Toast sourdough until golden. 2. Mash avocado with lemon, salt, and olive oil. 3. Top with tomatoes and feta, then finish with herbs.",
                12),
            ["Pancake Stack"] = (
                "Flour, milk, eggs, berries, maple syrup, butter",
                "1. Mix batter until just combined and rest briefly. 2. Cook pancakes on a buttered griddle until fluffy. 3. Stack with berries and maple syrup.",
                20),
            ["Bruschetta Classica"] = (
                "Bread, tomatoes, garlic, basil, olive oil",
                "1. Grill sliced bread and rub with garlic. 2. Dice tomatoes and mix with basil, olive oil, salt, and pepper. 3. Spoon topping over bread just before serving.",
                10),
            ["Caesar Salad"] = (
                "Lettuce, parmesan, croutons, anchovies, egg, Caesar dressing",
                "1. Wash and dry lettuce leaves thoroughly. 2. Blend dressing with egg, anchovies, parmesan, and lemon. 3. Toss with croutons and finish with parmesan.",
                15),
            ["Hummus Platter"] = (
                "Chickpeas, tahini, lemon, garlic, pita, olives, vegetables",
                "1. Blend chickpeas with tahini, lemon, garlic, and olive oil until smooth. 2. Warm pita and slice vegetables. 3. Plate hummus with toppings and serve.",
                14),
            ["Calamari Fritti"] = (
                "Squid, flour, lemon, garlic, mayonnaise, oil",
                "1. Slice squid and pat dry. 2. Coat lightly in seasoned flour and fry until crisp. 3. Serve with lemon wedges and garlic aioli.",
                16),
            ["Caprese Salad"] = (
                "Mozzarella, tomatoes, basil, balsamic vinegar, olive oil",
                "1. Slice tomatoes and mozzarella evenly. 2. Layer with basil leaves on a chilled plate. 3. Season and finish with olive oil and balsamic reduction.",
                8),
            ["Ribeye Steak"] = (
                "Beef ribeye, butter, vegetables, garlic, herbs, truffle sauce",
                "1. Season ribeye and sear on high heat for a crust. 2. Baste with butter, garlic, and herbs to desired doneness. 3. Rest, slice, and serve with vegetables and sauce.",
                28),
            ["Spaghetti Carbonara"] = (
                "Pasta, guanciale, eggs, pecorino, black pepper",
                "1. Render guanciale until crisp and boil pasta al dente. 2. Toss pasta with egg, pecorino, pepper, and pasta water off heat. 3. Fold in guanciale and serve creamy.",
                22),
            ["Grilled Salmon"] = (
                "Salmon, asparagus, lemon, butter, dill",
                "1. Season salmon and grill skin-side down. 2. Saute asparagus with butter and lemon. 3. Plate with dill butter and a lemon wedge.",
                24),
            ["Chicken Parmesan"] = (
                "Chicken, tomato sauce, mozzarella, parmesan, pasta",
                "1. Bread and pan-fry chicken until golden. 2. Top with tomato sauce and mozzarella, then bake until melted. 3. Serve with pasta and parmesan.",
                30),
            ["Tiramisu"] = (
                "Mascarpone, coffee, ladyfingers, cocoa, eggs, sugar",
                "1. Whip mascarpone cream with eggs and sugar. 2. Dip ladyfingers quickly in coffee and layer with cream. 3. Chill, dust with cocoa, and slice.",
                35),
            ["Chocolate Fondant"] = (
                "Chocolate, butter, eggs, flour, vanilla ice cream",
                "1. Melt chocolate with butter and fold into whipped eggs and flour. 2. Bake in molds until the edges set and center stays molten. 3. Serve warm with vanilla ice cream.",
                18),
            ["Fresh Orange Juice"] = (
                "Fresh oranges, ice",
                "1. Wash and halve oranges. 2. Press juice fresh to order. 3. Strain lightly and serve chilled over ice.",
                6)
        };

        var products = await db.Products.ToListAsync();
        var productMap = products.ToDictionary(p => p.Name, p => p, StringComparer.OrdinalIgnoreCase);
        var recipes = await db.Recipes.Include(r => r.Product).ToListAsync();
        var changed = false;

        foreach (var (productName, data) in recipeData)
        {
            if (!productMap.TryGetValue(productName, out var product))
            {
                continue;
            }

            var existingRecipe = recipes.FirstOrDefault(r => r.ProductId == product.Id);
            if (existingRecipe == null)
            {
                db.Recipes.Add(new Recipe
                {
                    ProductId = product.Id,
                    IngredientsList = data.ingredients,
                    Instructions = data.instructions,
                    PreparationTimeMinutes = data.minutes
                });
                changed = true;
                continue;
            }

            var isArtificial =
                existingRecipe.IngredientsList.Contains("Prepared ingredients", StringComparison.OrdinalIgnoreCase) ||
                existingRecipe.Instructions.Contains("Prepare mise en place", StringComparison.OrdinalIgnoreCase);

            if (isArtificial)
            {
                existingRecipe.IngredientsList = data.ingredients;
                existingRecipe.Instructions = data.instructions;
                existingRecipe.PreparationTimeMinutes = data.minutes;
                changed = true;
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Ensured realistic demo recipes.");
        }
    }

    private static async Task SeedOrdersAndOrderItemsAsync(AppDbContext db)
    {
        var products = await db.Products.ToListAsync();

        if (products.Count == 0)
        {
            return;
        }

        Product PickProduct(string preferredName, int fallbackIndex)
        {
            return products.FirstOrDefault(p => p.Name.Equals(preferredName, StringComparison.OrdinalIgnoreCase))
                ?? products[Math.Min(fallbackIndex, products.Count - 1)];
        }

        var client = await db.Users.FirstOrDefaultAsync(u => u.Role == Role.Client);
        var waiter = await db.Users.FirstOrDefaultAsync(u => u.Role == Role.Waiter);
        var tables = await db.Tables.OrderBy(t => t.TableNumber).ToListAsync();

        if (!await db.Orders.AnyAsync())
        {
            var orders = new List<Order>
            {
                new()
                {
                    CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(-1),
                    Status = OrderStatus.Delivered,
                    OrderType = OrderType.Delivery,
                    ClientId = client?.Id,
                    IsPaid = true
                },
                new()
                {
                    CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(-4),
                    Status = OrderStatus.Delivered,
                    OrderType = OrderType.Takeaway,
                    ClientId = client?.Id,
                    IsPaid = true
                },
                new()
                {
                    CreatedAt = DateTime.UtcNow.AddHours(-3),
                    Status = OrderStatus.Preparing,
                    OrderType = OrderType.DineIn,
                    ClientId = client?.Id,
                    WaiterId = waiter?.Id,
                    TableId = tables.FirstOrDefault(t => t.TableNumber == 4)?.Id ?? tables.FirstOrDefault()?.Id,
                    IsPaid = false
                },
                new()
                {
                    CreatedAt = DateTime.UtcNow.AddMinutes(-45),
                    Status = OrderStatus.Pending,
                    OrderType = OrderType.DineIn,
                    ClientId = client?.Id,
                    TableId = tables.FirstOrDefault(t => t.TableNumber == 7)?.Id,
                    IsPaid = false
                }
            };

            AddOrderItem(orders[0], PickProduct("Eggs Benedict", 0), 2);
            AddOrderItem(orders[0], PickProduct("Fresh Orange Juice", 1), 2);
            AddOrderItem(orders[1], PickProduct("Spaghetti Carbonara", 2), 1);
            AddOrderItem(orders[1], PickProduct("Caesar Salad", 3), 1);
            AddOrderItem(orders[2], PickProduct("Ribeye Steak", 4), 1);
            AddOrderItem(orders[2], PickProduct("Chocolate Fondant", 5), 2);
            AddOrderItem(orders[3], PickProduct("Grilled Salmon", 6), 1);
            AddOrderItem(orders[3], PickProduct("Caprese Salad", 7), 1);

            db.Orders.AddRange(orders);

            foreach (var table in tables.Where(t => t.TableNumber == 4 || t.TableNumber == 7))
            {
                table.IsOccupied = true;
            }

            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Inserted realistic demo orders with order items.");
            return;
        }

        if (!await db.OrderItems.AnyAsync())
        {
            var ordersWithoutItems = await db.Orders
                .Include(o => o.OrderItems)
                .OrderBy(o => o.Id)
                .Take(3)
                .ToListAsync();

            if (ordersWithoutItems.Count == 0)
            {
                return;
            }

            var demoProducts = new[]
            {
                PickProduct("Avocado Toast", 0),
                PickProduct("Tiramisu", 1),
                PickProduct("Chicken Parmesan", 2)
            };

            for (var i = 0; i < ordersWithoutItems.Count; i++)
            {
                var order = ordersWithoutItems[i];
                var product = demoProducts[Math.Min(i, demoProducts.Length - 1)];
                AddOrderItem(order, product, i == 0 ? 2 : 1);
            }

            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Inserted realistic demo order items.");
        }

        await RecalculateOrderTotalsAsync(db);
    }

    private static void AddOrderItem(Order order, Product product, int quantity)
    {
        order.OrderItems.Add(new OrderItem
        {
            ProductId = product.Id,
            Quantity = quantity,
            UnitPrice = product.Price
        });
        order.TotalAmount += quantity * product.Price;
    }

    private static async Task SeedReservationsAsync(AppDbContext db)
    {
        if (await db.Reservations.AnyAsync())
        {
            await RepairReservationTableAssignmentsAsync(db);
            return;
        }

        var client = await db.Users.FirstOrDefaultAsync(u => u.Role == Role.Client);
        var tables = await db.Tables.OrderBy(t => t.TableNumber).ToListAsync();

        if (client == null || tables.Count == 0)
        {
            return;
        }

        Table PickTable(int preferredNumber, int minCapacity)
        {
            return tables.FirstOrDefault(t => t.TableNumber == preferredNumber)
                ?? tables.FirstOrDefault(t => t.Capacity >= minCapacity)
                ?? tables[0];
        }

        db.Reservations.AddRange(
            new Reservation
            {
                ClientId = client.Id,
                TableId = PickTable(2, 2).Id,
                ReservationDate = DateTime.UtcNow.Date.AddDays(1).AddHours(19),
                NumberOfGuests = 2,
                SpecialRequests = "Window table if available.",
                Status = ReservationStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Reservation
            {
                ClientId = client.Id,
                TableId = PickTable(1, 4).Id,
                ReservationDate = DateTime.UtcNow.Date.AddDays(3).AddHours(20),
                NumberOfGuests = 4,
                SpecialRequests = "Birthday dinner, please prepare a dessert candle.",
                Status = ReservationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            },
            new Reservation
            {
                ClientId = client.Id,
                TableId = PickTable(3, 6).Id,
                ReservationDate = DateTime.UtcNow.Date.AddDays(5).AddHours(18).AddMinutes(30),
                NumberOfGuests = 6,
                SpecialRequests = "Quiet corner for a family dinner.",
                Status = ReservationStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddHours(-6)
            }
        );

        await db.SaveChangesAsync();
        System.Console.WriteLine("[Seed] Inserted realistic demo reservations.");
    }

    private static async Task RepairReservationTableAssignmentsAsync(AppDbContext db)
    {
        var reservations = await db.Reservations
            .Include(r => r.Table)
            .Where(r => r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed)
            .ToListAsync();

        var changed = false;
        foreach (var reservation in reservations)
        {
            if (reservation.Table != null && reservation.Table.Capacity >= reservation.NumberOfGuests)
            {
                continue;
            }

            var table = await FindAvailableTableForReservationAsync(
                db,
                reservation.ReservationDate,
                reservation.NumberOfGuests,
                reservation.Id);

            if (table == null)
            {
                continue;
            }

            reservation.TableId = table.Id;
            changed = true;
        }

        if (changed)
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Repaired reservation table assignments.");
        }
    }

    private static async Task<Table?> FindAvailableTableForReservationAsync(
        AppDbContext db,
        DateTime reservationDate,
        int guests,
        int? ignoredReservationId = null)
    {
        var reservationStart = reservationDate.Kind == DateTimeKind.Local
            ? reservationDate.ToUniversalTime()
            : DateTime.SpecifyKind(reservationDate, DateTimeKind.Utc);
        var reservationEnd = reservationStart.AddHours(2);
        var conflictStart = reservationStart.AddHours(-2);

        var reservedTableIds = await db.Reservations
            .Where(r =>
                r.Id != ignoredReservationId &&
                r.TableId.HasValue &&
                (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Confirmed) &&
                r.ReservationDate > conflictStart &&
                r.ReservationDate < reservationEnd)
            .Select(r => r.TableId!.Value)
            .ToListAsync();

        return await db.Tables
            .Where(t => t.Capacity >= guests && !reservedTableIds.Contains(t.Id))
            .OrderBy(t => t.Capacity)
            .ThenBy(t => t.TableNumber)
            .FirstOrDefaultAsync();
    }

    private static async Task SeedAddressesAsync(AppDbContext db)
    {
        if (!await TableExistsAsync(db, "Addresses"))
        {
            System.Console.WriteLine("[Seed] Addresses table not found, skipping address seed.");
            return;
        }

        var owner = await db.Users.FirstOrDefaultAsync(u => u.Role == Role.Admin)
            ?? await db.Users.FirstOrDefaultAsync(u => u.Role == Role.Client);
        if (owner == null)
        {
            return;
        }

        var branches = new[]
        {
            new Address
            {
                UserId = owner.Id,
                Street = "GastroFlow Center, bd. Stefan cel Mare si Sfant 12",
                City = "Chisinau",
                PostalCode = "2001",
                Country = "Moldova",
                AdditionalInfo = "GastroFlow Center, Chisinau"
            },
            new Address
            {
                UserId = owner.Id,
                Street = "GastroFlow Botanica, bd. Dacia 45",
                City = "Chisinau",
                PostalCode = "2060",
                Country = "Moldova",
                AdditionalInfo = "GastroFlow Botanica, Chisinau"
            },
            new Address
            {
                UserId = owner.Id,
                Street = "GastroFlow Riscani, str. Alecu Russo 18",
                City = "Chisinau",
                PostalCode = "2068",
                Country = "Moldova",
                AdditionalInfo = "GastroFlow Riscani, Chisinau"
            }
        };

        var existingAddresses = await db.Addresses.ToListAsync();
        bool MatchesBranch(Address existing, Address branch)
        {
            return existing.Street.Equals(branch.Street, StringComparison.OrdinalIgnoreCase) ||
                (existing.AdditionalInfo != null && existing.AdditionalInfo.Equals(branch.AdditionalInfo, StringComparison.OrdinalIgnoreCase));
        }

        var oldDemoAddresses = existingAddresses
            .Where(a =>
                a.Street.Equals("Str. Stefan cel Mare 12", StringComparison.OrdinalIgnoreCase) ||
                a.Street.Equals("Bd. Dacia 45", StringComparison.OrdinalIgnoreCase) ||
                (a.AdditionalInfo != null && a.AdditionalInfo.Contains("Apartment 14", StringComparison.OrdinalIgnoreCase)) ||
                (a.AdditionalInfo != null && a.AdditionalInfo.Contains("Office reception", StringComparison.OrdinalIgnoreCase)))
            .ToList();

        var changed = false;
        var usedBranches = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var existing in oldDemoAddresses)
        {
            var target = branches.FirstOrDefault(branch =>
                !usedBranches.Contains(branch.AdditionalInfo ?? string.Empty) &&
                !existingAddresses.Any(address => address.Id != existing.Id && MatchesBranch(address, branch)));

            if (target == null)
            {
                continue;
            }

            existing.UserId = owner.Id;
            existing.Street = target.Street;
            existing.City = target.City;
            existing.PostalCode = target.PostalCode;
            existing.Country = target.Country;
            existing.AdditionalInfo = target.AdditionalInfo;
            usedBranches.Add(target.AdditionalInfo ?? string.Empty);
            changed = true;
        }

        var missingBranches = branches
            .Where(branch => !existingAddresses.Any(existing => MatchesBranch(existing, branch)))
            .ToList();

        if (missingBranches.Count > 0)
        {
            db.Addresses.AddRange(missingBranches);
            changed = true;
        }

        if (changed)
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Ensured realistic restaurant addresses.");
        }
    }

    private static async Task RecalculateOrderTotalsAsync(AppDbContext db)
    {
        var orders = await db.Orders
            .Include(o => o.OrderItems)
            .ToListAsync();

        var changed = false;
        foreach (var order in orders)
        {
            if (order.TableId.HasValue && order.OrderType != OrderType.DineIn)
            {
                order.OrderType = OrderType.DineIn;
                changed = true;
            }

            var expectedTotal = order.OrderItems.Sum(item => item.Quantity * item.UnitPrice);
            if (expectedTotal > 0 && order.TotalAmount != expectedTotal)
            {
                order.TotalAmount = expectedTotal;
                changed = true;
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync();
            System.Console.WriteLine("[Seed] Recalculated order totals from order items.");
        }
    }

    private static async Task<bool> TableExistsAsync(AppDbContext db, string tableName)
    {
        var count = await db.Database
            .SqlQueryRaw<int>(
                "SELECT COUNT(*) AS \"Value\" FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}",
                tableName)
            .SingleAsync();

        return count > 0;
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

