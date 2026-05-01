import { menuImages } from "../assets/MenuImages";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string[];
  dietary: string[];
}

export const menuItems: MenuItem[] = [
  // Breakfast
  {
    id: 101,
    name: 'Eggs Benedict',
    description: 'Poached eggs, Canadian bacon, hollandaise sauce on English muffin',
    price: 95,
    category: 'Breakfast',
    image: menuImages.EggsBenedict,
    ingredients: ['eggs', 'bacon', 'butter', 'lemon', 'english muffin'],
    dietary: []
  },
  {
    id: 102,
    name: 'Avocado Toast',
    description: 'Smashed avocado, cherry tomatoes, feta cheese on sourdough',
    price: 75,
    category: 'Breakfast',
    image: menuImages.AvocadoToast,
    ingredients: ['avocado', 'tomatoes', 'feta', 'bread'],
    dietary: ['vegetarian']
  },
  {
    id: 103,
    name: 'Pancake Stack',
    description: 'Fluffy pancakes with maple syrup, berries, and whipped cream',
    price: 85,
    category: 'Breakfast',
    image: menuImages.PancakeStack,
    ingredients: ['flour', 'milk', 'eggs', 'berries', 'maple syrup'],
    dietary: ['vegetarian']
  },
  // Starters
  {
    id: 201,
    name: 'Bruschetta Classica',
    description: 'Toasted bread with tomatoes, garlic, basil and olive oil',
    price: 85,
    category: 'Starters',
    image: menuImages.BruschettaClassica,
    ingredients: ['bread', 'tomatoes', 'garlic', 'basil', 'olive oil'],
    dietary: ['vegan']
  },
  {
    id: 202,
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons, Caesar dressing',
    price: 95,
    category: 'Starters',
    image: menuImages.CaesarSalad,
    ingredients: ['lettuce', 'parmesan', 'croutons', 'anchovies', 'eggs'],
    dietary: []
  },
  {
    id: 203,
    name: 'Hummus Platter',
    description: 'Creamy hummus with pita bread, olives, and vegetables',
    price: 70,
    category: 'Starters',
    image: menuImages.HummusPlatter,
    ingredients: ['chickpeas', 'tahini', 'lemon', 'garlic', 'pita'],
    dietary: ['vegan']
  },

  // Vegan
  {
    id: 301,
    name: 'Buddha Bowl',
    description: 'Quinoa, roasted vegetables, avocado, tahini dressing',
    price: 125,
    category: 'Vegan',
    image: menuImages.BuddhaBowl,
    ingredients: ['quinoa', 'sweet potato', 'chickpeas', 'avocado', 'tahini'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 302,
    name: 'Vegan Burger',
    description: 'Plant-based patty, lettuce, tomato, vegan mayo, sweet potato fries',
    price: 145,
    category: 'Vegan',
    image: menuImages.VeganBurger,
    ingredients: ['plant protein', 'lettuce', 'tomato', 'vegan mayo', 'sweet potato'],
    dietary: ['vegan']
  },
  {
    id: 303,
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and herbs',
    price: 155,
    category: 'Vegan',
    image: menuImages.MushroomRisotto,
    ingredients: ['arborio rice', 'mushrooms', 'white wine', 'vegetable stock', 'herbs'],
    dietary: ['vegan', 'gluten-free']
  },

  // Main Dishes
  {
    id: 401,
    name: 'Ribeye Steak',
    description: 'Premium 350g ribeye, grilled vegetables, truffle sauce',
    price: 385,
    category: 'Main Dishes',
    image: menuImages.RibeyeSteak,
    ingredients: ['beef', 'vegetables', 'truffle', 'butter'],
    dietary: ['gluten-free']
  },
  {
    id: 402,
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with guanciale, eggs, pecorino',
    price: 165,
    category: 'Main Dishes',
    image: menuImages.SpaghettiCarbonara,
    ingredients: ['pasta', 'guanciale', 'eggs', 'pecorino', 'black pepper'],
    dietary: []
  },
  {
    id: 403,
    name: 'Grilled Salmon',
    description: 'Atlantic salmon, asparagus, lemon butter sauce',
    price: 295,
    category: 'Main Dishes',
    image: menuImages.GrilledSalmon,
    ingredients: ['salmon', 'asparagus', 'lemon', 'butter', 'dill'],
    dietary: ['gluten-free']
  },
  {
    id: 404,
    name: 'Lobster Linguine',
    description: 'Fresh lobster, cherry tomatoes, white wine, garlic',
    price: 425,
    category: 'Main Dishes',
    image: menuImages.LobsterLinguine,
    ingredients: ['lobster', 'pasta', 'tomatoes', 'white wine', 'garlic'],
    dietary: []
  },
  {
    id: 405,
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast, marinara sauce, mozzarella, pasta',
    price: 185,
    category: 'Main Dishes',
    image: menuImages.ChickenParmesan,
    ingredients: ['chicken', 'mozzarella', 'tomato sauce', 'pasta', 'parmesan'],
    dietary: []
  },

  // Desserts
  {
    id: 501,
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    price: 75,
    category: 'Desserts',
    image: menuImages.Tiramisu,
    ingredients: ['mascarpone', 'coffee', 'ladyfingers', 'cocoa', 'eggs'],
    dietary: ['vegetarian']
  },
  {
    id: 502,
    name: 'Chocolate Fondant',
    description: 'Warm chocolate cake with molten center, vanilla ice cream',
    price: 85,
    category: 'Desserts',
    image: menuImages.ChocolateFondant,
    ingredients: ['chocolate', 'butter', 'eggs', 'flour', 'vanilla ice cream'],
    dietary: ['vegetarian']
  },
  {
    id: 503,
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 80,
    category: 'Desserts',
    image: menuImages.Cheesecake,
    ingredients: ['cream cheese', 'sugar', 'eggs', 'berries', 'graham crackers'],
    dietary: ['vegetarian']
  },

  // Drinks
  {
    id: 601,
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 35,
    category: 'Drinks',
    image: menuImages.FreshOrangeJuice,
    ingredients: ['oranges'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 602,
    name: 'Espresso',
    description: 'Strong Italian coffee',
    price: 25,
    category: 'Drinks',
    image: menuImages.Espresso,
    ingredients: ['coffee beans'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 603,
    name: 'Craft Beer',
    description: 'Local craft beer selection',
    price: 45,
    category: 'Drinks',
    image: menuImages.CraftBeer,
    ingredients: ['malt', 'hops', 'yeast', 'water'],
    dietary: []
  },
  {
    id: 604,
    name: 'House Wine',
    description: 'Red or white wine selection',
    price: 55,
    category: 'Drinks',
    image: menuImages.HouseWine,
    ingredients: ['grapes'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 104,
    name: 'English Breakfast',
    description: 'Traditional full English breakfast with sausages, beans, and eggs',
    price: 110,
    category: 'Breakfast',
    image: menuImages.EnglishBreakfast,
    ingredients: ['sausages', 'eggs', 'baked beans', 'toast', 'mushrooms'],
    dietary: []
  },
  {
    id: 105,
    name: 'French Toast',
    description: 'Brioche bread soaked in egg and milk, served with cinnamon and syrup',
    price: 80,
    category: 'Breakfast',
    image: menuImages.FrenchToast,
    ingredients: ['brioche', 'eggs', 'milk', 'cinnamon', 'maple syrup'],
    dietary: ['vegetarian']
  },
  {
    id: 106,
    name: 'Smoothie Bowl',
    description: 'Berry smoothie base topped with granola, coconut flakes, and fresh fruit',
    price: 90,
    category: 'Breakfast',
    image: menuImages.SmoothieBowl,
    ingredients: ['mixed berries', 'banana', 'granola', 'coconut', 'almond milk'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 204,
    name: 'Calamari Fritti',
    description: 'Crispy fried squid rings served with garlic aioli and lemon',
    price: 135,
    category: 'Starters',
    image: menuImages.CalamariFritti,
    ingredients: ['squid', 'flour', 'lemon', 'garlic', 'mayonnaise'],
    dietary: []
  },
  {
    id: 205,
    name: 'Caprese Salad',
    description: 'Fresh mozzarella, ripe tomatoes, sweet basil, and balsamic reduction',
    price: 110,
    category: 'Starters',
    image: menuImages.CapreseSalad,
    ingredients: ['mozzarella', 'tomatoes', 'basil', 'balsamic vinegar', 'olive oil'],
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    id: 206,
    name: 'Beef Carpaccio',
    description: 'Thinly sliced raw beef topped with arugula, parmesan shavings, and capers',
    price: 165,
    category: 'Starters',
    image: menuImages.BeefCarpaccio,
    ingredients: ['beef', 'arugula', 'parmesan', 'capers', 'olive oil'],
    dietary: ['gluten-free']
  },
  {
    id: 304,
    name: 'Vegan Tacos',
    description: 'Corn tortillas filled with jackfruit pulled "pork", pico de gallo, and avocado',
    price: 120,
    category: 'Vegan',
    image: menuImages.VeganTacos,
    ingredients: ['jackfruit', 'corn tortillas', 'tomatoes', 'onions', 'avocado'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 305,
    name: 'Zucchini Noodles',
    description: 'Zoodles tossed in a rich tomato and walnut pesto sauce',
    price: 115,
    category: 'Vegan',
    image: menuImages.ZucchiniNoodles,
    ingredients: ['zucchini', 'tomatoes', 'walnuts', 'basil', 'garlic'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 306,
    name: 'Vegan Brownie',
    description: 'Fudgy chocolate brownie made with sweet potato and almond flour',
    price: 70,
    category: 'Vegan',
    image: menuImages.VeganBrownie,
    ingredients: ['sweet potato', 'cocoa powder', 'almond flour', 'maple syrup'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 406,
    name: 'Rack of Lamb',
    description: 'Herb-crusted rack of lamb with garlic mashed potatoes and red wine reduction',
    price: 450,
    category: 'Main Dishes',
    image: menuImages.RackOfLamb,
    ingredients: ['lamb', 'potatoes', 'garlic', 'herbs', 'red wine'],
    dietary: ['gluten-free']
  },
  {
    id: 407,
    name: 'Duck Breast',
    description: 'Pan-seared duck breast with cherry sauce and roasted root vegetables',
    price: 360,
    category: 'Main Dishes',
    image: menuImages.DuckBreast,
    ingredients: ['duck', 'cherries', 'carrots', 'parsnips', 'butter'],
    dietary: ['gluten-free']
  },
  {
    id: 408,
    name: 'Seafood Paella',
    description: 'Traditional Spanish rice dish with saffron, mussels, shrimp, and chorizo',
    price: 395,
    category: 'Main Dishes',
    image: menuImages.SeafoodPaella,
    ingredients: ['rice', 'saffron', 'mussels', 'shrimp', 'chorizo'],
    dietary: []
  },
  {
    id: 504,
    name: 'Panna Cotta',
    description: 'Vanilla bean panna cotta topped with a vibrant passion fruit coulis',
    price: 85,
    category: 'Desserts',
    image: menuImages.PannaCotta,
    ingredients: ['cream', 'sugar', 'gelatin', 'vanilla bean', 'passion fruit'],
    dietary: ['gluten-free']
  },
  {
    id: 505,
    name: 'Creme Brulee',
    description: 'Classic French custard dessert with a hard caramel top',
    price: 95,
    category: 'Desserts',
    image: menuImages.CremeBrulee,
    ingredients: ['cream', 'egg yolks', 'sugar', 'vanilla'],
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    id: 506,
    name: 'Gelato Selection',
    description: 'Three scoops of artisanal Italian gelato (chocolate, pistachio, strawberry)',
    price: 65,
    category: 'Desserts',
    image: menuImages.GelatoSelection,
    ingredients: ['milk', 'sugar', 'cocoa', 'pistachios', 'strawberries'],
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    id: 605,
    name: 'Iced Matcha Latte',
    description: 'Premium ceremonial grade matcha over milk and ice',
    price: 55,
    category: 'Drinks',
    image: menuImages.IcedMatchaLatte,
    ingredients: ['matcha powder', 'milk', 'ice', 'sugar'],
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    id: 606,
    name: 'Sparkling Water',
    description: 'San Pellegrino sparkling water with a slice of lemon',
    price: 30,
    category: 'Drinks',
    image: menuImages.SparklingWater,
    ingredients: ['mineral water', 'lemon'],
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: 607,
    name: 'Mojito Mocktail',
    description: 'Refreshing blend of lime, fresh mint, sugar, and soda water',
    price: 45,
    category: 'Drinks',
    image: menuImages.MojitoMocktail,
    ingredients: ['lime', 'mint', 'sugar', 'soda water', 'ice'],
    dietary: ['vegan', 'gluten-free']
  }
];
