import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { AddToCartButton } from '../components/AddToCartButton';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getMenuCategories, getMenuItems, type MenuItem } from '../services/menuService';

const dietaryOptions = ['All', 'vegan', 'vegetarian', 'gluten-free'];

export function MenuPage() {
  const { unavailableItems } = useApp();
  const [searchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') ?? '');

  // Sync search box when URL param changes (e.g. from header search)
  useEffect(() => {
    setSearchTerm(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);
        const [items, fetchedCategories] = await Promise.all([getMenuItems(), getMenuCategories()]);
        if (!isMounted) return;
        setMenuItems(items);
        setCategories(['All', ...fetchedCategories]);
      } catch {
        if (!isMounted) return;
        setMenuError('Unable to load menu data. Please try again.');
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

  const filteredItems = menuItems.filter(item => {
    // Global search (name or description — ingredients may be empty from API)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const ingMatch = item.ingredients.some(ing => ing.toLowerCase().includes(q));
      if (!nameMatch && !descMatch && !ingMatch) return false;
    }

    // Category filter (all API items have category 'Menu' until backend is extended)
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Dietary filter (no-op when backend returns no dietary data)
    if (selectedDietary !== 'All' && !item.dietary.includes(selectedDietary)) return false;

    // Ingredient filter (no-op when ingredients array is empty)
    if (ingredientFilter && item.ingredients.length > 0 && !item.ingredients.some(ing =>
      ing.toLowerCase().includes(ingredientFilter.toLowerCase())
    )) return false;

    // Price filter
    if (item.price < priceRange.min || item.price > priceRange.max) return false;

    // Availability
    if (unavailableItems.includes(item.name)) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 self-start">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6">Categories</h2>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category}>
                    <Button
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      className={`w-full justify-start px-4 py-2 rounded-xl transition-colors ${selectedCategory === category
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                      {category}
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Filters</h3>

                {/* Dietary Preferences */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Dietary</label>
                  <Select value={selectedDietary} onValueChange={setSelectedDietary}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dietaryOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ingredient Filter */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Ingredients</label>
                  <Input
                    type="text"
                    value={ingredientFilter}
                    onChange={(e) => setIngredientFilter(e.target.value)}
                    placeholder="Search ingredients..."
                    className="h-10"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Price Range: {priceRange.min} - {priceRange.max} MDL
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedDietary('All');
                    setIngredientFilter('');
                    setPriceRange({ min: 0, max: 500 });
                  }}
                  variant="secondary"
                  className="w-full mt-6"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            size="icon"
            className="lg:hidden fixed bottom-6 right-6 z-40 size-12 rounded-xl shadow-lg"
          >
            <Filter className="w-6 h-6" />
          </Button>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
              <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#242424] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                  <Button onClick={() => setShowFilters(false)} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                {/* Same filter content as sidebar */}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Search bar */}
            <div className="mb-6 flex items-center bg-[#242424] border border-gray-700 rounded-xl px-4 py-2 gap-3 focus-within:border-blue-600 transition-colors">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by dish name or ingredient..."
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Our Menu</h1>
              <p className="text-gray-400">
                Showing {filteredItems.length} of {menuItems.length} items
              </p>
            </div>

            {isLoadingMenu && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">Loading menu...</p>
              </div>
            )}

            {menuError && !isLoadingMenu && (
              <div className="text-center py-16">
                <p className="text-red-400 text-lg mb-4">{menuError}</p>
                <Button onClick={() => window.location.reload()} variant="secondary">
                  Retry
                </Button>
              </div>
            )}

            {!isLoadingMenu && !menuError && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:border-blue-700 transition-all hover:scale-[1.02] flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <span className="text-blue-400 font-bold text-lg">{item.price} MDL</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>

                    {/* Ingredients */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.ingredients.map((ing, idx) => (
                          <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    {item.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietary.map((diet, idx) => (
                          <span key={idx} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <AddToCartButton item={item} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            )}

            {!isLoadingMenu && !menuError && filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No items match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
