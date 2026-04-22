import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import ScrollReveal from '@/components/ScrollReveal';

const agents = [
  { id: 'financial', icon: '💰', name: 'Financial Health Agent', desc: 'Your personal CFO that never sleeps. It connects to your QuickBooks, bank accounts, and accounting data — then monitors everything in real time. It catches cash flow problems before they hit, flags unusual expenses, and shows you exactly where your money is going so you can make smarter decisions.', bullets: ['Monitors cash flow 24/7 and alerts you to shortfalls', 'Analyzes expense ratios to cut waste', 'Tracks revenue trends so you can forecast growth'], color: 'from-[hsl(43_55%_54%/0.15)]' },
  { id: 'fundability', icon: '📊', name: 'Fundability Agent', desc: 'Think of this as your funding readiness coach. It calculates a real-time Fundability Score for your business and tells you exactly what\'s holding you back from getting approved. Whether it\'s your credit, revenue gaps, or missing documents — this agent builds you a step-by-step roadmap to become fully fundable.', bullets: ['Live fundability score that updates as you improve', 'Pinpoints every blocker preventing approval', 'Creates a personalized roadmap to loan-ready status'], color: 'from-[hsl(217_91%_60%/0.1)]' },
  { id: 'capital', icon: '🎯', name: 'Capital Matching Agent', desc: 'Stop guessing which lenders will say yes. This agent analyzes your exact business profile — credit, revenue, time in business, industry — and matches you to funding sources where you actually qualify. SBA loans, lines of credit, revenue-based financing, AR factoring — it finds the right fit and tells you your likelihood of approval.', bullets: ['Matches you to SBA, LOC, and alternative lenders', 'Shows approval likelihood before you apply', 'Routes you to no-doc and fast-funding options'], color: 'from-[hsl(160_72%_40%/0.1)]' },
  { id: 'execution', icon: '⚡', name: 'Execution Agent', desc: 'Knowing what to do is one thing — this agent tells you exactly what to do THIS WEEK. It generates a prioritized weekly action plan based on your goals, your gaps, and your progress. No more wondering what the next step is. Every Monday, you get a clear, specific to-do list that moves you closer to funding and growth.', bullets: ['Generates a specific weekly action plan', 'Tracks your progress and adjusts priorities', 'Keeps you accountable to your funding goals'], color: 'from-[hsl(38_92%_50%/0.1)]' },
  { id: 'documentation', icon: '📋', name: 'Documentation Agent', desc: 'Lenders reject applications over missing paperwork — this agent makes sure that never happens to you. It scans your profile, identifies every document you\'re missing, and helps you prepare a complete loan package that\'s ready for underwriting. Tax returns, P&Ls, bank statements, business plans — it checks everything off the list.', bullets: ['Identifies every missing document automatically', 'Prepares underwriting-ready loan packages', 'Provides templates and compliance checklists'], color: 'from-[hsl(270_80%_60%/0.08)]' },
  { id: 'growth', icon: '📈', name: 'Growth Strategy Agent', desc: 'This agent helps you make more money. It analyzes your revenue streams, identifies your most profitable customers, and recommends strategies to grow faster. From pricing optimization to customer acquisition to CRM-synced outreach — it gives you a data-driven playbook to increase revenue and strengthen your business before you apply for funding.', bullets: ['Optimizes pricing and revenue streams', 'Identifies highest-value customer segments', 'Builds outreach strategies synced to your CRM'], color: 'from-[hsl(185_90%_50%/0.08)]' },
];

const AgentsSection = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [introText, setIntroText] = useState<string>('');
  const [loadingIntro, setLoadingIntro] = useState(false);

  const handleAgentClick = async (agentId: string) => {
    if (activeAgent === agentId) {
      setActiveAgent(null);
      setIntroText('');
      return;
    }

    setActiveAgent(agentId);
    setIntroText('');
    setLoadingIntro(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: { agentType: agentId, mode: 'intro' },
      });
      if (error) throw error;
      setIntroText(data.analysis);
    } catch {
      setIntroText("Hello! I'm ready to help analyze your business. Sign up to see me in action!");
    } finally {
      setLoadingIntro(false);
    }
  };

  const activeAgentData = agents.find(a => a.id === activeAgent);

  return (
    <section id="agents" className="px-6 md:px-10 py-28 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(var(--primary)/0.04),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full text-primary text-[10px] font-bold px-4 py-2 tracking-[3px] uppercase mb-5 font-mono">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-glow" />
              The Solution
            </div>
            <h2 className="font-display text-[clamp(32px,3.5vw,50px)] font-extrabold text-foreground leading-[1.08] mb-5 tracking-tight">
              6 AI Agents. One Platform.<br /><em className="italic text-gradient-gold not-italic">Complete Intelligence.</em>
            </h2>
            <p className="text-[15px] text-foreground/45 leading-[1.8] max-w-[540px] mx-auto">
              Each agent is specialized, trained, and running 24 hours a day. <strong className="text-foreground/70">Click any agent to hear them introduce themselves.</strong>
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((a, i) => (
            <ScrollReveal key={a.id} delay={i * 0.08}>
              <button
                onClick={() => handleAgentClick(a.id)}
                className={`w-full neon-card rounded-xl p-7 group text-left cursor-pointer relative ${
                  activeAgent === a.id
                    ? '!border-primary/50 shadow-[0_0_60px_hsl(var(--gold)/0.15)] scale-[1.02]'
                    : ''
                }`}
              >
                {/* Colored glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${a.color} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-[28px] transition-all duration-300 ${activeAgent === a.id ? 'scale-125 animate-float' : 'group-hover:scale-110'}`}>
                      {a.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold text-primary/40 tracking-[2px] font-mono">AGENT {String(i + 1).padStart(2, '0')}</div>
                      {activeAgent === a.id && (
                        <span className="w-2 h-2 bg-success rounded-full animate-glow" />
                      )}
                    </div>
                  </div>
                  <div className={`text-sm font-bold mb-2 transition-colors duration-300 ${activeAgent === a.id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{a.name}</div>
                  <div className="text-xs text-foreground/40 leading-[1.7] mb-4 line-clamp-3">{a.desc}</div>
                  <div className="flex flex-col gap-2 pt-3 border-t border-foreground/[0.05]">
                    {a.bullets.map((b, bi) => (
                      <div key={bi} className="text-[11px] text-foreground/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-gold-lt rounded-full flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                  {activeAgent !== a.id && (
                    <div className="mt-4 text-[10px] font-bold text-primary/60 uppercase tracking-[1.5px] font-mono flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      🤖 Click to meet me →
                    </div>
                  )}
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Agent Speech Bubble */}
        {activeAgent && activeAgentData && (
          <div className="mt-8 animate-fade-up">
            <div className="gradient-border max-w-3xl mx-auto">
              <div className="bg-[hsl(218_55%_12%)] rounded-2xl p-6 relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-gold-lt flex items-center justify-center text-2xl flex-shrink-0 shadow-[0_4px_20px_hsl(var(--gold)/0.25)] animate-float">
                    {activeAgentData.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-primary">{activeAgentData.name}</span>
                      <span className="w-2 h-2 bg-success rounded-full animate-glow" />
                      <span className="text-[9px] text-success font-mono font-bold tracking-[1px]">SPEAKING</span>
                    </div>
                    
                    {loadingIntro ? (
                      <div className="flex items-center gap-2 text-xs text-foreground/50">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        Thinking...
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none text-[13px] text-foreground/70 leading-[1.8] [&_strong]:text-foreground [&_p]:mb-2">
                        <ReactMarkdown>{introText}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-foreground/[0.05] flex items-center justify-between">
                  <span className="text-[10px] text-foreground/30 font-mono">Powered by Credibility Suite AI</span>
                  <button
                    onClick={() => { setActiveAgent(null); setIntroText(''); }}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Dismiss ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentsSection;
