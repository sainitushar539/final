import { useState, useMemo, useEffect, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Sparkles, ArrowRight, ArrowLeft, Check, Lock, Zap, Target, DollarSign, FileText, TrendingUp, Play, CreditCard } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import { buildQuestionnaireResult, normalizeGoals, toJson } from '@/lib/questionnaire';
import { claimClientIntakeFromLead } from '@/lib/clientDashboardData';

/* ──────── scoring options ──────── */
const creditScoreOptions = [
  { label: '780+', value: '780+', points: 10 },
  { label: '740–779', value: '740-779', points: 8 },
  { label: '680–739', value: '680-739', points: 6 },
  { label: '600–680', value: '600-680', points: 4 },
  { label: 'Below 600', value: '<600', points: 2 },
];

const revenueOptions = [
  { label: '$1M+', value: '1m+', points: 10 },
  { label: '$250K – $1M', value: '250k-1m', points: 8 },
  { label: '$100K – $250K', value: '100k-250k', points: 6 },
  { label: 'Under $100K', value: 'under100k', points: 4 },
  { label: 'Pre-revenue', value: 'pre', points: 2 },
];

const timeOptions = [
  { label: '10+ years', value: '10+', points: 10 },
  { label: '2-5 years', value: '2-5', points: 8 },
  { label: 'Less than 2 years', value: '<2', points: 4 },
  { label: 'Not started yet', value: 'not-started', points: 1 },
];

const getScoreLabel = (s: number) => {
  if (s >= 80) return { text: "Excellent — You're highly fundable!", tier: 'Tier 1', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: '#10b981' };
  if (s >= 60) return { text: 'Good — Strong foundation', tier: 'Tier 2', color: 'text-blue-600', bg: 'bg-blue-50', ring: '#3b82f6' };
  if (s >= 40) return { text: "Building — Let's close the gaps", tier: 'Tier 3', color: 'text-amber-600', bg: 'bg-amber-50', ring: '#f59e0b' };
  return { text: 'Getting Started — We can help', tier: 'Tier 4', color: 'text-gray-500', bg: 'bg-gray-100', ring: '#9ca3af' };
};


const generateInsights = (credit: string, revenue: string, time: string) => {
  const insights: string[] = [];
  const highCredit = ['780+', '740-779'].includes(credit);
  const hasRevenue = !['pre', 'under100k'].includes(revenue);
  const established = ['10+', '2-5', '2-5+', '2-10'].includes(time);
  if (highCredit && hasRevenue) insights.push('You are strong in credit and revenue — excellent foundation for traditional lending.');
  else if (highCredit && !hasRevenue) insights.push('Strong credit but revenue needs growth — focus on sales acceleration.');
  else if (!highCredit && hasRevenue) insights.push('Revenue is solid but credit needs work — consider credit repair first.');
  else insights.push('Both credit and revenue need attention — start with quick wins in each area.');
  if (established) insights.push('Your business longevity is a major strength for lenders.');
  else insights.push('Newer businesses can still qualify — we will show you the right programs.');
  if (hasRevenue && !highCredit) insights.push('Biggest opportunity: fix credit score while leveraging revenue-based funding.');
  if (highCredit && hasRevenue) insights.push('You may qualify for SBA loans with the best rates available.');
  if (!hasRevenue) insights.push('Focus: build recurring revenue streams and organize financials.');
  return insights;
};

const generateCanvasSnapshot = (businessName: string, revenue: string, time: string, credit: string) => {
  const hasRevenue = !['pre', 'under100k'].includes(revenue);
  const established = ['10+', '2-5', '2-5+', '2-10'].includes(time);
  const highCredit = ['780+', '740-779'].includes(credit);
  return [
    { title: 'Value Proposition', content: hasRevenue
      ? `${businessName} delivers proven value with an established revenue model.`
      : `${businessName} is positioned to capture market share with strong growth potential.` },
    { title: 'Customer Segments', content: established
      ? 'Established customer base with repeat buyers and referrals.'
      : 'Early adopters and initial target market — growth opportunity ahead.' },
    { title: 'Revenue Streams', content: hasRevenue
      ? 'Active revenue streams generating consistent income.'
      : 'Revenue model in development — focus on first paying customers.' },
    { title: 'Key Activities', content: established
      ? 'Operations, customer fulfillment, and scaling systems.'
      : 'Product development, market validation, and customer acquisition.' },
    { title: 'Key Resources', content: hasRevenue
      ? 'Team, technology, customer relationships, and brand equity.'
      : 'Founder expertise, initial capital, and early partnerships.' },
    { title: 'Channels', content: established
      ? 'Direct sales, partnerships, digital marketing, and referrals.'
      : 'Social media, direct outreach, and community building.' },
    { title: 'Growth Opportunities', content: hasRevenue
      ? 'Expand product lines, enter new markets, and optimize pricing.'
      : 'Validate product-market fit, build recurring revenue.' },
    { title: 'Gaps & Risks', content: !highCredit && !hasRevenue
      ? 'Pre-revenue with credit challenges — prioritize revenue and credit building.'
      : !hasRevenue ? 'Pre-revenue risk — establish cash flow quickly.'
      : !highCredit ? 'Credit score limiting funding options — credit repair recommended.'
      : 'Scaling risk — systems and team may need upgrading.' },
  ];
};

/* Deep question options */
const businessLocationOpts = [
  { label: 'Home', value: 'home' }, { label: 'Commercial', value: 'commercial' },
  { label: 'Virtual', value: 'virtual' }, { label: 'Not started', value: 'not-started' },
];
const stageOpts = [
  { label: 'Idea', value: 'idea' }, { label: 'Early', value: 'early' },
  { label: 'Growing', value: 'growing' }, { label: 'Established', value: 'established' },
];
const profitableOpts = [
  { label: 'Yes', value: 'yes' }, { label: 'Break-even', value: 'breakeven' }, { label: 'No', value: 'no' },
];
const financialsOpts = [
  { label: 'Fully organized', value: 'organized' }, { label: 'Somewhat', value: 'somewhat' }, { label: 'Not at all', value: 'not-at-all' },
];
const cashflowOpts = [
  { label: 'Consistent', value: 'consistent' }, { label: 'Fluctuating', value: 'fluctuating' }, { label: 'Unpredictable', value: 'unpredictable' },
];
const customerOpts = [
  { label: 'Consumers', value: 'consumers' }, { label: 'Businesses', value: 'businesses' },
  { label: 'Government', value: 'government' }, { label: 'Mixed', value: 'mixed' },
];
const revenueModelOpts = [
  { label: 'One-time sales', value: 'one-time' }, { label: 'Recurring', value: 'recurring' },
  { label: 'Mixed', value: 'mixed' }, { label: 'Not yet generating', value: 'none' },
];
const bottleneckOpts = [
  { label: 'Customers', value: 'customers' }, { label: 'Operations', value: 'operations' },
  { label: 'Capital', value: 'capital' }, { label: 'Systems', value: 'systems' }, { label: 'Team', value: 'team' },
];
const fundingPurposeOpts = [
  { label: 'Working Capital', value: 'working_capital' }, { label: 'Equipment', value: 'equipment' },
  { label: 'Inventory', value: 'inventory' }, { label: 'Expansion', value: 'expansion' },
  { label: 'Marketing', value: 'marketing' }, { label: 'Hiring', value: 'hiring' },
  { label: 'Real Estate', value: 'real_estate' }, { label: 'Debt Refinancing', value: 'refinancing' },
];
const fundingTimelineOpts = [
  { label: 'ASAP', value: 'asap' }, { label: '30–60 days', value: '30-60' },
  { label: '2–6 months', value: '2-6' }, { label: 'Just planning', value: 'planning' },
];

const agentModules = [
  { id: 'fundability', Icon: Zap, name: 'Fundability Agent', desc: 'Improves your funding score, identifies exact blockers, shows approval pathways', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'capital', Icon: Target, name: 'Capital Matching Agent', desc: 'Matches you to real funding options, shows amounts + likelihood, routes deals', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'financial', Icon: DollarSign, name: 'Financial Health Agent', desc: 'Analyzes cash flow + profitability, recommends fixes', gradient: 'from-amber-500 to-orange-500' },
  { id: 'docs', Icon: FileText, name: 'Documentation Agent', desc: 'Prepares you for underwriting, identifies missing docs', gradient: 'from-purple-500 to-violet-500' },
  { id: 'growth', Icon: TrendingUp, name: 'Growth Strategy Agent', desc: 'Builds revenue strategy, improves business model', gradient: 'from-pink-500 to-rose-500' },
  { id: 'execution', Icon: Play, name: 'Execution Agent', desc: 'Weekly action plan, "what to do next" guidance', gradient: 'from-cyan-500 to-blue-500' },
];

type Phase = 'contact' | 'snapshot' | 'results' | 'booking' | 'paywall' | 'deep-a' | 'deep-b' | 'deep-c' | 'deep-d' | 'signup';
type Option = { label: string; value: string };
type DraftFormData = {
  selectedGoals?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
  noWebsite?: boolean;
  creditScore?: string;
  revenue?: string;
  timeInBusiness?: string;
  bizDescription?: string;
  bizLocation?: string;
  bizStage?: string;
  profitable?: string;
  financials?: string;
  cashflow?: string;
  customers?: string;
  revenueModel?: string;
  bottleneck?: string;
  fundingPurposes?: string[];
  fundingTimeline?: string;
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
}

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">{label} {required && <span className="text-destructive">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl placeholder:text-muted-foreground/40"
    />
  </div>
);

interface OptionPillProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

const OptionPill = ({ options, selected, onSelect }: OptionPillProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onSelect(opt.value)}
        className={`text-sm font-medium px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          selected === opt.value
            ? 'border-primary bg-primary/[0.08] text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]'
            : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground bg-background'
        }`}
      >
        {selected === opt.value && <Check className="w-3 h-3 inline mr-1.5" />}
        {opt.label}
      </button>
    ))}
  </div>
);

interface MultiPillProps {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}

const MultiPill = ({ options, selected, onToggle }: MultiPillProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onToggle(opt.value)}
        className={`text-sm font-medium px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          selected.includes(opt.value)
            ? 'border-primary bg-primary/[0.08] text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]'
            : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground bg-background'
        }`}
      >
        {selected.includes(opt.value) && <Check className="w-3 h-3 inline mr-1.5" />}
        {opt.label}
      </button>
    ))}
  </div>
);

interface PrimaryBtnProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  children: ReactNode;
}

const PrimaryBtn = ({ onClick, disabled, children }: PrimaryBtnProps) => (
  <button
    onClick={() => void onClick()}
    disabled={disabled}
    className="flex-1 bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white border-none text-sm font-semibold py-3.5 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
  >
    {children}
  </button>
);

interface BackBtnProps {
  onClick: () => void;
}

const BackBtn = ({ onClick }: BackBtnProps) => (
  <button
    onClick={() => onClick()}
    className="bg-background text-muted-foreground border border-border text-sm font-medium px-5 py-3.5 cursor-pointer rounded-xl transition-all hover:border-foreground/20 hover:text-foreground flex items-center gap-2"
  >
    <ArrowLeft className="w-4 h-4" /> Back
  </button>
);

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);


const goalOptions: Option[] = [
  { label: 'Get a business loan', value: 'loan' },
  { label: 'Check my fundability', value: 'fundability' },
  { label: 'Improve my credit', value: 'credit' },
  { label: 'Grow my business', value: 'grow' },
  { label: 'Just exploring', value: 'exploring' },
];

const splitName = (value?: string | null) => {
  const parts = (value || '').trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') };
};

const mapSavedGoals = (value?: unknown) => normalizeGoals(Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

const mapCredit = (value?: unknown) => {
  const creditMap: Record<string, string> = {
    excellent: '780+',
    good: '740-779',
    fair: '680-739',
    'below-average': '600-680',
    poor: '<600',
    unsure: '<600',
  };
  return creditMap[String(value || '')] || String(value || '');
};

const mapRevenue = (value?: unknown) => {
  const revMap: Record<string, string> = {
    'pre-revenue': 'pre',
    'under-50k': 'under100k',
    '50k-100k': 'under100k',
    '100k-250k': '100k-250k',
    '250k-500k': '250k-1m',
    '500k-1m': '250k-1m',
    '1m-plus': '1m+',
  };
  return revMap[String(value || '')] || String(value || '');
};

const mapTimeInBusiness = (value?: unknown) => {
  const timeMap: Record<string, string> = {
    'pre-revenue': 'not-started',
    'under-1': '<2',
    '1-2': '<2',
    '3-5': '2-5',
    '5-plus': '10+',
  };
  return timeMap[String(value || '')] || String(value || '');
};

const phaseValues: Phase[] = ['contact', 'snapshot', 'results', 'booking', 'paywall', 'deep-a', 'deep-b', 'deep-c', 'deep-d', 'signup'];

const isValidPhase = (value: unknown): value is Phase => phaseValues.includes(value as Phase);

const isMissingQuestionnaireResultsTable = (error: unknown) => {
  const err = error as { code?: string; message?: string } | null;
  if (!err) return false;
  if (err.code === 'PGRST205' || err.code === '42P01') return true;
  return (err.message || '').toLowerCase().includes('questionnaire_results');
};

const isMissingOnboardingDraftsTable = (error: unknown) => {
  const err = error as { code?: string; message?: string } | null;
  if (!err) return false;
  if (err.code === 'PGRST205' || err.code === '42P01') return true;
  return (err.message || '').toLowerCase().includes('onboarding_drafts');
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>('contact');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [hasLeadData, setHasLeadData] = useState(false);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [noWebsite, setNoWebsite] = useState(false);

  const [creditScore, setCreditScore] = useState('');
  const [revenue, setRevenue] = useState('');
  const [timeInBusiness, setTimeInBusiness] = useState('');

  const [bizDescription, setBizDescription] = useState('');
  const [bizLocation, setBizLocation] = useState('');
  const [bizStage, setBizStage] = useState('');
  const [profitable, setProfitable] = useState('');
  const [financials, setFinancials] = useState('');
  const [cashflow, setCashflow] = useState('');
  const [customers, setCustomers] = useState('');
  const [revenueModel, setRevenueModel] = useState('');
  const [bottleneck, setBottleneck] = useState('');
  const [fundingPurposes, setFundingPurposes] = useState<string[]>([]);
  const [fundingTimeline, setFundingTimeline] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const applyDraft = (draftPhase?: unknown, formData?: DraftFormData | null) => {
    const safeData = formData || {};
    if (safeData.selectedGoals?.length) setSelectedGoals(safeData.selectedGoals);
    if (safeData.firstName) setFirstName(safeData.firstName);
    if (safeData.lastName) setLastName(safeData.lastName);
    if (safeData.email) setEmail(safeData.email);
    if (safeData.phone) setPhone(safeData.phone);
    if (safeData.businessName) setBusinessName(safeData.businessName);
    if (typeof safeData.website === 'string') setWebsite(safeData.website);
    if (typeof safeData.noWebsite === 'boolean') setNoWebsite(safeData.noWebsite);
    if (safeData.creditScore) setCreditScore(safeData.creditScore);
    if (safeData.revenue) setRevenue(safeData.revenue);
    if (safeData.timeInBusiness) setTimeInBusiness(safeData.timeInBusiness);
    if (safeData.bizDescription) setBizDescription(safeData.bizDescription);
    if (safeData.bizLocation) setBizLocation(safeData.bizLocation);
    if (safeData.bizStage) setBizStage(safeData.bizStage);
    if (safeData.profitable) setProfitable(safeData.profitable);
    if (safeData.financials) setFinancials(safeData.financials);
    if (safeData.cashflow) setCashflow(safeData.cashflow);
    if (safeData.customers) setCustomers(safeData.customers);
    if (safeData.revenueModel) setRevenueModel(safeData.revenueModel);
    if (safeData.bottleneck) setBottleneck(safeData.bottleneck);
    if (safeData.fundingPurposes?.length) setFundingPurposes(safeData.fundingPurposes);
    if (safeData.fundingTimeline) setFundingTimeline(safeData.fundingTimeline);
    if (isValidPhase(draftPhase)) setPhase(draftPhase);
  };

  const readLocalDraft = () => {
    try {
      const raw = sessionStorage.getItem('onboardingSnapshot');
      return raw ? JSON.parse(raw) as { phase?: Phase; formData?: DraftFormData } : null;
    } catch {
      return null;
    }
  };

  const hydrateFromLead = (lead: any) => {
    const contactName = lead?.contactName || lead?.contact_name || '';
    const companyName = lead?.companyName || lead?.company_name || lead?.name || '';
    const responses = (lead?.responses && typeof lead.responses === 'object' ? lead.responses : {}) as Record<string, any>;
    const savedGoals = lead?.needs || lead?.goals || responses.goals;
    const savedCredit = mapCredit(lead?.creditScore || lead?.credit_score_range || responses.creditScore);
    const savedRevenue = mapRevenue(lead?.annualRevenue || responses.annualRevenue);
    const savedTime = mapTimeInBusiness(lead?.timeInBusiness || responses.timeInBusiness);
    const savedWebsite = lead?.website || responses.website || '';
    const nameParts = splitName(contactName);

    if (nameParts.first) setFirstName((prev) => prev || nameParts.first);
    if (nameParts.last) setLastName((prev) => prev || nameParts.last);
    if (lead?.email) setEmail((prev) => prev || lead.email);
    if (lead?.phone) setPhone((prev) => prev || lead.phone);
    if (companyName) setBusinessName((prev) => prev || companyName);
    if (savedWebsite) setWebsite((prev) => prev || savedWebsite);
    if (savedGoals) setSelectedGoals((prev) => prev.length > 0 ? prev : mapSavedGoals(savedGoals));
    if (savedCredit) setCreditScore((prev) => prev || savedCredit);
    if (savedRevenue) setRevenue((prev) => prev || savedRevenue);
    if (savedTime) setTimeInBusiness((prev) => prev || savedTime);
    setHasLeadData(true);

    if (savedCredit && savedRevenue && savedTime) {
      setPhase('results');
    } else if (contactName || companyName || savedCredit || savedRevenue || savedTime) {
      setPhase('snapshot');
    }
  };

  const hydrateFromCachedLead = () => {
    try {
      const leadJson = sessionStorage.getItem('leadData');
      if (!leadJson) return false;
      hydrateFromLead(JSON.parse(leadJson));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const loadSavedIntake = async () => {
      setHydrating(true);

      if (!user) {
        hydrateFromCachedLead();
        setHydrating(false);
        return;
      }

      const userEmail = user.email?.trim() || '';

      try {
        const [{ data: existingBusiness }, { data: existingResult }, { data: profile }, leadResult, draftResult] = await Promise.all([
          supabase
            .from('businesses')
            .select('id')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('questionnaire_results')
            .select('id, questionnaire_completed, score')
            .eq('user_id', user.id)
            .eq('questionnaire_completed', true)
            .gt('score', 0)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', user.id)
            .maybeSingle(),
          userEmail
            ? supabase
                .from('leads')
                .select('contact_name, email, phone, company_name, credit_score_range, needs, responses, updated_at')
                .ilike('email', userEmail)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from('onboarding_drafts')
            .select('current_phase, form_data')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (existingBusiness?.id || existingResult?.id) {
          navigate('/client-dashboard', { replace: true });
          return;
        }

        const claimedLeadIntake = await claimClientIntakeFromLead(user.id, userEmail);
        if (claimedLeadIntake) {
          navigate('/client-dashboard', { replace: true });
          return;
        }

        const profileName = splitName(profile?.full_name);
        if (profileName.first) setFirstName(profileName.first);
        if (profileName.last) setLastName(profileName.last);
        if (profile?.email || userEmail) setEmail(profile?.email || userEmail);
        if (profile?.phone) setPhone(profile.phone);

        if (leadResult.data) {
          hydrateFromLead(leadResult.data);
        } else {
          hydrateFromCachedLead();
        }

        if (draftResult.error && !isMissingOnboardingDraftsTable(draftResult.error)) {
          throw draftResult.error;
        }

        if (draftResult.data) {
          applyDraft(draftResult.data.current_phase, draftResult.data.form_data as DraftFormData);
        } else {
          const localDraft = readLocalDraft();
          if (localDraft) applyDraft(localDraft.phase, localDraft.formData);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    };

    void loadSavedIntake();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, user?.email, navigate]);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  useEffect(() => {
    if (hydrating) return;

    const formData: DraftFormData = {
      selectedGoals,
      firstName,
      lastName,
      email,
      phone,
      businessName,
      website,
      noWebsite,
      creditScore,
      revenue,
      timeInBusiness,
      bizDescription,
      bizLocation,
      bizStage,
      profitable,
      financials,
      cashflow,
      customers,
      revenueModel,
      bottleneck,
      fundingPurposes,
      fundingTimeline,
    };

    try {
      sessionStorage.setItem('onboardingSnapshot', JSON.stringify({ phase, formData }));
      sessionStorage.setItem('onboardingSnapshotKey', user?.id || email || 'guest');
    } catch {
      // ignore storage failures
    }

    if (!user?.id) return;

    const timeoutId = window.setTimeout(() => {
      void supabase
        .from('onboarding_drafts')
        .upsert({
          user_id: user.id,
          current_phase: phase,
          form_data: toJson(formData),
        }, { onConflict: 'user_id' })
        .then(({ error: draftError }) => {
          if (draftError && !isMissingOnboardingDraftsTable(draftError)) {
            console.error('Failed to save onboarding draft', draftError);
          }
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    hydrating,
    user?.id,
    phase,
    selectedGoals,
    firstName,
    lastName,
    email,
    phone,
    businessName,
    website,
    noWebsite,
    creditScore,
    revenue,
    timeInBusiness,
    bizDescription,
    bizLocation,
    bizStage,
    profitable,
    financials,
    cashflow,
    customers,
    revenueModel,
    bottleneck,
    fundingPurposes,
    fundingTimeline,
  ]);

  const fundabilityScore = useMemo(() => {
    const cs = creditScoreOptions.find(o => o.value === creditScore)?.points || 0;
    const rv = revenueOptions.find(o => o.value === revenue)?.points || 0;
    const tb = timeOptions.find(o => o.value === timeInBusiness)?.points || 0;
    return Math.round(((cs + rv + tb) / 30) * 100);
  }, [creditScore, revenue, timeInBusiness]);

  const scoreInfo = getScoreLabel(fundabilityScore);
  const insights = useMemo(() => generateInsights(creditScore, revenue, timeInBusiness), [creditScore, revenue, timeInBusiness]);
  const toggleGoal = (value: string) => setSelectedGoals(prev => prev.includes(value) ? prev.filter(goal => goal !== value) : [...prev, value]);

  const handleSignUp = async () => {
    setError(''); setLoading(true);
    try {
      let targetUserId = user?.id;

      if (!targetUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email, password: signupPassword,
          options: { data: { full_name: `${firstName} ${lastName}` }, emailRedirectTo: window.location.origin },
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Unable to create your account.');
        if (!authData.session) { setError('Check your email for a verification link, then sign in.'); setLoading(false); return; }
        targetUserId = authData.user.id;
      }

      const questionnaire = buildQuestionnaireResult({
        businessName: businessName || `${firstName}'s Business`,
        email: email.trim(),
        selectedGoals,
        creditScoreRange: creditScore,
        revenueRange: revenue,
        timeInBusiness,
        score: fundabilityScore || 10,
        answers: {
          firstName,
          lastName,
          phone,
          website,
          businessDescription: bizDescription,
          businessLocation: bizLocation,
          businessStage: bizStage,
          profitable,
          financials,
          cashflow,
          customers,
          revenueModel,
          bottleneck,
          fundingPurposes,
          fundingTimeline,
        },
      });
      const checklist = questionnaire.checklist;
      const notesArr = [
        `Goals: ${selectedGoals.join(', ')}`, `Credit: ${creditScore}`, `Revenue: ${revenue}`, `Time: ${timeInBusiness}`,
        `Location: ${bizLocation}`, `Stage: ${bizStage}`, `Profitable: ${profitable}`,
        `Financials: ${financials}`, `Cashflow: ${cashflow}`, `Customers: ${customers}`,
        `Revenue model: ${revenueModel}`, `Bottleneck: ${bottleneck}`,
        `Funding purposes: ${fundingPurposes.join(', ')}`, `Timeline: ${fundingTimeline}`,
        `Description: ${bizDescription}`, `Website: ${website}`,
      ];

      const fullName = `${firstName} ${lastName}`.trim();
      const profilePayload = {
        user_id: targetUserId,
        full_name: fullName || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      };
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();
      if (existingProfile?.id) {
        const { error: profileError } = await supabase.from('profiles').update(profilePayload).eq('id', existingProfile.id);
        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase.from('profiles').insert(profilePayload);
        if (profileError) throw profileError;
      }

      const businessPayload = {
        user_id: targetUserId, name: businessName || `${firstName}'s Business`,
        industry: null, capital_need: null, checklist: toJson(checklist), score: fundabilityScore || 10,
        status: 'assessment', notes: notesArr.join('. '),
        top_gap: fundabilityScore < 60 ? 'Credit & Revenue' : 'Documentation',
        loan_product: fundabilityScore >= 80 ? 'standard' : fundabilityScore >= 60 ? 'revenue-based' : 'building',
      };
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const businessWrite = existingBusiness?.id
        ? await supabase.from('businesses').update(businessPayload).eq('id', existingBusiness.id)
        : await supabase.from('businesses').insert(businessPayload).select('id').single();
      if (businessWrite.error) throw businessWrite.error;

      const businessId = existingBusiness?.id || businessWrite.data?.id || null;
      const questionnairePayload = {
        user_id: targetUserId,
        business_id: businessId,
        email: email.trim().toLowerCase(),
        selected_goals: questionnaire.selectedGoals,
        credit_score_range: creditScore,
        revenue_range: revenue,
        time_in_business: timeInBusiness,
        answers: toJson(questionnaire.answers),
        score: fundabilityScore || 10,
        diagnosis_summary: questionnaire.diagnosis,
        roadmap: toJson(questionnaire.roadmap),
        checklist: toJson(checklist),
        questionnaire_completed: true,
        completed_at: new Date().toISOString(),
      };
      const { error: questionnaireError } = await supabase
        .from('questionnaire_results')
        .upsert(questionnairePayload, { onConflict: 'user_id' });
      if (questionnaireError && !isMissingQuestionnaireResultsTable(questionnaireError)) {
        throw questionnaireError;
      }

      if (targetUserId) {
        const { error: draftDeleteError } = await supabase
          .from('onboarding_drafts')
          .delete()
          .eq('user_id', targetUserId);
        if (draftDeleteError && !isMissingOnboardingDraftsTable(draftDeleteError)) {
          throw draftDeleteError;
        }
      }

      try {
        sessionStorage.removeItem('onboardingSnapshot');
        sessionStorage.removeItem('onboardingSnapshotKey');
      } catch {
        // ignore storage cleanup failures
      }

      navigate('/client-dashboard', { replace: true });
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const toggleFundingPurpose = (val: string) => setFundingPurposes(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const steps = [
    { label: 'Contact', phase: 'contact' },
    { label: 'Snapshot', phase: 'snapshot' },
    { label: 'Results', phase: 'results' },
    { label: 'Book', phase: 'booking' },
    { label: 'Upgrade', phase: 'paywall' },
    { label: 'Details', phase: 'deep-a' },
    { label: 'Account', phase: 'signup' },
  ];
  const stepIndex = { contact: 0, snapshot: 1, results: 2, booking: 3, paywall: 4, 'deep-a': 5, 'deep-b': 5, 'deep-c': 5, 'deep-d': 5, signup: 6 }[phase];

  if (hydrating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="bg-background rounded-2xl border border-border shadow-sm px-8 py-6 text-center">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
            <div className="text-sm text-muted-foreground">Checking your saved business snapshot...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      {/* Step indicator */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl mt-14">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < stepIndex ? 'bg-primary' : i === stepIndex ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]' : 'bg-border'
                }`} />
                {i < steps.length - 1 && <div className={`w-5 h-px ${i < stepIndex ? 'bg-primary/40' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center py-10 px-6 overflow-auto">
        <div className="w-full max-w-lg">

          {/* ═══════ STEP 1: CONTACT ═══════ */}
          {phase === 'contact' && (
            <div className="animate-fade-up">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/[0.06] text-primary text-xs font-semibold px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Takes 60 seconds to get your score
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Get your personalized<br />business snapshot</h1>
                <p className="text-sm text-muted-foreground">Quick info so we can tailor everything to you.</p>
              </div>
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">What are you here for? <span className="text-destructive">*</span></label>
                  <MultiPill options={goalOptions} selected={selectedGoals} onToggle={toggleGoal} />
                </div>
                <div className="space-y-0">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="Sarah" required />
                    <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Johnson" required />
                  </div>
                  <InputField label="Email Address" value={email} onChange={setEmail} placeholder="you@company.com" type="email" required />
                  <InputField label="Mobile Phone" value={phone} onChange={setPhone} placeholder="(404) 555-1234" type="tel" />
                  <InputField label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Johnson's Catering LLC" required />
                  {!noWebsite && <InputField label="Business Website" value={website} onChange={setWebsite} placeholder="www.example.com" />}
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input type="checkbox" checked={noWebsite} onChange={() => setNoWebsite(!noWebsite)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                    <span className="text-xs text-muted-foreground">I don't have a website</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <PrimaryBtn onClick={() => setPhase('snapshot')} disabled={selectedGoals.length === 0 || !firstName.trim() || !lastName.trim() || !email.trim() || !businessName.trim()}>
                  Continue <ArrowRight className="w-4 h-4" />
                </PrimaryBtn>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-5">
                Already have an account? <Link to="/auth" className="text-primary font-semibold hover:underline no-underline">Sign In</Link>
              </p>
            </div>
          )}

          {/* ═══════ STEP 2: SNAPSHOT ═══════ */}
          {phase === 'snapshot' && (
            <div className="animate-fade-up">
              <SectionTitle title="Let's quickly assess where your business stands" subtitle="3 questions to calculate your fundability score" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">What's your estimated credit score?</label>
                  <OptionPill options={creditScoreOptions} selected={creditScore} onSelect={setCreditScore} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">What's your approximate annual revenue?</label>
                  <OptionPill options={revenueOptions} selected={revenue} onSelect={setRevenue} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">How long have you been in business?</label>
                  <OptionPill options={timeOptions} selected={timeInBusiness} onSelect={setTimeInBusiness} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('contact')} />
                <PrimaryBtn onClick={() => setPhase('results')} disabled={!creditScore || !revenue || !timeInBusiness}>
                  See My Score <ArrowRight className="w-4 h-4" />
                </PrimaryBtn>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: RESULTS ═══════ */}
          {phase === 'results' && (
            <div className="animate-fade-up space-y-6">
              {/* Score */}
              <div className="bg-background rounded-2xl border border-border shadow-sm p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Your Fundability Score</p>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg viewBox="0 0 128 128" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                    <circle cx="64" cy="64" r="54" fill="none" stroke={scoreInfo.ring} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 54} strokeDashoffset={2 * Math.PI * 54 - (2 * Math.PI * 54 * fundabilityScore) / 100}
                      className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">{fundabilityScore}%</span>
                    <span className="text-xs text-muted-foreground">fundable</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 ${scoreInfo.bg} ${scoreInfo.color} text-sm font-semibold px-4 py-2 rounded-full`}>
                  {scoreInfo.tier} — {scoreInfo.text}
                </div>
              </div>

              {/* Business Model Canvas Snapshot */}
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground text-base">Your Business Snapshot</h3>
                    <p className="text-xs text-muted-foreground">Auto-generated from your answers</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  {generateCanvasSnapshot(businessName || 'Your Business', revenue, timeInBusiness, creditScore).map((item, i) => (
                    <div key={item.title} className={`px-5 py-4 ${i >= 2 ? 'border-t border-border' : ''} hover:bg-secondary/30 transition-colors`}>
                      <div className="text-xs font-bold text-primary mb-1">{item.title}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>


              <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-bold text-foreground text-base mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Key Insights
                </h3>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA — Book a walkthrough to continue */}
              <div className="bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] rounded-2xl p-6 text-center text-white">
                <p className="text-sm text-white/70 mb-1">You've seen your fundability score.</p>
                <p className="font-bold text-base mb-4">Book a walkthrough to get a personalized action plan and unlock AI advisors.</p>
                <button onClick={() => setPhase('booking')}
                  className="bg-white text-foreground font-semibold text-sm px-8 py-3.5 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-none flex items-center gap-2 mx-auto">
                  <Sparkles className="w-4 h-4" /> Book My Walkthrough
                </button>
              </div>
            </div>
          )}

          {/* ═══════ BOOKING WALL ═══════ */}
          {phase === 'booking' && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Schedule Your Walkthrough</h2>
                <p className="text-sm text-muted-foreground">Pick a time that works for you. Once confirmed, you'll get full access to the platform and AI advisors.</p>
              </div>
              <div className="rounded-2xl overflow-hidden bg-white border border-border relative" style={{ minHeight: 650 }}>
                {/* Loading state while Calendly loads */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 peer-[.loaded]:hidden" id="calendly-loader">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Loading scheduler…</p>
                </div>
                <iframe
                  src="https://calendly.com/mauricestewart/1-hour-consultation?hide_gdpr_banner=1&background_color=ffffff&text_color=1a1a2e&primary_color=2563eb"
                  width="100%"
                  height="650"
                  frameBorder="0"
                  title="Schedule a walkthrough"
                  onLoad={() => {
                    const loader = document.getElementById('calendly-loader');
                    if (loader) loader.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPhase('results')} className="flex-1 text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground transition-colors bg-transparent border-none py-2 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to my results
                </button>
                <button onClick={() => setPhase('paywall')} className="flex-1 bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white font-semibold text-sm py-3 rounded-xl cursor-pointer transition-all hover:shadow-lg border-none flex items-center justify-center gap-2">
                  Skip — Continue to Platform <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {phase === 'paywall' && (
            <div className="animate-fade-up space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Your AI Business Advisors</h2>
                <p className="text-sm text-muted-foreground">You have your fundability score. Now unlock the AI systems that help you improve it and get funded.</p>
              </div>

              <div className="space-y-3">
                {agentModules.map(agent => (
                  <div key={agent.id} className="rounded-xl border border-border p-4 flex items-center gap-4 bg-background hover:border-primary/20 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center flex-shrink-0`}>
                      <agent.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{agent.desc}</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-background rounded-2xl border-2 border-primary shadow-lg p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)]" />
                <div className="text-xs font-semibold text-primary bg-primary/[0.06] px-3 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl font-bold text-foreground">$299</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">Full Suite · All 6 AI Agents · Cancel anytime</p>
                <button onClick={() => setPhase('deep-a')}
                  className="w-full bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white font-semibold text-sm py-4 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-none mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Start 7-Day Free Trial
                </button>
                <p className="text-[11px] text-muted-foreground/60">No charge for 7 days · $299/mo after · Cancel anytime</p>
              </div>

              {/* Credit Agent Add-On */}
              <div className="bg-background rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">Credit Agent</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">AI-powered credit monitoring, dispute filing & score optimization</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-foreground text-sm">+$99<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                  <span className="text-[10px] text-muted-foreground">Add-on</span>
                </div>
              </div>

              {/* Custom Agent CTA */}
              <div className="bg-secondary/50 rounded-2xl border border-border p-5 text-center">
                <div className="text-sm font-semibold text-foreground mb-1">Need a Custom Agent?</div>
                <p className="text-xs text-muted-foreground mb-3">We build tailored AI agents for your specific industry, workflow, or compliance needs.</p>
                <a href="mailto:hello@credibilitysuite.ai" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline no-underline cursor-pointer">
                  Tell Us More <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <button onClick={() => setPhase('results')} className="w-full text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground transition-colors bg-transparent border-none py-2 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to my results
              </button>
            </div>
          )}

          {/* ═══════ STEP 5A ═══════ */}
          {phase === 'deep-a' && (
            <div className="animate-fade-up">
              <SectionTitle title="Tell us more about your business" subtitle="Section 1 of 4 — Business Details" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">What does your business do?</label>
                  <textarea value={bizDescription} onChange={e => setBizDescription(e.target.value)} placeholder="Brief description..."
                    className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl placeholder:text-muted-foreground/40 min-h-[80px] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">Where is your business based?</label>
                  <OptionPill options={businessLocationOpts} selected={bizLocation} onSelect={setBizLocation} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-3">What stage are you in?</label>
                  <OptionPill options={stageOpts} selected={bizStage} onSelect={setBizStage} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('paywall')} />
                <PrimaryBtn onClick={() => setPhase('deep-b')} disabled={!bizLocation || !bizStage}>Continue <ArrowRight className="w-4 h-4" /></PrimaryBtn>
              </div>
            </div>
          )}

          {/* ═══════ STEP 5B ═══════ */}
          {phase === 'deep-b' && (
            <div className="animate-fade-up">
              <SectionTitle title="Financial Depth" subtitle="Section 2 of 4 — Understanding your finances" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">Is your business profitable?</label><OptionPill options={profitableOpts} selected={profitable} onSelect={setProfitable} /></div>
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">How organized are your financials?</label><OptionPill options={financialsOpts} selected={financials} onSelect={setFinancials} /></div>
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">What does your cash flow look like?</label><OptionPill options={cashflowOpts} selected={cashflow} onSelect={setCashflow} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('deep-a')} />
                <PrimaryBtn onClick={() => setPhase('deep-c')} disabled={!profitable || !financials || !cashflow}>Continue <ArrowRight className="w-4 h-4" /></PrimaryBtn>
              </div>
            </div>
          )}

          {/* ═══════ STEP 5C ═══════ */}
          {phase === 'deep-c' && (
            <div className="animate-fade-up">
              <SectionTitle title="Business Model Intelligence" subtitle="Section 3 of 4 — How you operate" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">Who are your primary customers?</label><OptionPill options={customerOpts} selected={customers} onSelect={setCustomers} /></div>
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">What is your main revenue model?</label><OptionPill options={revenueModelOpts} selected={revenueModel} onSelect={setRevenueModel} /></div>
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">What is your biggest bottleneck?</label><OptionPill options={bottleneckOpts} selected={bottleneck} onSelect={setBottleneck} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('deep-b')} />
                <PrimaryBtn onClick={() => setPhase('deep-d')} disabled={!customers || !revenueModel || !bottleneck}>Continue <ArrowRight className="w-4 h-4" /></PrimaryBtn>
              </div>
            </div>
          )}

          {/* ═══════ STEP 5D ═══════ */}
          {phase === 'deep-d' && (
            <div className="animate-fade-up">
              <SectionTitle title="Funding & Execution" subtitle="Section 4 of 4 — Almost done!" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">What would you use funding for? (select all)</label><MultiPill options={fundingPurposeOpts} selected={fundingPurposes} onToggle={toggleFundingPurpose} /></div>
                <div><label className="block text-sm font-semibold text-foreground/80 mb-3">How soon do you need funding?</label><OptionPill options={fundingTimelineOpts} selected={fundingTimeline} onSelect={setFundingTimeline} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('deep-c')} />
                <PrimaryBtn onClick={() => setPhase('signup')} disabled={fundingPurposes.length === 0 || !fundingTimeline}>
                  Create My Account <ArrowRight className="w-4 h-4" />
                </PrimaryBtn>
              </div>
            </div>
          )}

          {/* ═══════ STEP 6: SIGNUP ═══════ */}
          {phase === 'signup' && (
            <div className="animate-fade-up">
              <SectionTitle title={user ? 'Complete your profile' : 'Create your account'} subtitle="Last step — access your full AI-powered dashboard" />
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center gap-4 bg-primary/[0.04] rounded-xl p-4 mb-6 border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{fundabilityScore}%</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{firstName} {lastName}</div>
                    <div className="text-xs text-muted-foreground">{businessName} · Fundability {scoreInfo.tier}</div>
                  </div>
                </div>
                <InputField label="Email" value={email} onChange={(v: string) => { setEmail(v); setError(''); }} placeholder="you@company.com" type="email" required />
                {!user && (
                  <InputField label="Password" value={signupPassword} onChange={(v: string) => { setSignupPassword(v); setError(''); }} placeholder="Min 6 characters" type="password" required />
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <BackBtn onClick={() => setPhase('deep-d')} />
                <PrimaryBtn onClick={handleSignUp} disabled={loading || !email.trim() || (!user && signupPassword.length < 6)}>
                  {loading ? 'Saving...' : user ? 'Complete Onboarding' : 'Launch Dashboard'} <ArrowRight className="w-4 h-4" />
                </PrimaryBtn>
              </div>
              {error && <p className="text-sm text-destructive text-center mt-4 bg-destructive/5 rounded-xl px-4 py-3">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
