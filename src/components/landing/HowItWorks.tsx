import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { MessageSquare, BarChart3, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  { n: '1', title: 'Answer a Few Questions', desc: 'Tell us about your business — revenue, time in business, and credit range. Takes about 3 minutes.', icon: MessageSquare },
  { n: '2', title: 'See Your Score', desc: 'Instantly get a funding readiness score with plain-English explanations of where you stand.', icon: BarChart3 },
  { n: '3', title: 'Get a Plan', desc: 'See exactly what to improve and track your progress. Upgrade anytime for deeper guidance.', icon: Rocket },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="px-5 md:px-10 py-16 md:py-24 relative overflow-hidden bg-muted/30">
      <div className="max-w-5xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-foreground leading-tight mb-3 tracking-tight">
              Here's How It Works
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              No complicated forms. No long waits. Just quick answers and clear results.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-10">
          {steps.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.12}>
              <div className="text-center group">
                <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs text-primary/80 tracking-widest mb-1.5 font-bold uppercase">Step {s.n}</div>
                <div className="text-base font-bold text-foreground mb-2">{s.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{s.desc}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="text-center">
            <button
              onClick={() => navigate('/get-started')}
              className="group bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white text-sm font-bold px-8 py-3.5 border-none cursor-pointer rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Get Started — Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
