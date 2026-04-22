import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import JourneyShell from './JourneyShell';
import AdviceCard from './AdviceCard';
import BookingCTA from './BookingCTA';
import { useJourneyAdvice } from './useJourneyAdvice';
import type { JourneyProps } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { persistFundingSnapshot, savePendingFundingSnapshot } from '@/lib/clientDashboardData';

const creditOpts = [
  { label: '780+', value: '780+' },
  { label: '740–779', value: '740-779' },
  { label: '680–739', value: '680-739' },
  { label: '600–680', value: '600-680' },
  { label: 'Below 600', value: '<600' },
];
const revenueOpts = [
  { label: '$1M+', value: '1m+' },
  { label: '$250K–$1M', value: '250k-1m' },
  { label: '$100K–$250K', value: '100k-250k' },
  { label: 'Under $100K', value: 'under100k' },
  { label: 'Pre-revenue', value: 'pre' },
];
const timeOpts = [
  { label: '10+ years', value: '10+' },
  { label: '2-5 years', value: '2-5' },
  { label: 'Less than 2 years', value: '<2' },
  { label: 'Not started yet', value: 'not-started' },
];

type Phase = 'questions' | 'results';

const FundingJourney = ({ lead, onBack }: JourneyProps) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('questions');
  const [credit, setCredit] = useState('');
  const [revenue, setRevenue] = useState('');
  const [time, setTime] = useState('');
  const { advice, loading, error, fetchAdvice } = useJourneyAdvice();

  const score = (() => {
    const cs = { '780+': 10, '740-779': 8, '680-739': 6, '600-680': 4, '<600': 2 }[credit] || 0;
    const rv = { '1m+': 10, '250k-1m': 8, '100k-250k': 6, 'under100k': 4, 'pre': 2 }[revenue] || 0;
    const tb = { '10+': 10, '2-5': 8, '2-5+': 10, '2-10': 8, '<2': 4, 'not-started': 1 }[time] || 0;
    return Math.round(((cs + rv + tb) / 30) * 100);
  })();

  const canContinue = credit && revenue && time;

  const handleContinue = () => {
    setPhase('results');
    const snapshot = {
      businessName: lead.name || 'My Business',
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      goals: lead.goals,
      credit,
      revenue,
      timeInBusiness: time,
      score,
      source: 'homepage_funding_journey',
    };
    savePendingFundingSnapshot(snapshot);
    if (user?.id) {
      void persistFundingSnapshot(user.id, snapshot);
    }
    fetchAdvice('funding', { name: lead.name, credit, revenue, time, score });
  };

  useEffect(() => {
    if (phase === 'results' && !advice && !loading && !error) {
      fetchAdvice('funding', { name: lead.name, credit, revenue, time, score });
    }
  }, [phase]);

  const Pills = ({ options, selected, onSelect }: { options: { label: string; value: string }[]; selected: string; onSelect: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} onClick={() => onSelect(o.value)}
          className={`text-sm font-medium px-4 py-2.5 rounded-xl border transition-all cursor-pointer bg-transparent ${
            selected === o.value ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08] text-white' : 'border-white/[0.1] text-white/50 hover:border-white/[0.2]'
          }`}>
          {selected === o.value && <Check className="w-3 h-3 inline mr-1.5" />}{o.label}
        </button>
      ))}
    </div>
  );

  return (
    <JourneyShell onBack={onBack}>
      {phase === 'questions' && (
        <>
          <div className="mb-2">
            <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">💰 Your Path to Funding</span>
            <h2 className="text-2xl font-extrabold text-white mb-1">3 quick questions.</h2>
            <p className="text-sm text-white/50 mb-6">We'll generate your funding readiness score.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-3">What's your estimated credit score?</label>
              <Pills options={creditOpts} selected={credit} onSelect={setCredit} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-3">Annual revenue?</label>
              <Pills options={revenueOpts} selected={revenue} onSelect={setRevenue} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-3">How long have you been in business?</label>
              <Pills options={timeOpts} selected={time} onSelect={setTime} />
            </div>
          </div>
          <button onClick={handleContinue} disabled={!canContinue}
            className="w-full mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            See My Score →
          </button>
        </>
      )}

      {phase === 'results' && (
        <>
          <div className="text-center mb-6">
            <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">Your Funding Score</span>
            <div className="text-6xl font-extrabold text-white mb-1">{score}</div>
            <p className="text-sm text-white/50">
              {score >= 80 ? "Excellent — You're highly fundable!" : score >= 60 ? 'Good — Strong foundation' : score >= 40 ? "Building — Let's close the gaps" : 'Getting Started — We can help'}
            </p>
          </div>
          <AdviceCard advice={advice} loading={loading} error={error} onRetry={() => fetchAdvice('funding', { name: lead.name, credit, revenue, time, score })} loadingText="Generating your credit snapshot..." />
          {!loading && advice && <BookingCTA title="Book a Funding Strategy Call" />}
        </>
      )}
    </JourneyShell>
  );
};

export default FundingJourney;
