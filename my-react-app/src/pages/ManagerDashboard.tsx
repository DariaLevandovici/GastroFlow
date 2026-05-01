import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, TrendingUp, Package, Calendar, DollarSign, Users, AlertTriangle, Database } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { ProductsManager } from '../components/ProductsManager';
import { IngredientsManager } from '../components/IngredientsManager';

export function ManagerDashboard() {
  const { user, logout, orders, reservations, inventory, updateReservationStatus } = useApp();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'inventory' | 'reservations' | 'reports' | 'products'>('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  }).length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const pendingReservations = reservations.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
            <p className="text-gray-400">Welcome, {user?.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="px-6"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-gray-400">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalRevenue} MDL</p>
            <p className="text-sm text-green-400 mt-2">+12% this month</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-gray-400">Today's Orders</span>
            </div>
            <p className="text-3xl font-bold text-white">{todayOrders}</p>
            <p className="text-sm text-blue-400 mt-2">Active: {orders.filter(o => o.status !== 'delivered').length}</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <span className="text-gray-400">Reservations</span>
            </div>
            <p className="text-3xl font-bold text-white">{reservations.length}</p>
            <p className="text-sm text-purple-400 mt-2">Pending: {pendingReservations.length}</p>
          </div>

          <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <span className="text-gray-400">Low Stock</span>
            </div>
            <p className="text-3xl font-bold text-white">{lowStockItems.length}</p>
            <p className="text-sm text-yellow-400 mt-2">Items need restock</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'reservations', label: 'Reservations', icon: Calendar },
            { id: 'reports', label: 'Reports', icon: Users },
            { id: 'products', label: 'Products (DB)', icon: Database }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              variant={selectedTab === tab.id ? 'default' : 'secondary'}
              className={`flex items-center gap-2 px-6 whitespace-nowrap ${
                selectedTab === tab.id
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
            {/* Recent Orders */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
              <div className="bg-[#242424] rounded-2xl border border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-400">Order ID</th>
                      <th className="text-left p-4 text-gray-400">Type</th>
                      <th className="text-left p-4 text-gray-400">Status</th>
                      <th className="text-left p-4 text-gray-400">Total</th>
                      <th className="text-left p-4 text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-t border-gray-800">
                        <td className="p-4 text-white font-semibold">{order.id}</td>
                        <td className="p-4 text-gray-400 capitalize">{order.type}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                            order.status === 'ready' ? 'bg-blue-900/30 text-blue-400' :
                            order.status === 'in-preparation' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {order.status.replace('-', ' ')}
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
            <h2 className="text-2xl font-bold text-white mb-6">Inventory Management</h2>
            <p className="text-gray-400 text-sm mb-8">
              Manage ingredients stored in the SQL Server database via the ASP.NET Core API
              (<span className="text-blue-400 font-mono">http://localhost:5224/api/Ingredients</span>).
            </p>
            <IngredientsManager />
          </div>
        )}


        {selectedTab === 'reservations' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Reservation Management</h2>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-400">No reservations</p>
                </div>
              ) : (
                reservations.map(reservation => (
                  <div key={reservation.id} className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{reservation.name}</h3>
                        <div className="space-y-1 text-gray-400 text-sm">
                          <p>Date: {reservation.date} at {reservation.time}</p>
                          <p>Guests: {reservation.guests}</p>
                          <p>Phone: {reservation.phone}</p>
                          {reservation.specialRequest && (
                            <p className="text-blue-400">Note: {reservation.specialRequest}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              variant="success"
                              className="h-9 px-4 text-sm"
                            >
                              Confirm
                            </Button>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              variant="destructive"
                              className="h-9 px-4 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {reservation.status !== 'pending' && (
                          <span className={`px-4 py-2 rounded-full text-sm ${
                            reservation.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                            reservation.status === 'completed' ? 'bg-blue-900/30 text-blue-400' :
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
            <h2 className="text-2xl font-bold text-white mb-6">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Sales Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Orders:</span>
                    <span className="text-white font-bold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Revenue:</span>
                    <span className="text-white font-bold">{totalRevenue} MDL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Order:</span>
                    <span className="text-white font-bold">
                      {orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0} MDL
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Order Types</h3>
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
              Generate Full Report
            </Button>
          </div>
        )}

        {selectedTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Products Management</h2>
            <p className="text-gray-400 text-sm mb-8">
              Manage products stored in the SQL Server database via the ASP.NET Core API
              (<span className="text-blue-400 font-mono">http://localhost:5224/api/Products</span>).
            </p>
            <ProductsManager />
          </div>
        )}
      </div>
    </div>
  );
}
