import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Building2, User, Eye, EyeOff } from 'lucide-react';

export function AdminSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<'shop_owner' | 'customer'>(
    roleParam === 'customer' ? 'customer' : 'shop_owner'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: 'Admin',
    phone: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase (with email confirmation disabled)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin + (selectedRole === 'shop_owner' ? '/admin/dashboard' : '/my-bookings'),
          data: {
            username: formData.username,
            full_name: formData.username,
            phone: formData.phone,
            role: selectedRole,
            referred_by: referralCode.trim() || null,
          },
        },
      });

      console.log('Signup response:', { data, error });

      if (error) throw error;

      if (data.user) {
        const cleanSlug = formData.username.toLowerCase().replace(/[^a-z0-9]/g, '') || `site_${Date.now()}`;
        const generatedReferralCode = formData.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) + Math.floor(100 + Math.random() * 900);
        
        // 1. Create Profile
        const newProfile = {
          id: data.user.id,
          user_id: data.user.id,
          full_name: formData.username,
          email: formData.email,
          phone: formData.phone,
          role: selectedRole,
          referral_code: generatedReferralCode,
          referred_by: referralCode.trim() || null,
        };
        await supabase.from('profiles').insert(newProfile);

        // 2. Create Website / Tenant Config (ONLY FOR SHOP OWNERS)
        if (selectedRole === 'shop_owner') {
          const newWebsite = {
            id: cleanSlug,
            owner_id: data.user.id,
            site_name: formData.username,
            business_name: `${formData.username} Salon`,
            slug: cleanSlug,
            subdomain: cleanSlug,
            logo_url: '',
            favicon_url: '',
            published: true,
          };
          await supabase.from('websites').insert(newWebsite);

          // Also register inside our tenants list
          const newTenantConfig = {
            id: cleanSlug,
            business_name: `${formData.username} Salon`,
            tagline: 'Luxury Salon Studio & Custom Embellishments',
            logo_url: '',
            banner_image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=600&fit=crop&q=80',
            address: 'Jaipur, Rajasthan',
            phone: formData.phone || '+91 99999 99999',
            whatsapp: formData.phone || '+919999999999',
            email: formData.email,
            facebook_url: '',
            instagram_url: '',
            about_heading: 'Crafting Artistry',
            about_text: 'Bespoke hand-crafted nail extensions and deluxe spa treatments.',
            about_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=80',
            timings: 'Monday - Sunday: 10:00 AM - 8:00 PM',
            seo_title: `${formData.username} Salon | Premium Nail Studio`,
            seo_description: `Professional treatments at ${formData.username} Salon.`,
            seo_keywords: 'nail art, salon',
            theme_color: 'pink' as const,
            is_published: true,
          };
          await supabase.from('tenants').insert(newTenantConfig);

          // Set the active tenant locally for instant preview routing
          localStorage.setItem('current_tenant_preview', cleanSlug);
        }

        // User account created, auto-login directly
        toast.success(
          selectedRole === 'shop_owner'
            ? 'Partner store account and custom site created successfully!'
            : 'Customer account created successfully!'
        );
        
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        // Wait a moment for auth state to update
        setTimeout(() => {
          if (selectedRole === 'shop_owner') {
            navigate('/admin/dashboard?tab=template');
          } else {
            navigate('/my-bookings');
          }
        }, 500);
      } else {
        toast.success('Account created! You can now login.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to complete registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="group bg-white/75 backdrop-blur-xl border border-white/60 rounded-3xl shadow-glass p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-white/90">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:shadow-md cursor-pointer">
              <UserPlus className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-105" />
            </div>
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Select your role below to get started
            </p>
          </div>

          {/* ── ROLE SELECTOR TOGGLE WIDGET ── */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('shop_owner')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'shop_owner'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Shop Owner
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'customer'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              End Client
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-xs font-bold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. partner@nailsbyuma.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-xs font-bold">
                {selectedRole === 'shop_owner' ? 'Salon / Shop Name' : 'Full Name'}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={selectedRole === 'shop_owner' ? 'e.g. Royal Nails' : 'e.g. Pooja Sharma'}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-xs font-bold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +91 98290 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-xs font-bold">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  className="text-xs h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-xs font-bold">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                  className="text-xs h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <Label htmlFor="referralCode" className="text-xs font-bold">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                placeholder="e.g. UMA500, PROMO20"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-11 rounded-xl text-xs font-bold mt-2"
              disabled={loading}
            >
              {loading
                ? 'Registering User...'
                : selectedRole === 'shop_owner'
                ? 'Register & Set Up Salon'
                : 'Create Client Account'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
