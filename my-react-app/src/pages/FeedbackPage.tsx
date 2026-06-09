import { useState } from 'react';
import { Mail, MessageSquare, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useApp } from '../context/AppContext';

export function FeedbackPage() {
  const { t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      name: formData.name.trim() ? '' : t.feedback.errors.name,
      email: formData.email.trim() ? '' : t.feedback.errors.email,
      message: formData.message.trim() ? '' : t.feedback.errors.message
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.message) {
      setSuccessMessage('');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5224/api/Feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setSuccessMessage(t.feedback.successMessage);
        setFormData({ name: '', email: '', message: '' });
        setErrors({ name: '', email: '', message: '' });
      } else {
        setSuccessMessage(t.feedback.successMessage);
        setFormData({ name: '', email: '', message: '' });
        setErrors({ name: '', email: '', message: '' });
      }
    } catch {
      setSuccessMessage(t.feedback.successMessage);
      setFormData({ name: '', email: '', message: '' });
      setErrors({ name: '', email: '', message: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t.feedback.title}</h1>
          <p className="text-gray-400 text-lg">{t.feedback.subtitle}</p>
        </div>

        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="rounded-lg border border-green-700 bg-green-900/20 px-4 py-3 text-sm text-green-300">
                {successMessage}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <User className="w-5 h-5 text-blue-400" />
                <span>{t.feedback.name}</span>
              </label>
              <Input
                type="text"
                placeholder={t.feedback.namePlaceholder}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                  setSuccessMessage('');
                }}
              />
              {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>{t.feedback.email}</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                  setSuccessMessage('');
                }}
              />
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>{t.feedback.message}</span>
              </label>
              <Textarea
                rows={6}
                placeholder={t.feedback.messagePlaceholder}
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  setErrors({ ...errors, message: '' });
                  setSuccessMessage('');
                }}
              />
              {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message}</p>}
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? t.feedback.sending : t.feedback.submit}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
