import ScrollReveal from '@/components/ScrollReveal';

const personas = [
  { icon: '🏛️', title: 'Municipalities & Counties', desc: 'Governments managing revolving loan funds and technical assistance programs for local businesses.', tags: ['Revolving Funds', 'Technical Assistance', 'Municipal'] },
  { icon: '🤝', title: 'Nonprofits & CDFIs', desc: 'Urban League chapters, SBDCs, and CDFIs that provide business coaching and capital access programs.', tags: ['Urban League', 'SBDC', 'CDFI'] },
  { icon: '🏦', title: 'Banks & Financial Institutions', desc: 'Banks that want to help business clients become loan-ready and maximize approval rates.', tags: ['Community Banks', 'Credit Unions', 'Loan Ready'] },
  { icon: '📊', title: 'Fund Managers & Capital Brokers', desc: 'Professionals who manage capital deployment and need a scalable system to assess and fund businesses.', tags: ['Fund Management', 'Capital Brokerage', 'Scale'] },
];

const WhoSection = () => (
  <section className="px-6 md:px-10 py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(218_55%_11%)] to-background" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--info)/0.03),transparent_60%)]" />
    
    <div className="max-w-7xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full text-primary text-[10px] font-bold px-4 py-2 tracking-[3px] uppercase mb-5 font-mono">
            <span className="w-1.5 h-1.5 bg-info rounded-full" />
            Who It Serves
          </div>
          <h2 className="font-display text-[clamp(32px,3.5vw,50px)] font-extrabold text-foreground leading-[1.08] mb-5 tracking-tight">
            Built for Organizations<br />That <span className="text-gradient-gold">Serve Small Businesses.</span>
          </h2>
          <p className="text-[15px] text-foreground/45 leading-[1.8] max-w-[540px] mx-auto">
            The platform is licensed to organizations — deploy it through your existing network at scale.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {personas.map((p, i) => (
          <ScrollReveal key={p.title} delay={i * 0.08}>
            <div className="neon-card rounded-xl p-8 group h-full relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-info/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-[32px] mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{p.icon}</div>
                <div className="text-[16px] font-bold text-foreground mb-2.5 group-hover:text-primary transition-colors">{p.title}</div>
                <div className="text-[13px] text-foreground/40 leading-[1.75] mb-4">{p.desc}</div>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-3 py-1.5 bg-primary/[0.08] border border-primary/20 text-primary/80 rounded-full tracking-wide group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:shadow-[0_0_12px_hsl(var(--gold)/0.1)] transition-all">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhoSection;
