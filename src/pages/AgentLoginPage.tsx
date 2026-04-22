import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

/**
 * Agent / Admin sign-in. Hard restricted to two emails.
 * The DB trigger handle_new_user_role also enforces this on the backend.
 */
const ALLOWED_ADMIN_EMAILS = ['mauricestewart@gmail.com', 'crankin05@gmail.com'];

const AgentLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  if (!authLoading && user && !roleLoading) {
    return <Navigate to={role === 'admin' ? '/agent-dashboard' : '/client-dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.toLowerCase().trim();

    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setError('Access denied. The Agent Portal is restricted to authorized administrators only.');
      return;
    }

    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
    const isAdmin = roles?.some((item: any) => item.role === 'admin');
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError('Access denied. This account is not assigned an administrator role.');
      return;
    }

    navigate('/agent-dashboard', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[hsl(220,40%,8%)] to-[hsl(240,35%,12%)] flex items-center justify-center px-5 py-8 overflow-auto">
      <form onSubmit={handleSubmit} className="animate-fade-up bg-[hsl(220,30%,14%)] border border-[hsl(40,40%,40%)/0.3] rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] p-6 md:p-8 w-full max-w-[420px]">
        <Link to="/" className="no-underline flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(40,80%,55%)] to-[hsl(40,70%,45%)] flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-[hsl(220,40%,10%)]" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Agent Portal</div>
            <div className="text-[10px] text-[hsl(40,40%,70%)] uppercase tracking-wider">Restricted Access</div>
          </div>
        </Link>

        <div className="bg-[hsl(40,40%,55%)/0.08] border border-[hsl(40,40%,55%)/0.2] rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[hsl(40,80%,65%)] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[hsl(40,30%,80%)] leading-relaxed">
            This portal is for approved Credibility Suite agents only. Unauthorized access is prohibited.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[hsl(40,30%,70%)] mb-1.5">Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            required
            className="w-full bg-[hsl(220,30%,18%)] border border-[hsl(40,40%,40%)/0.3] text-white text-sm px-3.5 py-2.5 outline-none transition-all focus:border-[hsl(40,80%,55%)] focus:ring-2 focus:ring-[hsl(40,80%,55%)/0.15] rounded-xl placeholder:text-white/30"
            placeholder="agent@credibilitysuite.com"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-[hsl(40,30%,70%)] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
              minLength={6}
              className="w-full bg-[hsl(220,30%,18%)] border border-[hsl(40,40%,40%)/0.3] text-white text-sm px-3.5 py-2.5 pr-10 outline-none transition-all focus:border-[hsl(40,80%,55%)] focus:ring-2 focus:ring-[hsl(40,80%,55%)/0.15] rounded-xl placeholder:text-white/30"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-[hsl(40,80%,55%)] to-[hsl(40,70%,48%)] text-[hsl(220,40%,10%)] border-none text-sm font-bold py-3 cursor-pointer rounded-xl transition-all hover:shadow-[0_10px_30px_-10px_rgba(201,168,76,0.5)] hover:-translate-y-0.5 disabled:opacity-50">
          {loading ? 'Verifying...' : 'Sign In to Agent Portal'}
        </button>

        {error && <p className="text-xs text-[hsl(0,80%,65%)] text-center mt-3 bg-[hsl(0,80%,55%)/0.1] rounded-xl px-3 py-2.5 border border-[hsl(0,80%,55%)/0.2]">{error}</p>}

        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center">
          <Link to="/auth" className="text-[11px] text-white/50 hover:text-white no-underline">
            ← Back to Client Portal
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AgentLoginPage;
