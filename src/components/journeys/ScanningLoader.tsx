import { useEffect, useState } from 'react';
import { Search, Database, Sparkles, CheckCircle2, Brain, Zap } from 'lucide-react';

/**
 * Animated "scanning" indicator shown while AI is generating advice.
 * Cycles through diagnostic-style steps to feel interactive and alive.
 */
const STEPS = [
  { icon: Search, label: 'Analyzing your business profile', color: 'text-blue-400' },
  { icon: Database, label: 'Scanning 50+ funding programs', color: 'text-purple-400' },
  { icon: Brain, label: 'Cross-referencing eligibility', color: 'text-pink-400' },
  { icon: Sparkles, label: 'Crafting personalized strategy', color: 'text-amber-400' },
  { icon: Zap, label: 'Finalizing recommendations', color: 'text-emerald-400' },
];

interface Props {
  variant?: 'dark' | 'themed';
}

const ScanningLoader = ({ variant = 'dark' }: Props) => {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % STEPS.length;
        setCompleted((c) => Array.from(new Set([...c, prev])));
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const baseText = variant === 'dark' ? 'text-white/70' : 'text-foreground/80';
  const mutedText = variant === 'dark' ? 'text-white/30' : 'text-muted-foreground/60';
  const completeText = variant === 'dark' ? 'text-white/40 line-through decoration-emerald-500/40' : 'text-muted-foreground line-through decoration-emerald-500/60';
  const rowBase = variant === 'dark' ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-muted/40 border-border';
  const rowActive = variant === 'dark' ? 'bg-white/[0.08] border-primary/40 shadow-[0_0_30px_-10px_hsl(var(--primary))]' : 'bg-primary/5 border-primary/40 shadow-md';

  return (
    <div className="relative py-2">
      {/* Animated scanning beam across the top */}
      <div className="relative h-1 mb-5 overflow-hidden rounded-full bg-white/[0.04]">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_ease-in-out_infinite]" />
      </div>

      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === active;
          const isDone = completed.includes(i) && !isActive;
          const isPending = !isActive && !isDone;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-500 ${
                isActive ? rowActive : rowBase
              } ${isPending ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in duration-300" />
                ) : (
                  <>
                    {isActive && (
                      <span className={`absolute inset-0 rounded-full ${step.color} opacity-20 animate-ping`} />
                    )}
                    <Icon
                      className={`w-4 h-4 ${step.color} ${isActive ? 'animate-pulse' : ''}`}
                    />
                  </>
                )}
              </div>
              <span
                className={`text-sm font-medium flex-1 ${
                  isDone ? completeText : isActive ? baseText : mutedText
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScanningLoader;
