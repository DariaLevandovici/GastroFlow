import { useState } from 'react';
import { Briefcase, User, Mail, Phone, Upload, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { useApp } from '../context/AppContext';

const positionIds = ['waiter', 'cook', 'manager'] as const;

export function CareerPage() {
  const navigate = useNavigate();
  const { t } = useApp();
  const positions = t.career.positions.map((position, index) => ({
    ...position,
    id: positionIds[index],
  }));
  const [formData, setFormData] = useState({
    position: '',
    fullName: '',
    email: '',
    phone: '',
    cv: null as File | null,
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t.career.successAlert);
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cv: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t.career.title}</h1>
          <p className="text-gray-400 text-lg">{t.career.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {positions.map(position => (
            <Card
              key={position.id}
              className="p-6 hover:border-blue-700 transition-all"
            >
              <Briefcase className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">{position.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{position.description}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-semibold">{t.career.requirements}</p>
                <ul className="space-y-1">
                  {position.requirements.map((req, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">-</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-8">{t.career.applicationFormTitle}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span>{t.career.positionLabel}</span>
              </label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.career.selectPosition} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>{t.career.fullName}</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{t.career.email}</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>{t.career.phoneNumber}</span>
              </label>
              <Input
                type="tel"
                required
                placeholder="+373 XXX XXX XX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>{t.career.uploadCV}</span>
              </label>
              <div className="relative">
                <Input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="file:mr-4 file:rounded-xl file:bg-blue-700 file:px-4 file:py-2 file:text-white hover:file:bg-blue-600"
                />
              </div>
              {formData.cv && (
                <p className="text-sm text-green-400 mt-2">OK {formData.cv.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>{t.career.coverLetter}</span>
              </label>
              <Textarea
                required
                rows={6}
                placeholder={t.career.coverLetterPlaceholder}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 h-12"
              >
                {t.career.submitApplication}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/')}
                variant="secondary"
                className="h-12 px-8"
              >
                {t.career.cancel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
