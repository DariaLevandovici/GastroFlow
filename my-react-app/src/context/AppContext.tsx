import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  type: 'delivery' | 'takeaway' | 'dine-in';
  items: CartItem[];
  total: number;
  status: 'draft' | 'confirmed' | 'in-preparation' | 'ready' | 'delivered';
  createdAt: string;
  address?: string;
  tableNumber?: number;
  clientName?: string;
  comment?: string;
  origin?: 'client' | 'waiter';
  createdByUserId?: string;
  finalized?: boolean;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'free' | 'occupied' | 'reserved';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'waiter' | 'cook' | 'manager';
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string, role: 'client' | 'staff') => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateCartQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  finalizeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => boolean;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  tables: Table[];
  updateTableStatus: (id: number, status: Table['status']) => void;
  inventory: InventoryItem[];
  updateInventory: (id: string, quantity: number) => void;
  unavailableItems: string[];
  unavailableIngredients: string[];
  setItemAvailability: (itemName: string, available: boolean) => void;
  setIngredientAvailability: (ingredientName: string, available: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      type: 'delivery',
      items: [],
      total: 450,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      address: 'Str. Stefan cel Mare 123',
      origin: 'waiter'
    }
  ]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      seats: i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 6,
      status: i % 4 === 0 ? 'occupied' : 'free'
    }))
  );
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'INV001', name: 'Tomatoes', quantity: 50, unit: 'kg', minStock: 20 },
    { id: 'INV002', name: 'Beef', quantity: 30, unit: 'kg', minStock: 15 },
    { id: 'INV003', name: 'Pasta', quantity: 25, unit: 'kg', minStock: 10 },
    { id: 'INV004', name: 'Cheese', quantity: 15, unit: 'kg', minStock: 10 },
    { id: 'INV005', name: 'Salmon', quantity: 18, unit: 'kg', minStock: 8 },
  ]);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const login = (email: string, password: string, role: 'client' | 'staff') => {
    // Mock login - in production, this would call an API
    if (role === 'client') {
      setUser({ id: '1', name: 'John Doe', email, role: 'client' });
    } else {
      // Determine staff role based on email
      const staffRole = email.includes('waiter') ? 'waiter' : 
                       email.includes('cook') ? 'cook' : 'manager';
      setUser({ id: '2', name: 'Staff Member', email, role: staffRole });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      origin: order.origin ?? (user?.role === 'waiter' ? 'waiter' : 'client'),
      createdByUserId: order.createdByUserId ?? user?.id
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  };

  const finalizeOrder = (id: string) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, finalized: true } : order));
  };

  const cancelOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order && (order.status === 'draft' || order.status === 'confirmed')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const addReservation = (reservation: Omit<Reservation, 'id' | 'status'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: `RES${String(reservations.length + 1).padStart(3, '0')}`,
      status: 'pending'
    };
    setReservations(prev => [newReservation, ...prev]);

    let reservedTable = false;
    setTables(prev => {
      const firstFreeTable = prev.find(table => table.status === 'free');
      if (!firstFreeTable) {
        return prev;
      }

      reservedTable = true;
      return prev.map(table =>
        table.id === firstFreeTable.id ? { ...table, status: 'reserved' } : table
      );
    });

    return reservedTable;
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
  };

  const updateTableStatus = (id: number, status: Table['status']) => {
    setTables(prev => prev.map(table => table.id === id ? { ...table, status } : table));
  };

  const updateInventory = (id: string, quantity: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const setItemAvailability = (itemName: string, available: boolean) => {
    setUnavailableItems(prev => 
      available ? prev.filter(name => name !== itemName) : [...prev, itemName]
    );
  };

  const setIngredientAvailability = (ingredientName: string, available: boolean) => {
    setUnavailableIngredients(prev =>
      available ? prev.filter(name => name !== ingredientName) : [...prev, ingredientName]
    );
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      addOrder,
      updateOrderStatus,
      finalizeOrder,
      cancelOrder,
      reservations,
      addReservation,
      updateReservationStatus,
      tables,
      updateTableStatus,
      inventory,
      updateInventory,
      unavailableItems,
      unavailableIngredients,
      setItemAvailability,
      setIngredientAvailability,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
