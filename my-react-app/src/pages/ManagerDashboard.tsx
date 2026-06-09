import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, TrendingUp, Package, Calendar, DollarSign, Users, AlertTriangle, Database } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { ProductsManager } from '../components/ProductsManager';
import { IngredientsManager } from '../components/IngredientsManager';
import { AdminBackButton } from '../components/AdminBackButton';
import { getReservations, type ApiReservation } from '../services/reservationService';

type ManagerTab = 'overview' | 'inventory' | 'reservations' | 'reports' | 'products';

interface ManagerNavigationState {
  adminTab?: ManagerTab;
}

interface DisplayReservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone?: string;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  tableNumber?: number;
  tableCapacity?: number;
  clientEmail?: string;
  source: 'api' | 'local';
}

function formatDatePart(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ro-MD');
}

function formatTimePart(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' });
}

function normalizeReservationStatus(status?: string): DisplayReservation['status'] {
  const normalized = (status || 'pending').toLowerCase();
  if (normalized === 'confirmed') return 'confirmed';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'cancelled';
  return 'pending';
}

function normalizeApiReservation(reservation: ApiReservation): DisplayReservation {
  return {
    id: String(reservation.id),
    date: formatDatePart(reservation.reservationDate),
    time: formatTimePart(reservation.reservationDate),
    guests: reservation.numberOfGuests,
    name: reservation.clientName || 'Customer',
    specialRequest: reservation.specialRequests,
    status: normalizeReservationStatus(reservation.status),
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
    clientEmail: reservation.clientEmail,
    source: 'api',
  };
}

export function ManagerDashboard() {
  const { user, logout, orders, reservations, inventory, updateReservationStatus, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as ManagerNavigationState | null;
  const [selectedTab, setSelectedTab] = useState<ManagerTab>(navigationState?.adminTab ?? 'overview');
  const [apiReservations, setApiReservations] = useState<DisplayReservation[] | null>(null);

  useEffect(() => {
    if (navigationState?.adminTab) {
      setSelectedTab(navigationState.adminTab);
    }
  }, [navigationState?.adminTab]);

  useEffect(() => {
    let isMounted = true;

    async function loadReservations() {
      try {
        const rows = await getReservations();
        if (isMounted) {
          setApiReservations(rows.map(normalizeApiReservation));
        }
      } catch {
        if (isMounted) {
          setApiReservations(null);
        }
      }
    }

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  }).length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const normalizedReservations = apiReservations ?? reservations.map((reservation) => ({
    id: reservation.id,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    name: reservation.clientName || reservation.name,
    phone: reservation.phone,
    specialRequest: reservation.specialRequest,
    status: reservation.status,
    tableNumber: reservation.tableNumber,
    tableCapacity: reservation.tableCapacity,
    clientEmail: reservation.clientEmail,
    source: 'local' as const,
  }));
  const pendingReservations = normalizedReservations.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t.manager.title}</h1>
            <p className="text-gray-400">{t.manager.welcome}, {user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminBackButton />
            <Button onClick={handleLogout} variant="secondary" className="px-6">
              <LogOut className="w-4 h-4" />
              {t.common.logout}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-gray-400">{t.manager.revenue}</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalRevenue} MDL</p>
            <p className="text-sm text-green-400 mt-2">{t.manager.thisMonth}</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-gray-400">{t.manager.todaysOrders}</span>
            </div>
            <p className="text-3xl font-bold text-white">{todayOrders}</p>
            <p className="text-sm text-blue-400 mt-2">{t.manager.active}: {orders.filter(o => o.status !== 'delivered').length}</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <span className="text-gray-400">{t.manager.reservations}</span>
            </div>
            <p className="text-3xl font-bold text-white">{normalizedReservations.length}</p>
            <p className="text-sm text-purple-400 mt-2">{t.common.pending}: {pendingReservations.length}</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <span className="text-gray-400">{t.manager.lowStock}</span>
            </div>
            <p className="text-3xl font-bold text-white">{lowStockItems.length}</p>
            <p className="text-sm text-yellow-400 mt-2">{t.manager.itemsNeedRestock}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: t.manager.overview, icon: TrendingUp },
            { id: 'inventory', label: t.manager.inventory, icon: Package },
            { id: 'reservations', label: t.manager.reservations, icon: Calendar },
            { id: 'reports', label: t.manager.reports, icon: Users },
            { id: 'products', label: t.manager.products, icon: Database }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              variant={selectedTab === tab.id ? 'default' : 'secondary'}
              className={`flex items-center gap-2 px-6 whitespace-nowrap ${selectedTab === tab.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-[#242424] text-gray-400 hover:bg-gray-800'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">{t.manager.createStaffAccount}</h2>
              <p className="text-gray-400 mb-6">{t.manager.createStaffDescription}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/dashboard/manager/staff-accounts')}
                  className="px-6"
                >
                  {t.manager.createStaffAccount}
                </Button>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{t.manager.recentOrders}</h2>
              <div className="bg-[#242424] rounded-2xl border border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-400">{t.manager.orderId}</th>
                      <th className="text-left p-4 text-gray-400">{t.common.type}</th>
                      <th className="text-left p-4 text-gray-400">{t.common.status}</th>
                      <th className="text-left p-4 text-gray-400">{t.common.total}</th>
                      <th className="text-left p-4 text-gray-400">{t.common.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-t border-gray-800">
                        <td className="p-4 text-white font-semibold">{order.id}</td>
                        <td className="p-4 text-gray-400 capitalize">{order.type}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                              order.status === 'ready' ? 'bg-blue-900/30 text-blue-400' :
                                order.status === 'in-preparation' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-gray-800 text-gray-400'
                            }`}>
                            {t.order.statusLabels[order.status] ?? order.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-white">{order.total} MDL</td>
                        <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.manager.inventoryManagement}</h2>
            <IngredientsManager />
          </div>
        )}

        {selectedTab === 'reservations' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.manager.reservationManagement}</h2>
            <div className="space-y-4">
              {normalizedReservations.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">{t.manager.noReservations}</p>
                </div>
              ) : (
                normalizedReservations.map(reservation => (
                  <div key={reservation.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{reservation.name}</h3>
                        <div className="space-y-1 text-gray-400 text-sm">
                          <p>
                            {t.common.table}: <span className="text-white">
                              {reservation.tableNumber ? `#${reservation.tableNumber}` : t.manager.unassigned}
                            </span>
                            {reservation.tableCapacity ? ` (${reservation.tableCapacity} ${t.common.seats})` : ''}
                          </p>
                          <p>{t.common.date}: {reservation.date} {t.account.at} {reservation.time}</p>
                          <p>{t.common.guests}: {reservation.guests}</p>
                          {reservation.phone && <p>{t.common.phone}: {reservation.phone}</p>}
                          {reservation.clientEmail && <p>{t.common.email}: {reservation.clientEmail}</p>}
                          {reservation.specialRequest && (
                            <p className="text-blue-400">{t.manager.note}: {reservation.specialRequest}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {reservation.status === 'pending' && reservation.source === 'local' && (
                          <>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              variant="success"
                              className="h-9 px-4 text-sm"
                            >
                              {t.manager.confirm}
                            </Button>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              variant="destructive"
                              className="h-9 px-4 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400"
                            >
                              {t.common.cancel}
                            </Button>
                          </>
                        )}
                        {(reservation.status !== 'pending' || reservation.source === 'api') && (
                          <span className={`px-4 py-2 rounded-full text-sm ${reservation.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                              reservation.status === 'completed' ? 'bg-blue-900/30 text-blue-400' :
                                reservation.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                                'bg-red-900/30 text-red-400'
                            }`}>
                            {reservation.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.manager.reportsAnalytics}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">{t.manager.salesSummary}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.manager.totalOrders}</span>
                    <span className="text-white font-bold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.manager.totalRevenue}</span>
                    <span className="text-white font-bold">{totalRevenue} MDL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t.manager.averageOrder}</span>
                    <span className="text-white font-bold">
                      {orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0} MDL
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">{t.manager.orderTypes}</h3>
                <div className="space-y-3">
                  {['delivery', 'takeaway', 'dine-in'].map(type => {
                    const count = orders.filter(o => o.type === type).length;
                    const percentage = orders.length > 0 ? ((count / orders.length) * 100).toFixed(0) : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 capitalize">{type}</span>
                          <span className="text-white">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button className="mt-6 w-full h-12">
              {t.manager.generateReport}
            </Button>
          </div>
        )}

        {selectedTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t.manager.productsManagement}</h2>
            <ProductsManager />
          </div>
        )}
      </div>
    </div>
  );
}
