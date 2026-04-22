import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

const stats = [
  { n: 75, suffix: '+', l: 'Fundability Score', sub: 'Target threshold for capital', icon: '🎯' },
  { n: 60, suffix: '', l: 'Days to Fundable', sub: 'Average with platform guidance', icon: '⏱️' },
  { n: 0, suffix: '', prefix: '$', l: 'Per Lead Cost', sub: 'Organizations bring pipeline', icon: '💡' },
  { n: null, display: '∞', l: 'Scale', sub: 'Serves thousands simultaneously', icon: '🚀' },
];

const AnimatedNumber = ({ target, suffix = '', prefix = '' }: { target: number | null; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 2000;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  if (target === null) return <div ref={ref}>∞</div>;
  return <div ref={ref}>{prefix}{count}{suffix}</div>;
};

const StatsSection = () => (
  <section className="relative overflow-hidden">
    <div className="section-glow-divider" />
    <div className="neon-card border-x-0 rounded-none relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-primary/[0.03]" />
      <ScrollReveal>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 relative z-10">
          {stats.map((s, i) => (
            <div key={i} className={`px-8 py-16 text-center group transition-all duration-300 hover:bg-foreground/[0.03] relative ${
              i < stats.length - 1 ? 'border-r border-foreground/[0.06]' : ''
            }`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-2xl mb-3 group-hover:scale-125 transition-transform duration-300">{s.icon}</div>
                <div className="font-display text-[52px] font-bold text-gradient-gold leading-none mb-2 group-hover:scale-110 transition-transform duration-300">
                  <AnimatedNumber target={s.n} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <div className="text-[11px] text-foreground/50 uppercase tracking-[2px] font-mono mb-1 font-bold">{s.l}</div>
                <div className="text-[11px] text-foreground/25">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
    <div className="section-glow-divider" />
  </section>
);

export default StatsSection;
