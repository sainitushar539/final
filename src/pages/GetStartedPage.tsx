import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, Check, Shield, Globe, Loader2, AlertCircle, LogIn, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FundingJourney from '@/components/journeys/FundingJourney';
import VEAJourney from '@/components/journeys/VEAJourney';
import CreditJourney from '@/components/journeys/CreditJourney';
import GrowthJourney from '@/components/journeys/GrowthJourney';
import AdvisoryJourney from '@/components/journeys/AdvisoryJourney';
import DocumentationJourney from '@/components/journeys/DocumentationJourney';
import { useAuth } from '@/contexts/AuthContext';

const GOALS = [
  { label: 'I need funding for my business', value: 'funding', icon: '💰' },
  { label: 'I need help with financial health & cash flow', value: 'financial_health', icon: '📊' },
  { label: 'I need a business plan or strategy', value: 'business_plan', icon: '📋' },
  { label: 'I need help with lead gen & marketing', value: 'lead_gen', icon: '📣' },
  { label: "I'm just exploring what's available", value: 'exploring', icon: '🔍' },
  { label: 'I need coaching on growing my business', value: 'coaching', icon: '🚀' },
  { label: 'I need help organizing documents', value: 'documents', icon: '📁' },
  { label: 'I need to improve my credit', value: 'credit', icon: '💳' },
  { label: 'I need an executive assistant', value: 'executive_assistant', icon: '🤖' },
];

// Map goals to journey paths
const GOAL_TO_PATH: Record<string, string> = {
  funding: 'funding',
  financial_health: 'advisory',
  business_plan: 'advisory',
  lead_gen: 'growth',
  exploring: 'advisory',
  coaching: 'growth',
  documents: 'documentation',
  credit: 'credit',
  executive_assistant: 'vea',
};

type Phase = 'welcome' | 'capture' | 'goals' | 'routing' | 'journey';

const STORAGE_KEY = 'cs_get_started_progress';

interface SavedProgress {
  phase: Phase;
  name: string;
  email: string;
  phone: string;
  website: string;
  selectedGoals: string[];
  routedPath: string;
  routingMessage: string;
  savedAt: number;
}

const saveProgress = (data: Omit<SavedProgress, 'savedAt'>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch { /* ignore */ }
};

const loadProgress = (): SavedProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedProgress;
    // Expire after 7 days
    if (Date.now() - data.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
};

const clearProgress = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

const GetStartedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [routedPath, setRoutedPath] = useState('');
  const [routingMessage, setRoutingMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.phase !== 'welcome') {
      setHasSavedProgress(true);
    }
  }, []);

  // Save progress on phase/data changes (skip welcome & routing)
  useEffect(() => {
    if (phase === 'welcome' || phase === 'routing') return;
    saveProgress({ phase, name, email, phone, website, selectedGoals, routedPath, routingMessage });
  }, [phase, name, email, phone, website, selectedGoals, routedPath, routingMessage]);

  const resumeProgress = () => {
    const saved = loadProgress();
    if (!saved) return;
    setName(saved.name);
    setEmail(saved.email);
    setPhone(saved.phone || '');
    setWebsite(saved.website);
    setSelectedGoals(saved.selectedGoals);
    setRoutedPath(saved.routedPath);
    setRoutingMessage(saved.routingMessage);
    // If they were on the journey phase, restore it; otherwise go to their last phase
    setPhase(saved.phase === 'routing' ? 'goals' : saved.phase);
    setHasSavedProgress(false);
  };

  const startFresh = () => {
    clearProgress();
    setHasSavedProgress(false);
    setPhase('capture');
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const toggleGoal = (value: string) => {
    setSelectedGoals(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  };

  const routeToJourney = async () => {
    setPhase('routing');

    // Save lead to DB
    try {
      await supabase.from('leads').insert({
        contact_name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company_name: name.trim(),
        needs: selectedGoals,
        responses: { website: website.trim() },
        status: 'new',
      });
    } catch { /* non-blocking */ }

    // Determine best path via AI
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-router`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), website: website.trim(), goals: selectedGoals }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setRoutedPath(data.path || determinePath());
        setRoutingMessage(data.message || '');
      } else {
        setRoutedPath(determinePath());
      }
    } catch {
      setRoutedPath(determinePath());
    }

    // Small delay for UX
    await new Promise(r => setTimeout(r, 1500));
    setPhase('journey');
  };

  const determinePath = () => {
    // Priority: funding > credit > growth > vea > documentation > advisory
    const priority = ['funding', 'credit', 'lead_gen', 'coaching', 'executive_assistant', 'documents', 'financial_health', 'business_plan', 'exploring'];
    for (const p of priority) {
      if (selectedGoals.includes(p)) return GOAL_TO_PATH[p];
    }
    return 'advisory';
  };

  const leadData = { name: name.trim(), email: email.trim(), phone: phone.trim(), website: website.trim(), goals: selectedGoals };

  // Welcome phase
  if (phase === 'welcome') {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col">
        <Nav hasUser={Boolean(user)} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center animate-fade-up">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Welcome.
            </h1>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-md mx-auto">
              Whether you're chasing funding, building credit, or ready to scale — you're in the right place. Let's figure out your next move together.
            </p>
            {hasSavedProgress ? (
              <div className="space-y-3">
                <button
                  onClick={resumeProgress}
                  className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-base font-bold px-10 py-4 border-none cursor-pointer rounded-xl transition-all duration-300 hover:shadow-[0_12px_40px_hsl(220_80%_50%/0.35)] hover:-translate-y-0.5 inline-flex items-center gap-2.5 w-full justify-center"
                >
                  Continue Where You Left Off <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={startFresh}
                  className="text-sm text-white/40 hover:text-white/70 bg-transparent border-none cursor-pointer transition-colors mx-auto block"
                >
                  Or start fresh →
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPhase('capture')}
                className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-base font-bold px-10 py-4 border-none cursor-pointer rounded-xl transition-all duration-300 hover:shadow-[0_12px_40px_hsl(220_80%_50%/0.35)] hover:-translate-y-0.5 inline-flex items-center gap-2.5"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-white/40">
              <Shield className="w-3.5 h-3.5" />
              Your information is secure and never shared without your permission.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lead capture phase
  if (phase === 'capture') {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col">
        <Nav step="1 of 3" hasUser={Boolean(user)} />
        <ProgressBar current={1} total={3} />
        <div className="flex-1 flex items-start justify-center px-6 pt-4 pb-12">
          <div className="max-w-md w-full animate-fade-up">
            <h2 className="text-2xl font-extrabold text-white mb-2">Let's start with the basics.</h2>
            <p className="text-sm text-white/50 mb-8">We just need a few details to personalize your experience.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Your Name *</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/30 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Email Address *</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  placeholder="jane@mybusiness.com"
                  className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-all text-sm ${
                    touched.email && !emailValid ? 'border-red-500/60 focus:ring-red-500/30' :
                    touched.email && emailValid ? 'border-emerald-500/40 focus:ring-emerald-500/30' :
                    'border-white/[0.12] focus:border-[#2563eb]/50 focus:ring-[#2563eb]/30'
                  }`}
                />
                {touched.email && !emailValid && email && (
                  <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" /> Enter a valid email
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Phone Number <span className="text-white/30">(optional)</span></label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/30 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Website URL <span className="text-white/30">(optional)</span></label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="url" value={website} onChange={e => setWebsite(e.target.value)}
                    placeholder="www.mybusiness.com"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/30 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setPhase('welcome')} className="bg-white/[0.06] text-white/60 border border-white/[0.1] text-sm font-medium px-5 py-3.5 cursor-pointer rounded-xl transition-all hover:bg-white/[0.1] flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setPhase('goals')}
                disabled={!name.trim() || !emailValid}
                className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-white/30 mt-4 text-center">
              By continuing, you agree to our{' '}
              <Link to="/privacy" className="text-white/50 hover:text-white/70 underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Goal selection phase
  if (phase === 'goals') {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col">
        <Nav step="2 of 3" hasUser={Boolean(user)} />
        <ProgressBar current={2} total={3} />
        <div className="flex-1 flex items-start justify-center px-6 pt-4 pb-12">
          <div className="max-w-lg w-full animate-fade-up">
            <h2 className="text-2xl font-extrabold text-white mb-2">What can we help you with?</h2>
            <p className="text-sm text-white/50 mb-6">Select all that apply — we'll point you to the right path.</p>

            <div className="space-y-2.5">
              {GOALS.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer bg-transparent ${
                    selectedGoals.includes(goal.value)
                      ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08] shadow-[0_0_0_1px_rgba(37,99,235,0.15)]'
                      : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-lg">{goal.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${selectedGoals.includes(goal.value) ? 'text-white' : 'text-white/60'}`}>
                    {goal.label}
                  </span>
                  {selectedGoals.includes(goal.value) && (
                    <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setPhase('capture')} className="bg-white/[0.06] text-white/60 border border-white/[0.1] text-sm font-medium px-5 py-3.5 cursor-pointer rounded-xl transition-all hover:bg-white/[0.1] flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={routeToJourney}
                disabled={selectedGoals.length === 0}
                className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Let's Go <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI routing phase
  if (phase === 'routing') {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col">
        <Nav hasUser={Boolean(user)} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center animate-fade-up">
            <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Finding your best path...</h2>
            <p className="text-sm text-white/50">We're personalizing your experience based on your goals.</p>
          </div>
        </div>
      </div>
    );
  }

  // Journey phase - render the appropriate journey
  const JourneyComponent = {
    funding: FundingJourney,
    credit: CreditJourney,
    growth: GrowthJourney,
    vea: VEAJourney,
    advisory: AdvisoryJourney,
    documentation: DocumentationJourney,
  }[routedPath];

  if (phase === 'journey' && JourneyComponent) {
    return <JourneyComponent lead={leadData} routingMessage={routingMessage} onBack={() => setPhase('goals')} />;
  }

  return null;
};

// Sub-components
const Nav = ({ step, hasUser }: { step?: string; hasUser?: boolean }) => (
  <nav className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
    <Link to="/" className="flex items-center gap-3 no-underline">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
        <Brain className="w-5 h-5 text-white" />
      </div>
      <span className="text-lg font-bold text-white">Credibility Suite</span>
    </Link>

    <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
      {step && <div className="text-sm text-white/50 font-mono mr-2">Step {step}</div>}

      {hasUser ? (
        <Link
          to="/client-dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] px-3.5 py-2 text-xs font-semibold text-white no-underline"
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </Link>
      ) : (
        <>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/85 no-underline hover:bg-white/[0.1]"
          >
            <LogIn className="w-3.5 h-3.5" /> Client Login
          </Link>
          <Link
            to="/agent-login"
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/[0.16] px-3 py-2 text-[11px] font-medium text-white/70 no-underline hover:bg-white/[0.06] hover:text-white"
          >
            <Shield className="w-3.5 h-3.5" /> Agent
          </Link>
        </>
      )}
    </div>
  </nav>
);

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="px-6 mb-6">
    <div className="max-w-lg mx-auto h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-full transition-all duration-500" style={{ width: `${(current / total) * 100}%` }} />
    </div>
  </div>
);

export default GetStartedPage;

