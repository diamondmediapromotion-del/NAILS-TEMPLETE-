import { useEffect, useState } from 'react';
import { useNavigate as useNavigateRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Booking, Payment, Service } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PromotionsManagementSection } from '@/components/features/PromotionsManagementSection';
import { ReviewIncentiveAdminSection } from '@/components/features/ReviewIncentiveAdminSection';
import { 
  LogOut, CheckCircle, XCircle, Loader2, ExternalLink, Calendar, Home, Building2,
  LayoutDashboard, Package, Settings, CreditCard, MessageSquare, Users, MapPin,
  Plus, Edit, Trash2, Upload, IndianRupee, Clock, Tag, Eye, Star, Ban, Gift, Image, Grid3x3
} from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';

interface BookingWithPayment extends Booking {
  payment?: Payment;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface HomeServiceCharge {
  id: string;
  min_km: number;
  max_km: number;
  charge_inr: number;
  is_active: boolean;
  created_at: string;
}

interface Review {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  is_approved: boolean;
  created_at: string;
}

interface Reel {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_active: boolean;
  created_at: string;
}

type AdminSection = 'dashboard' | 'services' | 'categories' | 'home-charges' | 'bookings' | 'payments' | 'reviews' | 'reels' | 'gallery' | 'promotions' | 'incentives';

export function AdminDashboard() {
  const navigate = useNavigate();
  const navigateRouter = useNavigateRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeCharges, setHomeCharges] = useState<HomeServiceCharge[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBookings(),
      fetchServices(),
      fetchCategories(),
      fetchHomeCharges(),
      fetchReviews(),
      fetchReels(),
    ]);
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsWithPayments = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: paymentData } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', booking.id)
            .single();

          return {
            ...booking,
            payment: paymentData || undefined,
          };
        })
      );

      setBookings(bookingsWithPayments);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHomeCharges = async () => {
    try {
      const { data, error } = await supabase
        .from('home_service_charges')
        .select('*')
        .order('min_km', { ascending: true });

      if (error) throw error;
      setHomeCharges(data || []);
    } catch (error) {
      console.error('Error fetching home charges:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    }
  };

  const handleVerifyPayment = async (bookingId: string, paymentId: string) => {
    setProcessingId(bookingId);
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          payment_status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          booking_status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Schedule review reminder + 24-hour appointment reminder
      const confirmedBooking = bookings.find(b => b.id === bookingId);
      if (confirmedBooking) {
        // Schedule 7-day review email reminder
        supabase.functions.invoke('review-incentive-engine', {
          body: {
            action: 'schedule_reminder',
            bookingId,
            phone: confirmedBooking.customer_phone,
            customerName: confirmedBooking.customer_name,
            customerEmail: confirmedBooking.customer_email || null,
            serviceName: confirmedBooking.service_name,
          }
        }).then(() => console.log('Review reminder scheduled for', confirmedBooking.customer_name));

        // Schedule WhatsApp appointment reminder 24 hours before appointment
        const appointmentDateTime = new Date(`${confirmedBooking.appointment_date}T${confirmedBooking.appointment_time || '10:00'}`);
        const reminderAt = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
        const now = new Date();

        if (reminderAt > now) {
          supabase.from('whatsapp_followups').insert({
            lead_id: null,
            followup_type: 'appointment_reminder',
            scheduled_at: reminderAt.toISOString(),
            status: 'pending',
            metadata: {
              phone: confirmedBooking.customer_phone,
              customerName: confirmedBooking.customer_name,
              bookingId: confirmedBooking.booking_id,
              serviceName: confirmedBooking.service_name,
              technicianName: confirmedBooking.technician_name || null,
              appointmentDate: confirmedBooking.appointment_date,
              appointmentTime: confirmedBooking.appointment_time,
              visitType: confirmedBooking.visit_type,
              address: confirmedBooking.address || null,
              totalPrice: confirmedBooking.total_price,
              advanceAmount: confirmedBooking.advance_amount,
            },
          }).then(({ error: reminderErr }) => {
            if (reminderErr) console.error('Failed to schedule appointment reminder:', reminderErr);
            else console.log(`📅 Appointment reminder scheduled for ${confirmedBooking.customer_name} at ${reminderAt.toLocaleString()}`);
          });
        } else {
          console.log('Appointment is within 24h, skipping reminder scheduling');
        }
      }

      if (bookingError) throw bookingError;

      toast({
        title: 'Payment Verified',
        description: 'Booking has been confirmed',
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayment = async (bookingId: string, paymentId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessingId(bookingId);
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          payment_status: 'rejected',
          rejection_reason: reason,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      toast({
        title: 'Payment Rejected',
        description: 'Booking has been cancelled',
        variant: 'destructive',
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.booking_status === 'pending_verification');
  const confirmedBookings = bookings.filter(b => b.booking_status === 'confirmed');
  const todayBookings = confirmedBookings.filter(
    b => b.appointment_date === new Date().toISOString().split('T')[0]
  );
  const homeServiceBookings = confirmedBookings.filter(b => b.visit_type === 'home');
  const totalAdvance = bookings
    .filter(b => b.booking_status === 'confirmed')
    .reduce((sum, b) => sum + b.advance_amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-muted/30 border-r min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
              Admin Panel
            </h2>
            
            <nav className="space-y-2">
              <SidebarButton
                icon={LayoutDashboard}
                label="Dashboard"
                active={activeSection === 'dashboard'}
                onClick={() => setActiveSection('dashboard')}
              />
              <SidebarButton
                icon={Package}
                label="Services"
                active={activeSection === 'services'}
                onClick={() => setActiveSection('services')}
              />
              <SidebarButton
                icon={Tag}
                label="Categories"
                active={activeSection === 'categories'}
                onClick={() => setActiveSection('categories')}
              />
              <SidebarButton
                icon={MapPin}
                label="Home Service Charges"
                active={activeSection === 'home-charges'}
                onClick={() => setActiveSection('home-charges')}
              />
              <SidebarButton
                icon={Calendar}
                label="Bookings"
                active={activeSection === 'bookings'}
                onClick={() => setActiveSection('bookings')}
              />
              <SidebarButton
                icon={CreditCard}
                label="Payment Verification"
                active={activeSection === 'payments'}
                onClick={() => setActiveSection('payments')}
                badge={pendingBookings.length}
              />
              <SidebarButton
                icon={Star}
                label="Reviews"
                active={activeSection === 'reviews'}
                onClick={() => setActiveSection('reviews')}
              />
              <SidebarButton
                icon={MessageSquare}
                label="Reels"
                active={activeSection === 'reels'}
                onClick={() => setActiveSection('reels')}
              />
              <SidebarButton
                icon={Image}
                label="Gallery"
                active={activeSection === 'gallery'}
                onClick={() => setActiveSection('gallery')}
              />
              <SidebarButton
                icon={Tag}
                label="Promotions"
                active={activeSection === 'promotions'}
                onClick={() => setActiveSection('promotions')}
              />
              <SidebarButton
                icon={Gift}
                label="Review Incentives"
                active={activeSection === 'incentives'}
                onClick={() => setActiveSection('incentives')}
              />
              <SidebarButton
                icon={Users}
                label="WhatsApp Leads"
                active={false}
                onClick={() => navigateRouter('/admin/whatsapp-leads')}
              />
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                <MobileNavButton
                  icon={LayoutDashboard}
                  active={activeSection === 'dashboard'}
                  onClick={() => setActiveSection('dashboard')}
                />
                <MobileNavButton
                  icon={Package}
                  active={activeSection === 'services'}
                  onClick={() => setActiveSection('services')}
                />
                <MobileNavButton
                  icon={Tag}
                  active={activeSection === 'categories'}
                  onClick={() => setActiveSection('categories')}
                />
                <MobileNavButton
                  icon={MapPin}
                  active={activeSection === 'home-charges'}
                  onClick={() => setActiveSection('home-charges')}
                />
                <MobileNavButton
                  icon={Calendar}
                  active={activeSection === 'bookings'}
                  onClick={() => setActiveSection('bookings')}
                />
                <MobileNavButton
                  icon={CreditCard}
                  active={activeSection === 'payments'}
                  onClick={() => setActiveSection('payments')}
                  badge={pendingBookings.length}
                />
                <MobileNavButton
                  icon={Star}
                  active={activeSection === 'reviews'}
                  onClick={() => setActiveSection('reviews')}
                />
                <MobileNavButton
                  icon={MessageSquare}
                  active={activeSection === 'reels'}
                  onClick={() => setActiveSection('reels')}
                />
                <MobileNavButton
                  icon={Image}
                  active={activeSection === 'gallery'}
                  onClick={() => setActiveSection('gallery')}
                />
                <MobileNavButton
                  icon={Tag}
                  active={activeSection === 'promotions'}
                  onClick={() => setActiveSection('promotions')}
                />
              </div>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <DashboardSection
                pendingCount={pendingBookings.length}
                todayCount={todayBookings.length}
                homeServiceCount={homeServiceBookings.length}
                totalBookings={bookings.length}
                totalAdvance={totalAdvance}
              />
            )}

            {/* Services Section */}
            {activeSection === 'services' && (
              <ServicesSection
                services={services}
                categories={categories}
                onRefresh={fetchServices}
              />
            )}

            {/* Categories Section */}
            {activeSection === 'categories' && (
              <CategoriesSection
                categories={categories}
                onRefresh={fetchCategories}
              />
            )}

            {/* Home Service Charges Section */}
            {activeSection === 'home-charges' && (
              <HomeChargesSection
                charges={homeCharges}
                onRefresh={fetchHomeCharges}
              />
            )}

            {/* Bookings Section */}
            {activeSection === 'bookings' && (
              <BookingsSection bookings={bookings} onRefresh={fetchBookings} />
            )}

            {/* Payment Verification Section */}
            {activeSection === 'payments' && (
              <PaymentVerificationSection
                bookings={pendingBookings}
                onVerify={handleVerifyPayment}
                onReject={handleRejectPayment}
                processing={processingId}
              />
            )}

            {/* Reviews Section */}
            {activeSection === 'reviews' && (
              <ReviewsSection reviews={reviews} onRefresh={fetchReviews} />
            )}

            {/* Reels Section */}
            {activeSection === 'reels' && (
              <ReelsManagementSection reels={reels} onRefresh={fetchReels} />
            )}

            {/* Gallery Section */}
            {activeSection === 'gallery' && (
              <GalleryManagementSection />
            )}

            {/* Promotions Section */}
            {activeSection === 'promotions' && (
              <PromotionsManagementSection />
            )}

            {/* Review Incentives Section */}
            {activeSection === 'incentives' && (
              <ReviewIncentiveAdminSection />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Sidebar Button Component
function SidebarButton({ icon: Icon, label, active, onClick, badge }: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-soft'
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Mobile Navigation Button
function MobileNavButton({ icon: Icon, active, onClick, badge }: {
  icon: any;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white'
          : 'bg-muted text-foreground'
      }`}
    >
      <Icon className="w-5 h-5" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Dashboard Section
function DashboardSection({ pendingCount, todayCount, homeServiceCount, totalBookings, totalAdvance }: {
  pendingCount: number;
  todayCount: number;
  homeServiceCount: number;
  totalBookings: number;
  totalAdvance: number;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Pending Verifications"
          value={pendingCount.toString()}
          icon={Calendar}
          color="yellow"
        />
        <StatsCard
          title="Today's Bookings"
          value={todayCount.toString()}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Home Service Bookings"
          value={homeServiceCount.toString()}
          icon={Home}
          color="blue"
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings.toString()}
          icon={Building2}
          color="purple"
        />
        <StatsCard
          title="Advance Collected"
          value={formatINR(totalAdvance)}
          icon={IndianRupee}
          color="green"
        />
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string;
  icon: any;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}) {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Services Section
function ServicesSection({ services, categories, onRefresh }: {
  services: Service[];
  categories: Category[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'basic',
    category_id: '',
    price_inr: '',
    duration_minutes: '',
    is_premium: false,
    home_service_allowed: true,
    image_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      category_id: service.category_id || '',
      price_inr: service.price_inr.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_premium: service.is_premium || false,
      home_service_allowed: service.home_service_allowed !== false,
      image_url: service.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disable this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Service Disabled',
        description: 'Service has been disabled successfully',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `service-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('review-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('review-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        category_id: formData.category_id || null,
        price_inr: parseInt(formData.price_inr),
        duration_minutes: parseInt(formData.duration_minutes),
        is_premium: formData.is_premium,
        home_service_allowed: formData.home_service_allowed,
        image_url: imageUrl,
        is_active: true,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'Service Updated' });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;
        toast({ title: 'Service Added' });
      }

      setShowForm(false);
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        category: 'basic',
        category_id: '',
        price_inr: '',
        duration_minutes: '',
        is_premium: false,
        home_service_allowed: true,
        image_url: '',
      });
      setImageFile(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingService(null);
          setFormData({
            name: '',
            description: '',
            category: 'basic',
            category_id: '',
            price_inr: '',
            duration_minutes: '',
            is_premium: false,
            home_service_allowed: true,
            image_url: '',
          });
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="basic">Basic Nails</option>
                <option value="premium">Premium Nails</option>
                <option value="art">Nail Art</option>
                <option value="mehndi">Mehndi</option>
                <option value="beauty">Beauty Parlour</option>
              </select>
            </div>

            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_inr}
                onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="image">Service Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {(formData.image_url || imageFile) && (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Premium Service</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.home_service_allowed}
                  onChange={(e) => setFormData({ ...formData, home_service_allowed: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Home Service Allowed</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
            {service.image_url && (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <div className="flex gap-4 text-sm mt-1">
                <span className="text-primary font-semibold">{formatINR(service.price_inr)}</span>
                <span className="text-muted-foreground">{service.duration_minutes} min</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(service.id)}
              >
                <Ban className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Categories Section
function CategoriesSection({ categories, onRefresh }: {
  categories: Category[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Category Disabled' : 'Category Enabled',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `category-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('review-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('review-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        image_url: imageUrl || null,
        is_active: true,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('service_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: 'Category Updated' });
      } else {
        const { error } = await supabase
          .from('service_categories')
          .insert(categoryData);

        if (error) throw error;
        toast({ title: 'Category Added' });
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image_url: '' });
      setImageFile(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Categories</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingCategory(null);
          setFormData({ name: '', description: '', image_url: '' });
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cat-image">Category Image</Label>
              <Input
                id="cat-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {(formData.image_url || imageFile) && (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
            {category.image_url && (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs ${
                category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
              <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={category.is_active ? 'destructive' : 'default'}
                onClick={() => handleToggleActive(category.id, category.is_active)}
              >
                {category.is_active ? <Ban className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Home Service Charges Section
function HomeChargesSection({ charges, onRefresh }: {
  charges: HomeServiceCharge[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCharge, setEditingCharge] = useState<HomeServiceCharge | null>(null);
  const [formData, setFormData] = useState({
    min_km: '',
    max_km: '',
    charge_inr: '',
  });

  const handleEdit = (charge: HomeServiceCharge) => {
    setEditingCharge(charge);
    setFormData({
      min_km: charge.min_km.toString(),
      max_km: charge.max_km.toString(),
      charge_inr: charge.charge_inr.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const chargeData = {
        min_km: parseInt(formData.min_km),
        max_km: parseInt(formData.max_km),
        charge_inr: parseFloat(formData.charge_inr),
        is_active: true,
      };

      if (editingCharge) {
        const { error } = await supabase
          .from('home_service_charges')
          .update(chargeData)
          .eq('id', editingCharge.id);

        if (error) throw error;
        toast({ title: 'Charge Updated' });
      } else {
        const { error } = await supabase
          .from('home_service_charges')
          .insert(chargeData);

        if (error) throw error;
        toast({ title: 'Charge Added' });
      }

      setShowForm(false);
      setEditingCharge(null);
      setFormData({ min_km: '', max_km: '', charge_inr: '' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Home Service Charges</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Charge
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingCharge ? 'Edit Charge' : 'Add New Charge'}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_km">Minimum KM *</Label>
              <Input
                id="min_km"
                type="number"
                value={formData.min_km}
                onChange={(e) => setFormData({ ...formData, min_km: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max_km">Maximum KM *</Label>
              <Input
                id="max_km"
                type="number"
                value={formData.max_km}
                onChange={(e) => setFormData({ ...formData, max_km: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="charge">Charge (₹) *</Label>
              <Input
                id="charge"
                type="number"
                value={formData.charge_inr}
                onChange={(e) => setFormData({ ...formData, charge_inr: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit">
              {editingCharge ? 'Update Charge' : 'Add Charge'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {charges.map((charge) => (
          <div key={charge.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {charge.min_km} - {charge.max_km} km
              </p>
              <p className="text-sm text-muted-foreground">
                Charge: {formatINR(charge.charge_inr)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(charge)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bookings Section
function BookingsSection({ bookings, onRefresh }: {
  bookings: BookingWithPayment[];
  onRefresh: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

// Payment Verification Section
function PaymentVerificationSection({ bookings, onVerify, onReject, processing }: {
  bookings: BookingWithPayment[];
  onVerify: (bookingId: string, paymentId: string) => void;
  onReject: (bookingId: string, paymentId: string) => void;
  processing: string | null;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment Verification</h1>
      {bookings.length === 0 ? (
        <div className="glass-card p-12 rounded-xl text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <p className="text-xl font-semibold mb-2">All Caught Up!</p>
          <p className="text-muted-foreground">No pending payment verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onVerify={onVerify}
              onReject={onReject}
              processing={processing === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Reviews Section
function ReviewsSection({ reviews, onRefresh }: {
  reviews: Review[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();

  const handleApprove = async (id: string) => {
    try {
      const reviewToApprove = reviews.find(r => r.id === id);
      
      const { error } = await supabase
        .from('customer_reviews')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      // If review has photo and customer has phone, trigger photo bonus
      if (reviewToApprove?.photo_url && reviewToApprove?.customer_phone) {
        supabase.functions.invoke('review-incentive-engine', {
          body: {
            action: 'process_photo_bonus',
            reviewId: id,
            phone: reviewToApprove.customer_phone,
            customerName: reviewToApprove.customer_name,
          }
        }).then(({ data, error: fnErr }) => {
          if (!fnErr && data?.success) {
            toast({ title: '🎁 Photo Bonus Issued!', description: `Bonus coupon ${data.coupon?.coupon_code} sent to ${reviewToApprove.customer_name}` });
          }
        });
      }

      toast({ title: 'Review Approved' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this review?')) return;

    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Review Rejected' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const approvedReviews = reviews.filter(r => r.is_approved);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
            {pendingReviews.length === 0 && (
              <div className="glass-card p-12 rounded-xl text-center">
                <p className="text-muted-foreground">No pending reviews</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {approvedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review, onApprove, onReject }: {
  review: Review;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-start gap-4">
        {review.photo_url && (
          <img
            src={review.photo_url}
            alt={review.customer_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{review.customer_name}</h3>
              {review.service_name && (
                <p className="text-sm text-muted-foreground">{review.service_name}</p>
              )}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm mb-3">{review.review_text}</p>
          {onApprove && onReject && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(review.id)}
                className="gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(review.id)}
                className="gap-1"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Booking Card Component (same as before)
interface BookingCardProps {
  booking: BookingWithPayment;
  onVerify?: (bookingId: string, paymentId: string) => void;
  onReject?: (bookingId: string, paymentId: string) => void;
  processing?: boolean;
}

// Reels Management Section
function ReelsManagementSection({ reels, onRefresh }: {
  reels: Reel[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'nails',
    video_url: '',
    thumbnail_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleEdit = (reel: Reel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      description: reel.description || '',
      category: reel.category || 'nails',
      video_url: reel.video_url,
      thumbnail_url: reel.thumbnail_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disable this reel?')) return;

    try {
      const { error } = await supabase
        .from('service_reels')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Reel Disabled' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'thumbnail'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    
    // Use reels-videos bucket for videos and thumbnails
    const { error: uploadError } = await supabase.storage
      .from('reels-videos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('reels-videos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let videoUrl = formData.video_url;
      let thumbnailUrl = formData.thumbnail_url;

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
      }

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnail');
      }

      if (!videoUrl) {
        throw new Error('Video URL is required');
      }

      const reelData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        is_active: true,
      };

      if (editingReel) {
        const { error } = await supabase
          .from('service_reels')
          .update(reelData)
          .eq('id', editingReel.id);

        if (error) throw error;
        toast({ title: 'Reel Updated' });
      } else {
        const { error } = await supabase
          .from('service_reels')
          .insert(reelData);

        if (error) throw error;
        toast({ title: 'Reel Added' });
      }

      setShowForm(false);
      setEditingReel(null);
      setFormData({
        title: '',
        description: '',
        category: 'nails',
        video_url: '',
        thumbnail_url: '',
      });
      setVideoFile(null);
      setThumbnailFile(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reels Management</h1>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingReel(null);
          setFormData({
            title: '',
            description: '',
            category: 'nails',
            video_url: '',
            thumbnail_url: '',
          });
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Reel
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingReel ? 'Edit Reel' : 'Add New Reel'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="nails">Nails</option>
                <option value="mehndi">Mehndi</option>
                <option value="beauty">Beauty</option>
                <option value="transformation">Transformation</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="video">Video File *</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {(formData.video_url || videoFile) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {videoFile ? videoFile.name : 'Video uploaded'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {(formData.thumbnail_url || thumbnailFile) && (
                <img
                  src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : formData.thumbnail_url}
                  alt="Thumbnail preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingReel ? 'Update Reel' : 'Add Reel'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {reels.map((reel) => (
          <div key={reel.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
            {reel.thumbnail_url && (
              <img
                src={reel.thumbnail_url}
                alt={reel.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{reel.title}</h3>
              <p className="text-sm text-muted-foreground">{reel.description}</p>
              <div className="flex gap-4 text-sm mt-1">
                <span className="text-muted-foreground">❤️ {reel.likes_count}</span>
                <span className="text-muted-foreground">💬 {reel.comments_count}</span>
                <span className="text-muted-foreground">👁️ {reel.views_count}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  reel.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {reel.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(reel)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(reel.id)}
              >
                <Ban className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {reels.length === 0 && (
          <div className="glass-card p-12 rounded-xl text-center">
            <p className="text-muted-foreground">No reels yet. Add your first reel to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gallery Management Section ─────────────────────────────────────────────

const GALLERY_CATEGORIES = [
  { id: 'gel',      label: 'Gel Nails',  emoji: '💅' },
  { id: 'acrylic',  label: 'Acrylic',    emoji: '💎' },
  { id: 'nail-art', label: 'Nail Art',   emoji: '🎨' },
  { id: 'mehndi',   label: 'Mehndi',     emoji: '🌿' },
  { id: 'bridal',   label: 'Bridal',     emoji: '👰' },
  { id: 'other',    label: 'Other',      emoji: '🌸' },
];

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

function GalleryManagementSection() {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState('gel');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error) setImages(data || []);
    setLoading(false);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setUploadPreviews(previews);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles.length) {
      toast({ title: 'No files selected', variant: 'destructive' });
      return;
    }
    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      try {
        const ext = file.name.split('.').pop();
        const fileName = `gallery-${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, file);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        const { error: insertErr } = await supabase
          .from('gallery_images')
          .insert({
            title: uploadTitle || '',
            category: uploadCategory,
            image_url: urlData.publicUrl,
            is_active: true,
            sort_order: 0,
          });
        if (insertErr) throw insertErr;
        successCount++;
      } catch (err: any) {
        console.error('Upload error:', err);
        failCount++;
      }
    }

    toast({
      title: failCount === 0 ? `${successCount} image(s) uploaded!` : `${successCount} uploaded, ${failCount} failed`,
      variant: failCount > 0 ? 'destructive' : 'default',
    });

    setUploadFiles([]);
    setUploadPreviews([]);
    setUploadTitle('');
    setShowUploadForm(false);
    fetchGallery();
    setUploading(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_active: !current })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setImages(prev => prev.map(img => img.id === id ? { ...img, is_active: !current } : img));
      toast({ title: current ? 'Image Hidden' : 'Image Visible' });
    }
  };

  const handleUpdateCategory = async (id: string, newCat: string) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ category: newCat })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setImages(prev => prev.map(img => img.id === id ? { ...img, category: newCat } : img));
      toast({ title: 'Category updated' });
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Delete this image permanently?')) return;
    try {
      // Extract filename from URL and delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('gallery-images').remove([fileName]);

      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== id));
      toast({ title: 'Image deleted' });
    } catch (err: any) {
      toast({ title: 'Error deleting image', description: err.message, variant: 'destructive' });
    }
  };

  const displayed = filterCat === 'all' ? images : images.filter(img => img.category === filterCat);
  const catCounts = ['all', ...GALLERY_CATEGORIES.map(c => c.id)].reduce<Record<string,number>>((acc, cat) => {
    acc[cat] = cat === 'all' ? images.length : images.filter(i => i.category === cat).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{images.length} total images</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Images
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUpload} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">Upload Gallery Images</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gallery-files">Images * (multiple supported)</Label>
              <Input
                id="gallery-files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 10MB each</p>
            </div>
            <div>
              <Label htmlFor="gallery-cat">Category *</Label>
              <select
                id="gallery-cat"
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              >
                {GALLERY_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="gallery-title">Caption / Title (optional)</Label>
              <Input
                id="gallery-title"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="e.g. Pink Marble Gel Nails"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Applied to all selected images. You can rename individual images after upload.</p>
            </div>
          </div>

          {/* Image previews */}
          {uploadPreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{uploadPreviews.length} image(s) selected:</p>
              <div className="flex gap-2 flex-wrap">
                {uploadPreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i+1}`} className="w-20 h-20 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? 'Uploading...' : `Upload ${uploadFiles.length > 1 ? `${uploadFiles.length} Images` : 'Image'}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowUploadForm(false); setUploadPreviews([]); setUploadFiles([]); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            filterCat === 'all' ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({catCounts['all']})
        </button>
        {GALLERY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterCat === cat.id ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.emoji} {cat.label} ({catCounts[cat.id] || 0})
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="glass-card p-16 rounded-xl text-center">
          <Image className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-xl font-semibold mb-2">No Gallery Images Yet</p>
          <p className="text-muted-foreground mb-6">Upload beautiful nail art photos to showcase your work</p>
          <Button onClick={() => setShowUploadForm(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Upload First Images
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {displayed.map(img => {
            const catInfo = GALLERY_CATEGORIES.find(c => c.id === img.category);
            return (
              <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                img.is_active ? 'border-border' : 'border-red-200 opacity-60'
              }`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={img.image_url}
                    alt={img.title || img.category}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {/* Category selector */}
                  <select
                    value={img.category}
                    onChange={e => { e.stopPropagation(); handleUpdateCategory(img.id, e.target.value); }}
                    className="w-full text-xs rounded px-2 py-1 bg-white text-foreground border-0 font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    {GALLERY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>

                  <div className="flex gap-1.5 w-full">
                    <button
                      onClick={() => handleToggleActive(img.id, img.is_active)}
                      className={`flex-1 text-xs py-1.5 rounded font-semibold ${
                        img.is_active
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {img.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id, img.image_url)}
                      className="flex-1 text-xs py-1.5 rounded font-semibold bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                    {catInfo?.emoji} {catInfo?.label}
                  </span>
                </div>

                {/* Hidden badge */}
                {!img.is_active && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Hidden</span>
                  </div>
                )}

                {/* Title */}
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                    <p className="text-white text-xs font-medium truncate">{img.title}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onVerify, onReject, processing }: BookingCardProps) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{booking.service_name}</h3>
              <p className="text-sm text-muted-foreground">ID: {booking.booking_id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {booking.booking_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-semibold">{booking.customer_name}</p>
              <p className="text-muted-foreground">{booking.customer_phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-semibold">
                {new Date(booking.appointment_date).toLocaleDateString('en-IN')}
              </p>
              <p className="font-semibold">{booking.appointment_time}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Visit Type</p>
              <p className="font-semibold capitalize flex items-center gap-1">
                {booking.visit_type === 'home' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                {booking.visit_type}
              </p>
            </div>
            {booking.visit_type === 'home' && (
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-semibold">{booking.distance_km} km</p>
              </div>
            )}
          </div>

          {booking.visit_type === 'home' && booking.address && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Address:</p>
              <p className="text-sm font-semibold">{booking.address}</p>
            </div>
          )}

          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-bold text-lg">{formatINR(booking.total_price)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Advance Paid</p>
              <p className="font-semibold text-green-600">{formatINR(booking.advance_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold text-orange-600">{formatINR(booking.remaining_amount)}</p>
            </div>
          </div>
        </div>

        {booking.payment && (
          <div className="lg:w-80 border-l pl-6 space-y-4">
            <h4 className="font-semibold">Payment Proof</h4>
            
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono font-semibold">{booking.payment.upi_transaction_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={`font-semibold capitalize ${
                  booking.payment.payment_status === 'verified' ? 'text-green-600' :
                  booking.payment.payment_status === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {booking.payment.payment_status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Screenshot:</p>
              <a
                href={booking.payment.payment_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={booking.payment.payment_screenshot_url}
                  alt="Payment Screenshot"
                  className="w-full rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
              <a
                href={booking.payment.payment_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Open in new tab
              </a>
            </div>

            {onVerify && onReject && booking.payment.payment_status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onVerify(booking.id, booking.payment!.id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Verify
                </Button>
                <Button
                  onClick={() => onReject(booking.id, booking.payment!.id)}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}

            {booking.payment.rejection_reason && (
              <div className="p-3 bg-red-50 rounded-lg text-sm">
                <p className="font-semibold text-red-700 mb-1">Rejection Reason:</p>
                <p className="text-red-600">{booking.payment.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
