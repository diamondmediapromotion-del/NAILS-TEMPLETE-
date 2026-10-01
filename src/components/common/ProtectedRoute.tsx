import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading, isAuthenticated } = useAuth();

  // During auth initialization, show the loading spinner/state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium animate-pulse">Checking security privileges...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If specific roles are required, check the user's role
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If a customer tries to access admin, redirect them to public profile
    if (role === 'customer') {
      return <Navigate to="/profile" replace />;
    }
    // Default fallback redirect to homepage
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
