import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations } from '../data/translations';
import type { Language, Translations } from '../data/translations';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  apiId?: number;
  type: 'delivery' | 'takeaway' | 'dine-in';
  items: CartItem[];
  total: number;
  status: 'draft' | 'confirmed' | 'sent-to-kitchen' | 'in-preparation' | 'preparing' | 'ready' | 'delivered' | 'closed';
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
  tableId?: number;
  tableNumber?: number;
  tableCapacity?: number;
  clientName?: string;
  clientEmail?: string;
}

interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'free' | 'occupied' | 'reserved';
}

type UserRole = 'client' | 'waiter' | 'cook' | 'manager' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  language: Language;
  setLanguage: (language: Language | ((current: Language) => Language)) => void;
  t: Translations;
  login: (email: string, password: string, role: 'client' | 'staff') => User;
  setAuthenticatedUser: (data: { email: string; role: string; firstName?: string; lastName?: string }) => User;
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
  addReservation: (reservation: Omit<Reservation, 'id' | 'status'> & Partial<Pick<Reservation, 'status'>>) => boolean;
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
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage === 'EN' || savedLanguage === 'RO' ? savedLanguage : 'RO';
  });
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
    [
      { id: 1, number: 1, seats: 4, status: 'free' },
      { id: 2, number: 2, seats: 2, status: 'free' },
      { id: 3, number: 3, seats: 6, status: 'free' },
      { id: 4, number: 4, seats: 4, status: 'occupied' },
      { id: 5, number: 5, seats: 2, status: 'free' },
      { id: 6, number: 6, seats: 6, status: 'free' },
      { id: 7, number: 7, seats: 4, status: 'occupied' },
      { id: 8, number: 8, seats: 2, status: 'free' },
      { id: 9, number: 9, seats: 6, status: 'free' },
      { id: 10, number: 10, seats: 4, status: 'free' },
      { id: 11, number: 11, seats: 2, status: 'free' },
      { id: 12, number: 12, seats: 6, status: 'free' },
    ]
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

  const setLanguage = (nextLanguage: Language | ((current: Language) => Language)) => {
    setLanguageState((current) => {
      const resolvedLanguage = typeof nextLanguage === 'function' ? nextLanguage(current) : nextLanguage;
      localStorage.setItem('language', resolvedLanguage);
      return resolvedLanguage;
    });
  };

  // Auto-update availability based on real stock + manual overrides
  useEffect(() => {
    const updateAutoAvailability = async () => {
      try {
        const [ingRes, prodRes] = await Promise.all([
          fetch('http://localhost:5224/api/Ingredients'),
          fetch('http://localhost:5224/api/Products')
        ]);
        
        if (!ingRes.ok || !prodRes.ok) return;
 
        const ingredients: any[] = await ingRes.json();
        const products: any[] = await prodRes.json();
 
        // An ingredient is "unavailable" if its stock is <= 0 OR it's in the manual override list
        const effectivelyUnavailableIngredients = new Set([
          ...ingredients.filter(i => i.quantity <= 0).map(i => i.name.toLowerCase()),
          ...unavailableIngredients.map(name => name.toLowerCase())
        ]);
 
        const autoUnavailableProducts = products
          .filter(p => (p.productIngredients || []).some((pi: any) => 
            effectivelyUnavailableIngredients.has(pi.ingredientName.toLowerCase())
          ))
          .map(p => p.name);
 
        setUnavailableItems(autoUnavailableProducts);
        
        // Update local inventory mock to match real data
        setInventory(ingredients.map(i => ({
          id: i.id.toString(),
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          minStock: i.minStock
        })));
 
      } catch (err) {
        console.error("Failed to sync auto-availability:", err);
      }
    };
 
    updateAutoAvailability();
    const interval = setInterval(updateAutoAvailability, 30000);
    return () => clearInterval(interval);
  }, [unavailableIngredients]); // Re-run when manual overrides change


  const login = (email: string, password: string, role: 'client' | 'staff') => {
    const normalizedEmail = email.trim().toLowerCase();
    void password;

    // Mock login - in production, this would call an API
    if (role === 'client') {
      const nextUser = { id: '1', name: 'John Doe', email, role: 'client' as const };
      setUser(nextUser);
      return nextUser;
    }

    // Determine staff role based on email
    const staffRole: UserRole = normalizedEmail === 'admin@gastroflow.md' ? 'admin' :
      normalizedEmail.includes('waiter') ? 'waiter' :
        normalizedEmail.includes('cook') || normalizedEmail.includes('bucatar') || normalizedEmail.includes('chef') ? 'cook' :
          'manager';
    const nextUser = {
      id: staffRole === 'admin' ? 'admin' : '2',
      name: staffRole === 'admin' ? 'Admin GastroFlow' : 'Staff Member',
      email,
      role: staffRole
    };

    setUser(nextUser);
    return nextUser;
  };

  const setAuthenticatedUser = (data: { email: string; role: string; firstName?: string; lastName?: string }) => {
    const normalizedRole = data.role.toLowerCase();
    const mappedRole: UserRole =
      normalizedRole === 'admin' ? 'admin' :
        normalizedRole === 'waiter' ? 'waiter' :
          normalizedRole === 'chef' || normalizedRole === 'cook' ? 'cook' :
            normalizedRole === 'manager' ? 'manager' :
              'client';
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    const nextUser = {
      id: mappedRole,
      name: name || (mappedRole === 'admin' ? 'Admin GastroFlow' : data.email),
      email: data.email,
      role: mappedRole
    };

    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
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

  const addReservation = (reservation: Omit<Reservation, 'id' | 'status'> & Partial<Pick<Reservation, 'status'>>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: `RES${String(reservations.length + 1).padStart(3, '0')}`,
      status: reservation.status ?? 'pending'
    };
    setReservations(prev => [newReservation, ...prev]);

    let reservedTable = false;
    setTables(prev => {
      const assignedTable = reservation.tableNumber
        ? prev.find(table => table.number === reservation.tableNumber)
        : prev.find(table => table.status === 'free');

      if (!assignedTable) {
        return prev;
      }

      reservedTable = true;
      return prev.map(table =>
        table.id === assignedTable.id && table.status !== 'occupied'
          ? { ...table, status: 'reserved' }
          : table
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
      language,
      setLanguage,
      t: translations[language],
      login,
      setAuthenticatedUser,
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
