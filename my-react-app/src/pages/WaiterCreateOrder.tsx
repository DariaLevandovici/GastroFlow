import { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { getMenuCategories, getMenuItems, type MenuItem } from '../services/menuService';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function WaiterCreateOrder() {
  const navigate = useNavigate();
  const { tables, addOrder } = useApp();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderComment, setOrderComment] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);

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
        setMenuError('Unable to load menu items.');
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

  const addItem = (item: MenuItem) => {
    const existing = orderItems.find(i => i.id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1 
      }]);
    }
  };

  const removeItem = (id: number) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = () => {
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }
    if (orderItems.length === 0) {
      alert('Please add items to the order');
      return;
    }

    addOrder({
      type: 'dine-in',
      items: orderItems as any,
      total,
      status: 'draft',
      tableNumber: selectedTable,
      comment: orderComment.trim() || undefined,
      origin: 'waiter'
    });

    alert(`Order created for Table ${selectedTable}`);
    navigate('/dashboard/waiter');
  };

  const filteredItems = menuItems.filter(item => {
    // category='Menu' from API — items pass when 'All' is selected
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard/waiter')}
            variant="ghost"
            size="icon"
            className="rounded-xl"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <h1 className="text-4xl font-bold text-white">Create New Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Selection */}
          <div className="lg:col-span-2">
            {/* Table Selection */}
            <div className="mb-6 bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Select Table</h3>
              <div className="grid grid-cols-6 gap-3">
                {tables.filter(t => t.status === 'free').map(table => (
                  <Button
                    key={table.id}
                    onClick={() => setSelectedTable(table.number)}
                    variant="outline"
                    className={`h-auto p-4 border-2 transition-all ${
                      selectedTable === table.number
                        ? 'bg-blue-900/30 border-blue-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-white font-bold text-center">{table.number}</p>
                  </Button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 px-6"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex gap-2 overflow-x-auto">
              {categories.map(cat => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? 'default' : 'secondary'}
                  className={`h-10 px-6 whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isLoadingMenu && (
                <p className="col-span-full text-center text-gray-400 py-8">Loading menu...</p>
              )}
              {menuError && !isLoadingMenu && (
                <p className="col-span-full text-center text-red-400 py-8">{menuError}</p>
              )}
              {!isLoadingMenu && !menuError && (
                <>
              {filteredItems.map(item => (
                <Button
                  key={item.id}
                  onClick={() => addItem(item)}
                  variant="outline"
                  className="h-auto bg-[#242424] p-4 border-gray-800 hover:border-blue-700 transition-all text-left flex-col items-start"
                >
                  <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm">{item.name}</h4>
                  <p className="text-blue-400 font-bold">{item.price} MDL</p>
                </Button>
              ))}
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-2xl font-bold text-white mb-6">Order Summary</h3>

              {selectedTable && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
                  <p className="text-blue-400 text-center font-bold text-lg">
                    Table {selectedTable}
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {orderItems.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No items added</p>
                ) : (
                  orderItems.map(item => (
                    <div key={item.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-bold text-sm flex-1">{item.name}</h4>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-gray-900 rounded-full px-3 py-1">
                          <Button
                            onClick={() => updateQuantity(item.id, -1)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white font-bold text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.id, 1)}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-white font-bold">
                          {item.price * item.quantity} MDL
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-2xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-blue-400">{total} MDL</span>
                </div>
              </div>

              <Button
                onClick={() => setShowCommentModal(true)}
                disabled={!selectedTable || orderItems.length === 0}
                className="w-full h-12"
              >
                Create Order
              </Button>
            </div>
          </div>
        </div>

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6">Add Special Instructions</h3>
              <Textarea
                value={orderComment}
                onChange={(e) => setOrderComment(e.target.value)}
                placeholder="Enter any special instructions for the kitchen (optional)..."
                rows={4}
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitOrder}
                  className="flex-1"
                >
                  Create Order
                </Button>
                <Button
                  onClick={() => setShowCommentModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}