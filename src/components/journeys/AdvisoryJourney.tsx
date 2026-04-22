import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import JourneyShell from './JourneyShell';
import AdviceCard from './AdviceCard';
import BookingCTA from './BookingCTA';
import { useJourneyAdvice } from './useJourneyAdvice';
import type { JourneyProps } from './types';

/* ─── 20 Questions across 7 sections ─── */

interface Question {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  multi?: boolean;
}

interface Section {
  title: string;
  icon: string;
  questions: Question[];
}

const SECTIONS: Section[] = [
  {
    title: 'Customer & Market Clarity',
    icon: '🎯',
    questions: [
      { key: 'q1_customer', label: 'Who is your primary customer?', options: [
        { label: 'Consumers (B2C)', value: 'b2c' }, { label: 'Businesses (B2B)', value: 'b2b' },
        { label: 'Government', value: 'gov' }, { label: 'Mixed', value: 'mixed' },
      ]},
      { key: 'q2_target', label: 'How clearly defined is your target customer?', options: [
        { label: 'Very specific niche', value: 'specific' }, { label: 'Somewhat defined', value: 'somewhat' },
        { label: 'Broad / unclear', value: 'broad' }, { label: 'Still exploring', value: 'exploring' },
      ]},
      { key: 'q3_problem', label: 'What problem are you primarily solving?', options: [
        { label: 'Revenue growth', value: 'revenue' }, { label: 'Cost savings', value: 'cost' },
        { label: 'Convenience / time savings', value: 'convenience' }, { label: 'Compliance / risk reduction', value: 'compliance' },
        { label: 'Lifestyle / emotional benefit', value: 'lifestyle' },
      ]},
      { key: 'q4_urgency', label: 'How urgent is this problem for your customer?', options: [
        { label: 'Critical (must solve now)', value: 'critical' }, { label: 'Important (actively seeking)', value: 'important' },
        { label: 'Moderate (nice to have)', value: 'moderate' }, { label: 'Low urgency', value: 'low' },
      ]},
    ],
  },
  {
    title: 'Value Proposition',
    icon: '💎',
    questions: [
      { key: 'q5_value_prop', label: 'What is your primary value proposition?', options: [
        { label: 'Better / faster service', value: 'faster' }, { label: 'Lower cost', value: 'cost' },
        { label: 'Higher quality / premium', value: 'premium' }, { label: 'Specialized expertise', value: 'expertise' },
        { label: 'Access to something rare', value: 'access' },
      ]},
      { key: 'q6_differentiator', label: 'What differentiates you from competitors?', options: [
        { label: 'Price advantage', value: 'price' }, { label: 'Brand / reputation', value: 'brand' },
        { label: 'Relationships / access', value: 'relationships' }, { label: 'Expertise / knowledge', value: 'expertise' },
        { label: 'Technology / systems', value: 'tech' }, { label: 'Not clearly differentiated', value: 'none' },
      ]},
      { key: 'q7_validation', label: 'How validated is your value in the market?', options: [
        { label: 'Strong traction (consistent demand)', value: 'strong' }, { label: 'Some traction (early validation)', value: 'some' },
        { label: 'Limited traction', value: 'limited' }, { label: 'No validation yet', value: 'none' },
      ]},
    ],
  },
  {
    title: 'Revenue Model',
    icon: '💰',
    questions: [
      { key: 'q8_revenue_model', label: 'What is your primary revenue model?', options: [
        { label: 'One-time transactions', value: 'one-time' }, { label: 'Recurring (subscriptions / retainers)', value: 'recurring' },
        { label: 'Project-based', value: 'project' }, { label: 'Mixed', value: 'mixed' },
        { label: 'Not generating revenue yet', value: 'none' },
      ]},
      { key: 'q9_predictability', label: 'How predictable is your revenue?', options: [
        { label: 'Highly predictable', value: 'high' }, { label: 'Somewhat predictable', value: 'somewhat' },
        { label: 'Inconsistent', value: 'inconsistent' }, { label: 'Unpredictable', value: 'unpredictable' },
      ]},
      { key: 'q10_deal_size', label: 'What is your average deal size or customer value?', options: [
        { label: 'High ($50K+ per client)', value: 'high' }, { label: 'Medium ($5K–$50K)', value: 'medium' },
        { label: 'Low ($500–$5K)', value: 'low' }, { label: 'Very low (<$500)', value: 'very-low' },
        { label: 'Unknown', value: 'unknown' },
      ]},
    ],
  },
  {
    title: 'Operations & Delivery',
    icon: '⚙️',
    questions: [
      { key: 'q11_delivery', label: 'How do you primarily deliver your product/service?', options: [
        { label: 'In-person', value: 'in-person' }, { label: 'Online / digital', value: 'online' },
        { label: 'Hybrid', value: 'hybrid' }, { label: 'Automated / system-driven', value: 'automated' },
      ]},
      { key: 'q12_scalability', label: 'How scalable is your current delivery model?', options: [
        { label: 'Highly scalable (systems-driven)', value: 'high' }, { label: 'Moderately scalable', value: 'moderate' },
        { label: 'Limited (people-dependent)', value: 'limited' }, { label: 'Not scalable yet', value: 'none' },
      ]},
      { key: 'q13_constraint', label: 'What is your biggest operational constraint?', options: [
        { label: 'Time', value: 'time' }, { label: 'Systems / technology', value: 'systems' },
        { label: 'Talent / team', value: 'talent' }, { label: 'Process inefficiencies', value: 'process' },
        { label: 'Supply / vendors', value: 'supply' },
      ]},
    ],
  },
  {
    title: 'Financial Health',
    icon: '📊',
    questions: [
      { key: 'q14_profitable', label: 'Is your business currently profitable?', options: [
        { label: 'Yes (consistently)', value: 'yes' }, { label: 'Break-even', value: 'breakeven' },
        { label: 'No, but improving', value: 'improving' }, { label: 'No, struggling', value: 'struggling' },
      ]},
      { key: 'q15_financials', label: 'How organized are your financials?', options: [
        { label: 'Fully organized (reports, KPIs, forecasts)', value: 'organized' }, { label: 'Mostly organized', value: 'mostly' },
        { label: 'Limited visibility', value: 'limited' }, { label: 'No structure', value: 'none' },
      ]},
      { key: 'q16_cashflow', label: 'What best describes your cash flow?', options: [
        { label: 'Strong and consistent', value: 'strong' }, { label: 'Stable with some variability', value: 'stable' },
        { label: 'Fluctuating', value: 'fluctuating' }, { label: 'Unpredictable', value: 'unpredictable' },
      ]},
    ],
  },
  {
    title: 'Resources & Partnerships',
    icon: '🤝',
    questions: [
      { key: 'q17_asset', label: 'What is your strongest asset today?', options: [
        { label: 'Brand / reputation', value: 'brand' }, { label: 'Relationships / network', value: 'relationships' },
        { label: 'Expertise / knowledge', value: 'expertise' }, { label: 'Systems / technology', value: 'systems' },
        { label: 'Capital', value: 'capital' },
      ]},
      { key: 'q18_partnerships', label: 'How strong are your partnerships?', options: [
        { label: 'Strong strategic partners', value: 'strong' }, { label: 'Some useful partnerships', value: 'some' },
        { label: 'Limited partnerships', value: 'limited' }, { label: 'No meaningful partnerships', value: 'none' },
      ]},
    ],
  },
  {
    title: 'Growth & Funding Readiness',
    icon: '🚀',
    questions: [
      { key: 'q19_bottleneck', label: 'What is your primary growth bottleneck?', options: [
        { label: 'Customers / demand', value: 'customers' }, { label: 'Capital', value: 'capital' },
        { label: 'Operations', value: 'operations' }, { label: 'Team', value: 'team' },
        { label: 'Systems', value: 'systems' }, { label: 'Strategy clarity', value: 'strategy' },
      ]},
      { key: 'q20_funding_use', label: 'What would you primarily use funding for?', multi: true, options: [
        { label: 'Hiring team', value: 'hiring' }, { label: 'Marketing / customer acquisition', value: 'marketing' },
        { label: 'Equipment / infrastructure', value: 'equipment' }, { label: 'Working capital', value: 'working_capital' },
        { label: 'Product / service development', value: 'product' }, { label: 'Expansion (locations, markets)', value: 'expansion' },
      ]},
    ],
  },
];

const TOTAL_SECTIONS = SECTIONS.length;

const AdvisoryJourney = ({ lead, onBack }: JourneyProps) => {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const { advice, loading, error, fetchAdvice } = useJourneyAdvice();

  const section = SECTIONS[sectionIdx];
  const isLast = sectionIdx === TOTAL_SECTIONS - 1;

  const setAnswer = (key: string, value: string, multi?: boolean) => {
    setAnswers(prev => {
      if (multi) {
        const arr = (prev[key] as string[]) || [];
        return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
      }
      return { ...prev, [key]: value };
    });
  };

  const sectionComplete = section.questions.every(q => {
    const val = answers[q.key];
    if (q.multi) return Array.isArray(val) && val.length > 0;
    return !!val;
  });

  const handleNext = () => {
    if (isLast) {
      setShowResults(true);
      // Build a readable summary of all answers for the AI
      const summary = SECTIONS.flatMap(s => s.questions.map(q => {
        const val = answers[q.key];
        const display = q.multi
          ? (val as string[])?.map(v => q.options.find(o => o.value === v)?.label).join(', ')
          : q.options.find(o => o.value === val)?.label;
        return `${q.label} → ${display || 'Not answered'}`;
      })).join('\n');

      fetchAdvice('advisory', {
        name: lead.name,
        website: lead.website,
        goals: lead.goals,
        intakeAnswers: summary,
      });
    } else {
      setSectionIdx(i => i + 1);
    }
  };

  const handleBack = () => {
    if (sectionIdx > 0) setSectionIdx(i => i - 1);
    else onBack();
  };

  if (showResults) {
    return (
      <JourneyShell onBack={() => { setShowResults(false); setSectionIdx(TOTAL_SECTIONS - 1); }}>
        <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">📋 Your Business Snapshot</span>
        <h2 className="text-2xl font-extrabold text-white mb-1">AI Business Analysis</h2>
        <p className="text-sm text-white/50 mb-6">Based on your 20 answers, here's a comprehensive snapshot and business model canvas.</p>
        <AdviceCard
          advice={advice}
          loading={loading}
          error={error}
          onRetry={() => {
            const summary = SECTIONS.flatMap(s => s.questions.map(q => {
              const val = answers[q.key];
              const display = q.multi
                ? (val as string[])?.map(v => q.options.find(o => o.value === v)?.label).join(', ')
                : q.options.find(o => o.value === val)?.label;
              return `${q.label} → ${display || 'N/A'}`;
            })).join('\n');
            fetchAdvice('advisory', { name: lead.name, website: lead.website, goals: lead.goals, intakeAnswers: summary });
          }}
          loadingText="Building your business snapshot & canvas..."
        />
        {!loading && advice && (
          <BookingCTA title="Book an Advisory Session" subtitle="Get your full Business Model Canvas and action plan" />
        )}
      </JourneyShell>
    );
  }

  // Questions UI — one section at a time
  const questionNumber = SECTIONS.slice(0, sectionIdx).reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <JourneyShell onBack={sectionIdx === 0 ? onBack : undefined}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full">
          {section.icon} {section.title}
        </span>
        <span className="text-xs text-white/30 font-mono">{sectionIdx + 1} / {TOTAL_SECTIONS}</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-6 mt-3">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-full transition-all duration-500"
          style={{ width: `${((sectionIdx + 1) / TOTAL_SECTIONS) * 100}%` }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-7">
        {section.questions.map((q, qi) => (
          <div key={q.key}>
            <label className="block text-sm font-semibold text-white/80 mb-3">
              <span className="text-white/30 font-mono text-xs mr-2">Q{questionNumber + qi + 1}.</span>
              {q.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => {
                const val = answers[q.key];
                const selected = q.multi
                  ? Array.isArray(val) && val.includes(opt.value)
                  : val === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnswer(q.key, opt.value, q.multi)}
                    className={`text-sm font-medium px-4 py-2.5 rounded-xl border transition-all cursor-pointer bg-transparent ${
                      selected
                        ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.15)]'
                        : 'border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:text-white/70'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 inline mr-1.5" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {q.multi && <p className="text-xs text-white/25 mt-1.5">Select all that apply</p>}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleBack}
          className="bg-white/[0.06] text-white/60 border border-white/[0.1] text-sm font-medium px-5 py-3.5 cursor-pointer rounded-xl transition-all hover:bg-white/[0.1] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!sectionComplete}
          className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLast ? 'Get My Business Snapshot' : 'Continue'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </JourneyShell>
  );
};

export default AdvisoryJourney;
