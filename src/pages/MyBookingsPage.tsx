import { useEffect, useState } from 'react';
import { supabase, Booking } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, IndianRupee, Clock, Phone, Search } from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';
import { toast } from 'sonner';

export default function MyBookingsPage() {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);

      if (!data || data.length === 0) {
        toast.info('No bookings found for this phone number');
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            My{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bookings
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your appointments and booking history
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Enter Your Phone Number
              </label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  {loading ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter the phone number you used when booking
              </p>
            </div>
          </form>
        </div>

        {/* Bookings List */}
        {searched && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center">
                <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any bookings with this phone number
                </p>
                <Button
                  onClick={() => window.location.href = '/book'}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="glass-card p-6 rounded-2xl">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Booking Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">
                            {booking.service_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Booking ID: {booking.booking_id}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.booking_status
                          )}`}
                        >
                          {booking.booking_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(booking.appointment_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{booking.appointment_time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="capitalize">{booking.visit_type} Service</span>
                        </div>

                        {booking.visit_type === 'home' && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Distance: {booking.distance_km} km
                            </span>
                          </div>
                        )}
                      </div>

                      {booking.visit_type === 'home' && booking.address && (
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Service Address:</p>
                          <p className="text-sm text-muted-foreground">{booking.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className="lg:w-64 border-l-0 lg:border-l lg:pl-6 pt-6 lg:pt-0 border-t lg:border-t-0">
                      <h4 className="font-semibold mb-4">Payment Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold">
                            {formatINR(booking.total_price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Advance Paid:</span>
                          <span className="font-semibold text-green-600">
                            {formatINR(booking.advance_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="font-semibold text-orange-600">
                            {formatINR(booking.remaining_amount)}
                          </span>
                        </div>
                      </div>

                      {booking.booking_status === 'pending_verification' && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700">
                            Your payment is being verified. You'll receive confirmation shortly.
                          </p>
                        </div>
                      )}

                      {booking.booking_status === 'confirmed' && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700">
                            ✓ Booking confirmed! We'll see you on your appointment date.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `tel:+916376539366`}
                    >
                      <Phone className="w-3 h-3 mr-2" />
                      Contact Us
                    </Button>
                    {booking.booking_status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Rescheduling feature coming soon!')}
                      >
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
