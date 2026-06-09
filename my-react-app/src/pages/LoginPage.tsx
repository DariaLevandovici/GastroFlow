import { useEffect, useState } from 'react';
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
  const titleParts = t.login.title.split('GastroFlow');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
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

  useEffect(() => {
    const subtitle = t.login.subtitle;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedSubtitle(subtitle);
      setIsTypingComplete(true);
      return;
    }

    let index = 0;
    let intervalId: number | undefined;

    setTypedSubtitle('');
    setIsTypingComplete(false);

    const startTimeout = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setTypedSubtitle(subtitle.slice(0, index));

        if (index >= subtitle.length && intervalId) {
          window.clearInterval(intervalId);
          setIsTypingComplete(true);
        }
      }, 35);
    }, 300);

    return () => {
      window.clearTimeout(startTimeout);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [t.login.subtitle]);

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
    <div className="relative min-h-screen overflow-hidden bg-[#1a1a1a] pt-24 pb-16">
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes loginAmbientGlow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate3d(12px, -10px, 0) scale(1.04); opacity: 0.32; }
        }

        @keyframes loginLogoPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 24px rgba(59, 130, 246, 0.42); }
        }

        @keyframes loginCursorBlink {
          0%, 42% { opacity: 1; }
          43%, 100% { opacity: 0; }
        }

        .login-title-enter {
          opacity: 0;
          animation: loginFadeUp 650ms ease-out forwards;
        }

        .login-subtitle-enter {
          opacity: 0;
          animation: loginFadeUp 650ms ease-out 200ms forwards;
        }

        .login-system-enter {
          opacity: 0;
          animation: loginFadeUp 650ms ease-out 360ms forwards;
        }

        .login-typing-cursor {
          display: inline-block;
          margin-left: 2px;
          color: rgb(96, 165, 250);
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.55);
          animation: loginCursorBlink 900ms steps(1, end) infinite;
        }

        .login-typing-cursor-complete {
          animation: none;
          opacity: 1;
        }

        .login-subtitle-measure {
          visibility: hidden;
          pointer-events: none;
        }

        .login-ambient-glow {
          animation: loginAmbientGlow 12s ease-in-out infinite;
        }

        header .bg-gradient-to-br.from-blue-600.to-blue-800 {
          animation: loginLogoPulse 4.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .login-title-enter,
          .login-subtitle-enter,
          .login-system-enter,
          .login-typing-cursor,
          .login-ambient-glow,
          header .bg-gradient-to-br.from-blue-600.to-blue-800 {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute left-[10%] top-24 h-44 w-44 rounded-full bg-blue-700/10 blur-3xl login-ambient-glow" />
      <div className="pointer-events-none absolute right-[12%] top-48 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl login-ambient-glow [animation-delay:1.8s]" />
      <div className="pointer-events-none absolute bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl login-ambient-glow [animation-delay:3.2s]" />

      <div className="container relative mx-auto px-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="login-title-enter text-4xl font-bold text-white mb-4">
            {titleParts[0]}
            <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(59,130,246,0.25)]">
              GastroFlow
            </span>
            {titleParts.slice(1).join('GastroFlow')}
          </h1>
          <p className="login-subtitle-enter relative text-gray-400" aria-label={t.login.subtitle}>
            <span aria-hidden="true" className="login-subtitle-measure block">
              {t.login.subtitle}
            </span>
            <span aria-hidden="true" className="absolute inset-0">
              {typedSubtitle}
              <span className={`login-typing-cursor${isTypingComplete ? ' login-typing-cursor-complete' : ''}`}>|</span>
            </span>
          </p>
          <div className="login-system-enter mt-4 inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-blue-950/20 px-3 py-1 text-xs font-medium text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
            {t.login.systemLabel}
          </div>
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
