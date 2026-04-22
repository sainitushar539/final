import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, useUserRole } from '@/hooks/useUserRole';

const ProtectedRoute = ({
  children,
  redirectTo = '/auth',
  requiredRole,
  roleRedirectTo,
}: {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: AppRole;
  roleRedirectTo?: string;
}) => {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (loading) {
      setSessionChecked(false);
      setHasSession(false);
      return;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session) && !error);
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
    };
  }, [loading, user]);

  if (loading || (!user && !sessionChecked) || (user && requiredRole && roleLoading)) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-primary font-mono text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user && !hasSession) return <Navigate to={redirectTo} replace />;

  if (requiredRole && role && role !== requiredRole) {
    return <Navigate to={roleRedirectTo || (role === 'admin' ? '/agent-dashboard' : '/client-dashboard')} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
