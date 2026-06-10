import { useEffect, useState } from 'react';
import { Calendar, ClipboardList, DollarSign, LogOut, Package, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';
import { getOrders, type ApiOrder } from '../services/orderService';
import { getReservations, type ApiReservation } from '../services/reservationService';
import { getTables, type ApiTable } from '../services/tableService';

interface DisplayOrder {
  id: string;
  type: string;
  status: string;
  total: number;
  createdAt: string;
  tableNumber?: number;
}

interface DisplayReservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  status: string;
  tableNumber?: number;
  tableCapacity?: number;
  clientEmail?: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ro-MD');
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' });
}

function normalizeOrderStatus(status: string) {
  const normalized = status.trim().toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'pending' || normalized === 'draft') return 'draft';
  if (normalized === 'senttokitchen' || normalized === 'confirmed') return 'sent-to-kitchen';
  if (normalized === 'preparing' || normalized === 'inpreparation') return 'preparing';
  if (normalized === 'ready') return 'ready';
  if (normalized === 'delivered') return 'delivered';
  if (normalized === 'closed' || normalized === 'paid') return 'closed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';
  return 'draft';
}

function normalizeOrderType(type: string) {
  const normalized = type.trim().toLowerCase().replace(/[-_\s]/g, '');
  if (normalized === 'dinein') return 'dine-in';
  if (normalized === 'takeaway') return 'takeaway';
  return 'delivery';
}

function mapApiOrder(order: ApiOrder): DisplayOrder {
  return {
    id: `API${order.id}`,
    type: normalizeOrderType(order.orderType),
    status: normalizeOrderStatus(order.status),
    total: order.totalAmount,
    createdAt: order.createdAt,
    tableNumber: order.tableNumber,
  };
}

function mapApiReservation(reservation: ApiReservation): DisplayReservation {
  return {
    id: String(reservation.id),
    date: formatDate(reservation.reservationDate),
    time: formatTime(reservation.reservationDate),
    guests: reservation.numberOfGuests,
    name: reservation.clientName || 'Customer',
    status: reservation.status,
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
    clientEmail: reservation.clientEmail,
  };
}

export function ManagerDashboard() {
  const { user, logout, orders, reservations, tables, t } = useApp();
  const navigate = useNavigate();
  const [apiOrders, setApiOrders] = useState<DisplayOrder[] | null>(null);
  const [apiReservations, setApiReservations] = useState<DisplayReservation[] | null>(null);
  const [apiTables, setApiTables] = useState<ApiTable[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadManagerData() {
      const [orderRows, reservationRows, tableRows] = await Promise.all([
        getOrders().catch(() => null),
        getReservations().catch(() => null),
        getTables().catch(() => null),
      ]);

      if (!isMounted) return;
      setApiOrders(orderRows ? orderRows.map(mapApiOrder) : null);
      setApiReservations(reservationRows ? reservationRows.map(mapApiReservation) : null);
      setApiTables(tableRows);
    }

    loadManagerData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const displayOrders = apiOrders ?? orders.map((order) => ({
    id: order.id,
    type: order.type,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    tableNumber: order.tableNumber,
  }));

  const displayReservations = apiReservations ?? reservations.map((reservation) => ({
    id: reservation.id,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    name: reservation.clientName || reservation.name,
    status: reservation.status,
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
    clientEmail: reservation.clientEmail,
  }));

  const displayTables = apiTables ?? tables.map((table) => ({
    id: table.id,
    tableNumber: table.number,
    capacity: table.seats,
    isOccupied: table.status === 'occupied',
  }));

  const reservedTableNumbers = new Set(
    displayReservations
      .filter((reservation) => reservation.tableNumber && ['pending', 'confirmed'].includes(reservation.status.toLowerCase()))
      .map((reservation) => reservation.tableNumber!)
  );

  const occupiedTables = displayTables.filter((table) => table.isOccupied).length;
  const reservedTables = reservedTableNumbers.size;
  const freeTables = Math.max(0, displayTables.length - occupiedTables - reservedTables);
  const estimatedRevenue = displayOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = displayOrders.filter((order) => !['delivered', 'closed', 'cancelled'].includes(order.status)).length;

  const tableStats = [
    { label: t.common.occupied, value: occupiedTables, color: 'bg-red-500', text: 'text-red-300' },
    { label: t.common.reserved, value: reservedTables, color: 'bg-yellow-500', text: 'text-yellow-300' },
    { label: t.common.free, value: freeTables, color: 'bg-green-500', text: 'text-green-300' },
  ];

  return (
    <div className="min-h-screen bg-[#101820] pt-24 pb-16 text-white">
      <div className="container mx-auto max-w-7xl px-6">
        <header className="mb-8 flex flex-col gap-4 border-b border-blue-950/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-300">GastroFlow</p>
            <h1 className="text-4xl font-bold text-white">{t.manager.title}</h1>
            <p className="mt-2 text-gray-400">{t.manager.welcome}, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="secondary" className="px-6">
            <LogOut className="h-4 w-4" />
            {t.common.logout}
          </Button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-950/60 bg-[#182434] p-6 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-blue-300" />
              <span className="text-gray-400">{t.manager.totalOrdersCount}</span>
            </div>
            <p className="text-3xl font-bold">{displayOrders.length}</p>
            <p className="mt-2 text-sm text-blue-300">{t.manager.active}: {activeOrders}</p>
          </div>

          <div className="rounded-2xl border border-blue-950/60 bg-[#182434] p-6 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-cyan-300" />
              <span className="text-gray-400">{t.manager.totalReservationsCount}</span>
            </div>
            <p className="text-3xl font-bold">{displayReservations.length}</p>
            <p className="mt-2 text-sm text-cyan-300">{t.common.pending}: {displayReservations.filter((item) => item.status.toLowerCase() === 'pending').length}</p>
          </div>

          <div className="rounded-2xl border border-blue-950/60 bg-[#182434] p-6 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-300" />
              <span className="text-gray-400">{t.manager.estimatedRevenue}</span>
            </div>
            <p className="text-3xl font-bold">{estimatedRevenue} MDL</p>
            <p className="mt-2 text-sm text-green-300">{t.manager.revenue}</p>
          </div>

          <div className="rounded-2xl border border-blue-950/60 bg-[#182434] p-6 shadow-xl shadow-black/10">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-300" />
              <span className="text-gray-400">{t.manager.tableStatus}</span>
            </div>
            <p className="text-3xl font-bold">{displayTables.length}</p>
            <p className="mt-2 text-sm text-purple-300">{t.common.tables}</p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-blue-950/60 bg-[#182434] p-6">
          <h2 className="mb-5 text-2xl font-bold">{t.manager.quickActions}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Button onClick={() => scrollToSection('manager-orders')} className="h-12">
              <ClipboardList className="h-4 w-4" />
              {t.manager.viewOrders}
            </Button>
            <Button onClick={() => scrollToSection('manager-reservations')} variant="secondary" className="h-12">
              <Calendar className="h-4 w-4" />
              {t.manager.viewReservations}
            </Button>
            <Button onClick={() => scrollToSection('manager-tables')} variant="secondary" className="h-12">
              <Package className="h-4 w-4" />
              {t.manager.viewTables}
            </Button>
          </div>
        </section>

        <section id="manager-tables" className="mb-8 rounded-2xl border border-blue-950/60 bg-[#182434] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{t.manager.tableStatus}</h2>
              <p className="mt-1 text-sm text-gray-400">Table occupancy overview</p>
            </div>
            <TrendingUp className="h-6 w-6 text-blue-300" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tableStats.map((stat) => {
              const percentage = displayTables.length > 0 ? Math.round((stat.value / displayTables.length) * 100) : 0;
              return (
                <div key={stat.label} className="rounded-xl border border-gray-800 bg-[#111b27] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className={`font-bold ${stat.text}`}>{stat.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800">
                    <div className={`h-2 rounded-full ${stat.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="manager-orders" className="mb-8 rounded-2xl border border-blue-950/60 bg-[#182434]">
          <div className="border-b border-blue-950/60 px-6 py-5">
            <h2 className="text-2xl font-bold">{t.manager.recentOrders}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#111b27]">
                <tr>
                  <th className="p-4 text-left text-gray-400">{t.manager.orderId}</th>
                  <th className="p-4 text-left text-gray-400">{t.common.type}</th>
                  <th className="p-4 text-left text-gray-400">{t.common.status}</th>
                  <th className="p-4 text-left text-gray-400">{t.common.total}</th>
                  <th className="p-4 text-left text-gray-400">{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="border-t border-blue-950/40">
                    <td className="p-4 font-semibold">{order.id}</td>
                    <td className="p-4 capitalize text-gray-300">{order.type}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-200">
                        {t.order.statusLabels[order.status as keyof typeof t.order.statusLabels] ?? order.status}
                      </span>
                    </td>
                    <td className="p-4">{order.total} MDL</td>
                    <td className="p-4 text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {displayOrders.length === 0 && (
                  <tr>
                    <td className="p-8 text-center text-gray-400" colSpan={5}>{t.common.noData}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section id="manager-reservations" className="rounded-2xl border border-blue-950/60 bg-[#182434] p-6">
          <h2 className="mb-5 text-2xl font-bold">{t.manager.recentReservations}</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {displayReservations.slice(0, 6).map((reservation) => (
              <div key={reservation.id} className="rounded-xl border border-gray-800 bg-[#111b27] p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{reservation.name}</h3>
                    <p className="text-sm text-gray-400">{reservation.date} {t.account.at} {reservation.time}</p>
                  </div>
                  <span className="rounded-full bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-200">
                    {reservation.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>{t.common.guests}: {reservation.guests}</p>
                  <p>
                    {t.common.table}: {reservation.tableNumber ? `#${reservation.tableNumber}` : t.manager.unassigned}
                    {reservation.tableCapacity ? ` (${reservation.tableCapacity} ${t.common.seats})` : ''}
                  </p>
                  {reservation.clientEmail && <p>{t.common.email}: {reservation.clientEmail}</p>}
                </div>
              </div>
            ))}
            {displayReservations.length === 0 && (
              <div className="rounded-xl border border-gray-800 bg-[#111b27] p-8 text-center text-gray-400 lg:col-span-2">
                {t.manager.noReservations}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
