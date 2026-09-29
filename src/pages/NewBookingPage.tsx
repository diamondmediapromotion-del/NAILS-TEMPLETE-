import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Service } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, MapPin, Calendar as CalendarIcon, Clock, IndianRupee, Upload,
  Loader2, Tag, CheckCircle, XCircle, Star, User, AlertCircle, ShieldCheck, Timer
} from 'lucide-react';
import { calculateHomeServiceCharge, formatINR, MAX_SERVICE_DISTANCE } from '@/lib/homeServiceCharges';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface Technician {
  id: string;
  name: string;
  specialty: string | null;
  rating: number;
  avatar_url: string | null;
}

export function NewBookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [visitType, setVisitType] = useState<'salon' | 'home'>('salon');
  const [distance, setDistance] = useState<string>('');
  const [homeServiceCharge, setHomeServiceCharge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    coupon_code: string;
    discount_type: string;
    discount_value: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  useEffect(() => {
    fetchServices();
    fetchTechnicians();
    const savedCode = localStorage.getItem('appliedCouponCode') || localStorage.getItem('appliedPromoCode');
    if (savedCode) {
      setCouponCode(savedCode);
      localStorage.removeItem('appliedCouponCode');
      localStorage.removeItem('appliedPromoCode');
    }
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });
    if (!error) setServices(data || []);
  };

  const fetchTechnicians = async () => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (!error) setTechnicians(data || []);
  };

  useEffect(() => {
    if (visitType === 'home' && distance) {
      const d = parseFloat(distance);
      if (!isNaN(d)) {
        const charge = calculateHomeServiceCharge(d);
        if (charge === -1) {
          setHomeServiceCharge(0);
          toast({ title: 'Distance Too Far', description: `We currently serve up to ${MAX_SERVICE_DISTANCE}km only`, variant: 'destructive' });
        } else {
          setHomeServiceCharge(charge);
        }
      }
    } else {
      setHomeServiceCharge(0);
    }
  }, [visitType, distance]);

  // Recalculate coupon discount when base price changes
  useEffect(() => {
    if (appliedCoupon && baseTotalPrice > 0) {
      const { discount_type, discount_value } = appliedCoupon;
      const newDiscount = discount_type === 'percentage'
        ? Math.round(baseTotalPrice * discount_value / 100)
        : discount_value;
      if (newDiscount !== appliedCoupon.discountAmount) {
        setAppliedCoupon({ ...appliedCoupon, discountAmount: newDiscount });
      }
    }
  }, [selectedService, homeServiceCharge]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from('payment-screenshots').upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from('payment-screenshots').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const validateCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code'); return; }
    if (!customerPhone || customerPhone.length < 10) { setCouponError('Enter your phone number first'); return; }

    setCouponValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('review-incentive-engine', {
        body: { action: 'validate_coupon', couponCode: couponCode.trim().toUpperCase(), phone: customerPhone, orderAmount: baseTotalPrice },
      });

      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try { msg = await error.context?.text() || msg; } catch {}
        }
        setCouponError(msg || 'Failed to validate coupon');
        return;
      }

      if (!data.valid) { setCouponError(data.message || 'Invalid coupon code'); return; }

      const discount = data.discountAmount || (
        data.coupon.discount_type === 'percentage'
          ? Math.round(baseTotalPrice * data.coupon.discount_value / 100)
          : data.coupon.discount_value
      );
      setAppliedCoupon({
        coupon_code: data.coupon.coupon_code,
        discount_type: data.coupon.discount_type,
        discount_value: data.coupon.discount_value,
        discountAmount: discount,
      });
      setCouponSuccess(
        `${data.coupon.discount_type === 'percentage' ? data.coupon.discount_value + '%' : '₹' + data.coupon.discount_value} discount applied!`
      );
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon');
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) { toast({ title: 'Service Required', description: 'Please select a service', variant: 'destructive' }); return; }
    if (!appointmentDate || !appointmentTime) { toast({ title: 'Date & Time Required', variant: 'destructive' }); return; }

    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    const selectedDateOnly = new Date(appointmentDate);
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (selectedDateOnly < todayDateOnly) { toast({ title: 'Invalid Date', description: 'Please select today or a future date.', variant: 'destructive' }); return; }
    if (selectedDateTime < now) { toast({ title: 'Invalid Time', description: 'Please select a future time.', variant: 'destructive' }); return; }

    if (visitType === 'home') {
      if (!address || !distance) { toast({ title: 'Address Required', variant: 'destructive' }); return; }
      if (homeServiceCharge === 0 && parseFloat(distance) > MAX_SERVICE_DISTANCE) { toast({ title: 'Distance Too Far', variant: 'destructive' }); return; }
    }
    if (!screenshot) { toast({ title: 'Payment Proof Required', variant: 'destructive' }); return; }
    if (!upiTransactionId.trim()) { toast({ title: 'Transaction ID Required', variant: 'destructive' }); return; }
    if (!agreedToPolicy) { toast({ title: 'Policy Agreement Required', description: 'Please agree to the cancellation policy', variant: 'destructive' }); return; }

    setLoading(true);
    setUploading(true);

    try {
      const screenshotUrl = await uploadScreenshot(screenshot);
      if (!screenshotUrl) throw new Error('Failed to upload screenshot');
      setUploading(false);

      const finalTotal = Math.max(0, totalPrice);
      const finalAdvance = Math.round(finalTotal * 0.5);
      const finalRemaining = finalTotal - finalAdvance;
      const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_id: bookingId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          service_id: selectedService.id,
          service_name: selectedService.name,
          category: selectedService.category,
          visit_type: visitType,
          address: visitType === 'home' ? address : null,
          distance_km: visitType === 'home' ? parseFloat(distance) : null,
          home_service_charge: homeServiceCharge,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          total_price: finalTotal,
          advance_amount: finalAdvance,
          remaining_amount: finalRemaining,
          booking_status: 'pending_verification',
          technician_name: selectedTechnician?.name || null,
          technician_id: selectedTechnician?.id || null,
          estimated_duration_minutes: selectedService.duration_minutes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      await supabase.from('payments').insert({
        booking_id: bookingData.id,
        upi_transaction_id: upiTransactionId,
        payment_screenshot_url: screenshotUrl,
        amount: finalAdvance,
        payment_status: 'pending',
      });

      // Redeem coupon if applied
      if (appliedCoupon) {
        supabase.functions.invoke('review-incentive-engine', {
          body: { action: 'redeem_coupon', couponCode: appliedCoupon.coupon_code, phone: customerPhone, bookingId: bookingData.id },
        }).then(() => console.log('Coupon redeemed'));
      }

      // Send WhatsApp booking confirmation (fire-and-forget)
      supabase.functions.invoke('whatsapp-webhook', {
        body: {
          action: 'send_booking_confirmation',
          phone: customerPhone,
          customerName,
          bookingId: bookingData.booking_id,
          serviceName: selectedService.name,
          technicianName: selectedTechnician?.name || null,
          appointmentDate,
          appointmentTime,
          advanceAmount: finalAdvance,
          totalPrice: finalTotal,
          visitType,
        },
      }).then(({ data, error }) => {
        if (error) console.error('WhatsApp notification error:', error);
        else console.log(`WhatsApp confirmation sent: ${data?.sent ? 'via API' : 'logged'}`);
      });

      // Send booking confirmation email (fire-and-forget)
      supabase.functions.invoke('review-incentive-engine', {
        body: {
          action: 'send_booking_confirmation',
          bookingId: bookingData.booking_id,
          customerName,
          customerEmail: customerEmail || null,
          customerPhone,
          serviceName: selectedService.name,
          technicianName: selectedTechnician?.name || null,
          estimatedDurationMinutes: selectedService.duration_minutes,
          appointmentDate,
          appointmentTime,
          visitType,
          address: visitType === 'home' ? address : null,
          totalPrice: finalTotal,
          advanceAmount: finalAdvance,
          remainingAmount: finalRemaining,
          couponCode: appliedCoupon?.coupon_code || null,
          couponSavings: appliedCoupon?.discountAmount || null,
          upiTransactionId,
        },
      }).then(({ data, error }) => {
        if (error) {
          console.error('Confirmation email error:', error);
        } else {
          console.log(`Booking confirmation email generated. Email sent: ${data?.emailSent}`);
        }
      });

      toast({ title: 'Booking Submitted!', description: customerEmail ? 'Confirmation email sent! Your booking is pending admin verification.' : 'Your booking is pending admin verification.' });
      navigate(`/booking-status/${bookingData.booking_id}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({ title: 'Booking Failed', description: error.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const baseTotalPrice = selectedService ? selectedService.price_inr + homeServiceCharge : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPrice = Math.max(0, baseTotalPrice - couponDiscount);
  const advanceAmount = Math.round(totalPrice * 0.5);

  // Group services by category
  const servicesByCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
        <p className="text-muted-foreground mb-8">Fill in your details to confirm your booking</p>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Form Sections */}
          <div className="flex-1 space-y-6 min-w-0">

            {/* ── 1. SERVICE SELECTION ── */}
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
                Select Service
              </h2>
              <div className="space-y-3">
                {Object.entries(servicesByCategory).map(([category, catServices]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      {category}
                    </p>
                    <div className="space-y-2">
                      {catServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setSelectedService(service);
                            setSelectedTechnician(null);
                          }}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                            selectedService?.id === service.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-3">
                              <h3 className="font-semibold text-sm">{service.name}</h3>
                              {service.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Timer className="w-3 h-3" />
                                  {formatDuration(service.duration_minutes)}
                                </span>
                                {service.is_premium && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                    Premium
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary">{formatINR(service.price_inr)}</p>
                              {selectedService?.id === service.id && (
                                <CheckCircle className="w-4 h-4 text-primary ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 2. TECHNICIAN SELECTION ── */}
            {selectedService && (
              <section className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
                  Choose Your Artist
                </h2>
                <p className="text-sm text-muted-foreground mb-4 ml-9">Optional – skip to let us assign the best available artist</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {/* Any Artist option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTechnician(null)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      !selectedTechnician ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">Any Available</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Best match for your service</p>
                  </button>

                  {technicians.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => setSelectedTechnician(tech)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        selectedTechnician?.id === tech.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-primary">
                        {tech.name.charAt(0)}
                      </div>
                      <p className="font-medium text-sm">{tech.name}</p>
                      {tech.specialty && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tech.specialty}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-600">{tech.rating.toFixed(1)}</span>
                      </div>
                      {selectedTechnician?.id === tech.id && (
                        <CheckCircle className="w-4 h-4 text-primary mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ── 3. VISIT TYPE ── */}
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">3</span>
                Visit Type
              </h2>
              <RadioGroup value={visitType} onValueChange={(v: any) => setVisitType(v)} className="space-y-2">
                <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${visitType === 'salon' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="salon" id="salon" />
                  <Label htmlFor="salon" className="flex-1 cursor-pointer font-medium">
                    Salon Visit <span className="text-green-600 text-xs font-semibold ml-1">(Free)</span>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${visitType === 'home' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="flex-1 cursor-pointer font-medium">
                    Home Service <span className="text-muted-foreground text-xs ml-1">(Extra charges apply)</span>
                  </Label>
                </div>
              </RadioGroup>

              {visitType === 'home' && (
                <div className="mt-4 space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your complete address" className="mt-1" required={visitType === 'home'} />
                  </div>
                  <div>
                    <Label htmlFor="distance">Distance from salon (km) *</Label>
                    <Input id="distance" type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g., 5.5" className="mt-1" required={visitType === 'home'} />
                    {homeServiceCharge > 0 && (
                      <p className="text-sm text-primary mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Home service charge: {formatINR(homeServiceCharge)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ── 4. CUSTOMER DETAILS ── */}
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">4</span>
                Your Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="mt-1" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp Number *</Label>
                  <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="9876543210" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email <span className="text-muted-foreground font-normal">(Optional – for booking confirmation)</span></Label>
                  <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1" />
                </div>
              </div>
            </section>

            {/* ── 5. DATE & TIME ── */}
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">5</span>
                Appointment Date & Time
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Date *
                  </Label>
                  <Input id="date" type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time *
                  </Label>
                  <Input id="time" type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required className="mt-1" />
                </div>
              </div>
              {selectedService && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <Timer className="w-4 h-4 text-primary" />
                  Estimated duration: <strong className="text-foreground">{formatDuration(selectedService.duration_minutes)}</strong>
                  {appointmentTime && (
                    <>
                      &nbsp;→ ends around <strong className="text-foreground">
                        {(() => {
                          const [h, m] = appointmentTime.split(':').map(Number);
                          const end = new Date();
                          end.setHours(h, m + selectedService.duration_minutes);
                          return end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                        })()}
                      </strong>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* ── 6. COUPON CODE ── */}
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">6</span>
                <Tag className="w-5 h-5" />
                Apply Coupon / Promo Code
              </h2>

              {appliedCoupon ? (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-green-700 font-mono text-base">{appliedCoupon.coupon_code}</p>
                        <p className="text-sm text-green-600 font-medium">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% discount`
                            : `₹${appliedCoupon.discount_value} discount`} applied!
                        </p>
                        <p className="text-sm font-bold text-green-700">You save: {formatINR(appliedCoupon.discountAmount)} 🎉</p>
                      </div>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <XCircle className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                          setCouponSuccess('');
                        }}
                        placeholder="Enter code (e.g. REV-XXXXXXXX)"
                        className="pl-9 font-mono uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), validateCoupon())}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white min-w-[80px]"
                    >
                      {couponValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 flex-shrink-0" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" /> {couponSuccess}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Have a review reward or promo code? Enter above for a discount.</p>
                </div>
              )}
            </section>

            {/* ── 7. PAYMENT ── */}
            {selectedService && (
              <section className="glass-card p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">7</span>
                  Pay Advance Amount
                </h2>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">Scan QR to Pay {formatINR(advanceAmount)}</p>
                  <div className="inline-block border p-3 rounded-xl">
                    <img
                      src="https://cdn-ai.onspace.ai/onspace/files/8BkFCvStZqKqUqrMcQuyBt/photo_2026-01-05_20-16-44.jpg"
                      alt="UPI QR Code"
                      className="w-56 h-auto mx-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">PhonePe · Google Pay · Paytm · Any UPI</p>
                  <p className="text-xs font-bold mt-1">UPI ID: 6376539366-2@ybl</p>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="upi-id">UPI Transaction ID *</Label>
                    <Input id="upi-id" value={upiTransactionId} onChange={(e) => setUpiTransactionId(e.target.value)} placeholder="e.g., 123456789012" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="screenshot">Payment Screenshot *</Label>
                    <Input id="screenshot" type="file" accept="image/*" onChange={handleScreenshotChange} required className="hidden" />
                    <Label htmlFor="screenshot" className="flex items-center justify-center gap-2 p-4 mt-1 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors bg-white">
                      <Upload className="w-5 h-5" />
                      <span>{screenshot ? screenshot.name : 'Upload Screenshot'}</span>
                    </Label>
                    {screenshotPreview && (
                      <img src={screenshotPreview} alt="Preview" className="mt-3 max-w-[200px] rounded-lg border" />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── 8. CANCELLATION POLICY ── */}
            <section className="glass-card p-6 rounded-2xl border-2 border-amber-200 bg-amber-50/50">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-800">
                <ShieldCheck className="w-5 h-5" />
                Booking Terms & Cancellation Policy
              </h2>
              <div className="space-y-2 text-sm text-amber-900 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <p><strong>Cancellations made less than 24 hours</strong> before the appointment will incur a <strong>50% charge</strong> of the total service amount.</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <p>Rescheduling requests made <strong>24+ hours in advance</strong> are free of charge (subject to availability).</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <p>The <strong>50% advance payment</strong> is non-refundable for no-shows or same-day cancellations.</p>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToPolicy}
                    onChange={(e) => setAgreedToPolicy(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-amber-400 text-primary cursor-pointer"
                  />
                </div>
                <span className={`text-sm font-medium ${agreedToPolicy ? 'text-amber-900' : 'text-amber-700'}`}>
                  I have read and agree to the <strong>Cancellation & Rescheduling Policy</strong> stated above. *
                </span>
              </label>
            </section>

            {/* SUBMIT */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !agreedToPolicy}
              className="w-full bg-gradient-to-r from-primary to-accent h-14 text-lg font-semibold disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Submit Booking
                  {appliedCoupon ? ` (Save ${formatINR(appliedCoupon.discountAmount)})` : selectedService ? ` · Pay ${formatINR(advanceAmount)} Advance` : ''}
                </>
              )}
            </Button>
            {!agreedToPolicy && (
              <p className="text-xs text-center text-muted-foreground">Please agree to the cancellation policy to proceed</p>
            )}
          </div>

          {/* RIGHT: Sticky Price Summary (Desktop) */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div ref={summaryRef} className="lg:sticky lg:top-6 space-y-4">

              {/* Order Summary Card */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
                  <h3 className="font-bold text-lg">Booking Summary</h3>
                  <p className="text-white/80 text-sm">Live price breakdown</p>
                </div>

                <div className="p-5 space-y-3">
                  {selectedService ? (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Service</p>
                        <p className="font-semibold">{selectedService.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {formatDuration(selectedService.duration_minutes)}
                          </span>
                          {selectedService.is_premium && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Premium</span>
                          )}
                        </div>
                      </div>

                      {selectedTechnician && (
                        <div className="flex items-center gap-2 pt-1 pb-1 border-t">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xs">
                            {selectedTechnician.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{selectedTechnician.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-yellow-600">{selectedTechnician.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {(appointmentDate || appointmentTime) && (
                        <div className="flex items-center gap-2 text-sm pt-1 border-t">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                            {appointmentTime ? ` at ${appointmentTime}` : ''}
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Price</span>
                          <span className="font-medium">{formatINR(selectedService.price_inr)}</span>
                        </div>
                        {homeServiceCharge > 0 && (
                          <div className="flex justify-between text-primary">
                            <span>Home Service Charge</span>
                            <span className="font-medium">+ {formatINR(homeServiceCharge)}</span>
                          </div>
                        )}
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-600 font-semibold">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {appliedCoupon.coupon_code}
                            </span>
                            <span>− {formatINR(appliedCoupon.discountAmount)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            {appliedCoupon && (
                              <p className="text-xs line-through text-muted-foreground">{formatINR(baseTotalPrice)}</p>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-primary">{formatINR(totalPrice)}</p>
                        </div>
                      </div>

                      <div className="rounded-xl p-3 bg-gradient-to-r from-primary/10 to-accent/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Pay Now (50% Advance)</p>
                            <p className="text-lg font-bold text-primary">{formatINR(advanceAmount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Pay After Service</p>
                            <p className="text-lg font-bold text-orange-500">{formatINR(totalPrice - advanceAmount)}</p>
                          </div>
                        </div>
                      </div>

                      {appliedCoupon && (
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700 font-semibold">
                            🎉 You save {formatINR(appliedCoupon.discountAmount)}!
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <IndianRupee className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Select a service to see pricing</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy quick-view */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Cancellation Policy
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Free cancellation <strong>24+ hours</strong> before appointment. Within 24 hours: <strong>50% charge applies</strong>. No-shows are non-refundable.
                </p>
              </div>
            </div>
          </div>

          {/* MOBILE: Fixed bottom price bar */}
          {selectedService && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg px-4 py-3">
              <div className="flex items-center justify-between max-w-lg mx-auto">
                <div>
                  <p className="text-xs text-muted-foreground">Total · 50% advance</p>
                  <div className="flex items-center gap-2">
                    {appliedCoupon && (
                      <span className="text-sm line-through text-muted-foreground">{formatINR(baseTotalPrice)}</span>
                    )}
                    <span className="text-xl font-bold text-primary">{formatINR(totalPrice)}</span>
                    <span className="text-sm text-muted-foreground">→ Pay {formatINR(advanceAmount)}</span>
                  </div>
                  {selectedTechnician && (
                    <p className="text-xs text-muted-foreground">Artist: {selectedTechnician.name}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !agreedToPolicy}
                  className="bg-gradient-to-r from-primary to-accent text-white px-5 h-11"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Book Now'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
