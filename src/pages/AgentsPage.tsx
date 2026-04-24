import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import ReactMarkdown from 'react-markdown';
import AgentHireDialog from '@/components/AgentHireDialog';

interface BusinessRow {
  id: string;
  name: string;
  industry: string | null;
  score: number;
  status: string;
  capital_need: number | null;
  loan_product: string | null;
  top_gap: string | null;
}

interface AgentSubscription {
  id: string;
  business_id: string;
  user_id: string;
  agent_type: string;
  price_monthly: number;
  status: string;
  active: boolean;
}

const MONTHLY_PRICE = 89;

const agents = [
  { id: 'fundability', icon: '📊', name: 'Credit Enhancement Agent', desc: 'Real-time score analysis, gap identification, fundability roadmap' },
  { id: 'execution', icon: '⚡', name: 'Virtual Executive Assistant Agent', desc: 'Weekly action plan, task generation, operational priorities' },
  { id: 'capital', icon: '🎯', name: 'Receptionist Agent', desc: 'Matches business to right funding programs by credit & revenue' },
  { id: 'financial', icon: '💰', name: 'Documentation Agent', desc: 'Cash flow monitoring, expense analysis, income verification' },
  { id: 'growth', icon: '📈', name: 'Business Growth Agent', desc: 'Revenue optimization, scalability, exit planning' },
];

const AgentsPage = () => {
  const { user } = useAuth();
  const { isClient } = useUserRole();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<AgentSubscription[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [agentLabel, setAgentLabel] = useState<string>('');
  const [introText, setIntroText] = useState<string>('');
  const [loadingIntro, setLoadingIntro] = useState(false);
  const [hireAgentId, setHireAgentId] = useState<string>('');
  const [hireProcessing, setHireProcessing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase
        .from('businesses')
        .select('id, name, industry, score, status, capital_need, loan_product, top_gap')
        .eq('user_id', user.id),
      supabase
        .from('business_agent_subscriptions')
        .select('id, business_id, user_id, agent_type, price_monthly, status, active')
        .eq('user_id', user.id),
    ]).then(([businessResult, subscriptionResult]) => {
      const businessData = businessResult.data || [];
      if (businessData.length > 0) {
        setBusinesses(businessData);
        setSelectedBiz((current) => current || businessData[0].id);
      }
      if (subscriptionResult.error) {
        setSubscriptionError(subscriptionResult.error.message);
        setSubscriptions([]);
        return;
      }
      setSubscriptions((subscriptionResult.data || []) as AgentSubscription[]);
    });
  }, [user]);

  const isAgentHired = (agentId: string, businessId = selectedBiz) =>
    subscriptions.some((subscription) =>
      subscription.business_id === businessId &&
      subscription.agent_type === agentId &&
      subscription.active &&
      subscription.status === 'active');

  const selectedAgentHired = selectedAgent ? isAgentHired(selectedAgent) : false;

  const handleAgentSelect = async (agentId: string) => {
    setSelectedAgent(agentId);
    setAnalysis('');

    setLoadingIntro(true);
    setIntroText('');
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: { agentType: agentId, mode: 'intro' },
      });
      if (error) throw error;
      setIntroText(data.analysis);
    } catch {
      setIntroText("I'm ready to analyze your business. Hire me when you're ready and click Run Agent to begin!");
    } finally {
      setLoadingIntro(false);
    }
  };

  const runAgent = async (agentIdOverride?: string, bypassHireCheck = false) => {
    const agentId = agentIdOverride || selectedAgent;
    if (!selectedBiz || !agentId) return;

    if (isClient && !bypassHireCheck && !isAgentHired(agentId)) {
      setAnalysis('This agent must be hired first. Click Pay $89 to Hire to activate the subscription for this business.');
      return;
    }

    setLoading(true);
    setAnalysis('');
    setIntroText('');
    const agent = agents.find((item) => item.id === agentId);
    setAgentLabel(agent?.name || '');

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: { agentType: agentId, businessId: selectedBiz },
      });
      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (e: any) {
      const message = e?.message || 'Failed to run agent';
      if (typeof message === 'string' && message.toLowerCase().includes('not hired')) {
        setAnalysis('This agent is not hired for the selected business yet. Complete payment first, then run the agent again.');
      } else {
        setAnalysis(`Error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmHireAgent = async () => {
    if (!user || !selectedBiz || !hireAgentId) return;

    setHireProcessing(true);
    try {
      const { data, error } = await supabase
        .from('business_agent_subscriptions')
        .upsert({
          business_id: selectedBiz,
          user_id: user.id,
          agent_type: hireAgentId,
          price_monthly: MONTHLY_PRICE,
          status: 'active',
          active: true,
          dummy_payment_success: true,
        }, { onConflict: 'business_id,agent_type' })
        .select('id, business_id, user_id, agent_type, price_monthly, status, active')
        .single();

      if (error) throw error;

      setSubscriptions((current) => {
        const next = current.filter((subscription) =>
          !(subscription.business_id === selectedBiz && subscription.agent_type === hireAgentId));
        return [...next, data as AgentSubscription];
      });

      const hiredAgent = agents.find((item) => item.id === hireAgentId);
      setAnalysis(`Payment successful. ${hiredAgent?.name || 'Agent'} is now hired for $${MONTHLY_PRICE}/month.`);
      setHireAgentId('');
      await runAgent(hireAgentId, true);
    } catch (e: any) {
      const message = e?.message || 'Failed to hire agent';
      setAnalysis(`Error: ${message}`);
      setSubscriptionError(message);
    } finally {
      setHireProcessing(false);
    }
  };

  const biz = businesses.find((b) => b.id === selectedBiz);
  const activeAgentData = agents.find((a) => a.id === selectedAgent);
  const hireAgentData = agents.find((a) => a.id === hireAgentId);

  return (
    <div className="animate-fade-up space-y-5">
      <AgentHireDialog
        open={!!hireAgentId}
        agentName={hireAgentData?.name || 'Agent'}
        onClose={() => setHireAgentId('')}
        onConfirm={confirmHireAgent}
        processing={hireProcessing}
      />

      {businesses.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-muted-foreground text-sm">No businesses found. Add businesses first to run AI agents.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2">
            {agents.map((a) => {
              const hired = isAgentHired(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => handleAgentSelect(a.id)}
                  className={`text-left glass-card rounded-xl p-5 transition-all duration-300 cursor-pointer group ${
                    selectedAgent === a.id
                      ? '!border-primary/40 !bg-primary/[0.08] shadow-[0_0_30px_hsl(var(--gold)/0.1)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className={`text-2xl transition-transform duration-300 ${
                      selectedAgent === a.id ? 'scale-110 animate-float' : 'group-hover:scale-110'
                    }`}>{a.icon}</div>
                    <div className="flex items-center gap-1.5">
                      {isClient && hired && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold tracking-[1px] text-emerald-400">
                          HIRED
                        </span>
                      )}
                      {selectedAgent === a.id && (
                        <>
                          <span className="w-1.5 h-1.5 bg-success rounded-full animate-glow" />
                          <span className="text-[8px] font-bold text-success font-mono tracking-[1px]">ACTIVE</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs font-bold mb-1 transition-colors ${
                    selectedAgent === a.id ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  }`}>{a.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">{a.desc}</div>
                  {isClient && !hired && (
                    <div className="mt-3 text-[10px] font-semibold text-amber-400">$89/mo subscription required</div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedAgent && activeAgentData && (introText || loadingIntro) && !analysis && !loading && (
            <div className="glass-card rounded-2xl p-5 animate-fade-up relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold-lt flex items-center justify-center text-xl flex-shrink-0 shadow-[0_4px_16px_hsl(var(--gold)/0.2)] animate-float">
                  {activeAgentData.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-primary">{activeAgentData.name}</span>
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-glow" />
                    <span className="text-[8px] text-success font-mono font-bold tracking-[1px]">SPEAKING</span>
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
                    <div className="prose prose-sm prose-invert max-w-none text-[13px] text-foreground/65 leading-[1.8] [&_strong]:text-foreground [&_p]:mb-2">
                      <ReactMarkdown>{introText}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-5 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[9px] font-bold tracking-[2px] uppercase text-muted-foreground font-mono block mb-2">Select Business</label>
              <select
                value={selectedBiz}
                onChange={(e) => setSelectedBiz(e.target.value)}
                className="w-full bg-background/50 border border-foreground/[0.08] text-foreground text-xs p-2.5 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} - Score: {b.score} - {b.status}</option>
                ))}
              </select>
            </div>

            {isClient && selectedAgent && !selectedAgentHired && (
              <button
                onClick={() => setHireAgentId(selectedAgent)}
                className="bg-emerald-500 text-white border-none font-body text-[11px] font-bold px-6 py-2.5 cursor-pointer tracking-[1px] uppercase rounded-lg transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-0.5"
              >
                Pay ${MONTHLY_PRICE} to Hire
              </button>
            )}

            {(!isClient || selectedAgentHired) && (
              <button
                onClick={() => runAgent()}
                disabled={!selectedAgent || loading}
                className="bg-primary text-primary-foreground border-none font-body text-[11px] font-bold px-6 py-2.5 cursor-pointer tracking-[1px] uppercase rounded-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_4px_16px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? '⏳ Analyzing...' : '▶ Run Agent'}
              </button>
            )}
          </div>

          {subscriptionError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              Subscription setup error: {subscriptionError}. Apply the latest Supabase migration so `business_agent_subscriptions` exists, then refresh this page.
            </div>
          )}

          {isClient && selectedAgent && !selectedAgentHired && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
              This agent is locked for the selected business. Use the dummy $89/month subscription button to hire it first.
            </div>
          )}

          {biz && (
            <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2">
              {[
                { label: 'Score', value: biz.score, color: biz.score >= 75 ? 'text-success' : biz.score >= 50 ? 'text-warning' : 'text-destructive' },
                { label: 'Status', value: biz.status.replace('-', ' '), color: 'text-primary' },
                { label: 'Capital Need', value: `$${(biz.capital_need || 0).toLocaleString()}`, color: 'text-info' },
                { label: 'Industry', value: biz.industry || 'N/A', color: 'text-foreground' },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className={`font-display text-lg font-bold ${s.color} capitalize`}>{s.value}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-[1.5px] font-mono">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {(analysis || loading) && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-foreground/[0.06] flex items-center gap-3">
                {activeAgentData && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold-lt flex items-center justify-center text-base flex-shrink-0">
                    {activeAgentData.icon}
                  </div>
                )}
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-primary font-mono">
                  {agentLabel} - Analysis
                </span>
                {loading && <span className="text-[9px] text-success font-mono font-bold animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full" /> RUNNING</span>}
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-3 bg-foreground/[0.04] rounded-lg animate-pulse" style={{ width: `${85 - i * 12}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none text-xs text-foreground/75 leading-relaxed [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-foreground/65 [&_ul]:space-y-1 [&_ol]:space-y-1">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentsPage;
