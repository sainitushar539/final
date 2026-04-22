import ScrollReveal from '@/components/ScrollReveal';

const outcomes = [
  { stat: '5,000+', label: 'Businesses Scored', sub: 'And growing every day' },
  { stat: '78', label: 'Avg Readiness Score', sub: 'After following the plan' },
  { stat: '3 min', label: 'To Get Your Score', sub: 'Quick and easy' },
  { stat: 'Free', label: 'To Get Started', sub: 'No credit card needed' },
];

const TrustSection = () => (
  <section className="px-5 md:px-10 py-16 md:py-24 relative overflow-hidden bg-muted/30">
    <div className="max-w-5xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-10">
          <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-foreground leading-tight mb-3 tracking-tight">
            Trusted by Business Owners
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Thousands of entrepreneurs have used their score to get clearer on funding and grow stronger businesses.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outcomes.map((o, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 md:p-6 text-center hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl md:text-4xl font-bold text-gradient-gold leading-none mb-2">{o.stat}</div>
              <div className="text-xs text-foreground/70 uppercase tracking-wider font-bold mb-0.5">{o.label}</div>
              <div className="text-xs text-muted-foreground">{o.sub}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default TrustSection;
