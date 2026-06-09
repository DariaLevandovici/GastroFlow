import { useEffect, useState } from 'react';
import { MenuCarousel } from './MenuCarousel';
import { ProductCard } from './ProductCard';

import { useApp } from '../../../context/AppContext';
import { getMenuCategories, getMenuItems, type MenuItem } from '../../../services/menuService';
import { getTranslatedMenuSearchText, translateCategory } from '../../../data/translationHelpers';

export function MenuSection() {
  const { searchQuery, t } = useApp();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);
        const [items, fetchedCategories] = await Promise.all([getMenuItems(), getMenuCategories()]);
        if (!isMounted) return;
        setMenuItems(items);
        setCategories(fetchedCategories);
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
  }, [t.menu.loadError]);

  if (isLoadingMenu) {
    return (
      <section id="menu" className="py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 text-lg">{t.home.loadingMenu}</p>
        </div>
      </section>
    );
  }

  if (menuError) {
    return (
      <section id="menu" className="py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-red-400 text-lg">{menuError}</p>
        </div>
      </section>
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const filteredItems = menuItems.filter((item) => getTranslatedMenuSearchText(t, item).includes(query));

    return (
      <section id="menu" className="py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{t.home.searchResultsTitle}</h2>
            <p className="text-gray-400 text-lg">{t.home.searchResultsFor} "{searchQuery}"</p>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">{t.home.noResults}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item.id} className="h-full">
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16 bg-[#1a1a1a]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{t.home.menuTitle}</h2>
          <p className="text-gray-400 text-lg">{t.home.menuSubtitle}</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 pb-4 border-b border-gray-800">
              {translateCategory(t, category)}
            </h3>
            <MenuCarousel items={menuItems.filter((item) => item.category === category)} />
          </div>
        ))}
      </div>
    </section>
  );
}
