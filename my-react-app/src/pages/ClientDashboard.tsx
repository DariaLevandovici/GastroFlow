import { useApp } from '../context/AppContext';
import { Clock, Calendar, ShoppingBag, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { AdminBackButton } from '../components/AdminBackButton';

export function ClientDashboard() {
  const { user, orders, reservations, logout, t } = useApp();
  const navigate = useNavigate();
  const clientOrders = orders.filter(order => {
    if (order.origin !== 'client') return false;
    if (!user) return true;
    return !order.createdByUserId || order.createdByUserId === user.id;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeOrders = clientOrders.filter(o => o.status !== 'delivered');
  const pastOrders = clientOrders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t.clientDashboard.welcome}, {user?.name}</h1>
            <p className="text-gray-400">{t.clientDashboard.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminBackButton />
            <Button onClick={handleLogout} variant="secondary" className="px-6">
              <LogOut className="w-4 h-4" />
              {t.common.logout}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            className="h-auto bg-[#242424] hover:bg-[#2a2a2a] p-6 border-gray-800 transition-all text-left flex-col items-start"
          >
            <ShoppingBag className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">{t.clientDashboard.orderFood}</h3>
            <p className="text-gray-400 text-sm">{t.clientDashboard.orderFoodDescription}</p>
          </Button>

          <Button
            onClick={() => navigate('/reservation')}
            variant="outline"
            className="h-auto bg-[#242424] hover:bg-[#2a2a2a] p-6 border-gray-800 transition-all text-left flex-col items-start"
          >
            <Calendar className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">{t.clientDashboard.reserveTable}</h3>
            <p className="text-gray-400 text-sm">{t.clientDashboard.reserveTableDescription}</p>
          </Button>

          <Button
            onClick={() => navigate('/order')}
            variant="outline"
            className="h-auto bg-[#242424] hover:bg-[#2a2a2a] p-6 border-gray-800 transition-all text-left flex-col items-start"
          >
            <Clock className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">{t.clientDashboard.trackOrders}</h3>
            <p className="text-gray-400 text-sm">{t.clientDashboard.trackOrdersDescription}</p>
          </Button>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">{t.clientDashboard.activeOrders}</h2>
          {activeOrders.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-gray-400">{t.clientDashboard.noActiveOrders}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{t.common.order} #{order.id}</h3>
                      <p className="text-gray-400 text-sm capitalize">{order.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold text-lg">{order.total} MDL</p>
                      <p className="text-sm text-gray-400 capitalize mt-1">
                        {t.order.statusLabels[order.status] ?? order.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      order.status === 'confirmed' ? 'bg-yellow-900/30 text-yellow-400' :
                      order.status === 'in-preparation' ? 'bg-blue-900/30 text-blue-400' :
                      order.status === 'ready' ? 'bg-green-900/30 text-green-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {order.status === 'confirmed' && t.order.statusLabels.confirmed}
                      {order.status === 'in-preparation' && t.order.statusLabels['in-preparation']}
                      {order.status === 'ready' && t.clientDashboard.readyForPickup}
                      {order.status !== 'confirmed' && order.status !== 'in-preparation' && order.status !== 'ready' && t.order.statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">{t.common.reservations}</h2>
          {reservations.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-gray-400">{t.account.noReservations}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservations.map(reservation => (
                <div key={reservation.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{t.clientDashboard.tableReservation}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      reservation.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                      reservation.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-400 text-sm">
                    <p>
                      <span className="text-white">{t.common.table}:</span>{' '}
                      {reservation.tableNumber ? `#${reservation.tableNumber}` : t.clientDashboard.toBeAssigned}
                      {reservation.tableCapacity ? ` (${reservation.tableCapacity} ${t.common.seats})` : ''}
                    </p>
                    <p><span className="text-white">{t.common.date}:</span> {reservation.date}</p>
                    <p><span className="text-white">{t.common.time}:</span> {reservation.time}</p>
                    <p><span className="text-white">{t.common.guests}:</span> {reservation.guests}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{t.clientDashboard.orderHistory}</h2>
          {pastOrders.length === 0 ? (
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-gray-400">{t.clientDashboard.noPastOrders}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastOrders.map(order => (
                <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{t.common.order} #{order.id}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{order.total} MDL</p>
                      <p className="text-green-400 text-sm">{t.common.delivered}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
