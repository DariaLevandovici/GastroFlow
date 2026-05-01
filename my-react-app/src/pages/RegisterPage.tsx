import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto max-w-md px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400">Register as a client to start ordering and booking faster.</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">Client Registration</CardTitle>
            <CardDescription className="text-gray-400">
              Fill in your details to create a new account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  <span>Name</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Your full name"
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
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <span>Password</span>
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <span>Confirm Password</span>
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <Button type="submit" className="h-12 w-full">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
