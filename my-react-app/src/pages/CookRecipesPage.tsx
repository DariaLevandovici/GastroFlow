import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getMenuItems, type MenuItem } from '../services/menuService';

interface RecipeItem extends MenuItem {
  prepTime: string;
  servings: number;
  difficulty: string;
  instructions: string[];
}

export function CookRecipesPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);

  const categories = ['All', 'Breakfast', 'Starters', 'Vegan', 'Main Dishes', 'Desserts', 'Drinks'];

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);
        const items = await getMenuItems();
        if (!isMounted) return;
        setMenuItems(items);
      } catch {
        if (!isMounted) return;
        setMenuError('Unable to load recipes.');
      } finally {
        if (isMounted) {
          setIsLoadingMenu(false);
        }
      }
    };

    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Enhanced recipes with detailed preparation instructions
  const recipesWithInstructions = menuItems.map(item => ({
    ...item,
    prepTime: getPreparationTime(item.category),
    servings: getServings(item.category),
    difficulty: getDifficulty(item.category),
    instructions: getInstructions(item.name, item.category)
  }));

  function getPreparationTime(category: string): string {
    const times: { [key: string]: string } = {
      'Breakfast': '15-20 min',
      'Starters': '20-25 min',
      'Vegan': '25-30 min',
      'Main Dishes': '35-45 min',
      'Desserts': '30-40 min',
      'Drinks': '5-10 min'
    };
    return times[category] || '30 min';
  }

  function getServings(category: string): number {
    return category === 'Drinks' ? 1 : category === 'Desserts' ? 2 : 4;
  }

  function getDifficulty(category: string): string {
    const difficulty: { [key: string]: string } = {
      'Breakfast': 'Easy',
      'Starters': 'Easy',
      'Vegan': 'Medium',
      'Main Dishes': 'Medium',
      'Desserts': 'Hard',
      'Drinks': 'Easy'
    };
    return difficulty[category] || 'Medium';
  }

  function getInstructions(name: string, category: string): string[] {
    // Main Dishes
    if (name === 'Ribeye Steak') {
      return [
        'Remove steak from refrigerator 30 minutes before cooking to bring to room temperature',
        'Season generously with salt and freshly ground black pepper on both sides',
        'Heat a cast-iron skillet over high heat until smoking hot',
        'Add a tablespoon of high-smoke-point oil (vegetable or grapeseed)',
        'Place steak in the pan and sear for 3-4 minutes without moving',
        'Flip the steak and add butter, garlic, and fresh thyme to the pan',
        'Baste the steak with the melted butter continuously for 3-4 minutes',
        'Check internal temperature: 52-55°C for medium-rare, 57-60°C for medium',
        'Remove from heat and let rest for 5-7 minutes before slicing',
        'Serve with grilled vegetables and your choice of sauce'
      ];
    } else if (name === 'Grilled Salmon') {
      return [
        'Pat salmon fillets dry with paper towels',
        'Brush both sides lightly with olive oil',
        'Season with salt, pepper, and lemon zest',
        'Preheat grill to medium-high heat (about 200°C)',
        'Oil the grill grates to prevent sticking',
        'Place salmon skin-side down on the grill',
        'Grill for 4-5 minutes without moving',
        'Carefully flip using a wide spatula',
        'Cook for another 3-4 minutes until fish flakes easily',
        'Remove from grill and squeeze fresh lemon juice over top',
        'Serve immediately with roasted vegetables'
      ];
    } else if (name === 'Chicken Parmesan') {
      return [
        'Pound chicken breasts to even thickness (about 1.5 cm)',
        'Set up breading station: flour, beaten eggs, and breadcrumb mixture',
        'Mix breadcrumbs with grated Parmesan, Italian herbs, salt, and pepper',
        'Dredge chicken in flour, dip in egg, then coat with breadcrumb mixture',
        'Heat olive oil in a large skillet over medium-high heat',
        'Fry chicken for 4-5 minutes per side until golden brown',
        'Transfer chicken to a baking dish',
        'Top each piece with marinara sauce and mozzarella cheese',
        'Bake at 200°C for 15-20 minutes until cheese is melted and bubbly',
        'Garnish with fresh basil and serve with pasta'
      ];
    }

    // Breakfast
    else if (category === 'Breakfast') {
      return [
        'Gather all ingredients and prep station',
        'Heat a non-stick pan over medium heat with butter',
        'Crack eggs into a bowl and whisk with a fork',
        'Pour eggs into the heated pan',
        'Use a spatula to gently scramble or cook as desired',
        'Season with salt and pepper to taste',
        'Cook until eggs reach desired consistency',
        'Plate immediately while hot',
        'Garnish with fresh herbs if desired',
        'Serve with toast and accompaniments'
      ];
    }

    // Starters
    else if (category === 'Starters') {
      return [
        'Prepare and wash all fresh ingredients',
        'Preheat oven to 180°C if baking is required',
        'Prepare the base or vessel for the appetizer',
        'Mix the main filling or topping ingredients',
        'Season to taste with salt, pepper, and herbs',
        'Assemble the appetizer carefully',
        'If baking: place in preheated oven for 10-15 minutes',
        'If frying: heat oil to 175°C and fry until golden',
        'Let cool slightly before serving',
        'Garnish and serve with appropriate dipping sauce'
      ];
    }

    // Vegan
    else if (category === 'Vegan') {
      return [
        'Wash and prepare all vegetables thoroughly',
        'Cut vegetables into uniform sizes for even cooking',
        'Heat a large pan or wok with olive oil over medium-high heat',
        'Start with harder vegetables that take longer to cook',
        'Add garlic and ginger for flavor',
        'Stir-fry vegetables while maintaining their crunch',
        'Add softer vegetables in the last few minutes',
        'Season with soy sauce, herbs, and spices',
        'Add plant-based protein if using (tofu, tempeh)',
        'Serve over quinoa, rice, or noodles'
      ];
    }

    // Desserts
    else if (category === 'Desserts') {
      return [
        'Preheat oven to 175°C and prepare baking pans',
        'Measure all ingredients accurately using a scale',
        'Mix dry ingredients (flour, sugar, baking powder) in one bowl',
        'Cream butter and sugar until light and fluffy',
        'Add eggs one at a time, beating well after each',
        'Alternately add dry ingredients and liquid ingredients',
        'Mix until just combined - do not overmix',
        'Pour batter into prepared pans',
        'Bake for specified time until toothpick comes out clean',
        'Cool completely before frosting or decorating'
      ];
    }

    // Drinks
    else if (category === 'Drinks') {
      return [
        'Chill all glasses in the freezer for 10 minutes',
        'Gather all ingredients and tools',
        'Add ice to a shaker or glass',
        'Pour measured ingredients over ice',
        'Shake vigorously for 15 seconds if using shaker',
        'Strain into chilled glass',
        'Garnish with fresh fruits, herbs, or rim decoration',
        'Serve immediately while cold',
        'Add straws or stirrers as needed'
      ];
    }

    // Default instructions
    return [
      'Prepare all ingredients and equipment',
      'Follow food safety guidelines and wash hands',
      'Cook according to the recipe specifications',
      'Season to taste throughout the cooking process',
      'Check for doneness using appropriate methods',
      'Plate the dish attractively',
      'Garnish as specified in the recipe',
      'Serve immediately at the proper temperature'
    ];
  }

  const filteredRecipes = recipesWithInstructions.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(recipeSearchTerm.toLowerCase()) ||
      // Only search ingredients if there are any (API items have empty array)
      (item.ingredients.length > 0 && item.ingredients.some(ing =>
        ing.toLowerCase().includes(recipeSearchTerm.toLowerCase())
      ));
    const matchesCategory = recipeCategory === 'All' || item.category === recipeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard/cook')}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Recipe Book</h1>
            <p className="text-gray-400">Complete preparation instructions for all dishes</p>
          </div>
        </div>

        {isLoadingMenu ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Loading recipes...</p>
          </div>
        ) : menuError ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">{menuError}</p>
          </div>
        ) : selectedRecipe ? (
          /* Recipe Detail View */
          <div className="max-w-5xl mx-auto">
            <Button
              onClick={() => setSelectedRecipe(null)}
              variant="ghost"
              className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2 px-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to recipes
            </Button>

            <div className="bg-[#242424] rounded-2xl overflow-hidden border border-gray-800">
              {/* Recipe Header */}
              <div className="relative h-80">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-4xl font-bold text-white mb-2">{selectedRecipe.name}</h2>
                  <p className="text-gray-300">{selectedRecipe.description}</p>
                </div>
              </div>

              <div className="p-8">
                {/* Recipe Info */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-bold">{selectedRecipe.prepTime}</p>
                    <p className="text-gray-400 text-sm">Prep Time</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-bold">{selectedRecipe.servings} servings</p>
                    <p className="text-gray-400 text-sm">Portions</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <ChefHat className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-bold">{selectedRecipe.difficulty}</p>
                    <p className="text-gray-400 text-sm">Difficulty</p>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Ingredients</h3>
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRecipe.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-300">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Preparation Instructions</h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((instruction: string, idx: number) => (
                      <div key={idx} className="flex gap-4 bg-gray-800 rounded-xl p-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{idx + 1}</span>
                        </div>
                        <p className="text-gray-300 flex-1 pt-1">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* Recipe Grid View */
          <>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <Input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={recipeSearchTerm}
                onChange={(e) => setRecipeSearchTerm(e.target.value)}
                className="h-12 px-6"
              />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    onClick={() => setRecipeCategory(cat)}
                    variant={recipeCategory === cat ? 'default' : 'secondary'}
                    className={`h-10 px-6 whitespace-nowrap ${recipeCategory === cat
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-gray-400 text-lg">No recipes found</p>
                </div>
              ) : (
                filteredRecipes.map(recipe => (
                  <Button
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    variant="outline"
                    className="h-auto bg-[#242424] rounded-2xl overflow-hidden border-gray-800 hover:border-blue-700 transition-all text-left group flex-col items-start p-0"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">{recipe.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.prepTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChefHat className="w-3 h-3" />
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
