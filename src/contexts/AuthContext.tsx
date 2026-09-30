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

interface AuthContextType {
  user: User | DemoUser | null;
  demoUser: DemoUser | null;
  role: 'owner' | 'manager' | 'receptionist';
  selectedBranch: 'all' | 'mansarovar' | 'doorstep';
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemoRole: (role: 'owner' | 'manager' | 'receptionist') => void;
  setSelectedBranch: (branch: 'all' | 'mansarovar' | 'doorstep') => void;
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
  const [role, setRole] = useState<'owner' | 'manager' | 'receptionist'>('owner');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'mansarovar' | 'doorstep'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check if demo user is stored in localStorage
    const savedDemoUser = localStorage.getItem('aura_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser) as DemoUser;
        setDemoUser(parsed);
        setUser(parsed);
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
        } else if (!savedDemoUser) {
          setUser(null);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setDemoUser(null);
        localStorage.removeItem('aura_demo_user');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        if (!localStorage.getItem('aura_demo_user')) {
          setUser(null);
          setDemoUser(null);
        }
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
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
    setRole(roleType);
    localStorage.setItem('aura_demo_user', JSON.stringify(demo));
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
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
  };

  const signOut = async () => {
    localStorage.removeItem('aura_demo_user');
    setDemoUser(null);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut exception handled:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUser,
        role,
        selectedBranch,
        loading,
        signIn,
        signOut,
        loginAsDemoRole,
        setSelectedBranch,
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
