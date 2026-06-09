import { useState } from 'react';
import { Calendar, Clock, Users, Phone, User, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { createReservation } from '../services/reservationService';

export function ReservationPage() {
  const { addReservation, user, t } = useApp();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    specialRequest: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.time) {
      setErrorMessage(t.reservation.selectTime);
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationDate = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      const createdReservation = await createReservation({
        reservationDate,
        numberOfGuests: formData.guests,
        specialRequests: formData.specialRequest
      });

      addReservation({
        ...formData,
        status: createdReservation.status.toLowerCase() === 'confirmed' ? 'confirmed' : 'pending',
        tableId: createdReservation.tableId,
        tableNumber: createdReservation.tableNumber,
        tableCapacity: createdReservation.tableCapacity,
        clientName: createdReservation.clientName || formData.name,
        clientEmail: createdReservation.clientEmail || user?.email
      });
      setSuccessMessage(
        createdReservation.tableNumber
          ? `${t.reservation.successAssigned} #${createdReservation.tableNumber}.`
          : t.reservation.successConfirmed
      );
      setTimeout(() => navigate('/'), 1800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.reservation.errorCreate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t.reservation.title}</h1>
          <p className="text-gray-400 text-lg">{t.reservation.subtitle}</p>
        </div>

        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>{t.reservation.date}</span>
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
                  <span>{t.reservation.time}</span>
                </label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.reservation.selectTime} />
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
                <span>{t.reservation.numberOfGuests}</span>
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
                  {formData.guests} {formData.guests === 1 ? t.reservation.guest : t.reservation.guests}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>{t.reservation.fullName}</span>
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
                  <span>{t.reservation.phoneNumber}</span>
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
                <span>{t.reservation.specialRequests}</span>
              </label>
              <Textarea
                rows={4}
                placeholder={t.reservation.specialRequestsPlaceholder}
                value={formData.specialRequest}
                onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.common.loading : t.reservation.confirmReservation}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/')}
                variant="secondary"
                className="h-12 px-8"
              >
                {t.reservation.cancel}
              </Button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
}
