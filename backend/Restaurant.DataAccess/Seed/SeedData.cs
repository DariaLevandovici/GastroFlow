using Restaurant.Domain.Entities;

namespace Restaurant.DataAccess.Seed;


public static class SeedData
{
    public static List<Product> GetProducts() => new()
    {
        // ── Breakfast ────────────────────────────────────────────────────────
        new Product {
            Name = "Eggs Benedict",
            Description = "Poached eggs, Canadian bacon, hollandaise sauce on English muffin",
            Price = 95m,
            Category = "Breakfast",
            Image = "/images/EggsBenedict.webp",
            Ingredients = "[\"eggs\",\"bacon\",\"butter\",\"lemon\",\"english muffin\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Avocado Toast",
            Description = "Smashed avocado, cherry tomatoes, feta cheese on sourdough",
            Price = 75m,
            Category = "Breakfast",
            Image = "/images/AvocadoToast.webp",
            Ingredients = "[\"avocado\",\"tomatoes\",\"feta\",\"bread\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "Pancake Stack",
            Description = "Fluffy pancakes with maple syrup, berries, and whipped cream",
            Price = 85m,
            Category = "Breakfast",
            Image = "/images/PancakeStack.webp",
            Ingredients = "[\"flour\",\"milk\",\"eggs\",\"berries\",\"maple syrup\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "English Breakfast",
            Description = "Traditional full English breakfast with sausages, beans, and eggs",
            Price = 110m,
            Category = "Breakfast",
            Image ="/images/EnglishBreakfast.webp",
            Ingredients = "[\"sausages\",\"eggs\",\"baked beans\",\"toast\",\"mushrooms\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "French Toast",
            Description = "Brioche bread soaked in egg and milk, served with cinnamon and syrup",
            Price = 80m,
            Category = "Breakfast",
            Image = "/images/FrenchToast.webp",
            Ingredients = "[\"brioche\",\"eggs\",\"milk\",\"cinnamon\",\"maple syrup\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "Smoothie Bowl",
            Description = "Berry smoothie base topped with granola, coconut flakes, and fresh fruit",
            Price = 90m,
            Category = "Breakfast",
            Image = "/images/SmoothieBowl.webp",
            Ingredients = "[\"mixed berries\",\"banana\",\"granola\",\"coconut\",\"almond milk\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },

        // ── Starters ─────────────────────────────────────────────────────────
        new Product {
            Name = "Bruschetta Classica",
            Description = "Toasted bread with tomatoes, garlic, basil and olive oil",
            Price = 85m,
            Category = "Starters",
            Image = "/images/BruschettaClassica.webp",
            Ingredients = "[\"bread\",\"tomatoes\",\"garlic\",\"basil\",\"olive oil\"]",
            Dietary = "[\"vegan\"]"
        },
        new Product {
            Name = "Caesar Salad",
            Description = "Romaine lettuce, parmesan, croutons, Caesar dressing",
            Price = 95m,
            Category = "Starters",
            Image = "/images/CaesarSalad.webp",
            Ingredients = "[\"lettuce\",\"parmesan\",\"croutons\",\"anchovies\",\"eggs\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Hummus Platter",
            Description = "Creamy hummus with pita bread, olives, and vegetables",
            Price = 70m,
            Category = "Starters",
            Image = "/images/HummusPlatter.webp",
            Ingredients = "[\"chickpeas\",\"tahini\",\"lemon\",\"garlic\",\"pita\"]",
            Dietary = "[\"vegan\"]"
        },
        new Product {
            Name = "Calamari Fritti",
            Description = "Crispy fried squid rings served with garlic aioli and lemon",
            Price = 135m,
            Category = "Starters",
            Image = "/images/CalamariFritti.webp",
            Ingredients = "[\"squid\",\"flour\",\"lemon\",\"garlic\",\"mayonnaise\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Caprese Salad",
            Description = "Fresh mozzarella, ripe tomatoes, sweet basil, and balsamic reduction",
            Price = 110m,
            Category = "Starters",
            Image = "/images/CapreseSalad.webp",
            Ingredients = "[\"mozzarella\",\"tomatoes\",\"basil\",\"balsamic vinegar\",\"olive oil\"]",
            Dietary = "[\"vegetarian\",\"gluten-free\"]"
        },
        new Product {
            Name = "Beef Carpaccio",
            Description = "Thinly sliced raw beef topped with arugula, parmesan shavings, and capers",
            Price = 165m,
            Category = "Starters",
            Image = "/images/BeefCarpaccio.webp",
            Ingredients = "[\"beef\",\"arugula\",\"parmesan\",\"capers\",\"olive oil\"]",
            Dietary = "[\"gluten-free\"]"
        },

        // ── Vegan ────────────────────────────────────────────────────────────
        new Product {
            Name = "Buddha Bowl",
            Description = "Quinoa, roasted vegetables, avocado, tahini dressing",
            Price = 125m,
            Category = "Vegan",
            Image = "/images/BuddhaBowl.webp",
            Ingredients = "[\"quinoa\",\"sweet potato\",\"chickpeas\",\"avocado\",\"tahini\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Vegan Burger",
            Description = "Plant-based patty, lettuce, tomato, vegan mayo, sweet potato fries",
            Price = 145m,
            Category = "Vegan",
            Image = "/images/VeganBurger.webp",
            Ingredients = "[\"plant protein\",\"lettuce\",\"tomato\",\"vegan mayo\",\"sweet potato\"]",
            Dietary = "[\"vegan\"]"
        },
        new Product {
            Name = "Mushroom Risotto",
            Description = "Creamy arborio rice with wild mushrooms and herbs",
            Price = 155m,
            Category = "Vegan",
            Image = "/images/MushroomRisotto.webp",
            Ingredients = "[\"arborio rice\",\"mushrooms\",\"white wine\",\"vegetable stock\",\"herbs\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Vegan Tacos",
            Description = "Corn tortillas filled with jackfruit, pico de gallo, and avocado",
            Price = 120m,
            Category = "Vegan",
            Image = "/images/VeganTacos.webp",
            Ingredients = "[\"jackfruit\",\"corn tortillas\",\"tomatoes\",\"onions\",\"avocado\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Zucchini Noodles",
            Description = "Zoodles tossed in a rich tomato and walnut pesto sauce",
            Price = 115m,
            Category = "Vegan",
            Image = "/images/ZucchiniNoodles.webp",
            Ingredients = "[\"zucchini\",\"tomatoes\",\"walnuts\",\"basil\",\"garlic\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Vegan Brownie",
            Description = "Fudgy chocolate brownie made with sweet potato and almond flour",
            Price = 70m,
            Category = "Vegan",
            Image = "/images/VeganBrownie.webp",
            Ingredients = "[\"sweet potato\",\"cocoa powder\",\"almond flour\",\"maple syrup\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },

        // ── Main Dishes ──────────────────────────────────────────────────────
        new Product {
            Name = "Ribeye Steak",
            Description = "Premium 350g ribeye, grilled vegetables, truffle sauce",
            Price = 385m,
            Category = "Main Dishes",
            Image = "/images/RibeyeSteak.webp",
            Ingredients = "[\"beef\",\"vegetables\",\"truffle\",\"butter\"]",
            Dietary = "[\"gluten-free\"]"
        },
        new Product {
            Name = "Spaghetti Carbonara",
            Description = "Classic Roman pasta with guanciale, eggs, pecorino",
            Price = 165m,
            Category = "Main Dishes",
            Image = "/images/SpaghettiCarbonara.webp",
            Ingredients = "[\"pasta\",\"guanciale\",\"eggs\",\"pecorino\",\"black pepper\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Grilled Salmon",
            Description = "Atlantic salmon, asparagus, lemon butter sauce",
            Price = 295m,
            Category = "Main Dishes",
            Image = "/images/GrilledSalmon.webp",
            Ingredients = "[\"salmon\",\"asparagus\",\"lemon\",\"butter\",\"dill\"]",
            Dietary = "[\"gluten-free\"]"
        },
        new Product {
            Name = "Lobster Linguine",
            Description = "Fresh lobster, cherry tomatoes, white wine, garlic",
            Price = 425m,
            Category = "Main Dishes",
            Image = "/images/LobsterLinguine.webp",
            Ingredients = "[\"lobster\",\"pasta\",\"tomatoes\",\"white wine\",\"garlic\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Chicken Parmesan",
            Description = "Breaded chicken breast, marinara sauce, mozzarella, pasta",
            Price = 185m,
            Category = "Main Dishes",
            Image = "/images/ChickenParmesan.webp",
            Ingredients = "[\"chicken\",\"mozzarella\",\"tomato sauce\",\"pasta\",\"parmesan\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "Rack of Lamb",
            Description = "Herb-crusted rack of lamb with garlic mashed potatoes and red wine reduction",
            Price = 450m,
            Category = "Main Dishes",
            Image = "/images/RackofLamb.webp",
            Ingredients = "[\"lamb\",\"potatoes\",\"garlic\",\"herbs\",\"red wine\"]",
            Dietary = "[\"gluten-free\"]"
        },
        new Product {
            Name = "Duck Breast",
            Description = "Pan-seared duck breast with cherry sauce and roasted root vegetables",
            Price = 360m,
            Category = "Main Dishes",
            Image = "/images/DuckBreast.webp",
            Ingredients = "[\"duck\",\"cherries\",\"carrots\",\"parsnips\",\"butter\"]",
            Dietary = "[\"gluten-free\"]"
        },
        new Product {
            Name = "Seafood Paella",
            Description = "Traditional Spanish rice dish with saffron, mussels, shrimp, and chorizo",
            Price = 395m,
            Category = "Main Dishes",
            Image = "/images/SeafoodPaella.webp",
            Ingredients = "[\"rice\",\"saffron\",\"mussels\",\"shrimp\",\"chorizo\"]",
            Dietary = "[]"
        },

        // ── Desserts ─────────────────────────────────────────────────────────
        new Product {
            Name = "Tiramisu",
            Description = "Classic Italian coffee-flavored dessert",
            Price = 75m,
            Category = "Desserts",
            Image = "/images/Tiramisu.webp",
            Ingredients = "[\"mascarpone\",\"coffee\",\"ladyfingers\",\"cocoa\",\"eggs\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "Chocolate Fondant",
            Description = "Warm chocolate cake with molten center, vanilla ice cream",
            Price = 85m,
            Category = "Desserts",
            Image = "/images/ChocolateFondant.webp",
            Ingredients = "[\"chocolate\",\"butter\",\"eggs\",\"flour\",\"vanilla ice cream\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "Cheesecake",
            Description = "New York style cheesecake with berry compote",
            Price = 80m,
            Category = "Desserts",
            Image = "/images/Cheesecake.webp",
            Ingredients = "[\"cream cheese\",\"sugar\",\"eggs\",\"berries\",\"graham crackers\"]",
            Dietary = "[\"vegetarian\"]"
        },
        new Product {
            Name = "Panna Cotta",
            Description = "Vanilla bean panna cotta topped with a vibrant passion fruit coulis",
            Price = 85m,
            Category = "Desserts",
            Image = "/images/PannaCotta.webp",
            Ingredients = "[\"cream\",\"sugar\",\"gelatin\",\"vanilla bean\",\"passion fruit\"]",
            Dietary = "[\"gluten-free\"]"
        },
        new Product {
            Name = "Creme Brulee",
            Description = "Classic French custard dessert with a hard caramel top",
            Price = 95m,
            Category = "Desserts",
            Image = "/images/CremeBrulee.webp",
            Ingredients = "[\"cream\",\"egg yolks\",\"sugar\",\"vanilla\"]",
            Dietary = "[\"vegetarian\",\"gluten-free\"]"
        },
        new Product {
            Name = "Gelato Selection",
            Description = "Three scoops of artisanal Italian gelato (chocolate, pistachio, strawberry)",
            Price = 65m,
            Category = "Desserts",
            Image = "/images/GelatoSelection.webp",
            Ingredients = "[\"milk\",\"sugar\",\"cocoa\",\"pistachios\",\"strawberries\"]",
            Dietary = "[\"vegetarian\",\"gluten-free\"]"
        },

        // ── Drinks ───────────────────────────────────────────────────────────
        new Product {
            Name = "Fresh Orange Juice",
            Description = "Freshly squeezed orange juice",
            Price = 35m,
            Category = "Drinks",
            Image = "/images/FreshOrangeJuice.webp",
            Ingredients = "[\"oranges\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Espresso",
            Description = "Strong Italian coffee",
            Price = 25m,
            Category = "Drinks",
            Image = "/images/Espresso.webp",
            Ingredients = "[\"coffee beans\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Craft Beer",
            Description = "Local craft beer selection",
            Price = 45m,
            Category = "Drinks",
            Image = "/images/CraftBeer.webp",
            Ingredients = "[\"malt\",\"hops\",\"yeast\",\"water\"]",
            Dietary = "[]"
        },
        new Product {
            Name = "House Wine",
            Description = "Red or white wine selection",
            Price = 55m,
            Category = "Drinks",
            Image = "/images/HouseWine.webp",
            Ingredients = "[\"grapes\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Iced Matcha Latte",
            Description = "Premium ceremonial grade matcha over milk and ice",
            Price = 55m,
            Category = "Drinks",
            Image = "/images/IcedMatchaLatte.webp",
            Ingredients = "[\"matcha powder\",\"milk\",\"ice\",\"sugar\"]",
            Dietary = "[\"vegetarian\",\"gluten-free\"]"
        },
        new Product {
            Name = "Sparkling Water",
            Description = "San Pellegrino sparkling water with a slice of lemon",
            Price = 30m,
            Category = "Drinks",
            Image = "/images/SparklingWater.webp",
            Ingredients = "[\"mineral water\",\"lemon\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        },
        new Product {
            Name = "Mojito Mocktail",
            Description = "Refreshing blend of lime, fresh mint, sugar, and soda water",
            Price = 45m,
            Category = "Drinks",
            Image = "/images/MojitoMocktail.webp",
            Ingredients = "[\"lime\",\"mint\",\"sugar\",\"soda water\",\"ice\"]",
            Dietary = "[\"vegan\",\"gluten-free\"]"
        }
    };
}
