import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  // Animated tech lines config — random positions/delays/durations
  const hLines = [
    { top: '12%', delay: '0s', duration: '7s', width: '180px' },
    { top: '28%', delay: '2.5s', duration: '9s', width: '120px' },
    { top: '46%', delay: '1s', duration: '8s', width: '220px' },
    { top: '63%', delay: '4s', duration: '10s', width: '150px' },
    { top: '82%', delay: '3s', duration: '7.5s', width: '200px' },
  ];
  const vLines = [
    { left: '8%', delay: '1.5s', duration: '9s', height: '160px' },
    { left: '32%', delay: '0.5s', duration: '11s', height: '120px' },
    { left: '68%', delay: '3.5s', duration: '8s', height: '200px' },
    { left: '88%', delay: '2s', duration: '10s', height: '140px' },
  ];

  return (
    <section className="min-h-[85vh] flex items-center px-5 md:px-10 pt-20 pb-16 relative overflow-hidden bg-[hsl(var(--brand-bg))]">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 animate-[grid-pulse_6s_ease-in-out_infinite]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--brand-blue-400) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-blue-400) / 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial blue glows */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--brand-blue-600)/0.35),transparent_70%)] blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--brand-blue-500)/0.2),transparent_70%)] blur-[60px] pointer-events-none" />

      {/* Animated horizontal tech lines */}
      {hLines.map((l, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px pointer-events-none"
          style={{
            top: l.top,
            left: 0,
            width: l.width,
            background: `linear-gradient(90deg, transparent, hsl(var(--brand-blue-400) / 0.9), hsl(var(--brand-blue-300)), transparent)`,
            boxShadow: '0 0 8px hsl(var(--brand-blue-400) / 0.6)',
            animation: `tech-line-h ${l.duration} linear ${l.delay} infinite`,
          }}
        />
      ))}

      {/* Animated vertical tech lines */}
      {vLines.map((l, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px pointer-events-none"
          style={{
            left: l.left,
            top: 0,
            height: l.height,
            background: `linear-gradient(180deg, transparent, hsl(var(--brand-blue-400) / 0.8), hsl(var(--brand-blue-300)), transparent)`,
            boxShadow: '0 0 8px hsl(var(--brand-blue-400) / 0.5)',
            animation: `tech-line-v ${l.duration} linear ${l.delay} infinite`,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto w-full relative z-10 text-center">
        <ScrollReveal>
          <h1 className="text-[clamp(30px,5.5vw,60px)] font-extrabold leading-[1.08] tracking-tight mb-5 text-white">
            Your Next Move<br />
            <span className="bg-gradient-to-r from-[hsl(var(--brand-blue-400))] to-[hsl(var(--brand-blue-300))] bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-lg mx-auto mb-8">
            Whether you're securing funding, building credit, or ready to scale. we'll show you exactly what to do next. Free Snapshot. Expert-Built Plan. Supported by AI, guided by real industry professionals.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-8">
            {['Free Evaluation', '3 minutes', 'No credit pull'].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <button
            onClick={() => navigate('/get-started')}
            className="group relative bg-gradient-to-r from-[hsl(var(--brand-blue-600))] to-[hsl(var(--brand-blue-700))] text-white text-base font-bold px-10 py-4 border-none cursor-pointer rounded-xl transition-all duration-300 hover:shadow-[0_12px_40px_hsl(var(--brand-blue-600)/0.5)] hover:-translate-y-0.5 inline-flex items-center gap-2.5"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-white/40">
            <Shield className="w-3.5 h-3.5" />
            Your information is secure and never shared without your permission.
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HeroSection;

