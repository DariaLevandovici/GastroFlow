import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function AccountPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  
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
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
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
                  variant="default"
                  className="w-full justify-start px-4 bg-blue-900/30 text-white"
                >
                  Personal Info
                </Button>
                {user.role === 'client' && (
                  <>
                    <Button
                      onClick={() => navigate('/dashboard/client')}
                      variant="ghost"
                      className="w-full justify-start px-4 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate('/order')}
                      variant="ghost"
                      className="w-full justify-start px-4 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      My Orders
                    </Button>
                    <Button
                      onClick={() => navigate('/reservation')}
                      variant="ghost"
                      className="w-full justify-start px-4 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Reservations
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full mt-6 bg-red-900/30 hover:bg-red-900/50 text-red-400"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <span>Full Name</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span>Email</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <span>Phone Number</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Address */}
                {user.role === 'client' && (
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span>Address</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                )}

                <div className="h-px bg-gray-700 my-8" />

                {/* Change Password */}
                <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>

                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <span>Current Password</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <span>New Password</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white mb-3">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <span>Confirm New Password</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
