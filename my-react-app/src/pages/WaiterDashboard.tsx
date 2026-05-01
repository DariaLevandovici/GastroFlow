import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Plus, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';

export function WaiterDashboard() {
  const { user, logout, tables, updateTableStatus, orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSendToKitchen = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Waiter Dashboard</h1>
            <p className="text-gray-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/dashboard/waiter/create-order')}
              className="px-6"
            >
              <Plus className="w-4 h-4" />
              Create New Order
            </Button>
            <Button
              onClick={() => navigate('/dashboard/waiter/bill')}
              variant="secondary"
              className="px-6"
            >
              <Receipt className="w-4 h-4" />
              Generate Bill
            </Button>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="px-6"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Management */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Table Status</h2>
            <div className="grid grid-cols-3 gap-4">
              {tables.map(table => (
                <Button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table.id);
                    updateTableStatus(table.id, table.status === 'free' ? 'occupied' : 'free');
                  }}
                  variant="outline"
                  className={`h-auto p-6 border-2 transition-all ${
                    table.status === 'occupied'
                      ? 'bg-red-900/30 border-red-600'
                      : 'bg-green-900/30 border-green-600'
                  } ${selectedTable === table.id ? 'ring-4 ring-blue-600/30' : ''}`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">#{table.number}</p>
                    <p className="text-sm text-gray-400">{table.seats} seats</p>
                    <p className={`text-xs mt-2 font-semibold ${
                      table.status === 'occupied' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {table.status.toUpperCase()}
                    </p>
                  </div>
                </Button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600"></div>
                <span className="text-sm text-gray-400">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600"></div>
                <span className="text-sm text-gray-400">Occupied</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Active Orders</h2>
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {orders.filter(o => o.status !== 'delivered').map(order => (
                <div key={order.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Order #{order.id}</h3>
                      <p className="text-gray-400 text-sm capitalize">{order.type}</p>
                      {order.tableNumber && (
                        <p className="text-gray-400 text-sm">Table #{order.tableNumber}</p>
                      )}
                    </div>
                    <span className="text-blue-400 font-bold text-lg">{order.total} MDL</span>
                  </div>

                  {/* Order Status */}
                  <div className="mb-4">
                    <div className={`w-full px-4 py-2 rounded-full border text-sm font-semibold ${
                      order.status === 'draft'
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : order.status === 'confirmed'
                          ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                          : order.status === 'in-preparation'
                            ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                            : order.status === 'ready'
                              ? 'bg-green-900/30 border-green-700 text-green-300'
                              : 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                    }`}>
                      {order.status === 'draft' && 'Created (Not Sent)'}
                      {order.status === 'confirmed' && 'Sent to Kitchen'}
                      {order.status === 'in-preparation' && 'In Preparation'}
                      {order.status === 'ready' && 'Ready'}
                      {order.status === 'delivered' && 'Delivered'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSendToKitchen(order.id)}
                      disabled={order.status !== 'draft'}
                      variant={order.status === 'draft' ? 'default' : 'secondary'}
                      className={`w-full ${
                        order.status === 'draft'
                          ? 'bg-blue-700 hover:bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {order.status === 'draft' ? 'Send to Kitchen' : 'Order Sent'}
                    </Button>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={order.status !== 'ready'}
                      variant={order.status === 'ready' ? 'success' : 'secondary'}
                      className={`w-full ${
                        order.status === 'ready'
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {order.status === 'delivered' ? 'Delivered' : 'Mark as Delivered'}
                    </Button>
                  </div>
                </div>
              ))}

              {orders.filter(o => o.status !== 'delivered').length === 0 && (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">No active orders</p>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Recent History</h3>
              <div className="space-y-3">
                {orders.filter(o => o.status === 'delivered').slice(0, 3).map(order => (
                  <div key={order.id} className="bg-[#242424] rounded-lg p-4 border border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Order #{order.id}</span>
                      <span className="text-gray-400 text-sm">{order.total} MDL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}