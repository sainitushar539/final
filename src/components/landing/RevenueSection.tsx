import ScrollReveal from '@/components/ScrollReveal';

const streams = [
  { icon: '🏛️', title: 'Organization Licensing', desc: 'Municipalities, nonprofits, and banks pay a monthly license fee to offer the platform.', range: '$500 – $2,000/mo', growth: '+32% YoY' },
  { icon: '💻', title: 'SaaS Reseller Revenue', desc: 'Every software tool recommended — QuickBooks, HubSpot — earns a recurring commission.', range: '$50 – $300/mo', growth: 'Recurring' },
  { icon: '💰', title: 'Capital Referral Fees', desc: "Every loan closed through the platform's capital matching earns origination fees.", range: '1% – 3% per loan', growth: 'Per close' },
  { icon: '📈', title: 'Fund Management Growth', desc: 'Fundable businesses feed directly into the revolving loan fund pipeline.', range: 'Ongoing growth', growth: 'Compound' },
];

const RevenueSection = () => (
  <section id="revenue" className="px-6 md:px-10 py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_50%,hsl(var(--primary)/0.04),transparent_60%)]" />
    
    <div className="max-w-7xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full text-primary text-[10px] font-bold px-4 py-2 tracking-[3px] uppercase mb-5 font-mono">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Revenue Model
          </div>
          <h2 className="font-display text-[clamp(32px,3.5vw,50px)] font-extrabold text-foreground leading-[1.08] mb-5 tracking-tight">
            Four Revenue Streams.<br /><span className="text-gradient-gold">One Platform.</span>
          </h2>
          <p className="text-[15px] text-foreground/45 leading-[1.8] max-w-[540px] mx-auto">
            Credibility Suite AI isn't just a tool — it's a revenue engine for every organization that licenses it.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {streams.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.08}>
            <div className="neon-card rounded-xl p-8 group flex gap-5 h-full relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-3xl mt-1 group-hover:scale-125 transition-transform duration-300 relative z-10">{s.icon}</div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{s.title}</div>
                  <span className="text-[9px] font-bold text-success/70 font-mono tracking-wider">{s.growth}</span>
                </div>
                <div className="text-[12.5px] text-foreground/40 leading-[1.7] mb-3">{s.desc}</div>
                <div className="inline-flex items-center text-[12px] font-bold text-primary font-mono bg-primary/[0.08] rounded-full px-4 py-1.5 group-hover:bg-primary/15 transition-colors border border-primary/10">{s.range}</div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default RevenueSection;
