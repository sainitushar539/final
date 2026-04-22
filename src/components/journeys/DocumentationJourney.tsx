import { useState } from 'react';
import { Check } from 'lucide-react';
import JourneyShell from './JourneyShell';
import AdviceCard from './AdviceCard';
import BookingCTA from './BookingCTA';
import { useJourneyAdvice } from './useJourneyAdvice';
import type { JourneyProps } from './types';

const docTypes = [
  { label: 'Business plan', value: 'business_plan' },
  { label: 'Financial statements', value: 'financials' },
  { label: 'Legal documents (LLC, contracts)', value: 'legal' },
  { label: 'Tax returns & filings', value: 'tax' },
  { label: 'Pitch deck / investor materials', value: 'pitch' },
  { label: 'Loan application package', value: 'loan_docs' },
  { label: 'Other / Not sure', value: 'other' },
];

const DocumentationJourney = ({ lead, onBack }: JourneyProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [showAdvice, setShowAdvice] = useState(false);
  const { advice, loading, error, fetchAdvice } = useJourneyAdvice();

  const toggle = (v: string) => setSelected(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const handleContinue = () => {
    setShowAdvice(true);
    const docTypeLabels = selected.map((value) => docTypes.find((option) => option.value === value)?.label || value);
    fetchAdvice('documents', { name: lead.name, docTypes: selected, docTypeLabels });
  };

  return (
    <JourneyShell onBack={onBack}>
      <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">📁 Documentation</span>

      {!showAdvice ? (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">What documents do you need help with?</h2>
          <p className="text-sm text-white/50 mb-6">Select all that apply — we'll create an organized request list.</p>
          <div className="space-y-2.5">
            {docTypes.map(o => (
              <button key={o.value} onClick={() => toggle(o.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer bg-transparent flex items-center gap-3 ${
                  selected.includes(o.value) ? 'border-[#2563eb]/50 bg-[#2563eb]/[0.08]' : 'border-white/[0.1] hover:border-white/[0.2]'
                }`}>
                <span className={`text-sm font-medium flex-1 ${selected.includes(o.value) ? 'text-white' : 'text-white/60'}`}>{o.label}</span>
                {selected.includes(o.value) && (
                  <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <button onClick={handleContinue} disabled={selected.length === 0}
            className="w-full mt-8 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white text-sm font-semibold py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
            Get My Document Checklist →
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-white mb-1">Your Document Checklist</h2>
          <p className="text-sm text-white/50 mb-6">Here's what you need to gather and how to organize it.</p>
          <AdviceCard advice={advice} loading={loading} error={error} onRetry={() => {
            const docTypeLabels = selected.map((value) => docTypes.find((option) => option.value === value)?.label || value);
            fetchAdvice('documents', { name: lead.name, docTypes: selected, docTypeLabels });
          }} loadingText="Building your document checklist..." />
          {!loading && advice && <BookingCTA title="Book a Document Review Call" subtitle="Get help from our legal agent or schedule a review" />}
        </>
      )}
    </JourneyShell>
  );
};

export default DocumentationJourney;
