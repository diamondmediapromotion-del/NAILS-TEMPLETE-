import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'receptionist';
  roleTitle: string;
  branch: string;
}

export type UserRole = 'customer' | 'shop_owner' | 'admin' | 'owner' | 'manager' | 'receptionist';

interface AuthContextType {
  user: User | DemoUser | null;
  demoUser: DemoUser | null;
  profile: any | null;
  role: UserRole;
  selectedBranch: 'all' | 'mansarovar' | 'doorstep';
  loading: boolean;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isShopOwner: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loginAsDemoRole: (role: 'owner' | 'manager' | 'receptionist') => void;
  setSelectedBranch: (branch: 'all' | 'mansarovar' | 'doorstep') => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ROLES: Record<'owner' | 'manager' | 'receptionist', DemoUser> = {
  owner: {
    id: 'user-uma-sharma',
    email: 'uma@nailsbyuma.in',
    name: 'Uma Sharma',
    role: 'owner',
    roleTitle: 'Business Owner & Founder',
    branch: 'All Outlets & Units',
  },
  manager: {
    id: 'user-jaipur-manager',
    email: 'manager.jaipur@nailsbyuma.in',
    name: 'Pooja Verma',
    role: 'manager',
    roleTitle: 'Branch Manager - Mansarovar',
    branch: 'Mansarovar Studio, Jaipur',
  },
  receptionist: {
    id: 'user-frontdesk-receptionist',
    email: 'frontdesk@nailsbyuma.in',
    name: 'Neha Sharma',
    role: 'receptionist',
    roleTitle: 'Front Desk Receptionist',
    branch: 'Front Desk - Mansarovar Outlet',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'mansarovar' | 'doorstep'>('all');
  const [loading, setLoading] = useState(true);

  const fetchProfileForUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setRole(data.role || 'customer');
      } else {
        // Safe profile setup state instead of crashing
        setProfile({ user_id: userId, role: 'customer' });
        setRole('customer');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setRole('customer');
    }
  };

  const refreshProfile = async () => {
    if (user && 'id' in user && !demoUser) {
      await fetchProfileForUser(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check if demo user is stored in localStorage
    const savedDemoUser = localStorage.getItem('aura_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser) as DemoUser;
        setDemoUser(parsed);
        setUser(parsed);
        setProfile(null);
        setRole(parsed.role || 'owner');
        setLoading(false);
      } catch (err) {
        console.warn('Could not parse demo user state:', err);
      }
    }

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setDemoUser(null);
          fetchProfileForUser(session.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          if (!savedDemoUser) {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setDemoUser(null);
        localStorage.removeItem('aura_demo_user');
        setLoading(true);
        await fetchProfileForUser(session.user.id);
        if (mounted) setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        if (!localStorage.getItem('aura_demo_user')) {
          setUser(null);
          setDemoUser(null);
          setProfile(null);
          setRole('customer');
        }
        if (mounted) setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        await fetchProfileForUser(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDemoRole = (roleType: 'owner' | 'manager' | 'receptionist') => {
    const demo = DEMO_ROLES[roleType];
    setDemoUser(demo);
    setUser(demo);
    setProfile(null);
    setRole(roleType);
    localStorage.setItem('aura_demo_user', JSON.stringify(demo));
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Fallback demo login if email matches demo role
      if (email.includes('uma') || email.includes('owner')) {
        loginAsDemoRole('owner');
        return;
      }
      if (email.includes('manager')) {
        loginAsDemoRole('manager');
        return;
      }
      if (email.includes('receptionist') || email.includes('frontdesk')) {
        loginAsDemoRole('receptionist');
        return;
      }
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('aura_demo_user');
    setDemoUser(null);
    setUser(null);
    setProfile(null);
    setRole('customer');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut exception handled:', err);
    }
  };

  const isAuthenticated = !!user;
  const isCustomer = role === 'customer';
  const isShopOwner = role === 'shop_owner' || role === 'owner' || role === 'manager' || role === 'receptionist';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUser,
        profile,
        role,
        selectedBranch,
        loading,
        isAuthenticated,
        isCustomer,
        isShopOwner,
        isAdmin,
        signIn,
        signOut,
        loginAsDemoRole,
        setSelectedBranch,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
