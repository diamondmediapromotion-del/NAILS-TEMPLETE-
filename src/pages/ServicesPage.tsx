import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Clock, IndianRupee, Sparkles, Home, ChevronRight, Loader2, Star, Calendar } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_inr: number;
  duration_minutes: number;
  image_url: string | null;
  is_premium: boolean;
  home_service_allowed: boolean;
}

interface CategoryMeta {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    id: 'basic',
    label: 'Basic Nail Services',
    emoji: '💅',
    description: 'Classic manicure & pedicure treatments for everyday nail care',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'premium',
    label: 'Premium Nail Treatments',
    emoji: '💎',
    description: 'Gel nails, acrylic extensions & long-lasting premium finishes',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'art',
    label: 'Nail Art & Designs',
    emoji: '🎨',
    description: 'Custom nail art, intricate designs & creative nail expressions',
    color: 'from-orange-400 to-pink-500',
  },
  {
    id: 'mehndi',
    label: 'Mehndi & Henna Art',
    emoji: '🌿',
    description: 'Traditional & modern mehndi designs for all occasions & bridal',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'beauty',
    label: 'Beauty Parlour Services',
    emoji: '✨',
    description: 'Facials, threading, waxing & complete beauty care treatments',
    color: 'from-amber-400 to-orange-500',
  },
];

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Inject per-service JSON-LD into <head> */
function injectServiceSchema(services: Service[]) {
  // Remove any existing service schema
  document.querySelectorAll('script[data-services-schema]').forEach(el => el.remove());

  if (!services.length) return;

  // ItemList schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Nail & Beauty Services at Nails by Uma',
    description: 'Complete list of professional nail salon services including manicure, gel nails, nail art, mehndi & beauty treatments',
    numberOfItems: services.length,
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        '@id': `https://nailsbyuma.onspace.app/services#${s.id}`,
        name: s.name,
        description: s.description || `Professional ${s.name} service at Nails by Uma luxury nail salon`,
        provider: {
          '@type': 'BeautySalon',
          name: 'Nails by Uma',
          url: 'https://nailsbyuma.onspace.app',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: s.price_inr,
          availability: 'https://schema.org/InStock',
          url: 'https://nailsbyuma.onspace.app/book',
        },
        serviceType: s.name,
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Duration',
            value: `${s.duration_minutes} minutes`,
          },
          {
            '@type': 'PropertyValue',
            name: 'Home Service',
            value: s.home_service_allowed ? 'Available' : 'In-salon only',
          },
        ],
      },
    })),
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-services-schema', 'true');
  script.textContent = JSON.stringify(itemListSchema);
  document.head.appendChild(script);
}

export default function ServicesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Professional Nail Services | Manicure, Gel Nails & Nail Art – Nails by Uma',
    description:
      'Explore our full range of professional nail services: classic manicure, gel nails, acrylic nails, nail art, mehndi designs & bridal beauty packages. In-salon & home service available. Book online today.',
    keywords:
      'professional manicure, gel nails, acrylic nails, nail art, mehndi designs, bridal nail package, pedicure, nail salon services, luxury nail care, nail services near me, nail art designs, gel nail art',
    canonicalPath: '/services',
    ogImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80',
  });

  // ── BreadcrumbList JSON-LD — Home > Services ─────────────────────
  useBreadcrumbSchema();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('price_inr', { ascending: true });

      if (error) throw error;
      const fetched = data || [];
      setServices(fetched);
      injectServiceSchema(fetched);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clean up JSON-LD on unmount
  useEffect(() => {
    return () => {
      document.querySelectorAll('script[data-services-schema]').forEach(el => el.remove());
    };
  }, []);

  // Intersection observer — highlight active category in sticky nav
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    CATEGORY_META.forEach(cat => {
      const el = categoryRefs.current[cat.id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCategory(cat.id);
        },
        { threshold: 0.3, rootMargin: '-100px 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [services]);

  const grouped = CATEGORY_META.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat.id] = services.filter(s => s.category === cat.id);
    return acc;
  }, {});

  const scrollToCategory = (catId: string) => {
    const el = categoryRefs.current[catId];
    if (!el) return;
    const offset = 140; // header + sticky nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const totalServices = services.length;
  const activeCategories = CATEGORY_META.filter(c => (grouped[c.id] || []).length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative py-20 px-4 overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" aria-hidden="true" />

        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6" aria-hidden="true">
            <Sparkles className="w-4 h-4" />
            {totalServices > 0 ? `${totalServices} Services Available` : 'Full Service Menu'}
          </div>

          {/* H1 — Primary page heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
            Professional Nail &amp;{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Beauty Services
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Luxury manicure, gel nails, nail art, mehndi &amp; full beauty care — crafted with expertise at our salon or delivered to your doorstep
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: '💅', label: 'Expert Nail Artists' },
              { icon: '🏠', label: 'Home Service Available' },
              { icon: '⭐', label: '4.9★ Rated Salon' },
              { icon: '📅', label: 'Easy Online Booking' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-white/70 border border-border/50 px-4 py-2 rounded-full shadow-sm">
                <span>{item.icon}</span>
                <span className="font-medium text-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Category Nav ───────────────────────────────────────── */}
      <div
        ref={navRef}
        className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
      >
        <div className="container mx-auto px-4">
          <nav
            className="flex gap-1 overflow-x-auto py-3 no-scrollbar"
            aria-label="Service categories"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              ✨ All Services
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {(grouped[cat.id] || []).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 py-12 pb-24">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">💅</div>
            <h2 className="text-2xl font-bold mb-2">Services Coming Soon</h2>
            <p className="text-muted-foreground mb-6">We're adding our complete service menu — check back shortly!</p>
            <Button onClick={() => navigate('/book')}>Book a Consultation</Button>
          </div>
        ) : (
          <div className="space-y-20">
            {activeCategories.map((cat, catIdx) => {
              const catServices = grouped[cat.id] || [];
              if (!catServices.length) return null;

              return (
                <section
                  key={cat.id}
                  id={`category-${cat.id}`}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  aria-labelledby={`cat-heading-${cat.id}`}
                >
                  {/* H2 — Category section heading */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow-sm`} aria-hidden="true">
                          {cat.emoji}
                        </div>
                        <h2
                          id={`cat-heading-${cat.id}`}
                          className="text-3xl md:text-4xl font-bold"
                        >
                          {cat.label}
                        </h2>
                      </div>
                      <p className="text-muted-foreground ml-[52px] text-base">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
                      <span className="text-sm text-muted-foreground">{catServices.length} services</span>
                      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${cat.color}`} />
                    </div>
                  </div>

                  {/* Service Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {catServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        catColor={cat.color}
                        onBook={() => navigate('/book')}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ────────────────────────────────────────────── */}
        {!loading && services.length > 0 && (
          <div className="mt-24 glass-card rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" aria-hidden="true" />
            <div className="relative">
              <div className="text-5xl mb-4" aria-hidden="true">💅</div>
              {/* H2 — CTA heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Your{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Perfect Service?
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Choose from {totalServices}+ professional nail &amp; beauty services — available in-salon or at your home
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/book')}
                  className="bg-gradient-to-r from-primary to-accent text-white px-10 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/packages')}
                  className="px-10 h-14 text-base font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Service Card Component ─────────────────────────────────────────────────
interface ServiceCardProps {
  service: Service;
  catColor: string;
  onBook: () => void;
}

function ServiceCard({ service, catColor, onBook }: ServiceCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = `https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=220&fit=crop&q=70&random=${service.id}`;

  return (
    <article
      className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      aria-label={`${service.name} — ₹${service.price_inr}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
        )}
        <img
          src={imgError ? fallbackImg : (service.image_url || fallbackImg)}
          alt={`${service.name} – professional nail service at Nails by Uma luxury salon`}
          loading="lazy"
          width="400"
          height="192"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Premium badge */}
        {service.is_premium && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-white" />
              Premium
            </span>
          </div>
        )}

        {/* Home service badge */}
        {service.home_service_allowed && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <Home className="w-3 h-3" />
              Home
            </span>
          </div>
        )}

        {/* Gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* H3 — Individual service name */}
        <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-primary transition-colors">
          {service.name}
        </h3>

        {service.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
            {service.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(service.duration_minutes)}</span>
          </div>
          {service.home_service_allowed && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Home className="w-3.5 h-3.5" />
              <span>Home service</span>
            </div>
          )}
        </div>

        {/* Price + CTA row */}
        <div className="flex items-center justify-between mt-auto">
          {/* Price — dominant visual element */}
          <div className="flex items-baseline gap-0.5">
            <IndianRupee className="w-4 h-4 text-primary mt-0.5" />
            <span className="text-2xl font-bold text-primary">{service.price_inr.toLocaleString('en-IN')}</span>
            <span className="text-xs text-muted-foreground ml-1 font-medium">onwards</span>
          </div>

          <Button
            size="sm"
            onClick={onBook}
            className={`bg-gradient-to-r ${catColor} text-white border-0 shadow-sm hover:shadow-md hover:scale-105 transition-all font-semibold px-4`}
          >
            Book
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div className={`h-0.5 bg-gradient-to-r ${catColor} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </article>
  );
}


