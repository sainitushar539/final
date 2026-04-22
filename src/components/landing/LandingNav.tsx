import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, LayoutDashboard, ArrowRight, Menu, X, LogIn, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const sectionLinks = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'cta' },
];

const LandingNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`sticky top-0 left-0 right-0 z-[200] transition-all duration-400 backdrop-blur-2xl backdrop-saturate-150 ${
        scrolled
          ? 'bg-background/70 border-b border-white/10 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/5'
          : 'bg-background/55 border-b border-white/10 py-3 shadow-[0_6px_28px_-10px_rgba(0,0,0,0.45)]'
      }`}>
        {/* Subtle top highlight for glass edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className={`text-base font-bold transition-colors ${scrolled ? 'text-foreground' : 'text-foreground'}`}>
              Credibility Suite
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden min-[900px]:flex items-center gap-0.5">
            {sectionLinks.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.id)}
                className={`text-[13px] font-medium transition-all bg-transparent border-none cursor-pointer px-3 py-2 rounded-lg ${
                  scrolled ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}

            <Link
              to="/about"
              className={`text-[13px] font-medium transition-all no-underline px-3 py-2 rounded-lg ${
                scrolled ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              About
            </Link>

            <div className={`w-px h-5 mx-2 ${scrolled ? 'bg-border' : 'bg-white/15'}`} />

            {user ? (
              <button
                onClick={() => navigate('/client-dashboard')}
                className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-semibold px-5 py-2 border-none cursor-pointer rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className={`text-[13px] font-medium transition-all bg-transparent border-none cursor-pointer px-3 py-2 rounded-lg flex items-center gap-1.5 ${
                    scrolled ? 'text-foreground/80 hover:text-foreground hover:bg-muted' : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Client Login
                </button>
                <button
                  onClick={() => navigate('/get-started')}
                  className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-semibold px-5 py-2 border-none cursor-pointer rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  Check My Score <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/agent-login"
                  className={`ml-1 text-[10px] font-medium no-underline px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap ${
                    scrolled ? 'text-muted-foreground/60 hover:text-foreground hover:bg-muted' : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted'
                  }`}
                  title="Agent / Admin Portal"
                >
                  <Shield className="w-3 h-3" /> Agent
                </Link>
              </>
            )}
          </div>

          {/* Tablet nav */}
          <div className="hidden md:flex min-[900px]:hidden items-center gap-2">
            {user ? (
              <button
                onClick={() => navigate('/client-dashboard')}
                className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-semibold px-3.5 py-2 border-none cursor-pointer rounded-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className={`text-[12px] font-medium transition-all bg-transparent border-none cursor-pointer px-2.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
                    scrolled ? 'text-foreground/80 hover:text-foreground hover:bg-muted' : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Client Login
                </button>
                <button
                  onClick={() => navigate('/get-started')}
                  className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-[11px] font-semibold px-3.5 py-2 border-none cursor-pointer rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  Check My Score <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/agent-login"
                  className={`text-[11px] font-medium no-underline px-2 py-2 rounded-md flex items-center gap-1 whitespace-nowrap ${
                    scrolled ? 'text-muted-foreground/70 hover:text-foreground hover:bg-muted' : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Shield className="w-3 h-3" /> Agent
                </Link>
              </>
            )}

            <button
              className={`bg-transparent border-none cursor-pointer p-2 rounded-lg transition-colors ${
                scrolled ? 'text-foreground hover:bg-muted' : 'text-foreground hover:bg-muted'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden bg-transparent border-none cursor-pointer p-2 rounded-lg transition-colors ${
              scrolled ? 'text-foreground hover:bg-muted' : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile / tablet menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[199] bg-[#0a1628] pt-16 px-5 overflow-y-auto min-[900px]:hidden animate-fade-in">
          <div className="space-y-1 mb-6 mt-4">
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors no-underline text-sm"
            >
              About
            </Link>

            {sectionLinks.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors bg-transparent border-none cursor-pointer text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pb-8">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); navigate('/client-dashboard'); }}
                className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white font-semibold text-sm py-3.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> My Dashboard
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                  className="w-full bg-white/[0.06] text-white font-semibold text-sm py-3.5 rounded-xl border border-white/[0.12] cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Client Login
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/get-started'); }}
                  className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white font-semibold text-sm py-3.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  Check My Score — Free <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/agent-login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-white/70 hover:text-white font-medium text-xs py-3 rounded-xl border border-dashed border-white/[0.15] cursor-pointer flex items-center justify-center gap-2 no-underline"
                >
                  <Shield className="w-3.5 h-3.5" /> Agent Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LandingNav;

