import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Plus, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { AdminBackButton } from '../components/AdminBackButton';
import { getReservations, type ApiReservation } from '../services/reservationService';
import { getOrders, updateOrderStatus as updateApiOrderStatus, type ApiOrder } from '../services/orderService';

interface DisplayReservation {
  id: string;
  reservationDate: string;
  guests: number;
  status: string;
  tableNumber?: number;
  tableCapacity?: number;
  clientName?: string;
  clientEmail?: string;
}

type DisplayOrderStatus = 'draft' | 'sent-to-kitchen' | 'preparing' | 'ready' | 'delivered' | 'closed' | 'cancelled';

interface DisplayOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DisplayOrder {
  id: string;
  localId?: string;
  apiId?: number;
  type: string;
  items: DisplayOrderItem[];
  total: number;
  status: DisplayOrderStatus;
  createdAt: string;
  tableNumber?: number;
  comment?: string;
  finalized?: boolean;
  isPaid?: boolean;
}

const RESERVATION_WINDOW_MS = 2 * 60 * 60 * 1000;

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toLocalDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return toDateInputValue(date);
}

function formatReservationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' });
}

function normalizeApiReservation(reservation: ApiReservation): DisplayReservation {
  return {
    id: String(reservation.id),
    reservationDate: reservation.reservationDate,
    guests: reservation.numberOfGuests,
    status: reservation.status,
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
    clientName: reservation.clientName,
    clientEmail: reservation.clientEmail,
  };
}

function normalizeOrderType(value: string) {
  return value.trim().toLowerCase().replace(/[-_\s]/g, '');
}

function isOpenDineInApiOrder(order: ApiOrder) {
  const status = normalizeApiStatus(order.status);
  return normalizeOrderType(order.orderType) === 'dinein'
    && !order.isPaid
    && status !== 'cancelled'
    && status !== 'closed';
}

function normalizeApiStatus(status: string): DisplayOrderStatus {
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

function normalizeApiOrderType(type: string) {
  const normalized = normalizeOrderType(type);
  if (normalized === 'dinein') return 'dine-in';
  if (normalized === 'takeaway') return 'takeaway';
  return 'delivery';
}

function normalizeApiDisplayOrder(order: ApiOrder): DisplayOrder {
  return {
    id: `API${order.id}`,
    apiId: order.id,
    type: normalizeApiOrderType(order.orderType),
    items: order.items.map((item) => ({
      id: String(item.id),
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
    })),
    total: order.totalAmount,
    status: normalizeApiStatus(order.status),
    createdAt: order.createdAt,
    tableNumber: order.tableNumber,
    isPaid: order.isPaid,
  };
}

export function WaiterDashboard() {
  const { user, logout, tables, reservations, updateTableStatus, orders, updateOrderStatus, t } = useApp();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());
  const [apiReservations, setApiReservations] = useState<DisplayReservation[]>([]);
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [reservationError, setReservationError] = useState('');
  const [orderActionError, setOrderActionError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const displayOrders = useMemo<DisplayOrder[]>(() => {
    const apiRows = apiOrders.map(normalizeApiDisplayOrder);
    const apiIds = new Set(apiRows.map((order) => order.apiId).filter((id): id is number => typeof id === 'number'));
    const localRows = orders
      .filter((order) => !order.apiId || !apiIds.has(order.apiId))
      .map((order) => ({
        id: order.id,
        localId: order.id,
        apiId: order.apiId,
        type: order.type,
        items: order.items.map((item) => ({
          id: String(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: order.total,
        status: normalizeApiStatus(order.status),
        createdAt: order.createdAt,
        tableNumber: order.tableNumber,
        comment: order.comment,
        finalized: order.finalized,
      }));

    return [...apiRows, ...localRows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [apiOrders, orders]);

  const currentOrders = displayOrders.filter((order) =>
    !order.finalized &&
    !order.isPaid &&
    order.status !== 'closed' &&
    order.status !== 'cancelled'
  );
  const recentHistoryOrders = displayOrders
    .filter((order) => order.finalized || order.isPaid || order.status === 'closed')
    .slice(0, 3);

  useEffect(() => {
    if (user?.role !== 'waiter' && user?.role !== 'admin') {
      return;
    }

    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [reservationRows, orderRows] = await Promise.all([
          getReservations(),
          getOrders(),
        ]);
        if (!isMounted) return;
        setApiReservations(reservationRows.map(normalizeApiReservation));
        setApiOrders(orderRows);
        setReservationError('');
      } catch {
        if (!isMounted) return;
        setApiReservations([]);
        setApiOrders([]);
        setReservationError(t.waiter.tableLoadFallback);
      }
    }

    loadDashboardData();
    const interval = window.setInterval(loadDashboardData, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [t.waiter.tableLoadFallback, user?.role]);

  const displayReservations = useMemo<DisplayReservation[]>(() => {
    const localRows = reservations.map((reservation) => ({
      id: reservation.id,
      reservationDate: new Date(`${reservation.date}T${reservation.time || '00:00'}:00`).toISOString(),
      guests: reservation.guests,
      status: reservation.status,
      tableNumber: reservation.tableNumber,
      tableCapacity: reservation.tableCapacity,
      clientName: reservation.clientName || reservation.name,
      clientEmail: reservation.clientEmail,
    }));

    const seen = new Set<string>();
    return [...apiReservations, ...localRows].filter((reservation) => {
      const key = `${reservation.id}-${reservation.tableNumber ?? 'no-table'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [apiReservations, reservations]);

  const selectedDateReservations = useMemo(() => {
    const now = Date.now();
    return displayReservations
      .filter((reservation) => {
        const status = reservation.status.toLowerCase();
        if (status !== 'pending' && status !== 'confirmed') return false;
        if (!reservation.tableNumber) return false;
        if (toLocalDateKey(reservation.reservationDate) !== selectedDate) return false;

        const reservationStart = new Date(reservation.reservationDate).getTime();
        if (Number.isNaN(reservationStart)) return false;
        return reservationStart + RESERVATION_WINDOW_MS >= now;
      })
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
  }, [displayReservations, selectedDate]);

  const getReservationForTable = (tableNumber: number) => (
    selectedDateReservations.find((reservation) => reservation.tableNumber === tableNumber)
  );

  const occupiedTableNumbers = useMemo(() => {
    const numbers = new Set<number>();
    orders
      .filter((order) => order.type === 'dine-in' && !order.finalized && order.tableNumber)
      .forEach((order) => numbers.add(order.tableNumber!));
    apiOrders
      .filter(isOpenDineInApiOrder)
      .forEach((order) => {
        if (order.tableNumber) {
          numbers.add(order.tableNumber);
        }
      });
    return numbers;
  }, [apiOrders, orders]);

  const tableStatusStyles = {
    free: {
      card: 'bg-green-900/30 border-green-600',
      label: 'text-green-400',
      text: 'FREE',
    },
    occupied: {
      card: 'bg-red-900/30 border-red-600',
      label: 'text-red-400',
      text: 'OCCUPIED',
    },
    reserved: {
      card: 'bg-yellow-900/30 border-yellow-600',
      label: 'text-yellow-400',
      text: 'RESERVED',
    },
  } as const;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const refreshOrders = async () => {
    const rows = await getOrders();
    setApiOrders(rows);
  };

  const handleSendToKitchen = async (order: DisplayOrder) => {
    setOrderActionError('');
    setBusyOrderId(order.id);

    try {
      if (order.apiId) {
        await updateApiOrderStatus(order.apiId, 'SentToKitchen');
        await refreshOrders();
      }
      if (order.localId) {
        updateOrderStatus(order.localId, 'sent-to-kitchen');
      }
    } catch (error) {
      setOrderActionError(error instanceof Error ? error.message : t.waiter.orderActionFallback);
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleMarkDelivered = async (order: DisplayOrder) => {
    setOrderActionError('');
    setBusyOrderId(order.id);

    try {
      if (order.apiId) {
        await updateApiOrderStatus(order.apiId, 'Delivered');
        await refreshOrders();
      }
      if (order.localId) {
        updateOrderStatus(order.localId, 'delivered');
      }
    } catch (error) {
      setOrderActionError(error instanceof Error ? error.message : t.waiter.orderActionFallback);
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t.waiter.title}</h1>
            <p className="text-gray-400">{t.waiter.welcome}, {user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminBackButton />
            <Button
              onClick={() => navigate('/dashboard/waiter/create-order')}
              className="px-6"
            >
              <Plus className="w-4 h-4" />
              {t.waiter.createNewOrder}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/waiter/bill')}
              variant="secondary"
              className="px-6"
            >
              <Receipt className="w-4 h-4" />
              {t.waiter.generateBill}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Management */}
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t.waiter.tableStatus}</h2>
                <p className="text-sm text-gray-400">{t.waiter.tableStatusHint}</p>
              </div>
              <label className="text-sm text-gray-400">
                {t.waiter.selectedDay}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-white outline-none focus:border-blue-500"
                />
              </label>
            </div>
            {reservationError && (
              <div className="mb-4 rounded-xl border border-yellow-900/50 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-200">
                {reservationError}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {tables.map(table => {
                const reservation = getReservationForTable(table.number);
                const activeOrder = currentOrders.find((order) => order.tableNumber === table.number);
                const effectiveStatus = table.status === 'occupied' || occupiedTableNumbers.has(table.number)
                  ? 'occupied'
                  : reservation
                    ? 'reserved'
                    : table.status;

                return (
                  <Button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table.id);
                      if (effectiveStatus === 'reserved') return;
                      updateTableStatus(table.id, effectiveStatus === 'free' ? 'occupied' : 'free');
                    }}
                    variant="outline"
                    className={`h-auto p-6 border-2 transition-all ${
                      tableStatusStyles[effectiveStatus].card
                    } ${selectedTable === table.id ? 'ring-4 ring-blue-600/30' : ''}`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white mb-1">#{table.number}</p>
                      <p className="text-sm text-gray-400">{table.seats} {t.common.seats}</p>
                      <p className={`text-xs mt-2 font-semibold ${tableStatusStyles[effectiveStatus].label}`}>
                        {effectiveStatus === 'occupied' ? t.common.occupied : effectiveStatus === 'reserved' ? t.common.reserved : t.common.free}
                      </p>
                      {effectiveStatus === 'reserved' && reservation && (
                        <p className="mt-2 text-xs text-yellow-100">
                          {formatReservationTime(reservation.reservationDate)} - {reservation.guests} {t.common.guests}
                        </p>
                      )}
                      {effectiveStatus === 'occupied' && activeOrder && (
                        <p className="mt-2 text-xs text-red-100">
                          {t.common.order} #{activeOrder.id} - {activeOrder.total} MDL
                        </p>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600"></div>
                <span className="text-sm text-gray-400">{t.common.free}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600"></div>
                <span className="text-sm text-gray-400">{t.common.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-600"></div>
                <span className="text-sm text-gray-400">{t.common.reserved}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.waiter.currentOrders}</h2>
            {orderActionError && (
              <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {orderActionError}
              </div>
            )}
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {currentOrders.map(order => (
                <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{t.common.order} #{order.id}</h3>
                      <p className="text-gray-400 text-sm capitalize">{order.type}</p>
                      {order.tableNumber && (
                        <p className="text-gray-400 text-sm">{t.common.table} #{order.tableNumber}</p>
                      )}
                    </div>
                    <span className="text-blue-400 font-bold text-lg">{order.total} MDL</span>
                  </div>

                  {/* Order Status */}
                  <div className="mb-4">
                    <div className={`w-full px-4 py-2 rounded-full border text-sm font-semibold ${
                      order.status === 'draft'
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : order.status === 'sent-to-kitchen'
                          ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                          : order.status === 'preparing'
                            ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                            : order.status === 'ready'
                              ? 'bg-green-900/30 border-green-700 text-green-300'
                              : 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                    }`}>
                      {order.status === 'draft' && t.waiter.orderCreatedNotSent}
                      {order.status === 'sent-to-kitchen' && t.common.sentToKitchen}
                      {order.status === 'preparing' && t.common.preparing}
                      {order.status === 'ready' && t.common.ready}
                      {order.status === 'delivered' && t.common.delivered}
                      {order.status === 'closed' && t.common.closed}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSendToKitchen(order)}
                      disabled={order.status !== 'draft' || busyOrderId === order.id}
                      variant={order.status === 'draft' ? 'default' : 'secondary'}
                      className={`w-full ${
                        order.status === 'draft'
                          ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {busyOrderId === order.id && order.status === 'draft' ? t.waiter.sending : order.status === 'draft' ? t.waiter.sendToKitchen : t.waiter.orderSent}
                    </Button>
                    <Button
                      onClick={() => handleMarkDelivered(order)}
                      disabled={order.status !== 'ready' || busyOrderId === order.id}
                      variant={order.status === 'ready' ? 'success' : 'secondary'}
                      className={`w-full ${
                        order.status === 'ready'
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {busyOrderId === order.id && order.status === 'ready' ? t.waiter.updating : order.status === 'delivered' ? t.common.delivered : t.waiter.markDelivered}
                    </Button>
                  </div>
                </div>
              ))}

              {currentOrders.length === 0 && (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">{t.waiter.noCurrentOrders}</p>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">{t.waiter.recentHistory}</h3>
              <div className="space-y-3">
                {recentHistoryOrders.map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-lg p-4 border border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-white">{t.common.order} #{order.id}</span>
                      <span className="text-gray-400 text-sm">{order.total} MDL</span>
                    </div>
                  </div>
                ))}
                {recentHistoryOrders.length === 0 && (
                  <div className="bg-[#242424] rounded-lg p-4 border border-gray-800 text-center">
                    <span className="text-gray-400 text-sm">{t.waiter.noRecentHistory}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
