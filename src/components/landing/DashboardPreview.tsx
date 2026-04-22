import ScrollReveal from '@/components/ScrollReveal';

const canvasSections = [
  { title: 'Customers', content: 'Small business owners, entrepreneurs, startups seeking funding' },
  { title: 'Value Proposition', content: 'AI-powered fundability scoring & personalized guidance' },
  { title: 'Revenue Streams', content: 'SaaS subscriptions, coaching fees, capital referrals' },
  { title: 'Channels', content: 'Website, AI chatbot, email campaigns, partner referrals' },
  { title: 'Key Activities', content: 'Credit analysis, document review, lender matching' },
  { title: 'Key Resources', content: 'AI agents, funding network, coaching team' },
  { title: 'Key Partners', content: 'SBA lenders, credit bureaus, financial advisors' },
  { title: 'Cost Structure', content: 'AI infrastructure, team, marketing, compliance' },
  { title: 'Growth Opportunities', content: 'New lending partners, expanded coaching, premium tiers' },
  { title: 'Funding Readiness', content: 'Score: 78/100 — Strong. 3 action items remaining' },
];

const DashboardPreview = () => (
  <section id="dashboard-preview" className="px-5 md:px-10 py-16 md:py-20 relative overflow-hidden bg-[hsl(var(--brand-bg))]">
    <div className="max-w-5xl mx-auto relative z-10">
      <ScrollReveal>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-full text-[hsl(var(--brand-blue-300))] text-xs font-bold px-4 py-1.5 tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 bg-[hsl(var(--brand-blue-300))] rounded-full" />
            Your Dashboard
          </div>
          <h2 className="text-[clamp(24px,3.5vw,42px)] font-extrabold text-white leading-tight mb-3 tracking-tight">
            Your Live Business<br /><span className="bg-gradient-to-r from-[hsl(var(--brand-blue-400))] to-[hsl(var(--brand-blue-300))] bg-clip-text text-transparent">Command Center</span>
          </h2>
          <p className="text-sm md:text-base text-white/65 leading-relaxed max-w-md mx-auto">
            A completed Business Model Canvas that becomes your ongoing home screen. Click any section for coaching and next steps.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-4 md:p-6 relative overflow-hidden bg-[hsl(220,30%,14%)] border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--brand-blue-600))] to-[hsl(260,70%,60%)] flex items-center justify-center text-base font-bold text-white shadow-md">
                  78
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Your Business Canvas</div>
                  <div className="text-xs text-emerald-400 font-medium">Funding Readiness: Strong</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-white/60">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Live · Updated today
              </div>
            </div>

            {/* Canvas grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-2.5">
              {canvasSections.map((section, i) => (
                <div
                  key={section.title}
                  className={`group rounded-lg border border-white/15 bg-white/[0.06] p-3 md:p-3.5 hover:border-[hsl(var(--brand-blue-400))]/50 hover:bg-[hsl(var(--brand-blue-400))]/10 transition-all cursor-pointer ${
                    i >= 8 ? 'md:col-span-2 col-span-1' : ''
                  } ${i === 9 ? 'md:col-span-1' : ''}`}
                >
                  <div className="text-[11px] md:text-xs font-bold text-white group-hover:text-[hsl(var(--brand-blue-300))] transition-colors mb-1.5">
                    {section.title}
                  </div>
                  <div className="text-[10px] md:text-[11px] text-white/50 leading-relaxed line-clamp-2">
                    {section.content}
                  </div>
                  <div className="mt-2 text-[9px] md:text-[10px] text-[hsl(var(--brand-blue-400))]/0 group-hover:text-[hsl(var(--brand-blue-400))] transition-colors font-medium">
                    Explore →
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom prompt */}
            <div className="mt-4 pt-3 border-t border-white/12 flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-white/[0.06] border border-white/12 px-3 py-2.5 text-xs text-white/40">
                Ask about your business...
              </div>
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--brand-blue-600))]/30 border border-[hsl(var(--brand-blue-600))]/40 flex items-center justify-center text-[hsl(var(--brand-blue-300))] text-sm shadow-sm">
                →
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default DashboardPreview;
