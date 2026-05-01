import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, TrendingUp, Package, Calendar, DollarSign, Users, AlertTriangle, Database } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
<<<<<<< HEAD
import { Input } from '../ui/input';

const mockStaffAccounts = [
  { id: 1, name: 'Andrei Popa', role: 'Waiter' },
  { id: 2, name: 'Elena Rusu', role: 'Cook' },
  { id: 3, name: 'Mihai Ceban', role: 'Waiter' },
];
=======
import { ProductsManager } from '../components/ProductsManager';
import { IngredientsManager } from '../components/IngredientsManager';
>>>>>>> main

export function ManagerDashboard() {
  const { user, logout, orders, reservations, inventory, updateReservationStatus } = useApp();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [selectedTab, setSelectedTab] = useState<'overview' | 'inventory' | 'reservations' | 'reports'>('overview');
  const [localInventoryItems, setLocalInventoryItems] = useState(inventory);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    quantity: '',
    unit: '',
    minStock: '',
  });
=======
  const [selectedTab, setSelectedTab] = useState<'overview' | 'inventory' | 'reservations' | 'reports' | 'products'>('overview');
>>>>>>> main

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = newItemForm.name.trim();
    const trimmedUnit = newItemForm.unit.trim();
    const quantity = Number(newItemForm.quantity);
    const minStock = Number(newItemForm.minStock);

    if (!trimmedName || !trimmedUnit || Number.isNaN(quantity) || Number.isNaN(minStock)) {
      return;
    }

    const nextItemNumber = localInventoryItems.length + 1;
    setLocalInventoryItems((prev) => [
      ...prev,
      {
        id: `INV${String(nextItemNumber).padStart(3, '0')}`,
        name: trimmedName,
        quantity,
        unit: trimmedUnit,
        minStock,
      },
    ]);
    setNewItemForm({
      name: '',
      quantity: '',
      unit: '',
      minStock: '',
    });
  };

  const handleLocalInventoryChange = (id: string, quantity: number) => {
    setLocalInventoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    if (inventory.some((item) => item.id === id)) {
      updateInventory(id, quantity);
    }
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
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">Create Staff Account</h2>
              <p className="text-gray-400 mb-6">Open the dedicated page to create and manage staff accounts.</p>
              <Button
                onClick={() => navigate('/dashboard/manager/staff-accounts')}
                className="w-full md:w-auto px-6"
              >
                Create Staff Account
              </Button>
            </div>

            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">Staff Accounts</h2>
              <p className="text-gray-400 mb-6">Current mock staff members in the system.</p>

              <div className="space-y-3">
                {mockStaffAccounts.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1f1f1f] px-4 py-4"
                  >
                    <span className="font-semibold text-white">{staff.name}</span>
                    <span className="text-sm text-blue-400">{staff.role}</span>
                  </div>
                ))}
              </div>
            </div>

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
<<<<<<< HEAD
          <form onSubmit={handleAddItemSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
              <Button type="submit" className="px-6">
                Add Item
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-800 bg-[#242424] p-6 md:grid-cols-2 xl:grid-cols-4">
              <Input
                type="text"
                placeholder="Item name"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                min="0"
                placeholder="Quantity"
                value={newItemForm.quantity}
                onChange={(e) => setNewItemForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
              <Input
                type="text"
                placeholder="Unit"
                value={newItemForm.unit}
                onChange={(e) => setNewItemForm((prev) => ({ ...prev, unit: e.target.value }))}
              />
              <Input
                type="number"
                min="0"
                placeholder="Min stock"
                value={newItemForm.minStock}
                onChange={(e) => setNewItemForm((prev) => ({ ...prev, minStock: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localInventoryItems.map(item => {
                const isLowStock = item.quantity <= item.minStock;
                return (
                  <div
                    key={item.id}
                    className={`bg-[#242424] rounded-2xl p-6 border-2 ${
                      isLowStock ? 'border-yellow-600' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      {isLowStock && (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Stock:</span>
                        <span className={`font-bold ${isLowStock ? 'text-yellow-400' : 'text-white'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Stock:</span>
                        <span className="text-gray-400">{item.minStock} {item.unit}</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          type="button"
                          onClick={() => handleLocalInventoryChange(item.id, item.quantity - 5)}
                          variant="destructive"
                          className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 h-9"
                        >
                          -5
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleLocalInventoryChange(item.id, item.quantity + 10)}
                          variant="success"
                          className="flex-1 h-9"
                        >
                          +10
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
=======
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Inventory Management</h2>
            <p className="text-gray-400 text-sm mb-8">
              Manage ingredients stored in the SQL Server database via the ASP.NET Core API
              (<span className="text-blue-400 font-mono">http://localhost:5224/api/Ingredients</span>).
            </p>
            <IngredientsManager />
          </div>
>>>>>>> main
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
