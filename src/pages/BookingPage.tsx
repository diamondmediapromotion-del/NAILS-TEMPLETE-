import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICES } from '@/constants/services';
import { generateTimeSlots } from '@/constants/timeSlots';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, ArrowLeft, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const addBooking = useBookingStore(state => state.addBooking);

  const preSelectedServiceId = searchParams.get('service');
  
  const [selectedService, setSelectedService] = useState(preSelectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];
  const service = SERVICES.find(s => s.id === selectedService);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedService(preSelectedServiceId);
    }
  }, [preSelectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const serviceName = SERVICES.find(s => s.id === selectedService)?.name || '';
      const price = SERVICES.find(s => s.id === selectedService)?.price || 0;

      addBooking({
        serviceId: selectedService,
        serviceName,
        date: selectedDate,
        time: selectedTime,
        customerName,
        customerEmail,
        customerPhone,
        price,
      });

      toast({
        title: 'Booking Confirmed! 🎉',
        description: `Your appointment for ${serviceName} has been scheduled`,
      });

      navigate('/confirmation');
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Book Your Appointment</h1>
            <p className="text-muted-foreground">Fill in your details and select your preferred time</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">Select Service *</Label>
              <select
                id="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Choose a service...</option>
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date *
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(''); // Reset time when date changes
                }}
                required
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time *
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-soft'
                          : slot.available
                          ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Your Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {service && (
              <div className="bg-gradient-gold p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Service</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{service.duration} minutes</span>
                </div>
                <div className="border-t border-primary/20 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lifted transition-all text-lg py-6"
            >
              {isProcessing ? (
                <>Processing Payment...</>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirm & Pay ${service?.price || 0}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Payment is required to confirm your booking. You can cancel up to 24 hours before your appointment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
