import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Calendar,
  FileText,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdviceRenderer from './AdviceRenderer';
import ScanningLoader from './ScanningLoader';

interface PremiumAIReportProps {
  advice: string;
  loading: boolean;
  error: string;
  onRetry?: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  loadingText?: string;
  actions?: ReactNode;
  fullScreen?: boolean;
}

const navItems = [
  { label: 'Overview', href: '#overview', icon: FileText },
  { label: 'Insights', href: '#insights', icon: BarChart3 },
  { label: 'Strategy', href: '#strategy', icon: Target },
  { label: 'Action Plan', href: '#action-plan', icon: ListChecks },
];

const PremiumAIReport = ({
  advice,
  loading,
  error,
  onRetry,
  onClose,
  title = 'AI Strategic Analysis',
  subtitle = 'A structured executive report generated from your AI response.',
  loadingText = 'Generating strategic intelligence...',
  actions,
  fullScreen = true,
}: PremiumAIReportProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const progress = loading ? (advice ? 72 : 38) : advice ? 100 : 0;
  const status = loading ? 'Analyzing' : advice ? 'Complete' : 'Pending';

  const shellClass = fullScreen
    ? 'fixed inset-0 z-[999] h-screen w-screen'
    : 'relative min-h-[760px] w-full rounded-2xl';

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !advice) return;

    const handleScroll = () => {
      const scrollerTop = scroller.getBoundingClientRect().top;
      let current = navItems[0].href.slice(1);

      for (const item of navItems) {
        const id = item.href.slice(1);
        const section = scroller.querySelector<HTMLElement>(`#${id}`);
        if (!section) continue;

        const offset = section.getBoundingClientRect().top - scrollerTop;
        if (offset <= 132) current = id;
      }

      setActiveSection(current);
    };

    handleScroll();
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [advice]);

  const handleNavClick = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    const scroller = scrollRef.current;
    const section = scroller?.querySelector<HTMLElement>(`#${id}`);
    if (!scroller || !section) return;

    event.preventDefault();
    setActiveSection(id);
    scroller.scrollTo({
      top: section.offsetTop - 20,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`${shellClass} overflow-hidden bg-[#070b13] text-[#f5f7fb]`}>
      <style>{`
        @keyframes reportFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.028)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex h-full flex-col">
        <header className="border-b border-white/[0.08] bg-[#090e18]/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8b76a]/25 bg-[#d8b76a]/10">
                  <Sparkles className="h-4 w-4 text-[#d8b76a]" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b76a]">
                  Enterprise Intelligence
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-normal text-white md:text-4xl">
                AI Strategic Analysis
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:text-[15px]">
                {subtitle || title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <div className="rounded-xl border border-white/[0.08] bg-[#101827] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                  <span className={`h-2 w-2 rounded-full ${loading ? 'bg-[#d8b76a]' : advice ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {status}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#101827] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Score</div>
                <div className="mt-1 text-sm font-semibold text-white">{progress}%</div>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#101827] text-slate-300 transition hover:border-[#d8b76a]/40 hover:text-white"
                  aria-label="Regenerate report"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#101827] text-slate-300 transition hover:border-white/20 hover:text-white"
                  aria-label="Close report"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-5 md:px-8 md:py-7">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-7 lg:self-start">
              <nav className="rounded-2xl border border-white/[0.08] bg-[#0d1422]/95 p-2 shadow-[0_18px_70px_-48px_rgba(0,0,0,.9)]">
                <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Report Navigation
                </div>
                <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const id = item.href.slice(1);
                    const isActive = activeSection === id;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={handleNavClick(id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`group flex min-w-max items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium no-underline transition ${
                          isActive
                            ? 'border-[#d8b76a]/30 bg-[#d8b76a]/10 text-white'
                            : 'border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-[#d8b76a]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </nav>

              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0d1422]/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-[#d8b76a]" />
                  Analysis Quality
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-[#d8b76a] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Structured into an executive summary, key insights, strategy, and action plan.
                </p>
              </div>

              {advice && !loading && (
                <button
                  onClick={() => window.open('https://calendly.com/mauricestewart/1-hour-consultation', '_blank')}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8b76a]/25 bg-[#d8b76a]/10 px-4 py-3 text-sm font-semibold text-[#f1d890] transition hover:border-[#d8b76a]/45 hover:bg-[#d8b76a]/15 hover:text-white"
                >
                  <Calendar className="h-4 w-4" />
                  Book Consultation
                </button>
              )}

              {actions && <div className="mt-4">{actions}</div>}
            </aside>

            <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0d1422]/95 p-3 shadow-[0_22px_90px_-58px_rgba(0,0,0,.95)] md:p-5">
              {loading && !advice && (
                <div className="rounded-xl border border-white/[0.08] bg-[#101827] p-5 md:p-7">
                  <ScanningLoader variant="dark" />
                  <p className="mt-5 text-center text-sm font-medium text-slate-400">{loadingText}</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-8 text-center">
                  <p className="text-sm text-red-100">{error}</p>
                  {onRetry && (
                    <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-100/20 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]">
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  )}
                </div>
              )}

              {advice && (
                <div className="[animation:reportFade_.35s_ease-out_both]">
                  <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#111a2a] px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Report Sections</p>
                      <p className="mt-1 text-sm text-slate-300">Strategic blueprint, business model context, execution strategy, and milestones</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready for review
                    </div>
                  </div>
                  <AdviceRenderer text={advice} variant="dark" reportMode />
                  {!loading && (
                    <>
                      <div className="mt-5 rounded-xl border border-[#d8b76a]/20 bg-[#d8b76a]/10 p-4 md:flex md:items-center md:justify-between md:gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">Ready to turn this plan into execution?</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">Book a consultation to review the strategy and prioritize the next move.</p>
                        </div>
                        <button
                          onClick={() => window.open('https://calendly.com/mauricestewart/1-hour-consultation', '_blank')}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d8b76a] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#e5c879] md:mt-0 md:w-auto"
                        >
                          <Calendar className="h-4 w-4" />
                          Book Consultation
                        </button>
                      </div>
                      <button
                        onClick={() => navigate('/')}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                      >
                        Return to Home
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {loading && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#101827] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-[#d8b76a]" />
                      Streaming analysis
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PremiumAIReport;
