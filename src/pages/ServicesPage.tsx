import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { supabase } from '@/lib/supabase';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';
import { Button } from '@/components/ui/button';
import {
  Clock,
  IndianRupee,
  Sparkles,
  Home,
  ChevronRight,
  Star,
  Search,
  X,
  Palette,
  Heart,
  Gem,
  Flower2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ServiceImage } from '@/components/features/ServiceImage';
import { useServiceReviews } from '@/hooks/useServiceReviews';
import { ServiceReviewModal } from '@/components/features/ServiceReviewModal';

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
  group: 'all' | 'nails' | 'spa' | 'bridal' | 'beauty' | 'mehndi';
  emoji: string;
  description: string;
  color: string;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    id: 'manicure',
    label: 'Manicure',
    group: 'nails',
    emoji: '💅',
    description: 'Clean cuticle shaping, hand scrubbing massage, and nail care.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'pedicure',
    label: 'Pedicure',
    group: 'nails',
    emoji: '🦶',
    description: 'Relaxing foot bath, heel smoothing, scrub, and relaxing massage.',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'extensions',
    label: 'Nail Extensions',
    group: 'nails',
    emoji: '💎',
    description: 'Acrylic and gel nail extensions for long, beautiful nails.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'gel-nails',
    label: 'Gel Nails',
    group: 'nails',
    emoji: '✨',
    description: 'Shiny UV gel nail polish, natural nail overlay, and chip-free color.',
    color: 'from-fuchsia-500 to-rose-500',
  },
  {
    id: 'art',
    label: 'Nail Art',
    group: 'nails',
    emoji: '🎨',
    description: 'Custom hand-painted designs, 3D flowers, glitter, and stone work.',
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'chrome-french',
    label: 'French / Chrome / Glitter',
    group: 'nails',
    emoji: '🪞',
    description: 'Shining mirror chrome polish, French tips, and glitter shading.',
    color: 'from-indigo-400 to-pink-500',
  },
  {
    id: 'bridal',
    label: 'Bridal Nails',
    group: 'bridal',
    emoji: '👑',
    description: 'Bridal stone art, custom wedding nails, and full bridal beauty care.',
    color: 'from-rose-500 to-amber-500',
  },
  {
    id: 'mehndi',
    label: 'Mehndi & Henna',
    group: 'mehndi',
    emoji: '🌿',
    description: 'Intricate bridal, Arabic, and festival henna using 100% pure chemical-free organic dark-stain cones.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'beauty',
    label: 'Facial & Beauty',
    group: 'beauty',
    emoji: '🌸',
    description: '24K gold glow facials, hydra dermabrasion pore infusions, anti-tan cleanups, and glow therapy.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'spa',
    label: 'Spa Treatments',
    group: 'spa',
    emoji: '🫧',
    description: 'Lavender aromatherapeutic foot baths, crystalline jelly pedicures, and hot stone reflexology.',
    color: 'from-cyan-500 to-blue-500',
  },
];

const HIGH_LEVEL_GROUPS = [
  { id: 'all', label: 'All Services', icon: '✨' },
  { id: 'nails', label: 'Nails & Extensions', icon: '💅' },
  { id: 'spa', label: 'Spa Treatments', icon: '🫧' },
  { id: 'bridal', label: 'Bridal Nails', icon: '👑' },
  { id: 'mehndi', label: 'Mehndi & Henna', icon: '🌿' },
  { id: 'beauty', label: 'Facials & Beauty', icon: '🌸' },
];

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ServicesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Professional Nail & Beauty Services | Manicure, Gel Nails, 3D Art & Mehndi – Nails by Uma',
    description:
      'Explore luxury nail extensions, high-gloss gel manicures, 3D Swarovski nail art, bridal mehndi, and deluxe spa treatments at Nails by Uma in Jaipur. Book in-salon or doorstep home service today.',
    keywords:
      'manicure jaipur, pedicure jaipur, gel nails jaipur, nail extensions jaipur, nail art jaipur, chrome nails, bridal nail packages, mehndi artist jaipur, facial spa jaipur, nails by uma',
    canonicalPath: '/services',
    ogImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(5000);
  const [loading, setLoading] = useState(true);

  // Review & Rating Modal state
  const { getServiceRating, submitReview } = useServiceReviews();
  const [reviewModalService, setReviewModalService] = useState<Service | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenReview = (service: Service) => {
    setReviewModalService(service);
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price_inr', { ascending: true });

      let finalServices: Service[] = [];
      if (error || !data || data.length === 0) {
        // Fallback to rich initial dataset
        finalServices = INITIAL_SERVICES_DATA as Service[];
      } else {
        // Map database records and combine with rich catalog
        const combined = [...data];
        const existingIds = new Set(data.map((d: any) => d.id));
        INITIAL_SERVICES_DATA.forEach((s) => {
          if (!existingIds.has(s.id)) {
            combined.push(s as any);
          }
        });
        finalServices = combined as Service[];
      }

      setServices(finalServices);
      if (finalServices.length > 0) {
        const maxP = Math.max(...finalServices.map((s) => s.price_inr || 0));
        const ceilingMax = Math.max(Math.ceil(maxP / 500) * 500, 1000);
        setMaxPossiblePrice(ceilingMax);
        setMaxPriceFilter(ceilingMax);
      }
    } catch (err) {
      console.warn('Using local catalog for services:', err);
      const fallback = INITIAL_SERVICES_DATA as Service[];
      setServices(fallback);
      if (fallback.length > 0) {
        const maxP = Math.max(...fallback.map((s) => s.price_inr || 0));
        const ceilingMax = Math.max(Math.ceil(maxP / 500) * 500, 1000);
        setMaxPossiblePrice(ceilingMax);
        setMaxPriceFilter(ceilingMax);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter logic combining Group, Category tag, Budget & Search text
  const filteredServices = services.filter((s) => {
    // Filter by max price budget
    if (s.price_inr > maxPriceFilter) return false;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Filter by high level group
    if (selectedGroup !== 'all') {
      const matchingCats = CATEGORY_META.filter((c) => c.group === selectedGroup).map((c) => c.id);
      const isGroupMatch =
        matchingCats.includes(s.category) ||
        (selectedGroup === 'nails' &&
          ['basic', 'premium', 'art', 'extensions', 'gel-nails', 'manicure', 'pedicure', 'chrome-french'].includes(
            s.category
          )) ||
        (selectedGroup === 'spa' && ['spa', 'basic'].includes(s.category)) ||
        (selectedGroup === 'bridal' && ['bridal', 'art', 'mehndi'].includes(s.category)) ||
        (selectedGroup === 'mehndi' && ['mehndi'].includes(s.category)) ||
        (selectedGroup === 'beauty' && ['beauty', 'spa'].includes(s.category));

      if (!isGroupMatch) return false;
    }

    // Filter by deep specific category tag
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'manicure') {
        return s.id.includes('mani') || s.name.toLowerCase().includes('manicure');
      }
      if (selectedCategory === 'pedicure') {
        return s.id.includes('pedi') || s.name.toLowerCase().includes('pedicure');
      }
      if (selectedCategory === 'extensions') {
        return s.id.includes('extension') || s.name.toLowerCase().includes('extension') || s.category === 'art';
      }
      if (selectedCategory === 'gel-nails') {
        return s.id.includes('gel') || s.name.toLowerCase().includes('gel');
      }
      if (selectedCategory === 'chrome-french') {
        return (
          s.id.includes('french') ||
          s.id.includes('chrome') ||
          s.name.toLowerCase().includes('french') ||
          s.name.toLowerCase().includes('chrome')
        );
      }
      if (selectedCategory === 'bridal') {
        return s.category === 'bridal' || s.name.toLowerCase().includes('bridal');
      }
      if (selectedCategory === 'mehndi') {
        return s.category === 'mehndi' || s.name.toLowerCase().includes('mehndi') || s.name.toLowerCase().includes('henna');
      }
      if (selectedCategory === 'beauty') {
        return s.category === 'beauty' || s.name.toLowerCase().includes('facial');
      }
      if (selectedCategory === 'spa') {
        return s.category === 'spa' || s.name.toLowerCase().includes('spa');
      }
      if (selectedCategory === 'art') {
        return s.category === 'art' || s.name.toLowerCase().includes('art');
      }
      return s.category === selectedCategory;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-background to-muted/20 pb-24">
      {/* ── HERO BANNER WITH PROFESSIONAL SALON STUDIO IMAGE ───────── */}
      <section className="relative min-h-[440px] flex items-center justify-center overflow-hidden bg-slate-900 text-white py-16 px-4">
        {/* Background Studio Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1920&h=800&fit=crop&q=85"
            alt="Nails by Uma Luxury Studio"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-rose-950/60 to-slate-950/80" />
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-100 uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Full Nail &amp; Beauty Services Menu</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            Complete <br />
            <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              Nail &amp; Beauty Services
            </span>
          </h1>

          <p className="text-base sm:text-lg text-rose-100/90 max-w-2xl mx-auto leading-relaxed font-light">
            Get long-lasting gel manicures, custom 3D nail art, organic bridal mehndi, and relaxing foot spa care. Available in our salon or right at your doorstep in Jaipur.
          </p>

          {/* Search Input in Hero */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Gel Nails, 3D Art, Russian Manicure, Bridal Mehndi)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-white/40 bg-white/95 backdrop-blur-md text-slate-900 placeholder:text-slate-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERING SECTION WITH SMOOTH TRANSITIONS ────────────────── */}
      <section className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs py-3 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* 1. High-Level Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 sm:justify-center">
            {HIGH_LEVEL_GROUPS.map((group) => {
              const isActive = selectedGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setSelectedCategory('all');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm scale-105'
                      : 'bg-pink-50/70 text-slate-700 hover:bg-pink-100/70 hover:text-pink-600'
                  }`}
                >
                  <span>{group.icon}</span>
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Detailed Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 sm:justify-center border-t border-pink-100/60 mt-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {CATEGORY_META.filter((c) => selectedGroup === 'all' || c.group === selectedGroup).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Budget & Price Range Filter */}
          <div className="pt-2.5 border-t border-pink-100/60 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-pink-50/70 dark:bg-slate-800/70 p-2.5 rounded-2xl border border-pink-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-xl">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Filter by Price Range</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Services up to <strong className="text-pink-600 dark:text-pink-400 font-bold">₹{maxPriceFilter.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="flex-1 min-w-[200px] max-w-xs flex items-center gap-2.5">
                <span className="text-[11px] font-semibold text-slate-400">₹0</span>
                <input
                  type="range"
                  min={300}
                  max={maxPossiblePrice}
                  step={100}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer h-2 bg-pink-200 dark:bg-slate-700 rounded-lg"
                  aria-label="Filter services by maximum price range"
                />
                <span className="text-[11px] font-semibold text-slate-400">₹{maxPossiblePrice.toLocaleString('en-IN')}</span>
              </div>

              {/* Quick Budget Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMaxPriceFilter(maxPossiblePrice)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    maxPriceFilter >= maxPossiblePrice
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  All Prices
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPriceFilter(500)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    maxPriceFilter === 500
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  Under ₹500
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPriceFilter(1000)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    maxPriceFilter === 1000
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  Under ₹1,000
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPriceFilter(2000)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    maxPriceFilter === 2000
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  Under ₹2,000
                </button>
                <button
                  type="button"
                  onClick={() => setMaxPriceFilter(3500)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    maxPriceFilter === 3500
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 hover:bg-pink-100'
                  }`}
                >
                  Under ₹3,500
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN SERVICES GRID (GLASS CARDS) ─────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 pt-10">
        {/* Results Counter / Filter Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              {selectedGroup === 'all' && selectedCategory === 'all'
                ? 'Complete Service Collection'
                : selectedCategory !== 'all'
                ? CATEGORY_META.find((c) => c.id === selectedCategory)?.label || 'Filtered Treatments'
                : HIGH_LEVEL_GROUPS.find((g) => g.id === selectedGroup)?.label || 'Treatments'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing <strong>{filteredServices.length}</strong> luxurious treatments available for booking
            </p>
          </div>

          {(searchQuery || selectedGroup !== 'all' || selectedCategory !== 'all' || maxPriceFilter < maxPossiblePrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('all');
                setSelectedCategory('all');
                setMaxPriceFilter(maxPossiblePrice);
              }}
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-xl text-xs gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </Button>
          )}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-12 rounded-3xl text-center border border-pink-100 shadow-sm max-w-md mx-auto my-12"
          >
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4 text-pink-600">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">No Services Found</h3>
            <p className="text-sm text-slate-600 mb-6">
              We couldn't find any services matching &ldquo;{searchQuery}&rdquo;. Try another term or reset your filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('all');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-bold px-6"
            >
              Show All Services
            </Button>
          </motion.div>
        ) : (
          /* Glass Cards Grid with Micro-Interactions & Framer Motion Stagger */
          <motion.div
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06 },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => {
                const rating = getServiceRating(service.id);
                const catMeta = CATEGORY_META.find((c) => c.id === service.category);
                const catColor = catMeta ? catMeta.color : 'from-pink-500 to-rose-500';

                return (
                  <motion.article
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="glass-card rounded-3xl overflow-hidden border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group bg-white/75 backdrop-blur-md"
                  >
                    <div>
                      {/* Visual Cover Photo with Overlay Badges */}
                      <div className="relative h-56 w-full overflow-hidden bg-pink-50">
                        <ServiceImage
                          src={service.image_url}
                          alt={`${service.name} at Nails by Uma Jaipur`}
                          category={service.category}
                          serviceTitle={service.name}
                          aspectRatio="16:9"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* Premium Badge */}
                        {service.is_premium && (
                          <div className="absolute top-3 left-3">
                            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              Special Studio
                            </span>
                          </div>
                        )}

                        {/* Home Service Badge */}
                        {service.home_service_allowed && (
                          <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                              <Home className="w-3 h-3 text-pink-600" />
                              Home Service
                            </span>
                          </div>
                        )}

                        {/* Rating Overlay Pill */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReview(service);
                          }}
                          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm hover:scale-105 transition-all"
                          title="View ratings & reviews"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rating.averageRating}</span>
                          <span className="text-[10px] text-pink-200">({rating.reviewCount})</span>
                        </button>

                        {/* Duration Overlay Pill */}
                        <div className="absolute bottom-3 right-3">
                          <span className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-white/20">
                            <Clock className="w-3 h-3 text-pink-400" />
                            <span>Est. {formatDuration(service.duration_minutes)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-2 text-xs mb-3">
                          <span className="inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold px-2.5 py-1 rounded-lg text-xs border border-pink-100 dark:border-pink-900/50">
                            <Clock className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                            <span>Est. Time: {formatDuration(service.duration_minutes)}</span>
                          </span>
                          <span className="capitalize text-pink-600 font-bold bg-pink-50/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] border border-pink-100/60 shrink-0">
                            {catMeta?.label || service.category}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-pink-600 transition-colors">
                          {service.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                          {service.description ||
                            `Custom ${service.name} performed with clean, safe tools and quality products.`}
                        </p>
                      </div>
                    </div>

                    {/* Card Bottom CTA & Price */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-pink-100/60 mt-auto">
                      <div className="flex items-center justify-between pt-4">
                        {/* Price in INR */}
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                            Starting at
                          </span>
                          <div className="flex items-baseline text-2xl font-extrabold text-slate-900">
                            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-serif">
                              ₹{service.price_inr.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: View Details & Book */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/services/${service.id}`)}
                            className="border-pink-200 hover:bg-pink-50 text-slate-800 text-xs px-3 h-9 rounded-xl font-semibold transition-colors"
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/book?service=${service.id}`)}
                            className={`bg-gradient-to-r ${catColor} text-white border-0 shadow-sm hover:shadow-md hover:scale-105 transition-all font-bold px-4 h-9 rounded-xl`}
                          >
                            Book Now
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ── TRUST & HYGIENE BANNER ───────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 mt-20">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/90 shadow-md bg-gradient-to-r from-white via-pink-50/40 to-amber-50/30">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Autoclave Sterilization</h4>
                <p className="text-xs text-slate-600 mt-0.5">Hospital-grade sanitized implements for 100% safety.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Certified Non-Toxic Gels</h4>
                <p className="text-xs text-slate-600 mt-0.5">Long-wear European formulas safe for natural nails.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Doorstep Home Service</h4>
                <p className="text-xs text-slate-600 mt-0.5">Mobile salon setup available across Jaipur city.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review & Rating Modal */}
      {reviewModalService && (
        <ServiceReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          serviceId={reviewModalService.id}
          serviceName={reviewModalService.name}
          serviceImage={reviewModalService.image_url}
          onSubmitReview={submitReview}
        />
      )}
    </div>
  );
}
