import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { claimClientIntakeFromLead, consumePendingFundingSnapshot, persistFundingSnapshot } from '@/lib/clientDashboardData';
import { Brain, Eye, EyeOff, KeyRound, Shield } from 'lucide-react';

/**
 * Client Portal — Sign in (existing clients) or Sign up (requires approval code from admin).
 * Admins use /agent-login.
 */
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  if (!authLoading && user && !roleLoading) {
    return <Navigate to={role === 'admin' ? '/agent-dashboard' : '/client-dashboard'} replace />;
  }

  const getRoleForUser = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    return data?.some((item: any) => item.role === 'admin') ? 'admin' : 'client';
  };

  const persistPendingClientSnapshot = async (userId: string, nextRole: string, userEmail: string) => {
    if (nextRole !== 'client') return;
    const pending = consumePendingFundingSnapshot();
    if (pending) {
      await persistFundingSnapshot(userId, pending);
    }
    await claimClientIntakeFromLead(userId, userEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (isSignUp) {
        // 1. Validate code BEFORE creating account (we can't pre-validate-only,
        //    so we check by attempting non-mutating lookup via RPC after signup user_id is known).
        //    For now, require a non-empty code shape.
        if (!approvalCode || approvalCode.trim().length < 4) {
          throw new Error('Please enter the approval code provided by your advisor.');
        }

        // 2. Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Sign-up failed. Please try again.');

        // 3. Consume code (server validates email+code+unused)
        const { data: ok, error: rpcErr } = await supabase.rpc('consume_approval_code', {
          _email: cleanEmail,
          _code: approvalCode.trim().toUpperCase(),
          _user_id: data.user.id,
        });

        if (rpcErr || !ok) {
          // Hard fail — sign them out so they can't use the account
          await supabase.auth.signOut();
          throw new Error('Invalid or already-used approval code. Contact your advisor.');
        }

        if (data.session) {
          const nextRole = await getRoleForUser(data.user.id);
          await persistPendingClientSnapshot(data.user.id, nextRole, cleanEmail);
          navigate(nextRole === 'admin' ? '/agent-dashboard' : '/client-dashboard', { replace: true });
        } else {
          setMessage('Account created! Check your email for the verification link, then sign in.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail, password,
        });
        if (signInError) throw signInError;
        const nextRole = data.user ? await getRoleForUser(data.user.id) : 'client';
        if (data.user) await persistPendingClientSnapshot(data.user.id, nextRole, cleanEmail);
        navigate(nextRole === 'admin' ? '/agent-dashboard' : '/client-dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-5 py-8 overflow-auto">
      <form onSubmit={handleSubmit} className="animate-fade-up bg-card border border-border rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-[420px]">
        <Link to="/" className="no-underline flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground">Credibility Suite</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Client Portal</div>
          </div>
        </Link>

        <h1 className="text-lg font-bold text-foreground mb-1">
          {isSignUp ? 'Activate your account' : 'Welcome back'}
        </h1>
        <p className="text-xs text-muted-foreground mb-5">
          {isSignUp
            ? 'Approved by an advisor? Enter your access code below.'
            : 'Sign in to access your dashboard.'}
        </p>

        {isSignUp && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full bg-muted border border-border text-foreground text-sm px-3.5 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl"
              placeholder="Jane Doe" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required
            className="w-full bg-muted border border-border text-foreground text-sm px-3.5 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl"
            placeholder="you@email.com" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required minLength={6}
              className="w-full bg-muted border border-border text-foreground text-sm px-3.5 py-2.5 pr-10 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl"
              placeholder="Min. 6 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Approval Code
            </label>
            <input
              type="text"
              value={approvalCode}
              onChange={e => { setApprovalCode(e.target.value.toUpperCase()); setError(''); }}
              required
              maxLength={16}
              className="w-full bg-muted border border-border text-foreground text-sm px-3.5 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl font-mono tracking-widest uppercase"
              placeholder="XXXXXXXX"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Provided by your Credibility Suite advisor after approval.
            </p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white border-none text-sm font-semibold py-3 cursor-pointer rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50">
          {loading ? 'Please wait...' : isSignUp ? 'Activate Account' : 'Sign In'}
        </button>

        {error && <p className="text-xs text-destructive text-center mt-3 bg-destructive/5 rounded-xl px-3 py-2.5">{error}</p>}
        {message && <p className="text-xs text-[hsl(var(--success))] text-center mt-3 bg-[hsl(var(--success)/0.05)] rounded-xl px-3 py-2.5">{message}</p>}

        <p className="text-xs text-muted-foreground text-center mt-4">
          {isSignUp ? 'Already activated?' : "Got an approval code?"}{' '}
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            className="text-primary font-semibold bg-transparent border-none cursor-pointer hover:underline text-xs">
            {isSignUp ? 'Sign In' : 'Activate Account'}
          </button>
        </p>

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-center">
          <Link to="/agent-login" className="text-[11px] text-muted-foreground hover:text-foreground no-underline flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Agent Portal
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
