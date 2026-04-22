import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const userId = user?.id;

    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const cacheKey = `cs_role_cache_${userId}`;
    let cachedRole: AppRole | null = null;

    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw === 'admin' || raw === 'client') cachedRole = raw;
    } catch {
      cachedRole = null;
    }

    if (cachedRole) {
      setRole(cachedRole);
      setLoading(false);
    } else {
      setLoading(true);
    }

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!mounted) return;

        const resolvedRole: AppRole =
          data && data.length > 0 && data.some((r: any) => r.role === 'admin') ? 'admin' : 'client';

        setRole(resolvedRole);
        try { sessionStorage.setItem(cacheKey, resolvedRole); } catch { /* ignore */ }
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setRole('client');
        try { sessionStorage.setItem(cacheKey, 'client'); } catch { /* ignore */ }
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { role, isAdmin: role === 'admin', isClient: role === 'client', loading };
};
