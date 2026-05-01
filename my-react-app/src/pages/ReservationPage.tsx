import { useState } from 'react';
import { Calendar, Clock, Users, Phone, User, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function ReservationPage() {
  const { addReservation } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    specialRequest: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation(formData);
    alert('Reservation submitted successfully! We will confirm shortly.');
    navigate('/');
  };

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Reserve a Table</h1>
          <p className="text-gray-400 text-lg">Book your dining experience with us</p>
        </div>

        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Date</span>
                </label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>Time</span>
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Number of Guests</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-700 font-bold min-w-[80px] text-center">
                  {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>Full Name</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>Phone Number</span>
                </label>
                <Input
                  type="tel"
                  required
                  placeholder="+373 XXX XXX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="flex items-center gap-2 text-white mb-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Special Requests (Optional)</span>
              </label>
              <Textarea
                rows={4}
                placeholder="Any dietary restrictions, allergies, or special occasions..."
                value={formData.specialRequest}
                onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 h-12"
              >
                Confirm Reservation
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/')}
                variant="secondary"
                className="h-12 px-8"
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