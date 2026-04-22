import ScrollReveal from '@/components/ScrollReveal';
import { FileCheck, BarChart3, Compass } from 'lucide-react';

const benefits = [
  {
    icon: FileCheck,
    title: 'A Completed Business Model Canvas',
    desc: 'See your entire business at a glance — customers, revenue streams, key activities, cost structure, and more.',
  },
  {
    icon: BarChart3,
    title: 'A Quick Funding Readiness Snapshot',
    desc: 'Instantly understand where you stand with lenders. See your strengths, identify gaps, and know exactly what to improve.',
  },
  {
    icon: Compass,
    title: 'Ongoing Guidance & Coaching Tools',
    desc: 'Get personalized next steps, growth strategies, and financial health insights — like having a trusted advisor on call.',
  },
];

const BenefitsSection = () => (
  <section className="px-5 md:px-10 py-16 md:py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,hsl(var(--primary)/0.04),transparent_60%)]" />

    <div className="max-w-6xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/15 rounded-full text-primary text-xs font-bold px-4 py-1.5 tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            What You Get
          </div>
          <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-foreground leading-tight mb-4 tracking-tight">
            Everything You Need to<br />
            <span className="text-gradient-gold">Understand & Strengthen</span> Your Business
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            No complicated systems. No confusing dashboards. Just clear insights and practical guidance.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {benefits.map((b, i) => (
          <ScrollReveal key={b.title} delay={i * 0.1}>
            <div className="bg-card border border-border rounded-xl p-6 md:p-7 group h-full hover:border-primary/30 hover:shadow-md transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-4 group-hover:bg-primary/[0.12] transition-colors">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{b.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{b.desc}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
