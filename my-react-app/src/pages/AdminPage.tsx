import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldAlert,
  Tag,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';
import type { Product } from '../types/product';
import {
  getAdminCategories,
  getAdminOrders,
  getAdminProducts,
  getAdminReservations,
  getAdminUsers,
  type AdminCategory,
  type AdminOrder,
  type AdminReservation,
  type AdminUser,
} from '../services/adminService';

interface NormalizedOrder {
  id: string;
  name: string;
  status: string;
  amount: number;
  date: string;
}

interface RecentActivity {
  id: string;
  kind: 'Order' | 'Reservation';
  title: string;
  status: string;
  amount?: number;
  date: string;
}

interface NormalizedReservation {
  id: string;
  title: string;
  status: string;
  date: string;
  guests: number;
  tableNumber?: number | null;
  tableCapacity?: number | null;
}

function formatAmount(value: number) {
  return `${Math.round(value)} MDL`;
}

function formatDate(value: string, language: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';

  return date.toLocaleString(language === 'RO' ? 'ro-MD' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getLastSevenDays(language: string) {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(language === 'RO' ? 'ro-MD' : 'en-US', { weekday: 'short' }),
    };
  });
}

function dateTime(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('delivered') || normalized.includes('completed') || normalized.includes('confirmed')) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }

  if (normalized.includes('pending') || normalized.includes('preparation') || normalized.includes('draft')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }

  if (normalized.includes('cancelled')) {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }

  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

function mapApiOrder(order: AdminOrder, labels: { restaurantOrder: string; table: string }): NormalizedOrder {
  return {
    id: String(order.id),
    name: order.clientName || (order.tableNumber ? `${labels.table} ${order.tableNumber}` : labels.restaurantOrder),
    status: order.status || 'unknown',
    amount: Number(order.totalAmount ?? order.total ?? 0),
    date: order.createdAt || '',
  };
}

function mapApiReservation(
  reservation: AdminReservation,
  labels: { table: string; seats: string; unassignedTable: string; guests: string }
): NormalizedReservation {
  const tableLabel = reservation.tableNumber
    ? `${labels.table} #${reservation.tableNumber}${reservation.tableCapacity ? ` (${reservation.tableCapacity} ${labels.seats})` : ''}`
    : labels.unassignedTable;
  const guestLabel = `${reservation.numberOfGuests ?? 0} ${labels.guests}`;

  return {
    id: String(reservation.id),
    title: `${tableLabel} - ${guestLabel}`,
    status: reservation.status || 'unknown',
    date: reservation.reservationDate || reservation.createdAt || '',
    guests: reservation.numberOfGuests ?? 0,
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
  };
}

export function AdminPage() {
  const { user, logout, orders, reservations, t, language } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [apiOrders, setApiOrders] = useState<AdminOrder[] | null>(null);
  const [apiReservations, setApiReservations] = useState<AdminReservation[] | null>(null);
  const [apiUsers, setApiUsers] = useState<AdminUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);

      const [productsResult, categoriesResult, ordersResult, reservationsResult, usersResult] = await Promise.allSettled([
        getAdminProducts(),
        getAdminCategories(),
        getAdminOrders(),
        getAdminReservations(),
        getAdminUsers(),
      ]);

      if (!isMounted) return;

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      }

      if (ordersResult.status === 'fulfilled') {
        setApiOrders(ordersResult.value);
      } else {
        setApiOrders(null);
      }

      if (reservationsResult.status === 'fulfilled') {
        setApiReservations(reservationsResult.value);
      } else {
        setApiReservations(null);
      }

      if (usersResult.status === 'fulfilled') {
        setApiUsers(usersResult.value);
      } else {
        setApiUsers(null);
      }

      setIsLoading(false);
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedOrders = useMemo<NormalizedOrder[]>(() => {
    if (apiOrders && apiOrders.length > 0) {
      return apiOrders.map((order) => mapApiOrder(order, {
        restaurantOrder: t.admin.restaurantOrder,
        table: t.common.table,
      }));
    }

    return orders.map((order) => ({
      id: order.id,
      name: order.clientName || order.type,
      status: order.status,
      amount: order.total,
      date: order.createdAt,
    }));
  }, [apiOrders, orders, t.admin.restaurantOrder, t.common.table]);

  const normalizedReservations = useMemo<NormalizedReservation[]>(() => {
    if (apiReservations && apiReservations.length > 0) {
      return apiReservations.map((reservation) => mapApiReservation(reservation, {
        table: t.common.table,
        seats: t.common.seats,
        unassignedTable: t.admin.unassignedTable,
        guests: t.common.guests,
      }));
    }

    return reservations.map((reservation) => ({
      id: reservation.id,
      title: `${reservation.tableNumber ? `${t.common.table} #${reservation.tableNumber}` : t.admin.unassignedTable} - ${reservation.guests} ${t.common.guests}`,
      status: reservation.status,
      date: `${reservation.date} ${reservation.time}`,
      guests: reservation.guests,
      tableNumber: reservation.tableNumber,
      tableCapacity: reservation.tableCapacity,
    }));
  }, [apiReservations, reservations, t.admin.unassignedTable, t.common.guests, t.common.seats, t.common.table]);

  const distinctProductCategories = useMemo(() => (
    new Set(products.map((product) => product.category).filter(Boolean)).size
  ), [products]);

  const categoryTotal = categories.length > 0 ? categories.length : distinctProductCategories;
  const orderTotal = normalizedOrders.length;
  const userTotal = apiUsers?.length ?? 0;
  const estimatedRevenue = normalizedOrders.reduce((sum, order) => sum + order.amount, 0);

  const chartData = useMemo(() => {
    return getLastSevenDays(language).map((day) => {
      const dayOrders = normalizedOrders.filter((order) => toDateKey(order.date) === day.key);
      return {
        ...day,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.amount, 0),
      };
    });
  }, [language, normalizedOrders]);

  const maxRevenue = Math.max(...chartData.map((day) => day.revenue), 1);

  const recentActivity = useMemo<RecentActivity[]>(() => {
    const orderRows = normalizedOrders.map((order) => ({
      id: order.id,
      kind: 'Order' as const,
      title: order.name,
      status: order.status,
      amount: order.amount,
      date: order.date,
    }));

    const reservationRows = normalizedReservations.map((reservation) => ({
      id: reservation.id,
      kind: 'Reservation' as const,
      title: reservation.title,
      status: reservation.status,
      date: reservation.date,
    }));

    return [...orderRows, ...reservationRows]
      .sort((a, b) => dateTime(b.date) - dateTime(a.date))
      .slice(0, 6);
  }, [normalizedOrders, normalizedReservations]);

  const stats = [
    {
      label: t.admin.totalProducts,
      value: products.length,
      helper: t.admin.activeCatalog,
      icon: Package,
      accent: 'text-blue-300 bg-blue-500/15 border-blue-500/25',
    },
    {
      label: t.admin.totalCategories,
      value: categoryTotal,
      helper: categories.length > 0 ? t.admin.fromApi : t.admin.fromProducts,
      icon: Tag,
      accent: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/25',
    },
    {
      label: t.admin.totalUsers,
      value: userTotal,
      helper: apiUsers ? t.admin.fromApi : t.admin.fallbackZero,
      icon: Users,
      accent: 'text-violet-300 bg-violet-500/15 border-violet-500/25',
    },
    {
      label: t.admin.totalReservations,
      value: normalizedReservations.length,
      helper: apiReservations ? t.admin.fromApi : t.admin.localData,
      icon: CalendarDays,
      accent: 'text-amber-300 bg-amber-500/15 border-amber-500/25',
    },
    {
      label: t.admin.totalOrders,
      value: orderTotal,
      helper: apiOrders ? t.admin.fromApi : t.admin.localData,
      icon: ClipboardList,
      accent: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/25',
    },
    {
      label: t.admin.estimatedRevenue,
      value: formatAmount(estimatedRevenue),
      helper: t.admin.fromOrders,
      icon: DollarSign,
      accent: 'text-sky-300 bg-sky-500/15 border-sky-500/25',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#121820] px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-700 bg-[#1a2330] p-8 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-300">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="mb-3 text-3xl font-bold">{t.admin.accessDenied}</h1>
            <p className="mb-8 text-slate-400">{t.admin.accessDeniedText}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate('/login')} className="bg-blue-700 hover:bg-blue-600">
                {t.common.login}
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary">
                {t.common.home}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121820] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-[#0f141b] px-5 py-6 xl:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">GastroFlow</p>
              <h1 className="text-xl font-bold">{t.admin.dashboard}</h1>
            </div>
          </div>

          <nav className="space-y-2">
            <Button className="w-full justify-start bg-blue-700 text-white hover:bg-blue-600">
              <BarChart3 className="h-4 w-4" />
              {t.admin.overview}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => navigate('/manager', { state: { fromAdmin: true } })}>
              <Users className="h-4 w-4" />
              {t.admin.managerArea}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => navigate('/waiter', { state: { fromAdmin: true } })}>
              <ClipboardList className="h-4 w-4" />
              {t.admin.staffOrders}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => navigate('/dashboard/client', { state: { fromAdmin: true } })}>
              <Activity className="h-4 w-4" />
              {t.admin.clientArea}
            </Button>
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">{t.admin.controlCenter}</p>
              <h2 className="mt-1 text-3xl font-bold">{t.admin.operations}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleLogout} className="bg-blue-700 hover:bg-blue-600">
                <LogOut className="h-4 w-4" />
                {t.common.logout}
              </Button>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-[#1a2330] p-5 shadow-xl shadow-black/10">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{isLoading ? '...' : stat.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stat.accent}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.helper}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-slate-800 bg-[#1a2330] p-5 shadow-xl shadow-black/10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{t.admin.lastSevenDaysRevenue}</h3>
                  <p className="mt-1 text-sm text-slate-400">{t.admin.chartHint}</p>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-200">
                  {formatAmount(estimatedRevenue)}
                </div>
              </div>

              <div className="flex h-64 items-end gap-3 rounded-xl border border-slate-800 bg-[#121820] px-4 py-5">
                {chartData.map((day) => {
                  const height = day.revenue > 0 ? Math.max(8, (day.revenue / maxRevenue) * 100) : 2;

                  return (
                    <div key={day.key} className="flex h-full flex-1 flex-col justify-end gap-3">
                      <div className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-800 to-blue-400 shadow-lg shadow-blue-900/20"
                          style={{ height: `${height}%` }}
                          title={`${day.orders} ${t.common.orders}, ${formatAmount(day.revenue)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold uppercase text-slate-400">{day.label}</p>
                        <p className="mt-1 text-xs text-blue-300">{day.orders}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#1a2330] p-5 shadow-xl shadow-black/10">
              <h3 className="mb-4 text-xl font-bold">{t.admin.quickActions}</h3>
              <div className="space-y-3">
                {[
                  { label: t.admin.viewMenu, path: '/menu', icon: Package },
                  { label: t.admin.viewReservations, path: '/manager', icon: CalendarDays, adminTab: 'reservations' },
                  { label: t.admin.viewOrders, path: '/waiter', icon: ClipboardList },
                ].map((action) => (
                  <Button
                    key={action.label}
                    onClick={() => navigate(action.path, { state: { fromAdmin: true, adminTab: action.adminTab } })}
                    variant="secondary"
                    className="h-14 w-full justify-between rounded-xl border border-slate-700 bg-[#121820] text-white hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-3">
                      <action.icon className="h-5 w-5 text-blue-300" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-800 bg-[#1a2330] shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="text-xl font-bold">{t.admin.recentActivity}</h3>
                <p className="mt-1 text-sm text-slate-400">{t.admin.recentActivityHint}</p>
              </div>
              <span className="rounded-xl bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                {recentActivity.length}
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {recentActivity.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                  {t.admin.noRecentActivity}
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={`${item.kind}-${item.id}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-300">
                        {item.kind === 'Order' ? <ClipboardList className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{item.kind === 'Order' ? t.common.order : t.common.reservation} #{item.id}</p>
                        <p className="text-sm text-slate-400">{item.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      {typeof item.amount === 'number' && (
                        <span className="text-sm font-semibold text-blue-200">{formatAmount(item.amount)}</span>
                      )}
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-sm text-slate-400">{formatDate(item.date, language)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
