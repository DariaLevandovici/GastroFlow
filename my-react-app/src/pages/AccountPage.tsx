import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, ShoppingBag, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { translateProductName } from '../data/translationHelpers';

type Section = 'personal' | 'orders' | 'reservations';

export function AccountPage() {
  const { user, logout, orders, t } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('personal');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+373 XXX XXX XX',
    address: 'Str. Stefan cel Mare 123, Chisinau',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t.account.profileUpdated);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const myOrders = orders;

  const myReservations = [
    { id: '1', date: '2026-05-10', time: '19:00', guests: 2, status: 'confirmed', table: 3 },
    { id: '2', date: '2026-04-20', time: '20:00', guests: 4, status: 'completed', table: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">{t.account.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#242424] rounded-2xl p-6 border border-gray-800">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                <p className="text-gray-400 text-sm capitalize">{user.role}</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setActiveSection('personal')}
                  variant="default"
                  className={`w-full justify-start px-4 ${activeSection === 'personal' ? 'bg-blue-900/50 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <User className="w-4 h-4 mr-2" />
                  {t.account.personalInfo}
                </Button>
                {user.role === 'client' && (
                  <>
                    <Button
                      onClick={() => navigate('/dashboard/client')}
                      variant="ghost"
                      className="w-full justify-start px-4 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      {t.account.dashboard}
                    </Button>
                    <Button
                      onClick={() => setActiveSection('orders')}
                      variant="ghost"
                      className={`w-full justify-start px-4 ${activeSection === 'orders' ? 'bg-blue-900/30 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {t.account.myOrders}
                    </Button>
                    <Button
                      onClick={() => setActiveSection('reservations')}
                      variant="ghost"
                      className={`w-full justify-start px-4 ${activeSection === 'reservations' ? 'bg-blue-900/30 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {t.account.reservations}
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full mt-6 bg-red-900/30 hover:bg-red-900/50 text-red-400"
              >
                {t.account.logout}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeSection === 'personal' && (
              <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">{t.account.personalInfoTitle}</h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <User className="w-5 h-5 text-blue-400" />
                      <span>{t.account.fullName}</span>
                    </label>
                    <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span>{t.account.email}</span>
                    </label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <Phone className="w-5 h-5 text-blue-400" />
                      <span>{t.account.phoneNumber}</span>
                    </label>
                    <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  {user.role === 'client' && (
                    <div>
                      <label className="flex items-center gap-2 text-white mb-3">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span>{t.account.address}</span>
                      </label>
                      <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                  )}
                  <div className="h-px bg-gray-700 my-8" />
                  <h3 className="text-xl font-bold text-white mb-4">{t.account.changePassword}</h3>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <Lock className="w-5 h-5 text-blue-400" />
                      <span>{t.account.currentPassword}</span>
                    </label>
                    <Input type="password" placeholder="********" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <Lock className="w-5 h-5 text-blue-400" />
                      <span>{t.account.newPassword}</span>
                    </label>
                    <Input type="password" placeholder="********" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <Lock className="w-5 h-5 text-blue-400" />
                      <span>{t.account.confirmNewPassword}</span>
                    </label>
                    <Input type="password" placeholder="********" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full h-12 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    {t.account.saveChanges}
                  </Button>
                </form>
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">{t.account.ordersTitle}</h2>
                {myOrders.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">{t.account.noOrders}</p>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-bold">{t.common.order} #{order.id.slice(0, 8)}</p>
                            <p className="text-gray-400 text-sm capitalize">{order.type}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'delivered' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                            {t.order.statusLabels[order.status] ?? order.status}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-gray-400 text-sm">
                              {item.quantity}x {translateProductName(t, item.name)} - {(item.price * item.quantity).toFixed(2)} MDL
                            </p>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-sm">{t.account.total}</p>
                          <p className="text-blue-400 font-bold">{order.total.toFixed(2)} MDL</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'reservations' && (
              <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">{t.account.reservationsTitle}</h2>
                {myReservations.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">{t.account.noReservations}</p>
                ) : (
                  <div className="space-y-4">
                    {myReservations.map((res) => (
                      <div key={res.id} className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-bold">{t.account.table} {res.table}</p>
                            <p className="text-gray-400 text-sm">{res.date} {t.account.at} {res.time}</p>
                            <p className="text-gray-400 text-sm">{res.guests} {t.account.guests}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${res.status === 'confirmed' ? 'bg-green-900/50 text-green-400' : res.status === 'completed' ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'}`}>
                            {res.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
