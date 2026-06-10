import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';
import { getReservations, type ApiReservation } from '../services/reservationService';
import { getOrders, updateOrderPayment, type ApiOrder } from '../services/orderService';
import { translateProductName } from '../data/translationHelpers';

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

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  orderId: string;
}

interface BillOrder {
  id: string;
  localId?: string;
  apiId?: number;
  tableNumber?: number;
  items: BillItem[];
  finalized?: boolean;
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
  const status = order.status.trim().toLowerCase().replace(/[-_\s]/g, '');
  return normalizeOrderType(order.orderType) === 'dinein'
    && !order.isPaid
    && status !== 'cancelled'
    && status !== 'canceled'
    && status !== 'closed'
    && status !== 'paid';
}

function normalizeApiBillOrder(order: ApiOrder): BillOrder {
  return {
    id: `API${order.id}`,
    apiId: order.id,
    tableNumber: order.tableNumber,
    items: order.items.map((item) => ({
      id: String(item.id),
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
      orderId: `API${order.id}`,
    })),
  };
}

export function WaiterBillPage() {
  const navigate = useNavigate();
  const { orders, tables, reservations, updateTableStatus, finalizeOrder, user, t } = useApp();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [splitCountInput, setSplitCountInput] = useState('2');
  const [apiReservations, setApiReservations] = useState<DisplayReservation[]>([]);
  const [apiOrders, setApiOrders] = useState<ApiOrder[]>([]);
  const [closeError, setCloseError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const billOrders = useMemo<BillOrder[]>(() => {
    const apiRows = apiOrders
      .filter(isOpenDineInApiOrder)
      .map(normalizeApiBillOrder);
    const apiIds = new Set(apiRows.map((order) => order.apiId).filter((id): id is number => typeof id === 'number'));
    const localRows = orders
      .filter((order) => order.type === 'dine-in' && !order.finalized && (!order.apiId || !apiIds.has(order.apiId)))
      .map((order) => ({
        id: order.id,
        localId: order.id,
        apiId: order.apiId,
        tableNumber: order.tableNumber,
        finalized: order.finalized,
        items: order.items.map((item) => ({
          id: String(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          orderId: order.id,
        })),
      }));

    return [...apiRows, ...localRows];
  }, [apiOrders, orders]);

  const selectedTableOrders = selectedTable
    ? billOrders.filter((order) => order.tableNumber === selectedTable)
    : [];

  const billItems = selectedTableOrders.flatMap(order => order.items);

  const totalBill = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = totalBill * 0.1;
  const grandTotal = totalBill + tax;

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
        if (isMounted) {
          setApiReservations(reservationRows.map(normalizeApiReservation));
          setApiOrders(orderRows);
        }
      } catch {
        if (isMounted) {
          setApiReservations([]);
          setApiOrders([]);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

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

  const todayReservations = useMemo(() => {
    const today = toDateInputValue();
    const now = Date.now();
    return displayReservations
      .filter((reservation) => {
        const status = reservation.status.toLowerCase();
        if (status !== 'pending' && status !== 'confirmed') return false;
        if (!reservation.tableNumber) return false;
        if (toLocalDateKey(reservation.reservationDate) !== today) return false;

        const reservationStart = new Date(reservation.reservationDate).getTime();
        if (Number.isNaN(reservationStart)) return false;
        return reservationStart + RESERVATION_WINDOW_MS >= now;
      })
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
  }, [displayReservations]);

  const tableOptions = tables.map((table) => {
    const reservation = todayReservations.find((item) => item.tableNumber === table.number);
    const hasOpenOrder = billOrders.some((order) => order.tableNumber === table.number);
    const status = table.status === 'occupied' || hasOpenOrder ? 'occupied' : reservation ? 'reserved' : table.status;
    return { ...table, status, reservation };
  });

  const selectedReservation = selectedTable
    ? todayReservations.find((reservation) => reservation.tableNumber === selectedTable)
    : undefined;

  const handlePrintBill = () => {
    window.print();
  };

  const handleGenerateBill = async () => {
    if (!selectedTable) {
      alert(t.bill.selectTableAlert);
      return;
    }
    if (billItems.length === 0) {
      alert(t.bill.noOrderItems);
      return;
    }

    setCloseError('');
    setIsClosing(true);

    try {
      const apiOrderIds = selectedTableOrders
        .map((order) => order.apiId)
        .filter((id): id is number => typeof id === 'number');

      await Promise.all(apiOrderIds.map((orderId) => updateOrderPayment(orderId, true)));

      selectedTableOrders.forEach((order) => {
        if (order.localId) {
          finalizeOrder(order.localId);
        }
      });
      alert(`${t.bill.billGenerated} ${selectedTable}\n${t.common.total}: ${grandTotal.toFixed(2)} MDL`);
      const relatedTable = tables.find((table) => table.number === selectedTable);
      if (relatedTable) {
        updateTableStatus(relatedTable.id, 'free');
      }
      setSelectedTable(null);
    } catch (error) {
      setCloseError(error instanceof Error ? error.message : t.bill.closeError);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/waiter')}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <h1 className="text-4xl font-bold text-white">{t.bill.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Selection */}
          <div className="lg:col-span-1">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">{t.bill.selectTable}</h3>
              <div className="grid grid-cols-3 gap-3">
                {tableOptions.filter(t => t.status === 'occupied' || t.status === 'reserved').map(table => (
                  <Button
                    key={table.id}
                    onClick={() => setSelectedTable(table.number)}
                    variant="outline"
                    className={`h-auto p-4 border-2 transition-all ${selectedTable === table.number
                      ? 'bg-blue-900/30 border-blue-600'
                      : table.status === 'reserved'
                        ? 'bg-yellow-900/30 border-yellow-700 hover:border-yellow-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                  >
                    <p className="text-white font-bold text-center text-lg">{table.number}</p>
                    <p className="text-gray-400 text-xs text-center mt-1">
                      {table.status === 'reserved' ? t.common.reserved : t.common.occupied}
                    </p>
                  </Button>
                ))}
              </div>

              {tableOptions.filter(t => t.status === 'occupied' || t.status === 'reserved').length === 0 && (
                <p className="text-gray-400 text-center py-4 text-sm">{t.bill.noOccupiedTables}</p>
              )}
            </div>
          </div>

          {/* Bill Details */}
          <div className="lg:col-span-2">
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
              {selectedTable ? (
                <>
                  {/* Bill Header */}
                  <div className="text-center mb-8 pb-6 border-b border-gray-700">
                    <h2 className="text-3xl font-bold text-white mb-2">GastroFlow</h2>
                    <p className="text-gray-400">{t.bill.restaurantBar}</p>
                    <p className="text-gray-500 text-sm mt-2">Str. Stefan cel Mare 123, Chisinau</p>
                  </div>

                  {/* Table Info */}
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-blue-400 font-bold text-lg">{t.common.table} {selectedTable}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {t.bill.server}: #{Math.floor(Math.random() * 10) + 1}
                      </p>
                    </div>
                  </div>

                  {selectedReservation && (
                    <div className="mb-6 rounded-xl border border-yellow-700 bg-yellow-900/20 p-4">
                      <p className="font-bold text-yellow-200">
                        {t.bill.reservedAt} {formatReservationTime(selectedReservation.reservationDate)}
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-yellow-100/90">
                        <p>{t.common.guests}: {selectedReservation.guests}</p>
                        {selectedReservation.clientName && <p>{t.bill.customer}: {selectedReservation.clientName}</p>}
                        {selectedReservation.clientEmail && <p>{t.common.email}: {selectedReservation.clientEmail}</p>}
                      </div>
                    </div>
                  )}

                  {closeError && (
                    <div className="mb-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                      {closeError}
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">{t.bill.items}</h3>
                    <div className="space-y-3">
                      {billItems.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">{t.bill.noOrdersForTable}</p>
                      ) : (
                        billItems.map((item) => (
                          <div key={`${item.orderId}-${item.id}`} className="flex justify-between py-3 border-b border-gray-700">
                            <div className="flex-1">
                              <p className="text-white font-semibold">{translateProductName(t, item.name)}</p>
                              <p className="text-gray-400 text-sm">{t.common.order} #{item.orderId}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-white">{item.quantity}x</p>
                              <p className="text-blue-400 font-bold">{item.price * item.quantity} MDL</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bill Summary */}
                  <div className="space-y-3 mb-8 pt-6 border-t border-gray-700">
                    <div className="flex justify-between text-gray-400">
                      <span>{t.common.subtotal}</span>
                      <span className="text-white">{totalBill.toFixed(2)} MDL</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>{t.common.tax}</span>
                      <span className="text-white">{tax.toFixed(2)} MDL</span>
                    </div>
                    <div className="h-px bg-gray-700" />
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-white">{t.common.total}</span>
                      <span className="text-blue-400">{grandTotal.toFixed(2)} MDL</span>
                    </div>
                  </div>

                  {/* Split Bill Section */}
                  {showSplit && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                      <h4 className="text-white font-bold mb-3">{t.bill.splitBill}</h4>
                      <div className="flex items-center gap-4 mb-3">
                        <p className="text-gray-400 text-sm">{t.bill.numberOfPeople}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSplitCountInput(String(Math.max(2, Number(splitCountInput) - 1)))}
                            className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600"
                          >
                            -
                          </button>
                          <span className="text-white font-bold w-6 text-center">{splitCountInput}</span>
                          <button
                            onClick={() => setSplitCountInput(String(Number(splitCountInput) + 1))}
                            className="w-8 h-8 bg-gray-700 text-white rounded-full hover:bg-gray-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">{t.bill.eachPays}</p>
                        <p className="text-blue-400 font-bold text-xl">
                          {(grandTotal / Math.max(1, Number(splitCountInput))).toFixed(2)} MDL
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => setShowSplit(!showSplit)}
                      variant="outline"
                      className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/30"
                    >
                      <Users className="w-4 h-4" />
                      {showSplit ? t.bill.hideSplitBill : t.bill.splitBill}
                    </Button>
                    <div className="flex gap-4">
                      <Button onClick={handlePrintBill} variant="secondary" className="flex-1">
                        <Printer className="w-4 h-4" />
                        {t.bill.printBill}
                      </Button>
                      <Button onClick={handleGenerateBill} className="flex-1" disabled={isClosing}>
                        <Download className="w-4 h-4" />
                        {isClosing ? t.bill.closing : t.bill.finalizeClose}
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-6">
                    {t.bill.thankYou}
                  </p>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">{t.bill.selectTablePrompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
