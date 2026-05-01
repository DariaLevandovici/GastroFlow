import { useState } from 'react';
import { User, Users, Mail, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'client' | 'staff'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData.email, formData.password, loginType);
    
    if (loginType === 'client') {
      navigate('/dashboard/client');
    } else {
      // Redirect based on staff role
      if (formData.email.includes('waiter')) {
        navigate('/dashboard/waiter');
      } else if (formData.email.includes('cook')) {
        navigate('/dashboard/cook');
      } else {
        navigate('/dashboard/manager');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => setLoginType('client')}
            variant="outline"
            className={`h-auto p-6 border-2 flex flex-col items-center justify-center text-center ${
              loginType === 'client'
                ? 'bg-blue-900/30 border-blue-600'
                : 'bg-[#242424] border-gray-800'
            }`}
          >
            <User className={`w-10 h-10 mx-auto mb-3 ${loginType === 'client' ? 'text-blue-400' : 'text-gray-400'}`} />
            <h3 className="text-white font-bold">Client</h3>
          </Button>

          <Button
            onClick={() => setLoginType('staff')}
            variant="outline"
            className={`h-auto p-6 border-2 flex flex-col items-center justify-center text-center ${
              loginType === 'staff'
                ? 'bg-blue-900/30 border-blue-600'
                : 'bg-[#242424] border-gray-800'
            }`}
          >
            <Users className={`w-10 h-10 mx-auto mb-3 ${loginType === 'staff' ? 'text-blue-400' : 'text-gray-400'}`} />
            <h3 className="text-white font-bold">Staff</h3>
          </Button>
        </div>

        {/* Login Form */}
        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Email</span>
              </label>
              <Input
                type="email"
                required
                placeholder={loginType === 'staff' ? 'waiter@gastroflow.md / cook@gastroflow.md / manager@gastroflow.md' : 'your@email.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-500 space-y-1">
              {loginType === 'client' ? (
                <p>Client: client@demo.com / password</p>
              ) : (
                <>
                  <p>Waiter: waiter@gastroflow.md / pass</p>
                  <p>Cook: cook@gastroflow.md / pass</p>
                  <p>Manager: manager@gastroflow.md / pass</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 mb-3">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Register
            </button>
          </p>
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
