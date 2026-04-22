import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import JourneyShell from './JourneyShell';
import AdviceCard from './AdviceCard';
import BookingCTA from './BookingCTA';
import { useJourneyAdvice } from './useJourneyAdvice';
import type { JourneyProps } from './types';

const situationOpts = [
  { label: 'Bad credit — need to rebuild', value: 'rebuild' },
  { label: 'Fair credit — want to improve', value: 'improve' },
  { label: 'Good credit — want excellent', value: 'optimize' },
  { label: 'Not sure where I stand', value: 'unsure' },
];

const CreditJourney = ({ lead, onBack }: JourneyProps) => {
  const [situation, setSituation] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const { advice, loading, error, fetchAdvice } = useJourneyAdvice();

  const handleContinue = () => {
    setShowAdvice(true);
    const situationLabel = situationOpts.find((option) => option.value === situation)?.label || situation;
    fetchAdvice('credit', { name: lead.name, situation, situationLabel });
  };

  return (
    <JourneyShell onBack={onBack}>
      <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">💳 Credit Enhancement</span>

      {!showAdvice ? (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">Where are you with your credit?</h2>
          <p className="text-sm text-white/50 mb-6">We'll build a roadmap to get you where you need to be.</p>
          <div className="space-y-2.5">
            {situationOpts.map(o => (
              <button key={o.value} onClick={() => setSituation(o.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer bg-transparent flex items-center gap-3 ${
                  situation === o.value ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08]' : 'border-white/[0.1] hover:border-white/[0.2]'
                }`}>
                <span className={`text-sm font-medium ${situation === o.value ? 'text-white' : 'text-white/60'}`}>{o.label}</span>
                {situation === o.value && <Check className="w-4 h-4 text-[#2563eb] ml-auto" />}
              </button>
            ))}
          </div>
          <button onClick={handleContinue} disabled={!situation}
            className="w-full mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            Get My Credit Roadmap →
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">Your Credit Roadmap</h2>
          <p className="text-sm text-white/50 mb-6">Here's what we recommend to strengthen your credit profile.</p>
          <AdviceCard advice={advice} loading={loading} error={error} onRetry={() => {
            const situationLabel = situationOpts.find((option) => option.value === situation)?.label || situation;
            fetchAdvice('credit', { name: lead.name, situation, situationLabel });
          }} loadingText="Building your credit roadmap..." />
          {!loading && advice && <BookingCTA title="Book a Credit Strategy Session" />}
        </>
      )}
    </JourneyShell>
  );
};

export default CreditJourney;
