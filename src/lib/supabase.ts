import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface Service {
  id: string;
  category: 'basic' | 'premium' | 'art' | 'bridal' | 'mehndi' | 'beauty';
  name: string;
  description: string;
  price_inr: number;
  duration_minutes: number;
  image_url: string;
  is_active: boolean;
  is_premium?: boolean;
  home_service_allowed?: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_id: string;
  service_name: string;
  category: string;
  visit_type: 'salon' | 'home';
  address?: string;
  distance_km?: number;
  home_service_charge: number;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  advance_amount: number;
  remaining_amount: number;
  booking_status: 'pending_verification' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  technician_id?: string | null;
  technician_name?: string | null;
  coupon_code?: string | null;
  coupon_discount?: number | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  upi_transaction_id: string;
  payment_screenshot_url: string;
  amount: number;
  payment_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

// Initial seed data when working in local preview without Supabase credentials
const INITIAL_SERVICES: Service[] = [
  {
    id: 'classic-mani',
    name: 'Classic Manicure',
    category: 'basic',
    description: 'Essential nail care with shaping, cuticle treatment, and premium polish.',
    price_inr: 499,
    duration_minutes: 45,
    image_url: 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'classic-pedi',
    name: 'Classic Pedicure',
    category: 'basic',
    description: 'Relaxing foot soak, gentle exfoliation, massage, and nail shaping.',
    price_inr: 699,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1629198735700-610c0e49aab2?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gel-mani',
    name: 'Gel Manicure',
    category: 'premium',
    description: 'Long-lasting high-gloss gel polish cured with UV lamp, lasts up to 3 weeks.',
    price_inr: 899,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gel-pedi',
    name: 'Gel Pedicure Deluxe',
    category: 'premium',
    description: 'Luxury foot spa treatment with chip-free gel polish for long-lasting glamour.',
    price_inr: 1099,
    duration_minutes: 75,
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'french-mani',
    name: 'French Manicure & Tips',
    category: 'premium',
    description: 'Timeless French manicure with clean natural pink base and crisp white smile lines.',
    price_inr: 799,
    duration_minutes: 50,
    image_url: 'https://images.unsplash.com/photo-1606789674925-58a94bf6d1e8?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'nail-art-simple',
    name: 'Accent Nail Art (2-4 Nails)',
    category: 'art',
    description: 'Hand-painted designs, chrome powder, foil, or crystals on accent nails.',
    price_inr: 649,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'nail-art-complex',
    name: 'Full Set 3D Nail Art & Extensions',
    category: 'art',
    description: 'Full acrylic/gel extensions with intricate 3D hand art, pearls, and rhinestones.',
    price_inr: 1599,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mehndi-bridal',
    name: 'Bridal Henna & Mehndi Design',
    category: 'mehndi',
    description: 'Full bridal arms and feet ornate mehndi using 100% organic dark-stain henna cone.',
    price_inr: 3499,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bridal-package',
    name: 'Complete Bridal Glow Package',
    category: 'bridal',
    description: 'Gel nail extensions, custom bridal nail art, luxury pedicure, and relaxing hand spa.',
    price_inr: 4999,
    duration_minutes: 240,
    image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'facial-glow',
    name: 'Gold Glow Facial & Clean-up',
    category: 'beauty',
    description: 'Deep pore cleansing, skin rejuvenating fruit peel, gold mask, and face massage.',
    price_inr: 1299,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    customer_name: 'Priya Sharma',
    service_name: 'Gel Nail Art',
    rating: 5,
    review_text: 'Uma did an exceptional job on my nails! The finish was super smooth and lasted over 3 weeks without a single chip. Highly recommend!',
    photo_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=600&fit=crop&q=80',
    is_approved: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-2',
    customer_name: 'Sneha Patel',
    service_name: 'Bridal Nail Package',
    rating: 5,
    review_text: 'Booked home service for my sangeet and wedding. The team was punctual, courteous, and made my hands look royal.',
    photo_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&h=600&fit=crop&q=80',
    is_approved: true,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    customer_name: 'Ritu Kapoor',
    service_name: 'Classic Pedicure',
    rating: 5,
    review_text: 'The best foot spa experience I have had in a long time. Very clean environment and hygienic tools used.',
    photo_url: null,
    is_approved: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_TECHNICIANS = [
  {
    id: 'tech-1',
    name: 'Uma Sharma',
    specialty: 'Master Nail Artist & Mehndi Specialist',
    rating: 4.9,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'tech-2',
    name: 'Pooja Verma',
    specialty: 'Gel Extensions & Nail Art',
    rating: 4.8,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'tech-3',
    name: 'Ananya Roy',
    specialty: 'Spa & Bridal Nail Expert',
    rating: 4.9,
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&q=80',
    is_active: true,
  },
];

const INITIAL_PROMOTIONS = [
  {
    id: 'promo-1',
    title: 'Festive Season Glam Offer',
    description: 'Get 20% off on all Nail Art & Gel services when you book online!',
    discount_percentage: 20,
    discount_amount: null,
    code: 'GLAM20',
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
    terms_conditions: 'Valid on orders above ₹899.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'promo-2',
    title: 'Bridal Booking Special',
    description: 'Flat ₹500 instant discount on complete bridal nail and beauty packages.',
    discount_percentage: null,
    discount_amount: 500,
    code: 'BRIDAL500',
    image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 60 * 86400000).toISOString(),
    terms_conditions: 'Valid once per customer on bridal bookings.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_COUPONS = [
  {
    id: 'c-1',
    code: 'GLAM20',
    coupon_code: 'GLAM20',
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true,
  },
  {
    id: 'c-2',
    code: 'BRIDAL500',
    coupon_code: 'BRIDAL500',
    discount_type: 'fixed',
    discount_value: 500,
    is_active: true,
  },
];

const INITIAL_REELS = [
  {
    id: 'reel-1',
    title: 'Rose Gold Chrome Nails',
    description: 'Watch the transformation from bare nails to stunning mirror chrome finish.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=600&h=800&fit=crop&q=80',
    category: 'art',
    is_active: true,
    likes_count: 248,
    comments_count: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: 'reel-2',
    title: 'Bridal French Ombre',
    description: 'Soft baby boomer french gradient with micro glitter accents.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1606789674925-58a94bf6d1e8?w=600&h=800&fit=crop&q=80',
    category: 'bridal',
    is_active: true,
    likes_count: 312,
    comments_count: 24,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_HOME_SERVICE_CHARGES = [
  { id: 'hsc-1', min_km: 0, max_km: 5, charge_inr: 150, is_active: true, created_at: new Date().toISOString() },
  { id: 'hsc-2', min_km: 5, max_km: 10, charge_inr: 300, is_active: true, created_at: new Date().toISOString() },
  { id: 'hsc-3', min_km: 10, max_km: 15, charge_inr: 500, is_active: true, created_at: new Date().toISOString() },
];

function getStoredTable<T>(key: string, initial: T[]): T[] {
  try {
    const raw = localStorage.getItem(`luxenails_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return initial;
}

function setStoredTable<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(`luxenails_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// In-memory mock database with LocalStorage persistence
const mockTables: Record<string, any[]> = {
  services: getStoredTable('services', INITIAL_SERVICES),
  customer_reviews: getStoredTable('customer_reviews', INITIAL_REVIEWS),
  reviews: getStoredTable('customer_reviews', INITIAL_REVIEWS),
  technicians: getStoredTable('technicians', INITIAL_TECHNICIANS),
  promotions: getStoredTable('promotions', INITIAL_PROMOTIONS),
  coupons: getStoredTable('coupons', INITIAL_COUPONS),
  reels: getStoredTable('reels', INITIAL_REELS),
  bookings: getStoredTable('bookings', []),
  payments: getStoredTable('payments', []),
  home_service_charges: getStoredTable('home_service_charges', INITIAL_HOME_SERVICE_CHARGES),
  whatsapp_leads: getStoredTable('whatsapp_leads', []),
  gallery_images: getStoredTable('gallery_images', []),
  categories: getStoredTable('categories', [
    { id: 'basic', name: 'Basic Nails', is_active: true },
    { id: 'premium', name: 'Premium Nails', is_active: true },
    { id: 'art', name: 'Nail Art', is_active: true },
    { id: 'mehndi', name: 'Mehndi', is_active: true },
    { id: 'beauty', name: 'Beauty Care', is_active: true },
  ]),
};

function createMockQueryBuilder(tableName: string) {
  let tableData = [...(mockTables[tableName] || [])];
  let isSingle = false;

  const builder: any = {
    select: (_fields?: string) => builder,
    eq: (col: string, val: any) => {
      tableData = tableData.filter((row) => String(row[col]) === String(val));
      return builder;
    },
    neq: (col: string, val: any) => {
      tableData = tableData.filter((row) => String(row[col]) !== String(val));
      return builder;
    },
    or: (_conditions: string) => builder,
    order: (col: string, opts?: { ascending?: boolean }) => {
      const asc = opts?.ascending !== false;
      tableData.sort((a, b) => {
        if (a[col] < b[col]) return asc ? -1 : 1;
        if (a[col] > b[col]) return asc ? 1 : -1;
        return 0;
      });
      return builder;
    },
    limit: (count: number) => {
      tableData = tableData.slice(0, count);
      return builder;
    },
    single: () => {
      isSingle = true;
      return builder;
    },
    maybeSingle: () => {
      isSingle = true;
      return builder;
    },
    insert: (rowOrRows: any) => {
      const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
      const inserted = rows.map((r) => ({
        id: r.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        created_at: r.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
      }));
      mockTables[tableName] = [...(mockTables[tableName] || []), ...inserted];
      setStoredTable(tableName, mockTables[tableName]);
      tableData = inserted;
      return builder;
    },
    update: (updates: any) => {
      mockTables[tableName] = (mockTables[tableName] || []).map((row) => {
        const matches = tableData.some((t) => t.id === row.id);
        if (matches) {
          return { ...row, ...updates, updated_at: new Date().toISOString() };
        }
        return row;
      });
      setStoredTable(tableName, mockTables[tableName]);
      tableData = tableData.map((r) => ({ ...r, ...updates }));
      return builder;
    },
    delete: () => {
      const idsToDelete = new Set(tableData.map((r) => r.id));
      mockTables[tableName] = (mockTables[tableName] || []).filter((r) => !idsToDelete.has(r.id));
      setStoredTable(tableName, mockTables[tableName]);
      return builder;
    },
    then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
      try {
        const result = isSingle ? tableData[0] || null : tableData;
        return Promise.resolve({ data: result, error: null }).then(resolve, reject);
      } catch (err) {
        return Promise.resolve({ data: null, error: err }).then(resolve, reject);
      }
    },
  };

  return builder;
}

function createMockClient() {
  const authListeners: Array<(event: string, session: any) => void> = [];

  const currentUser = {
    id: 'admin_preview_user',
    email: 'admin@nailsbyuma.com',
    app_metadata: {},
    user_metadata: { role: 'admin', name: 'Uma Admin' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  return {
    from: (table: string) => createMockQueryBuilder(table),
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: currentUser,
            access_token: 'mock_token',
          },
        },
        error: null,
      }),
      onAuthStateChange: (cb: (event: string, session: any) => void) => {
        authListeners.push(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = authListeners.indexOf(cb);
                if (idx !== -1) authListeners.splice(idx, 1);
              },
            },
          },
        };
      },
      signInWithPassword: async ({ email }: { email: string; password?: string }) => {
        const session = {
          user: { ...currentUser, email: email || currentUser.email },
          access_token: 'mock_token',
        };
        authListeners.forEach((cb) => cb('SIGNED_IN', session));
        return { data: { session, user: session.user }, error: null };
      },
      signUp: async ({ email }: { email: string; password?: string }) => {
        const session = {
          user: { ...currentUser, email: email || currentUser.email },
          access_token: 'mock_token',
        };
        authListeners.forEach((cb) => cb('SIGNED_IN', session));
        return { data: { session, user: session.user }, error: null };
      },
      signOut: async () => {
        authListeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      },
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string, file: any) => {
          let url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80';
          if (typeof URL !== 'undefined' && file instanceof Blob) {
            url = URL.createObjectURL(file);
          }
          return { data: { path: url }, error: null };
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: path || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80' },
        }),
      }),
    },
    functions: {
      invoke: async (name: string, _options?: any) => {
        return {
          data: { success: true, sent: true, emailSent: true, function: name },
          error: null,
        };
      },
    },
  } as any;
}

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10
);

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient();
