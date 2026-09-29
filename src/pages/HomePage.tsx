import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { supabase, Service } from '@/lib/supabase';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Award, IndianRupee, Star, MessageSquare, ArrowRight, Calendar, Clock, Shield } from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';
import { ReviewCard } from '@/components/features/ReviewCard';
import { ReelsSection } from '@/components/features/ReelsSection';
import { PromotionsSection } from '@/components/features/PromotionsSection';

const CATEGORIES = [
  { id: 'all', label: 'All Services', value: 'all' },
  { id: 'basic', label: 'Basic Nails', value: 'basic' },
  { id: 'premium', label: 'Premium Nails', value: 'premium' },
  { id: 'art', label: 'Nail Art', value: 'art' },
  { id: 'mehndi', label: 'Mehndi', value: 'mehndi' },
  { id: 'beauty', label: 'Beauty Parlour', value: 'beauty' },
];

interface Review {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
}

export function HomePage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Nails by Uma | Luxury Nail Salon – Professional Manicure & Best Nail Art',
    description:
      'Nails by Uma offers luxury nail salon services including professional manicure, pedicure, gel nails, best nail art, mehndi & bridal beauty packages. Book in-salon or home service today.',
    keywords:
      'luxury nail salon, professional manicure, best nail art, gel nails, pedicure, mehndi artist, bridal nail package, beauty parlour, home nail service, nail salon near me, acrylic nails',
    canonicalPath: '/',
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Parallax refs
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax scroll effect — video moves at 40% of scroll speed
  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!videoRef.current || !heroRef.current) return;
        const scrollY = window.scrollY;
        const heroH = heroRef.current.offsetHeight;
        if (scrollY <= heroH) {
          videoRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    fetchServices();
    fetchReviews();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section — Cinematic Video Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7)', willChange: 'transform', transform: 'translateY(0px)' }}
        >
          {/* Pexels free nail/beauty salon cinematic videos */}
          <source
            src="https://videos.pexels.com/video-files/3243090/3243090-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
          <source
            src="https://videos.pexels.com/video-files/5453056/5453056-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
          {/* Fallback static image if video fails */}
          <img
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920&h=1080&fit=crop&q=80"
            alt="Luxury Nail Salon"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Layered Dark Overlay — top darker, bottom lighter for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/60" />
        {/* Subtle warm pink tone overlay for brand colour */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-5 py-2.5 rounded-full mb-8 shadow-lg" role="note" aria-label="Premium nail care experience badge">
              <Sparkles className="w-4 h-4 text-pink-300" aria-hidden="true" />
              <span className="text-sm font-semibold text-white tracking-wide">Premium Nail Care Experience</span>
            </div>

            {/* H1 — Primary page heading, keyword-rich */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Nails by{' '}
              <span className="bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                Uma
              </span>
              {' '}—{' '}
              <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-white/90">
                Luxury Nail Salon &amp; Beauty Studio
              </span>
            </h1>

            {/* Sub-text / page descriptor */}
            <p className="text-base sm:text-lg lg:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Professional manicure, gel nails, nail art, mehndi &amp; bridal beauty packages —
              expert care in-salon or at your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => navigate('/book')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl h-14 px-8 text-base font-bold rounded-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/gallery')}
                className="border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-14 px-8 text-base font-semibold rounded-xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                View Gallery
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                  <Award className="w-4 h-4 text-pink-300" />
                </div>
                <span className="font-medium drop-shadow-sm">Certified Technicians</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                  <Heart className="w-4 h-4 text-pink-300" />
                </div>
                <span className="font-medium drop-shadow-sm">Premium Products</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                </div>
                <span className="font-medium drop-shadow-sm">4.9★ Rated</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                  <Shield className="w-4 h-4 text-pink-300" />
                </div>
                <span className="font-medium drop-shadow-sm">Home Service Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* Reels Section */}
      <ReelsSection />

      {/* Promotions Section */}
      <PromotionsSection />

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-muted/30" id="why-choose-us">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            {/* H2 — Section heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nails by Uma
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">Your trusted luxury nail salon &amp; beauty partner</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: 'Expert Team',
                description: '10+ years of experience with certified professionals',
              },
              {
                icon: Clock,
                title: 'Timely Service',
                description: 'On-time appointments and efficient service delivery',
              },
              {
                icon: Shield,
                title: 'Hygiene First',
                description: 'Sterilized tools and premium quality products',
              },
              {
                icon: Heart,
                title: 'Customer Care',
                description: 'Personalized attention and satisfaction guaranteed',
              },
            ].map((item, index) => (
              <div key={index} className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                {/* H3 — Feature title under Why Choose Us H2 */}
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20" id="services">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* H2 — Services section heading */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Nail &amp; Beauty Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our full range of professional manicure, gel nails, nail art, mehndi &amp; bridal beauty services — everyday grooming to grand bridal packages
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-secondary/50 gap-1">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.value}
                  className="text-xs sm:text-sm py-2 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="glass-card rounded-2xl overflow-hidden hover:shadow-lifted transition-all group cursor-pointer"
                  onClick={() => navigate('/book')}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={`${service.name} – professional nail service at Nails by Uma luxury nail salon`}
                      loading="lazy"
                      width="400"
                      height="192"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    {/* H3 — Individual service name under Our Services H2 */}
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                        <IndianRupee className="w-5 h-5" />
                        {service.price_inr}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {service.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4" aria-hidden="true">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">Customer Reviews</span>
              </div>
              {/* H2 — Reviews section */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Clients Say About Our Nail Salon</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real experiences from clients who trusted Nails by Uma for professional manicure, nail art &amp; beauty services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  customerName={review.customer_name}
                  serviceName={review.service_name || undefined}
                  rating={review.rating}
                  reviewText={review.review_text}
                  photoUrl={review.photo_url || undefined}
                  createdAt={review.created_at}
                />
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/reviews')}
                variant="outline"
                className="gap-2 group"
              >
                <MessageSquare className="w-4 h-4" />
                View All Reviews & Share Yours
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Happy Customers' },
              { value: '50+', label: 'Services Offered' },
              { value: '10+', label: 'Years Experience' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          {/* H2 — CTA section */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Book Your Luxury Nail Appointment Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experience professional manicure, gel nails &amp; nail art at our luxury nail salon — or book a home service
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = '/book')}
              className="bg-gradient-to-r from-primary to-accent text-white shadow-soft hover:shadow-lg transition-all"
            >
              <Calendar className="mr-2" />
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = '/packages')}
            >
              <Sparkles className="mr-2" />
              View Packages
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
