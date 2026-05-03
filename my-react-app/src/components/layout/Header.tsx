import { useState } from 'react';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export function Header() {
  const [language, setLanguage] = useState<'RO' | 'EN'>('RO');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cart, user, logout, searchQuery, setSearchQuery } = useApp();
  const labels = language === 'RO'
    ? {
        reservation: 'Rezervare',
        order: 'Comandă',
        menu: 'Meniu',
        career: 'Cariere',
        login: 'Autentificare',
        logout: 'Deconectare',
      }
    : {
        reservation: 'Reservation',
        order: 'Order',
        menu: 'Meniu',
        career: 'Career',
        login: 'Login',
        logout: 'Logout',
      };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-8">
            <Button onClick={() => navigate('/')} variant="ghost" className="h-auto min-w-0 px-0 py-0 hover:bg-transparent">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">GastroFlow</h1>
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
              {labels.reservation}
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/order')}>
              {labels.order}
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/menu')}>
              {labels.menu}
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white px-2" onClick={() => navigate('/career')}>
              {labels.career}
            </Button>
            {user && user.role === 'client' && pathname !== '/' && (
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300 px-2" onClick={() => navigate('/dashboard/client')}>
                Dashboard
              </Button>
            )}
          </nav>

          {/* Right Side - Search & Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex h-10 w-14 flex-shrink-0 items-center justify-center px-0 text-center text-xs font-semibold leading-none tracking-wide text-gray-300"
              onClick={() => setLanguage((current) => (current === 'RO' ? 'EN' : 'RO'))}
            >
              {language}
            </Button>

            {/* Search Bar */}
            <div className="hidden w-72 flex-shrink-0 items-center gap-2 md:flex">
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
                  className="h-10 px-3 sm:px-4"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden text-sm sm:inline">{user.name}</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center px-0 sm:min-w-[150px] sm:px-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{labels.logout}</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center px-0 sm:min-w-[150px] sm:px-6"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{labels.login}</span>
              </Button>
            )}
          </div>

          <div className="flex w-full items-center gap-2 rounded-xl border border-gray-700 bg-[#242424] px-4 py-2 md:hidden">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <Input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
