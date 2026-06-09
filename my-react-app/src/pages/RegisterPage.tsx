import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { registerClient } from '../services/authService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';

function getClientNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || 'Client';

  return { firstName, lastName };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage(t.register.errors.name);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage(t.register.errors.shortPassword);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t.register.errors.mismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const { firstName, lastName } = getClientNameParts(formData.name);
      await registerClient({
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setSuccessMessage(t.register.success);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'Email already exists') {
        setErrorMessage(t.register.errors.emailExists);
      } else if (message === 'Invalid data') {
        setErrorMessage(t.register.errors.invalidData);
      } else {
        setErrorMessage(t.register.errors.server);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">{t.register.title}</h1>
          <p className="text-gray-400">{t.register.subtitle}</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">{t.register.cardTitle}</CardTitle>
            <CardDescription className="text-gray-400">
              {t.register.cardDescription}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  <span>{t.register.name}</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder={t.register.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>{t.common.email}</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder={t.register.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <span>{t.common.password}</span>
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder={t.register.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <span>{t.register.confirmPassword}</span>
                </label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder={t.register.confirmPasswordPlaceholder}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-green-900/60 bg-green-950/30 px-4 py-3 text-sm text-green-200">
                  {successMessage}
                </div>
              )}

              <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
                {isSubmitting ? t.register.creatingAccount : t.register.createAccount}
              </Button>

              {successMessage && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => navigate('/login')}
                >
                  {t.register.signIn}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            type="button"
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            {t.register.backToLogin}
          </Button>
        </div>
      </div>
    </div>
  );
}
