import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, ChefHat, AlertTriangle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getMenuItems, type MenuItem } from '../services/menuService';
import { API_ENDPOINTS } from '../config/api';
import { getOrders, updateOrderStatus as updateApiOrderStatus, type ApiOrder } from '../services/orderService';
import { getTranslatedMenuSearchText, translateIngredient, translateProductName } from '../data/translationHelpers';

interface IngredientItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
}

interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface KitchenOrder {
  id: string;
  localId?: string;
  apiId?: number;
  createdAt: string;
  status: 'sent-to-kitchen' | 'preparing';
  type: string;
  tableNumber?: number;
  comment?: string;
  items: KitchenOrderItem[];
}

function normalizeOrderType(type: string) {
  const normalized = type.trim().toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'dinein') return 'dine-in';
  if (normalized === 'takeaway') return 'takeaway';
  return 'delivery';
}

function normalizeKitchenStatus(status: string): 'sent-to-kitchen' | 'preparing' | 'other' {
  const normalized = status.trim().toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'senttokitchen' || normalized === 'confirmed') return 'sent-to-kitchen';
  if (normalized === 'preparing' || normalized === 'inpreparation') return 'preparing';
  return 'other';
}

function mapApiKitchenOrder(order: ApiOrder): KitchenOrder | null {
  const status = normalizeKitchenStatus(order.status);
  if (status !== 'sent-to-kitchen' && status !== 'preparing') {
    return null;
  }

  return {
    id: `API${order.id}`,
    apiId: order.id,
    createdAt: order.createdAt,
    status,
    type: normalizeOrderType(order.orderType),
    tableNumber: order.tableNumber,
    items: order.items.map((item) => ({
      id: String(item.id),
      name: item.productName,
      quantity: item.quantity,
    })),
  };
}

export function CookDashboard() {
  const {
    user,
    logout,
    orders,
    updateOrderStatus,
    unavailableItems,
    unavailableIngredients,
    setItemAvailability,
    setIngredientAvailability,
    inventory,
    updateInventory,
    t
  } = useApp();
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
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [ordersError, setOrdersError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const refreshOrders = async () => {
    const rows = await getOrders();
    setApiOrders(rows);
  };

  const handlePickOrder = async (order: KitchenOrder) => {
    setOrdersError('');
    setBusyOrderId(order.id);

    try {
      if (order.apiId) {
        await updateApiOrderStatus(order.apiId, 'Preparing');
        await refreshOrders();
      }
      if (order.localId) {
        updateOrderStatus(order.localId, 'preparing');
      }
      setSelectedOrder(order.id);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : t.kitchen.startError);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleCompleteOrder = async (order: KitchenOrder) => {
    setOrdersError('');
    setBusyOrderId(order.id);

    try {
      if (order.apiId) {
        await updateApiOrderStatus(order.apiId, 'Ready');
        await refreshOrders();
      }
      if (order.localId) {
        updateOrderStatus(order.localId, 'ready');
      }
      setSelectedOrder(null);

      // Simulate inventory reduction (mock logic)
      const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
      if (randomItem) {
        updateInventory(randomItem.id, Math.max(0, randomItem.quantity - 2));
      }
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : t.kitchen.readyError);
    } finally {
      setBusyOrderId(null);
    }
  };

  const kitchenOrders = [
    ...apiOrders.map(mapApiKitchenOrder).filter((order): order is KitchenOrder => order !== null),
    ...orders
      .filter((order) => !order.apiId)
      .map((order) => {
        const status = normalizeKitchenStatus(order.status);
        if (status !== 'sent-to-kitchen' && status !== 'preparing') {
          return null;
        }

        return {
          id: order.id,
          localId: order.id,
          createdAt: order.createdAt,
          status,
          type: order.type,
          tableNumber: order.tableNumber,
          comment: order.comment,
          items: order.items.map((item) => ({
            id: String(item.id),
            name: item.name,
            quantity: item.quantity,
          })),
        };
      })
      .filter((order): order is KitchenOrder => order !== null)
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const incomingOrders = kitchenOrders.filter(o => o.status === 'sent-to-kitchen');
  const preparingOrders = kitchenOrders.filter(o => o.status === 'preparing');
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
        setMenuError(t.kitchen.unableMenu);
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
  }, [t.kitchen.unableMenu]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const rows = await getOrders();
        if (!isMounted) return;
        setApiOrders(rows);
        setOrdersError('');
      } catch {
        if (!isMounted) return;
        setApiOrders([]);
        setOrdersError(t.kitchen.ordersLoadError);
      }
    };

    loadOrders();
    const interval = window.setInterval(loadOrders, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [t.kitchen.ordersLoadError]);

  useEffect(() => {
    const fetchIngredients = () => {
      fetch(API_ENDPOINTS.ingredients)
        .then(r => r.json())
        .then((data: IngredientItem[]) => setIngredients(data))
        .catch(() => {/* silent fail */ });
    };

    fetchIngredients();
    const interval = setInterval(fetchIngredients, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter menu items for the availability grid
  const filteredMenuItems = menuItems.filter(item => {
    const isUnavailable = unavailableItems.includes(item.name);
    const matchesSearch = getTranslatedMenuSearchText(t, item).includes(menuSearchTerm.toLowerCase());
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
            <h1 className="text-4xl font-bold text-white mb-2">{t.kitchen.title}</h1>
            <p className="text-gray-400">{t.kitchen.welcome}, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/cook/recipes')}
              variant="secondary"
              className="px-6"
            >
              <BookOpen className="w-4 h-4" />
              {t.kitchen.recipes}
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="px-6"
            >
              <LogOut className="w-4 h-4" />
              {t.common.logout}
            </Button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-8 bg-yellow-900/30 border border-yellow-600 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{t.kitchen.lowStockAlert}</h3>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <span key={item.id} className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {translateIngredient(t, item.name)}: {item.quantity} {item.unit}
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
            <h2 className="text-2xl font-bold text-white mb-6">{t.kitchen.incomingOrders}</h2>
            {ordersError && (
              <div className="mb-4 rounded-xl border border-yellow-900/60 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
                {ordersError}
              </div>
            )}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {incomingOrders.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">{t.kitchen.noIncomingOrders}</p>
                </div>
              ) : (
                incomingOrders.map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800 hover:border-blue-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.common.order} #{order.id}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                        {t.kitchen.new}
                      </span>
                    </div>

                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">{t.kitchen.items}: {order.items.length} {t.kitchen.dishes}</p>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-white text-sm">
                            {item.quantity}x {translateProductName(t, item.name)}
                          </p>
                        ))}
                      </div>
                      {order.tableNumber && (
                        <p className="text-white text-sm mt-1">{t.common.table}: #{order.tableNumber}</p>
                      )}
                      <p className="text-white text-sm mt-1">{t.kitchen.type}: <span className="capitalize">{order.type}</span></p>
                      {order.comment && (
                        <p className="text-gray-300 text-sm mt-2">{t.kitchen.notes}: {order.comment}</p>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePickOrder(order)}
                      className="w-full"
                      disabled={busyOrderId === order.id}
                    >
                      <ChefHat className="w-4 h-4" />
                      {busyOrderId === order.id ? t.kitchen.starting : t.kitchen.startPreparing}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders in Preparation */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.kitchen.inPreparation}</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {preparingOrders.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">{t.kitchen.noPreparingOrders}</p>
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-blue-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{t.common.order} #{order.id}</h3>
                        <p className="text-gray-400 text-sm">
                          {t.kitchen.started}: {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                        {t.kitchen.cooking}
                      </span>
                    </div>

                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">{t.kitchen.waiterNotes}</p>
                      <p className="text-white text-sm">{order.comment || t.kitchen.noSpecialInstructions}</p>
                      <div className="mt-3 space-y-1">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-gray-300 text-sm">
                            {item.quantity}x {translateProductName(t, item.name)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCompleteOrder(order)}
                      variant="success"
                      className="w-full"
                      disabled={busyOrderId === order.id}
                    >
                      {busyOrderId === order.id ? t.kitchen.updating : t.kitchen.markReady}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Menu Item Availability */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">{t.kitchen.menuAvailability}</h2>

          <div className="mb-6 flex gap-4">
            <Input
              type="text"
              placeholder={t.kitchen.searchMenuItems}
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
              className="flex-1 h-12 px-6"
            />
            <Select value={menuFilter} onValueChange={setMenuFilter}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t.kitchen.allItems}</SelectItem>
                <SelectItem value="Available">{t.kitchen.availableOnly}</SelectItem>
                <SelectItem value="Unavailable">{t.kitchen.unavailableOnly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingMenu && (
              <p className="col-span-full text-center text-gray-400 py-8">{t.kitchen.loadingMenu}</p>
            )}
            {menuError && !isLoadingMenu && (
              <p className="col-span-full text-center text-red-400 py-8">{menuError}</p>
            )}
            {!isLoadingMenu && !menuError && (
              filteredMenuItems.map(item => {
                const isUnavailable = unavailableItems.includes(item.name);
                return (
                  <div
                    key={item.id}
                    className={`h-auto p-4 rounded-xl border-2 transition-all text-left ${
                      isUnavailable
                        ? 'bg-red-900/30 border-red-600'
                        : 'bg-green-900/30 border-green-600'
                    }`}
                  >
                    <p className="text-white font-bold text-sm mb-1">{translateProductName(t, item.name)}</p>
                    <p className={`text-xs ${isUnavailable ? 'text-red-400' : 'text-green-400'}`}>
                      {isUnavailable ? t.kitchen.unavailable : t.kitchen.available}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ingredients Availability */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">{t.kitchen.ingredientsAvailability}</h2>

          <div className="mb-6 flex gap-4">
            <Input
              type="text"
              placeholder={t.kitchen.searchIngredients}
              value={ingSearchTerm}
              onChange={(e) => setIngSearchTerm(e.target.value)}
              className="flex-1 h-12 px-6"
            />
            <Select value={ingFilter} onValueChange={setIngFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t.kitchen.all}</SelectItem>
                <SelectItem value="Low">{t.kitchen.lowStock}</SelectItem>
                <SelectItem value="Ok">{t.kitchen.inStock}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ingredients
              .filter(ing => {
                const q = ingSearchTerm.toLowerCase();
                const matchesSearch = ing.name.toLowerCase().includes(q) || translateIngredient(t, ing.name).toLowerCase().includes(q);
                const isLow = ing.quantity <= ing.minStock;
                const matchesFilter = ingFilter === 'All' || (ingFilter === 'Low' && isLow) || (ingFilter === 'Ok' && !isLow);
                return matchesSearch && matchesFilter;
              })
              .map(ing => {
                const isOutOfStock = ing.quantity <= 0;
                const isManuallyUnavailable = unavailableIngredients.includes(ing.name.toLowerCase());
                const effectivelyUnavailable = isOutOfStock || isManuallyUnavailable;

                return (
                  <Button
                    key={ing.id}
                    onClick={() => setIngredientAvailability(ing.name, effectivelyUnavailable)}
                    variant="outline"
                    className={`h-auto p-4 rounded-xl border-2 transition-all text-left flex-col items-start hover:scale-[1.02] ${
                      effectivelyUnavailable
                        ? 'bg-red-900/30 border-red-600 hover:bg-red-900/40'
                        : 'bg-green-900/30 border-green-600 hover:bg-green-900/40'
                    }`}
                  >
                    <p className="text-white font-bold text-sm mb-1 truncate w-full capitalize">{translateIngredient(t, ing.name)}</p>
                    <p className={`text-xs ${effectivelyUnavailable ? 'text-red-400' : 'text-green-400'}`}>
                      {isOutOfStock ? t.kitchen.outOfStock : isManuallyUnavailable ? t.kitchen.manuallyDisabled : `${ing.quantity} ${ing.unit}`}
                    </p>
                  </Button>
                );
              })
            }

            {ingredients.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-8">{t.kitchen.loadingIngredients}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
