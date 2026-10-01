import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSubdomainUrl } from '@/utils/tenant';

export interface TenantConfig {
  id: string; // unique subdomain/slug e.g. 'nailsbyuma', 'royalnails', 'glamstudio'
  business_name: string;
  tagline: string;
  logo_url: string;
  banner_image_url: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  about_heading: string;
  about_text: string;
  about_image_url: string;
  timings: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  theme_color: 'pink' | 'purple' | 'amber' | 'rose' | 'emerald';
  is_published: boolean;
  custom_domain?: string;
  domain_status?: 'pending' | 'verified' | 'failed';
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_TENANTS: Record<string, TenantConfig> = {
  nailsbyuma: {
    id: 'nailsbyuma',
    business_name: 'Nails by Uma',
    tagline: 'Beautiful Nails & Friendly Beauty Care',
    logo_url: '/src/assets/logo.png',
    banner_image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1920&h=800&fit=crop&q=85',
    address: 'Plot 31, Sector 5, Mansarovar, Jaipur, Rajasthan 302020',
    phone: '+91 63765 39366',
    whatsapp: '+916376539366',
    email: 'info@nailsbyuma.in',
    facebook_url: 'https://facebook.com/nailsbyuma',
    instagram_url: 'https://instagram.com/nailsbyuma',
    about_heading: 'Crafting Artistry, Preserving Elegance',
    about_text: 'At Nails by Uma, we believe that nail styling is not just a service—it is an act of artistic expression. Founded in Jaipur, we specialize in high-precision manicures, bespoke bridal art, and certified organic beauty therapies designed to leave you feeling and looking gorgeous.',
    about_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=80',
    timings: 'Monday - Sunday: 10:00 AM - 8:00 PM',
    seo_title: 'Nails by Uma | Luxury Nail Salon – Professional Manicure & Best Nail Art',
    seo_description: 'Nails by Uma offers luxury nail salon services including professional manicure, pedicure, gel nails, best nail art, mehndi & bridal beauty packages in Jaipur.',
    seo_keywords: 'luxury nail salon, professional manicure, best nail art, gel nails, pedicure, mehndi artist, bridal nail package',
    theme_color: 'pink',
    is_published: true,
  },
  royalbeauty: {
    id: 'royalbeauty',
    business_name: 'Royal Beauty & Nails',
    tagline: 'Where Royalty Meets Exquisite Nail Art',
    logo_url: '',
    banner_image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1200&h=600&fit=crop&q=80',
    address: 'Sunder Lane, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    email: 'hello@royalbeauty.in',
    facebook_url: 'https://facebook.com/royalbeauty',
    instagram_url: 'https://instagram.com/royalbeauty',
    about_heading: 'Our Royal Beauty Commitment',
    about_text: 'Experience the ultimate royal treatment. Our team of certified expert stylists and nail artists deliver customized, high-luxury nail extensions, Swarovski embellishments, and anti-tan therapies designed for the modern queen.',
    about_image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=1000&fit=crop&q=80',
    timings: 'Monday - Sunday: 11:00 AM - 9:00 PM',
    seo_title: 'Royal Beauty & Nails | Premium Nail Studio & Facials',
    seo_description: 'Unleash your inner royalty. High-precision extensions, luxury facials, and bridal nail packages at Royal Beauty Jaipur.',
    seo_keywords: 'luxury beauty parlor, nail art, extensions, facials',
    theme_color: 'purple',
    is_published: true,
  },
};

interface TenantContextType {
  tenant: TenantConfig;
  allTenants: TenantConfig[];
  isLoading: boolean;
  isPlatformAdmin: boolean;
  currentTenantId: string;
  createTenant: (config: Omit<TenantConfig, 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTenantConfig: (updates: Partial<TenantConfig>) => Promise<boolean>;
  switchTenant: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function getActiveTenantId(): string {
  if (typeof window === 'undefined') return 'nailsbyuma';

  // 1. Path-based /site/{slug} fallback
  const pathname = window.location.pathname;
  if (pathname.startsWith('/site/')) {
    const slug = pathname.split('/site/')[1]?.split('/')[0];
    if (slug) {
      const cleanSlug = slug.toLowerCase();
      localStorage.setItem('current_tenant_preview', cleanSlug);
      return cleanSlug;
    }
  }

  // 2. Check Subdomains (e.g. royalbeauty.localhost or royalbeauty.platform.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 1) {
    const subdomain = parts[0].toLowerCase();
    const reservedWords = ['localhost', 'ais-dev', 'ais-pre', 'www', 'platform', 'app', 'admin', 'api'];
    if (!reservedWords.includes(subdomain) && !subdomain.startsWith('127') && !subdomain.startsWith('192')) {
      return subdomain;
    }
  }

  // 3. Check Query Parameter (e.g. ?tenant=royalbeauty)
  const params = new URLSearchParams(window.location.search);
  const queryTenant = params.get('tenant');
  if (queryTenant) return queryTenant.toLowerCase();

  // 4. Check Preview Cookie / LocalStorage Fallback
  const previewTenant = localStorage.getItem('current_tenant_preview');
  if (previewTenant) return previewTenant.toLowerCase();

  return 'nailsbyuma';
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string>('nailsbyuma');
  const [tenant, setTenant] = useState<TenantConfig>(DEFAULT_TENANTS.nailsbyuma);
  const [allTenants, setAllTenants] = useState<TenantConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all registered tenants from Supabase/LocalStorage
  useEffect(() => {
    loadTenants();
  }, [tenantId]);

  const loadTenants = async () => {
    setIsLoading(true);
    const activeId = getActiveTenantId();
    setTenantId(activeId);

    try {
      const { data, error } = await supabase.from('tenants').select('*');

      let tenantsList: TenantConfig[] = [];
      if (error || !data || data.length === 0) {
        // Fallback to initial seeds stored in localStorage
        const localTenantsRaw = localStorage.getItem('luxenails_tenants');
        if (localTenantsRaw) {
          tenantsList = JSON.parse(localTenantsRaw);
        } else {
          tenantsList = Object.values(DEFAULT_TENANTS);
          localStorage.setItem('luxenails_tenants', JSON.stringify(tenantsList));
        }
      } else {
        tenantsList = data as TenantConfig[];
      }

      setAllTenants(tenantsList);

      const activeTenant = tenantsList.find((t) => t.id === activeId) || tenantsList.find((t) => t.id === 'nailsbyuma') || DEFAULT_TENANTS.nailsbyuma;
      setTenant(activeTenant);
    } catch (err) {
      console.warn('Using fallback configuration for tenants:', err);
      setTenant(DEFAULT_TENANTS.nailsbyuma);
    } finally {
      setIsLoading(false);
    }
  };

  const createTenant = async (config: Omit<TenantConfig, 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tenants').insert(config);

      if (error) {
        // Mock client fallback
        const current = JSON.parse(localStorage.getItem('luxenails_tenants') || '[]');
        if (current.some((t: any) => t.id === config.id)) {
          return false; // already exists
        }
        const updated = [...current, { ...config, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
        localStorage.setItem('luxenails_tenants', JSON.stringify(updated));
      }

      // Seed default initial services for the new tenant
      const defaultServices = [
        {
          name: 'Classic Gel Manicure',
          category: 'basic',
          description: 'Cuticle trimming, shaping, and application of high gloss long wear gel polish.',
          price_inr: 599,
          duration_minutes: 45,
          image_url: 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80',
          is_active: true,
          is_premium: false,
          home_service_allowed: true,
          tenant_id: config.id,
        },
        {
          name: 'Luxury Acrylic Extensions',
          category: 'extensions',
          description: 'Bespoke full set acrylic length extensions with beautiful gel polish overlay.',
          price_inr: 1499,
          duration_minutes: 90,
          image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
          is_active: true,
          is_premium: true,
          home_service_allowed: true,
          tenant_id: config.id,
        },
        {
          name: '3D Designer Swarovski Art',
          category: 'art',
          description: 'Hand-painted lines, marble textures, Chrome finish, and crystals embellishment.',
          price_inr: 999,
          duration_minutes: 60,
          image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80',
          is_active: true,
          is_premium: true,
          home_service_allowed: false,
          tenant_id: config.id,
        }
      ];
      await supabase.from('services').insert(defaultServices);

      await loadTenants();
      return true;
    } catch {
      return false;
    }
  };

  const updateTenantConfig = async (updates: Partial<TenantConfig>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tenants').update(updates).eq('id', tenant.id);

      if (error) {
        // Mock client fallback
        const current = JSON.parse(localStorage.getItem('luxenails_tenants') || '[]');
        const updated = current.map((t: any) => (t.id === tenant.id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
        localStorage.setItem('luxenails_tenants', JSON.stringify(updated));
      }
      await loadTenants();
      return true;
    } catch {
      return false;
    }
  };

  const switchTenant = (id: string) => {
    localStorage.setItem('current_tenant_preview', id);
    setTenantId(id);
    window.location.reload();
  };

  // ── PREMIUM Fallback & Offline State Rendering ──
  const isPublicRoute = !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/booking-status');
  const activeId = getActiveTenantId();
  const exists = allTenants.some((t) => t.id === activeId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-pink-100 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-serif font-bold tracking-widest uppercase mt-4 animate-pulse">Loading Salon Portfolio...</p>
      </div>
    );
  }

  if (isPublicRoute && activeId !== 'nailsbyuma') {
    if (!exists) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-slate-800">
          <span className="text-4xl">🔍</span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-4">Website Not Found</h1>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            The subdomain you are trying to reach does not correspond to an active salon website in our multi-tenant network.
          </p>
          <a href="/admin/signup" className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md">
            Create Your Own Salon Website
          </a>
        </div>
      );
    }

    if (!tenant.is_published) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-slate-800">
          <span className="text-4xl">🔒</span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-4">This Website is Currently Offline</h1>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            The website owner has saved their changes in draft mode and has not published their site live yet. Please check back later.
          </p>
          <a href="/admin/login" className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
            Login as Owner to Publish
          </a>
        </div>
      );
    }
  }

  return (
    <TenantContext.Provider
      value={{
        tenant,
        allTenants,
        isLoading,
        isPlatformAdmin: tenant.id === 'nailsbyuma',
        currentTenantId: tenantId,
        createTenant,
        updateTenantConfig,
        switchTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
