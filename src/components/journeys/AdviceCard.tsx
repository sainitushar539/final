import { useEffect, useState } from 'react';
import { Maximize2, RefreshCw, Sparkles } from 'lucide-react';
import PremiumAIReport from './PremiumAIReport';

interface AdviceCardProps {
  advice: string;
  loading: boolean;
  error: string;
  onRetry?: () => void;
  loadingText?: string;
}

const AdviceCard = ({ advice, loading, error, onRetry, loadingText }: AdviceCardProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || advice || error) setOpen(true);
  }, [advice, loading, error]);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-5 shadow-[0_20px_80px_-45px_rgba(37,99,235,.9)]">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{loading ? 'AI analysis in progress' : advice ? 'Premium AI report ready' : 'AI report workspace'}</p>
              <p className="mt-0.5 text-xs text-white/45">{loadingText || 'Open the full-screen strategy experience.'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onRetry && error && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 transition-all hover:border-primary/40 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-3 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-primary/25"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Open Report
            </button>
          </div>
        </div>
      </div>

      {open && (
        <PremiumAIReport
          advice={advice}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onClose={() => setOpen(false)}
          title="AI Consultant Report"
          subtitle="A premium strategy dashboard translating the AI response into executive priorities, opportunities, and next actions."
          loadingText={loadingText}
        />
      )}
    </>
  );
};

export default AdviceCard;
