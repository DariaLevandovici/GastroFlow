import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export function Header() {
  const navigate = useNavigate();
  const { cart, user, logout, searchQuery, setSearchQuery } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Button onClick={() => navigate('/')} variant="ghost" className="h-auto px-0 py-0 hover:bg-transparent">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <h1 className="text-2xl font-bold text-white">GastroFlow</h1>
            </Button>
            
            {/* Cart */}
            <Button 
              onClick={() => navigate('/cart')}
              variant="ghost"
              size="icon"
              className="relative rounded-xl"
            >
              <ShoppingCart className="w-6 h-6 text-gray-300" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>

          {/* Central Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/reservation')}>
              Reservation
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/order')}>
              Order
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/menu')}>
              Meniu
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/career')}>
              Career
            </Button>
            {user && user.role === 'client' && (
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300 px-2" onClick={() => navigate('/dashboard/client')}>
                Dashboard
              </Button>
            )}
          </nav>

          {/* Right Side - Search & Login */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 w-64">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>

            {/* User Menu or Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('/account')}
                  variant="secondary"
                  className="h-10"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.name}</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-10 px-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="h-10 px-6"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
