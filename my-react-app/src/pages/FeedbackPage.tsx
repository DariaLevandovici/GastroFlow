import { useState } from 'react';
import { Mail, MessageSquare, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

export function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      name: formData.name.trim() ? '' : 'Name is required.',
      email: formData.email.trim() ? '' : 'Email is required.',
      message: formData.message.trim() ? '' : 'Message is required.'
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.message) {
      setSuccessMessage('');
      return;
    }

    setSuccessMessage('Thank you for your feedback');
    setFormData({
      name: '',
      email: '',
      message: ''
    });
    setErrors({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Feedback</h1>
          <p className="text-gray-400 text-lg">Share your thoughts with us</p>
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
                <span>Name</span>
              </label>
              <Input
                type="text"
                placeholder="Your name"
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
                <span>Email</span>
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
                <span>Message</span>
              </label>
              <Textarea
                rows={6}
                placeholder="Write your feedback here..."
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  setErrors({ ...errors, message: '' });
                  setSuccessMessage('');
                }}
              />
              {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message}</p>}
            </div>

            <Button type="submit" className="w-full h-12">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
