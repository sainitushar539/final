import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Is this really free?', a: 'Yes. You can check your funding readiness score and see personalized tips completely free. No credit card required.' },
  { q: 'Will this affect my credit?', a: 'No. We never run a credit check. We just ask you a few simple questions to estimate your readiness.' },
  { q: 'How long does it take?', a: 'About 3 minutes. You answer a handful of questions and get your score right away.' },
  { q: 'What do I get?', a: 'A funding readiness score (0–100), a breakdown of your strengths and gaps, and clear next steps to improve your chances of getting approved.' },
  { q: 'Do I need to be tech-savvy?', a: 'Not at all. It feels like answering a few simple questions. Everything is explained in plain language.' },
];

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="px-5 md:px-10 py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-foreground leading-tight tracking-tight">
              Questions? We've Got Answers.
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className={`w-full bg-transparent border-none text-left text-sm font-semibold px-5 py-4 cursor-pointer flex justify-between items-center gap-3 transition-all duration-200 ${
                    openIdx === i ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {f.q}
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${openIdx === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-out ${openIdx === i ? 'max-h-[300px]' : 'max-h-0'}`}>
                  <p className="text-sm text-muted-foreground leading-relaxed px-5 pb-4">{f.a}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
