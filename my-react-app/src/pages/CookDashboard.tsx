import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, ChefHat, AlertTriangle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getMenuItems, type MenuItem } from '../services/menuService';
import { API_ENDPOINTS } from '../config/api';

interface IngredientItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
}

export function CookDashboard() {
  const { user, logout, orders, updateOrderStatus, unavailableItems, setItemAvailability, inventory, updateInventory } = useApp();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilter, setMenuFilter] = useState('All');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [ingSearchTerm, setIngSearchTerm] = useState('');
  const [ingFilter, setIngFilter] = useState('All'); // All | Low | Ok


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePickOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    updateOrderStatus(orderId, 'in-preparation');
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    setSelectedOrder(null);
    
    // Simulate inventory reduction
    const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
    if (randomItem) {
      updateInventory(randomItem.id, Math.max(0, randomItem.quantity - 2));
    }
  };

  const incomingOrders = orders.filter(o => o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'in-preparation');
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

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
        setMenuError('Unable to load menu availability.');
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

  useEffect(() => {
    fetch(API_ENDPOINTS.ingredients)
      .then(r => r.json())
      .then((data: IngredientItem[]) => setIngredients(data))
      .catch(() => {/* silent fail */});
  }, []);

  // Build a set of ingredient names that are completely out of stock (<= 0).
  const outOfStockIngNames = new Set(
    ingredients.filter(i => i.quantity <= 0).map(i => i.name.toLowerCase())
  );

  // A menu item is auto-unavailable if ANY of its ingredients is out of stock.
  const autoUnavailableProducts = new Set(
    menuItems
      .filter(item => item.ingredients.some(ing => outOfStockIngNames.has(ing.toLowerCase())))
      .map(item => item.name)
  );

  // Filter menu items for the availability grid
  const filteredMenuItems = menuItems.filter(item => {
    const isUnavailable = autoUnavailableProducts.has(item.name);
    const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase());
    const matchesFilter = menuFilter === 'All' ||
      (menuFilter === 'Available' && !isUnavailable) ||
      (menuFilter === 'Unavailable' && isUnavailable);
    return matchesSearch && matchesFilter;
  });



  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Cook Dashboard</h1>
            <p className="text-gray-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/dashboard/cook/recipes')}
              variant="secondary"
              className="px-6"
            >
              <BookOpen className="w-4 h-4" />
              Recipes
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="px-6"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-8 bg-yellow-900/30 border border-yellow-600 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Low Stock Alert</h3>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <span key={item.id} className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {item.name}: {item.quantity} {item.unit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Orders */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Incoming Orders</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {incomingOrders.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">No incoming orders</p>
                </div>
              ) : (
                incomingOrders.map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800 hover:border-blue-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Order #{order.id}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                        NEW
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Items: {order.items.length} dishes</p>
                      {order.tableNumber && (
                        <p className="text-white text-sm mt-1">Table: #{order.tableNumber}</p>
                      )}
                      <p className="text-white text-sm mt-1">Type: <span className="capitalize">{order.type}</span></p>
                      {order.comment && (
                        <p className="text-gray-300 text-sm mt-2">Notes: {order.comment}</p>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePickOrder(order.id)}
                      className="w-full"
                    >
                      <ChefHat className="w-4 h-4" />
                      Start Preparing
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders in Preparation */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">In Preparation</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {preparingOrders.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">No orders being prepared</p>
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-blue-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Order #{order.id}</h3>
                        <p className="text-gray-400 text-sm">
                          Started: {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                        COOKING
                      </span>
                    </div>

                    {/* Waiter Comments */}
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Waiter Notes:</p>
                      <p className="text-white text-sm">{order.comment || 'No special instructions'}</p>
                    </div>

                    <Button
                      onClick={() => handleCompleteOrder(order.id)}
                      variant="success"
                      className="w-full"
                    >
                      Mark as Ready
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Menu Item Availability */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Menu Availability</h2>
          
          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <Input
              type="text"
              placeholder="Search menu items..."
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
              className="flex-1 h-12 px-6"
            />
            <Select value={menuFilter} onValueChange={setMenuFilter}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Items</SelectItem>
                <SelectItem value="Available">Available Only</SelectItem>
                <SelectItem value="Unavailable">Unavailable Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingMenu && (
              <p className="col-span-full text-center text-gray-400 py-8">Loading menu...</p>
            )}
            {menuError && !isLoadingMenu && (
              <p className="col-span-full text-center text-red-400 py-8">{menuError}</p>
            )}
            {!isLoadingMenu && !menuError && (
              <>
            {filteredMenuItems.map(item => {
              const isUnavailable = autoUnavailableProducts.has(item.name);
              return (
                <div
                  key={item.id}
                  className={`h-auto p-4 rounded-xl border-2 transition-all text-left ${
                    isUnavailable
                      ? 'bg-red-900/30 border-red-600'
                      : 'bg-green-900/30 border-green-600'
                  }`}
                >
                  <p className="text-white font-bold text-sm mb-1">{item.name}</p>
                  <p className={`text-xs ${isUnavailable ? 'text-red-400' : 'text-green-400'}`}>
                    {isUnavailable ? 'Unavailable' : 'Available'}
                  </p>
                </div>
              );
            })}
              </>
            )}
          </div>
        </div>
        {/* Ingredients Availability */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ingredients Availability</h2>

          {/* Search + Filter */}
          <div className="mb-6 flex gap-4">
            <Input
              type="text"
              placeholder="Search ingredients..."
              value={ingSearchTerm}
              onChange={(e) => setIngSearchTerm(e.target.value)}
              className="flex-1 h-12 px-6"
            />
            <Select value={ingFilter} onValueChange={setIngFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Low">Low Stock</SelectItem>
                <SelectItem value="Ok">In Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ingredients
              .filter(ing => {
                const matchesSearch = ing.name.toLowerCase().includes(ingSearchTerm.toLowerCase());
                const isOutOfStock = ing.quantity <= 0;
                const isLow = ing.quantity <= ing.minStock;
                const matchesFilter = ingFilter === 'All' || (ingFilter === 'Low' && isLow) || (ingFilter === 'Ok' && !isLow);
                return matchesSearch && matchesFilter;
              })
              .map(ing => {
                const isOutOfStock = ing.quantity <= 0;
                return (
                  <div
                    key={ing.id}
                    className={`h-auto p-4 rounded-xl border-2 transition-all text-left ${
                      isOutOfStock ? 'bg-red-900/30 border-red-600' : 'bg-green-900/30 border-green-600'
                    }`}
                  >
                    <p className="text-white font-bold text-sm mb-1 truncate">{ing.name}</p>
                    <p className={`text-xs ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${ing.quantity} ${ing.unit}`}
                    </p>
                  </div>
                );
              })
            }

            {ingredients.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">Loading ingredients...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}