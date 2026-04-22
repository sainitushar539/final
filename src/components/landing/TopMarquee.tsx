import { Shield, Clock, CheckCircle2, Sparkles, Zap, TrendingUp } from 'lucide-react';

const items = [
  { icon: CheckCircle2, text: 'Free to Use' },
  { icon: Clock, text: 'Results in 3 Minutes' },
  { icon: Shield, text: 'No Credit Check Required' },
  { icon: Sparkles, text: 'AI-Powered Strategy' },
  { icon: Zap, text: 'Instant Fundability Score' },
  { icon: TrendingUp, text: 'Trusted by 1,200+ Founders' },
];

const TopMarquee = () => {
  // Duplicate for seamless infinite scroll
  const loop = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-[hsl(245,75%,58%)] to-[hsl(260,70%,60%)] border-b border-primary/30 py-2.5 shadow-lg">
      {/* Subtle shine overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)] bg-[length:200%_100%] animate-[shine_4s_linear_infinite]" />

      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[hsl(260,70%,60%)] to-transparent z-10" />

      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite]">
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-[12px] font-bold text-white tracking-wide uppercase mx-6 md:mx-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
            >
              <Icon className="w-3.5 h-3.5" />
              {item.text}
              <span className="ml-6 md:ml-8 text-white/40">•</span>
            </span>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default TopMarquee;
