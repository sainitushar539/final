import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, Check, Loader2, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  NAICS_INDUSTRIES,
  CREDIT_SCORE_RANGES,
  FUNDING_AMOUNTS,
  BUSINESS_NEEDS,
  TIME_IN_BUSINESS,
  ANNUAL_REVENUE,
} from '@/data/intakeOptions';

const TOTAL_STEPS = 4;

interface FormData {
  contactName: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  naicsCode: string;
  needs: string[];
  creditScore: string;
  amountSeeking: string;
  timeInBusiness: string;
  annualRevenue: string;
}

// Group NAICS by sector for browsable categories
const NAICS_SECTORS = [
  { header: '🖥️ Technology & Software', codes: ['511210','518210','519130','541511','541512','541513','541519','541611','541618','541690'] },
  { header: '🏗️ Construction & Trades', codes: ['236','237','238'] },
  { header: '🍽️ Food & Restaurants', codes: ['311','312','445','722','721'] },
  { header: '🏥 Healthcare & Social Services', codes: ['621','622','623','624'] },
  { header: '🏪 Retail & E-Commerce', codes: ['441','442','443','444','446','447','448','451','452','453','454'] },
  { header: '🚛 Transportation & Logistics', codes: ['481','482','483','484','485','486','487','488','491','492','493'] },
  { header: '💰 Finance & Insurance', codes: ['521','522','523','524','525'] },
  { header: '🏠 Real Estate', codes: ['531','532','533'] },
  { header: '⚖️ Professional Services', codes: ['5411','5412','5418','5419','541715'] },
  { header: '🎓 Education', codes: ['6111','6112','6113','6114','6115','6116','6117'] },
  { header: '🎭 Arts, Entertainment & Recreation', codes: ['711','712','713'] },
  { header: '🏭 Manufacturing', codes: ['313','314','315','316','321','322','323','324','325','326','327','331','332','333','334','335','336','337','339'] },
  { header: '📡 Telecom & Media', codes: ['512','515','517'] },
  { header: '🌾 Agriculture & Natural Resources', codes: ['111','112','113','114','115','211','212','213'] },
  { header: '⚡ Utilities', codes: ['2211','2212','2213'] },
  { header: '🛒 Wholesale Trade', codes: ['423','424','425'] },
  { header: '🔧 Other Services', codes: ['811','812','813','814','551','561','562'] },
  { header: '🏛️ Government & Public Admin', codes: ['921','922','923','924','925','926','927','928'] },
];

const naicsLookup = Object.fromEntries(NAICS_INDUSTRIES.map(i => [i.code, i]));

const NaicsDropdownStep = ({ selectedCode, selectedLabel, onSelect }: {
  selectedCode: string;
  selectedLabel: string;
  onSelect: (code: string, label: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSearching = search.trim().length > 0;
  const q = search.toLowerCase();

  const filteredFlat = useMemo(() => {
    if (!isSearching) return [];
    return NAICS_INDUSTRIES.filter(
      ind => ind.label.toLowerCase().includes(q) || ind.code.includes(q)
    );
  }, [search, isSearching, q]);

  return (
    <div>
      <h2 className="text-[28px] font-extrabold text-white mb-2">What industry are you in?</h2>
      <p className="text-[16px] text-white/60 mb-8">Browse categories or search to find your industry.</p>

      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
            selectedCode
              ? 'bg-[#2563eb]/10 border-[#2563eb]/40 text-white'
              : 'bg-white/[0.06] border-white/[0.12] text-white/40'
          }`}
        >
          <span className="text-[15px] truncate">
            {selectedCode ? `${selectedLabel}` : 'Select your industry…'}
          </span>
          <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-[#0f1d33] border border-white/[0.15] rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-white/[0.08]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search (e.g. restaurant, software, trucking…)"
                  autoFocus
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50"
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                filteredFlat.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/40 text-[14px]">No industries found</div>
                ) : (
                  filteredFlat.map(ind => (
                    <button
                      key={ind.code}
                      onClick={() => { onSelect(ind.code, ind.label); setOpen(false); setSearch(''); }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        selectedCode === ind.code ? 'bg-[#2563eb]/15 text-white' : 'text-white/70 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-[14px] font-medium">{ind.label}</span>
                      {selectedCode === ind.code && <Check className="w-4 h-4 text-[#2563eb]" />}
                    </button>
                  ))
                )
              ) : (
                NAICS_SECTORS.map(sector => {
                  const items = sector.codes.map(c => naicsLookup[c]).filter(Boolean);
                  if (items.length === 0) return null;
                  return (
                    <div key={sector.header}>
                      <div className="px-4 py-2.5 text-[13px] font-bold text-white/50 bg-white/[0.03] sticky top-0">
                        {sector.header}
                      </div>
                      {items.map(ind => (
                        <button
                          key={ind.code}
                          onClick={() => { onSelect(ind.code, ind.label); setOpen(false); setSearch(''); }}
                          className={`w-full text-left px-6 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                            selectedCode === ind.code ? 'bg-[#2563eb]/15 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                          }`}
                        >
                          <span className="text-[14px]">{ind.label}</span>
                          {selectedCode === ind.code && <Check className="w-4 h-4 text-[#2563eb]" />}
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const IntakePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    contactName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    naicsCode: '',
    needs: [],
    creditScore: '',
    amountSeeking: '',
    timeInBusiness: '',
    annualRevenue: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const update = (field: keyof FormData, value: string | string[]) => {
    if (field === 'phone' && typeof value === 'string') {
      setForm(prev => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const validation = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneDigits = form.phone.replace(/\D/g, '');
    return {
      email: !form.email.trim() ? 'Email is required' : !emailRegex.test(form.email.trim()) ? 'Enter a valid email address' : '',
      phone: form.phone.trim() && phoneDigits.length < 10 ? 'Enter a valid 10-digit phone number' : '',
    };
  }, [form.email, form.phone]);

  const toggleNeed = (value: string) => {
    setForm(prev => ({
      ...prev,
      needs: prev.needs.includes(value)
        ? prev.needs.filter(n => n !== value)
        : [...prev.needs, value],
    }));
  };

  const selectIndustry = (code: string, label: string) => {
    setForm(prev => ({ ...prev, industry: label, naicsCode: code }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.contactName.trim() && form.email.trim() && form.companyName.trim() && !validation.email && !validation.phone;
      case 2:
        return form.industry && form.naicsCode;
      case 3:
        return form.needs.length > 0;
      case 4:
        return form.creditScore && form.timeInBusiness && form.annualRevenue;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const amountEntry = FUNDING_AMOUNTS.find(a => a.value === form.amountSeeking);

    try {
      const { error } = await supabase.from('leads').insert({
        contact_name: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company_name: form.companyName.trim(),
        industry: form.industry,
        naics_code: form.naicsCode,
        credit_score_range: form.creditScore,
        amount_seeking: amountEntry?.amount ?? null,
        needs: form.needs,
        responses: {
          timeInBusiness: form.timeInBusiness,
          annualRevenue: form.annualRevenue,
          amountSeeking: form.amountSeeking,
        },
      });

      if (error) throw error;
      // Store lead data for onboarding pre-fill
      sessionStorage.setItem('leadData', JSON.stringify({
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        industry: form.industry,
        naicsCode: form.naicsCode,
        creditScore: form.creditScore,
        timeInBusiness: form.timeInBusiness,
        annualRevenue: form.annualRevenue,
        amountSeeking: form.amountSeeking,
        needs: form.needs,
      }));
      sessionStorage.setItem('leadCaptured', 'true');
      navigate('/onboarding');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === TOTAL_STEPS) {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const back = () => setStep(s => Math.max(1, s - 1));

  // After submission, user is redirected to /onboarding

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Credibility Suite</span>
        </div>
        <div className="text-[14px] text-white/50 font-mono">
          Step {step} of {TOTAL_STEPS}
        </div>
      </nav>

      {/* Progress bar */}
      <div className="px-6 mb-8">
        <div className="max-w-xl mx-auto h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="max-w-xl w-full animate-fade-up" key={step}>

          {/* STEP 1: Contact Info */}
          {step === 1 && (
            <div>
              <h2 className="text-[28px] font-extrabold text-white mb-2">Let's get to know you.</h2>
              <p className="text-[16px] text-white/60 mb-8">Tell us a bit about yourself and your business.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Your Full Name *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={e => update('contactName', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3.5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="jane@mybusiness.com"
                    className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3.5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-all ${
                      touched.email && validation.email
                        ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/30'
                        : touched.email && !validation.email && form.email
                        ? 'border-emerald-500/40 focus:border-emerald-500/50 focus:ring-emerald-500/30'
                        : 'border-white/[0.12] focus:border-[#2563eb]/50 focus:ring-[#2563eb]/30'
                    }`}
                  />
                  {touched.email && validation.email && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validation.email}
                    </p>
                  )}
                  {touched.email && !validation.email && form.email && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      Valid email
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    onBlur={() => markTouched('phone')}
                    placeholder="(555) 123-4567"
                    className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3.5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-all ${
                      touched.phone && validation.phone
                        ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/30'
                        : touched.phone && !validation.phone && form.phone
                        ? 'border-emerald-500/40 focus:border-emerald-500/50 focus:ring-emerald-500/30'
                        : 'border-white/[0.12] focus:border-[#2563eb]/50 focus:ring-[#2563eb]/30'
                    }`}
                  />
                  {touched.phone && validation.phone && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validation.phone}
                    </p>
                  )}
                  {touched.phone && !validation.phone && form.phone && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      Valid phone number
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Business / Company Name *</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={e => update('companyName', e.target.value)}
                    placeholder="My Awesome Business LLC"
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3.5 text-[16px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/30 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Industry & NAICS */}
          {step === 2 && (
            <NaicsDropdownStep
              selectedCode={form.naicsCode}
              selectedLabel={form.industry}
              onSelect={selectIndustry}
            />
          )}

          {/* STEP 3: Needs (Multi-Select) */}
          {step === 3 && (
            <div>
              <h2 className="text-[28px] font-extrabold text-white mb-2">What do you need help with?</h2>
              <p className="text-[16px] text-white/60 mb-8">Select all that apply — this helps us put you in the right path.</p>

              <div className="grid grid-cols-1 gap-3">
                {BUSINESS_NEEDS.map(need => (
                  <button
                    key={need.value}
                    onClick={() => toggleNeed(need.value)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                      form.needs.includes(need.value)
                        ? 'bg-[#2563eb]/15 border-[#2563eb]/40 text-white'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.07] hover:border-white/[0.15]'
                    }`}
                  >
                    <span className="text-[24px]">{need.icon}</span>
                    <span className="text-[15px] font-semibold flex-1">{need.label}</span>
                    {form.needs.includes(need.value) && (
                      <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Credit Score, Revenue, Time, Amount */}
          {step === 4 && (
            <div>
              <h2 className="text-[28px] font-extrabold text-white mb-2">A few more details.</h2>
              <p className="text-[16px] text-white/60 mb-8">This helps us understand your funding position and next best step.</p>

              <div className="space-y-6">
                {/* Credit Score */}
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Estimated Credit Score *</label>
                  <div className="space-y-2">
                    {CREDIT_SCORE_RANGES.map(cs => (
                      <button
                        key={cs.value}
                        onClick={() => update('creditScore', cs.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-[15px] font-medium ${
                          form.creditScore === cs.value
                            ? 'bg-[#2563eb]/15 border-[#2563eb]/40 text-white'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.07]'
                        }`}
                      >
                        {cs.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time in Business */}
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Time in Business *</label>
                  <div className="space-y-2">
                    {TIME_IN_BUSINESS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => update('timeInBusiness', t.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-[15px] font-medium ${
                          form.timeInBusiness === t.value
                            ? 'bg-[#2563eb]/15 border-[#2563eb]/40 text-white'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.07]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Revenue */}
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">Annual Revenue *</label>
                  <div className="space-y-2">
                    {ANNUAL_REVENUE.map(r => (
                      <button
                        key={r.value}
                        onClick={() => update('annualRevenue', r.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-[15px] font-medium ${
                          form.annualRevenue === r.value
                            ? 'bg-[#2563eb]/15 border-[#2563eb]/40 text-white'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.07]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Seeking */}
                <div>
                  <label className="block text-[14px] font-semibold text-white/80 mb-2">How much funding are you seeking?</label>
                  <div className="space-y-2">
                    {FUNDING_AMOUNTS.map(a => (
                      <button
                        key={a.value}
                        onClick={() => update('amountSeeking', a.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-[15px] font-medium ${
                          form.amountSeeking === a.value
                            ? 'bg-[#2563eb]/15 border-[#2563eb]/40 text-white'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.07]'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.08]">
            {step > 1 ? (
              <button
                onClick={back}
                className="flex items-center gap-2 text-[15px] text-white/60 font-medium hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[15px] text-white/60 font-medium hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
            )}
            <button
              onClick={next}
              disabled={!canProceed() || submitting}
              className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-[15px] font-bold px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_hsl(220_80%_50%/0.3)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  See My Results
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakePage;
