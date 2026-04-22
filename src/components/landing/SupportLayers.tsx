import ScrollReveal from '@/components/ScrollReveal';
import { DollarSign, TrendingUp, Target, FileText, Zap } from 'lucide-react';

const layers = [
  { icon: DollarSign, title: 'Funding Readiness', desc: 'Understand what lenders look for and get a clear path to approval.' },
  { icon: TrendingUp, title: 'Financial Health', desc: 'Monitor cash flow, track expenses, and strengthen your financial position.' },
  { icon: Target, title: 'Growth Planning', desc: 'Identify profitable customers, optimize pricing, and build a growth strategy.' },
  { icon: FileText, title: 'Documentation', desc: 'Know which documents you need and build a complete loan-ready package.' },
  { icon: Zap, title: 'Action Plans', desc: 'Get a prioritized weekly plan with clear steps. Stay on track and measure progress.' },
];

const SupportLayers = () => (
  <section id="support-layers" className="px-5 md:px-10 py-16 md:py-24 relative overflow-hidden">
    <div className="max-w-6xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/15 rounded-full text-primary text-xs font-bold px-4 py-1.5 tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Guidance Tools
          </div>
          <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-foreground leading-tight mb-3 tracking-tight">
            Go Deeper When<br /><span className="text-gradient-gold">You're Ready</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your dashboard is free to explore. When you want more personalized help, these tools are here for you.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {layers.map((l, i) => (
          <ScrollReveal key={l.title} delay={i * 0.08}>
            <div className="bg-card border border-border rounded-xl p-5 group h-full hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center mb-3 group-hover:bg-primary/[0.12] transition-colors">
                <l.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{l.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{l.desc}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default SupportLayers;
