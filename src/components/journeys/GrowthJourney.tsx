import { useState } from 'react';
import { Check } from 'lucide-react';
import JourneyShell from './JourneyShell';
import AdviceCard from './AdviceCard';
import BookingCTA from './BookingCTA';
import { useJourneyAdvice } from './useJourneyAdvice';
import type { JourneyProps } from './types';

const focusOpts = [
  { label: 'Getting more customers & leads', value: 'leads' },
  { label: 'Social media & content marketing', value: 'social' },
  { label: 'Scaling operations', value: 'operations' },
  { label: 'Building a team', value: 'team' },
  { label: 'Revenue growth strategy', value: 'revenue' },
];

const GrowthJourney = ({ lead, onBack }: JourneyProps) => {
  const [focus, setFocus] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const { advice, loading, error, fetchAdvice } = useJourneyAdvice();

  const handleContinue = () => {
    setShowAdvice(true);
    const focusLabel = focusOpts.find((option) => option.value === focus)?.label || focus;
    fetchAdvice('growth', { name: lead.name, focus, focusLabel, website: lead.website });
  };

  return (
    <JourneyShell onBack={onBack}>
      <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">🚀 Business Growth</span>

      {!showAdvice ? (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">What's your growth focus?</h2>
          <p className="text-sm text-white/50 mb-6">We'll build a lead gen plan and business model canvas for you.</p>
          <div className="space-y-2.5">
            {focusOpts.map(o => (
              <button key={o.value} onClick={() => setFocus(o.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer bg-transparent flex items-center gap-3 ${
                  focus === o.value ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08]' : 'border-white/[0.1] hover:border-white/[0.2]'
                }`}>
                <span className={`text-sm font-medium ${focus === o.value ? 'text-white' : 'text-white/60'}`}>{o.label}</span>
                {focus === o.value && <Check className="w-4 h-4 text-[#2563eb] ml-auto" />}
              </button>
            ))}
          </div>
          <button onClick={handleContinue} disabled={!focus}
            className="w-full mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            Build My Growth Plan →
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">Your Growth Plan</h2>
          <p className="text-sm text-white/50 mb-6">Here's a personalized strategy for your business.</p>
          <AdviceCard advice={advice} loading={loading} error={error} onRetry={() => {
            const focusLabel = focusOpts.find((option) => option.value === focus)?.label || focus;
            fetchAdvice('growth', { name: lead.name, focus, focusLabel, website: lead.website });
          }} loadingText="Building your growth plan..." />
          {!loading && advice && <BookingCTA title="Book a Growth Strategy Call" subtitle="Get a detailed marketing plan and business model canvas" />}
        </>
      )}
    </JourneyShell>
  );
};

export default GrowthJourney;
