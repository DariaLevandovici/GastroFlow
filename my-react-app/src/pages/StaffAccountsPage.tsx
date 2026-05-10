import { useState } from 'react';
import { Lock, Mail, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function StaffAccountsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'waiter',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', role: 'waiter', password: '' });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto max-w-3xl px-6">

        {/* Sageata inapoi */}
        <button
          onClick={() => navigate('/dashboard/manager')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Staff Accounts</h1>
          <p className="text-gray-400">Create internal accounts for restaurant staff members.</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#242424] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-blue-400" />
                <span>Name</span>
              </label>
              <Input
                type="text"
                placeholder="Staff full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>Email</span>
              </label>
              <Input
                type="email"
                placeholder="staff@gastroflow.md"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span>Role</span>
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="cook">Cook</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-blue-400" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Butoane */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 h-12">
                Create Staff Account
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 border-red-800 text-red-400 hover:bg-red-900/20"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}