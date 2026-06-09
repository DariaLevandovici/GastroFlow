import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock, Mail, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { loginWithApi } from '../services/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const demoStaffEmails = new Set([
  'admin@gastroflow.md',
  'waiter@gastroflow.md',
  'cook@gastroflow.md',
  'bucatar@gastroflow.md',
  'manager@gastroflow.md',
]);

function normalizeRole(role: string) {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole === 'admin') return 'admin';
  if (normalizedRole === 'manager') return 'manager';
  if (normalizedRole === 'waiter') return 'waiter';
  if (normalizedRole === 'chef' || normalizedRole === 'cook') return 'cook';
  return 'client';
}

function dashboardPathForRole(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'waiter') return '/dashboard/waiter';
  if (role === 'cook') return '/dashboard/cook';
  if (role === 'manager') return '/dashboard/manager';
  return '/menu';
}

export function LoginPage() {
  const { login, setAuthenticatedUser, t } = useApp();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'client' | 'staff'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearMessages = () => {
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleLoginTypeChange = (nextType: 'client' | 'staff') => {
    setLoginType(nextType);
    clearMessages();
  };

  const tryDemoStaffLogin = () => {
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!demoStaffEmails.has(normalizedEmail) || formData.password !== '123456') {
      return null;
    }

    localStorage.removeItem('token');
    return login(normalizedEmail, formData.password, 'staff');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    const email = formData.email.trim().toLowerCase();

    try {
      if (loginType === 'staff' && email === 'manager@gastroflow.md') {
        const demoUser = tryDemoStaffLogin();
        if (!demoUser) {
          throw new Error('invalid-demo-staff');
        }

        navigate(dashboardPathForRole(demoUser.role));
        return;
      }

      const response = await loginWithApi(email, formData.password);
      const responseRole = normalizeRole(response.role);

      if (loginType === 'staff' && responseRole === 'client') {
        localStorage.removeItem('token');
        setErrorMessage(t.login.clientAccountError);
        return;
      }

      if (loginType === 'client' && responseRole !== 'client') {
        localStorage.removeItem('token');
        setErrorMessage(t.login.staffAccountError);
        return;
      }

      localStorage.setItem('token', response.token);
      const signedInUser = setAuthenticatedUser({
        email,
        role: response.role,
        firstName: response.firstName,
        lastName: response.lastName
      });

      navigate(dashboardPathForRole(signedInUser.role));
    } catch {
      if (loginType === 'staff') {
        const demoUser = tryDemoStaffLogin();
        if (demoUser) {
          navigate(dashboardPathForRole(demoUser.role));
          return;
        }
      }

      localStorage.removeItem('token');
      setErrorMessage(t.login.invalidCredentials);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t.login.title}</h1>
          <p className="text-gray-400">{t.login.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            type="button"
            onClick={() => handleLoginTypeChange('client')}
            variant="outline"
            className={`h-auto p-6 border-2 flex flex-col items-center justify-center text-center ${
              loginType === 'client'
                ? 'bg-blue-900/30 border-blue-600'
                : 'bg-[#242424] border-gray-800'
            }`}
          >
            <User className={`w-10 h-10 mx-auto mb-3 ${loginType === 'client' ? 'text-blue-400' : 'text-gray-400'}`} />
            <h3 className="text-white font-bold">{t.login.client}</h3>
          </Button>

          <Button
            type="button"
            onClick={() => handleLoginTypeChange('staff')}
            variant="outline"
            className={`h-auto p-6 border-2 flex flex-col items-center justify-center text-center ${
              loginType === 'staff'
                ? 'bg-blue-900/30 border-blue-600'
                : 'bg-[#242424] border-gray-800'
            }`}
          >
            <Users className={`w-10 h-10 mx-auto mb-3 ${loginType === 'staff' ? 'text-blue-400' : 'text-gray-400'}`} />
            <h3 className="text-white font-bold">{t.login.staff}</h3>
          </Button>
        </div>

        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>{t.login.email}</span>
              </label>
              <Input
                type="email"
                required
                placeholder={loginType === 'staff'
                  ? t.login.staffEmailPlaceholder
                  : t.login.clientEmailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>{t.login.password}</span>
              </label>
              <Input
                type="password"
                required
                placeholder={t.login.password}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setInfoMessage(t.login.passwordResetUnavailable);
                  }}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  {t.login.forgotPassword}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="rounded-xl border border-blue-900/60 bg-blue-950/30 px-4 py-3 text-sm text-blue-200">
                {infoMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.login.signingIn : t.login.signIn}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          {loginType === 'client' ? (
            <p className="text-sm text-gray-400 mb-3">
              {t.login.noAccount}{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.login.register}
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mb-3">
              {t.login.staffManaged}
            </p>
          )}
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            {t.login.backToHome}
          </Button>
        </div>
      </div>
    </div>
  );
}
