import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { AddToCartButton } from '../components/AddToCartButton';
import { AdminBackButton } from '../components/AdminBackButton';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getMenuCategories, getMenuItems, type MenuItem } from '../services/menuService';
import {
  getTranslatedMenuSearchText,
  translateCategory,
  translateDietary,
  translateIngredient,
  translateProductDescription,
  translateProductName,
} from '../data/translationHelpers';

const dietaryOptions = ['All', 'vegan', 'vegetarian', 'gluten-free'];

export function MenuPage() {
  const { unavailableItems, searchQuery, t } = useApp();
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
        setMenuError(t.menu.loadError);
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
    // Local search (name, description, or ingredients) + global search query from context
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!getTranslatedMenuSearchText(t, item).includes(q)) return false;
    }

    // Also apply global search query from the navbar (AppContext)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!getTranslatedMenuSearchText(t, item).includes(q)) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Dietary filter (no-op when backend returns no dietary data)
    if (selectedDietary !== 'All' && !item.dietary.includes(selectedDietary)) return false;

    // Ingredient filter (no-op when ingredients array is empty)
    if (ingredientFilter && item.ingredients.length > 0) {
      const q = ingredientFilter.toLowerCase();
      const matchesIngredient = item.ingredients.some((ing) =>
        ing.toLowerCase().includes(q) || translateIngredient(t, ing).toLowerCase().includes(q)
      );
      if (!matchesIngredient) return false;
    }

    // Price filter
    if (item.price < priceRange.min || item.price > priceRange.max) return false;

    // Availability
    if (unavailableItems.includes(item.name)) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <AdminBackButton className="mb-6" />
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 self-start">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6">{t.menu.categoriesTitle}</h2>
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
                      {translateCategory(t, category)}
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">{t.menu.filtersTitle}</h3>

                {/* Dietary Preferences */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">{t.menu.dietary}</label>
                  <Select value={selectedDietary} onValueChange={setSelectedDietary}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dietaryOptions.map(option => (
                        <SelectItem key={option} value={option}>{translateDietary(t, option)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ingredient Filter */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">{t.menu.ingredients}</label>
                  <Input
                    type="text"
                    value={ingredientFilter}
                    onChange={(e) => setIngredientFilter(e.target.value)}
                    placeholder={t.menu.searchIngredients}
                    className="h-10"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t.menu.priceRange}: {priceRange.min} - {priceRange.max} MDL
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
                  {t.menu.resetFilters}
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            size="icon"
            className="lg:hidden fixed bottom-4 right-4 z-40 size-12 rounded-xl shadow-lg sm:bottom-6 sm:right-6"
          >
            <Filter className="w-6 h-6" />
          </Button>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
              <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#242424] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">{t.menu.filtersTitle}</h2>
                  <Button onClick={() => setShowFilters(false)} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                {/* Same filter content as sidebar */}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 pb-20 lg:pb-0">
            {/* Search bar */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-700 bg-[#242424] px-4 py-2 transition-colors focus-within:border-blue-600 sm:mb-6">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.menu.searchPlaceholder}
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">{t.menu.title}</h1>
              <p className="text-gray-400">
                {t.menu.showing} {filteredItems.length} {t.menu.of} {menuItems.length} {t.menu.items}
              </p>
            </div>

            {isLoadingMenu && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">{t.menu.loadingMenu}</p>
              </div>
            )}

            {menuError && !isLoadingMenu && (
              <div className="text-center py-16">
                <p className="text-red-400 text-lg mb-4">{menuError}</p>
                <Button onClick={() => window.location.reload()} variant="secondary">
                  {t.menu.retry}
                </Button>
              </div>
            )}

            {!isLoadingMenu && !menuError && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.02] hover:border-blue-700"
                >
                  <div className="h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={translateProductName(t, item.name)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-4 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white sm:text-xl">{translateProductName(t, item.name)}</h3>
                      <span className="text-lg font-bold text-blue-400">{item.price} MDL</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{translateProductDescription(t, item)}</p>

                    {/* Ingredients */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">{t.menu.ingredientsLabel}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.ingredients.map((ing, idx) => (
                          <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                            {translateIngredient(t, ing)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    {item.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietary.map((diet, idx) => (
                          <span key={idx} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                            {translateDietary(t, diet)}
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
                <p className="text-gray-400 text-lg">{t.menu.noMatch}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
