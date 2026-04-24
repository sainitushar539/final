import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';
import { Sparkles, Upload, FileCheck, AlertTriangle, Brain, Target, DollarSign, FileText, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { formatGoal, normalizeGoals } from '@/lib/questionnaire';
import AgentHireDialog from '@/components/AgentHireDialog';

interface ChecklistItem { label: string; complete: boolean; }
interface BusinessRow {
  id: string; name: string; industry: string | null; score: number; status: string;
  capital_need: number | null; checklist: Json; top_gap: string | null; loan_product: string | null; notes: string | null;
}
interface QuestionnaireResult {
  id: string;
  business_id: string | null;
  selected_goals: string[] | null;
  credit_score_range: string | null;
  revenue_range: string | null;
  time_in_business: string | null;
  answers: Json;
  score: number;
  diagnosis_summary: string | null;
  roadmap: Json;
  checklist: Json;
  questionnaire_completed: boolean;
  completed_at: string;
}
interface RepNote { id: string; note: string; visibility: 'internal_only' | 'client_visible'; created_at: string; }
interface Submission { id: string; checklist_key: string; file_name: string; file_url: string; submitted_at: string; verified: boolean; }
interface AgentSubscription {
  id: string;
  business_id: string;
  user_id: string;
  agent_type: string;
  status: string;
  active: boolean;
  price_monthly: number;
}

const MONTHLY_PRICE = 89;
const getAgentType = (agentId: string) => agentId === 'docs' ? 'documentation' : agentId;

const agentDefs = [
  { id: 'fundability', Icon: Zap, name: 'Credit Enhancement Agent', desc: 'Score optimization & gap identification', weight: 0.2, gradient: 'from-blue-500 to-indigo-500' },
  { id: 'capital', Icon: Target, name: 'Receptionist Agent', desc: 'Funding program matching & routing', weight: 0.2, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'financial', Icon: DollarSign, name: 'Documentation Agent', desc: 'Cash flow & profitability analysis', weight: 0.2, gradient: 'from-amber-500 to-orange-500' },
  { id: 'docs', Icon: FileText, name: 'Documentation Agent', desc: 'Underwriting preparation', weight: 0.15, gradient: 'from-purple-500 to-violet-500' },
  { id: 'growth', Icon: TrendingUp, name: 'Business Growth Agent', desc: 'Revenue optimization & scaling', weight: 0.15, gradient: 'from-pink-500 to-rose-500' },
  { id: 'execution', Icon: Brain, name: 'Virtual Executive Assistant Agent', desc: 'Weekly action plans & priorities', weight: 0.1, gradient: 'from-cyan-500 to-blue-500' },
];

const computeAgentScores = (biz: BusinessRow, checklist: ChecklistItem[]) => {
  const pct = checklist.length > 0 ? checklist.filter(c => c.complete).length / checklist.length : 0;
  const notes = biz.notes || '';
  const hasRevenue = notes.includes('Revenue: 1m') || notes.includes('Revenue: 250k') || notes.includes('Revenue: 100k');
  const hasDocs = pct > 0.5;
  return agentDefs.map(a => {
    let s = 0;
    switch (a.id) {
      case 'fundability': s = Math.round(biz.score * 0.7 + pct * 30); break;
      case 'capital': s = hasRevenue ? 60 : 25; if (hasDocs) s += 20; break;
      case 'financial': s = hasRevenue ? 55 : 20; s += Math.round(pct * 20); break;
      case 'docs': s = Math.round(pct * 90 + 10); break;
      case 'growth': s = hasRevenue ? 45 : 15; s += Math.round(pct * 15); break;
      case 'execution': s = Math.round(pct * 60 + 20); break;
    }
    return { ...a, score: Math.min(100, Math.max(0, s)) };
  });
};

const parseCanvas = (biz: BusinessRow) => {
  const notes = biz.notes || '';
  const hasRevenue = !notes.includes('Revenue: pre') && !notes.includes('Revenue: under100k');
  const established = notes.includes('Time: 10+') || notes.includes('Time: 2-5') || notes.includes('Time: 2-10');
  return {
    valueProposition: hasRevenue ? `${biz.name} delivers proven value with an established revenue model.` : `${biz.name} is positioned to capture market share with growth potential.`,
    customerSegments: established ? 'Established customer base with repeat buyers' : 'Early adopters and initial market segment',
    revenueStreams: hasRevenue ? 'Active revenue streams generating consistent income' : 'Revenue model in development',
    keyActivities: established ? 'Operations, customer fulfillment, scaling' : 'Product development, market validation',
    keyResources: hasRevenue ? 'Team, technology, customer relationships' : 'Founder expertise, initial capital',
    channels: established ? 'Direct sales, partnerships, digital marketing' : 'Social media, direct outreach',
    growthOpportunities: hasRevenue ? 'Expand product lines, enter new markets' : 'Validate product-market fit',
    gapsRisks: !hasRevenue ? 'Pre-revenue risk — need to establish cash flow' : 'Scaling risk — systems may need upgrading',
  };
};

const parseCanvasFromQuestionnaire = (biz: BusinessRow, result?: QuestionnaireResult | null) => {
  if (!result) return parseCanvas(biz);
  const revenue = result.revenue_range || '';
  const time = result.time_in_business || '';
  const credit = result.credit_score_range || '';
  const goals = normalizeGoals(result.selected_goals || []);
  const hasRevenue = !['pre', 'under100k'].includes(revenue);
  const established = ['10+', '2-5', '2-5+', '2-10'].includes(time);
  const wantsFunding = goals.some(goal => ['loan', 'fundability'].includes(goal));
  const wantsCredit = goals.includes('credit');
  const wantsGrowth = goals.includes('grow');

  return {
    valueProposition: hasRevenue ? `${biz.name} has revenue history to build on.` : `${biz.name} needs stronger revenue proof before aggressive funding moves.`,
    customerSegments: established ? 'Existing customers and repeat buyers can support the plan.' : 'Early customers and validation should be documented clearly.',
    revenueStreams: hasRevenue ? `Current revenue range: ${revenue}.` : 'Revenue model still needs proof and consistency.',
    keyActivities: wantsFunding ? 'Prepare lender documents and match capital options.' : wantsCredit ? 'Repair credit and build business credit depth.' : 'Clarify the next strategic milestones.',
    keyResources: wantsCredit ? `Credit profile: ${credit || 'not provided'}.` : 'Business records, financials, and advisor guidance.',
    channels: wantsGrowth ? 'Growth channels, customer acquisition, and conversion tracking.' : 'Advisor-supported funding readiness workflow.',
    growthOpportunities: result.diagnosis_summary || 'Personalized roadmap is ready from your questionnaire.',
    gapsRisks: [wantsFunding && 'funding readiness', wantsCredit && 'credit improvement', wantsGrowth && 'growth execution'].filter(Boolean).join(' + ') || 'readiness planning',
  };
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [questionnaireResults, setQuestionnaireResults] = useState<QuestionnaireResult[]>([]);
  const [repNotes, setRepNotes] = useState<RepNote[]>([]);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subscriptions, setSubscriptions] = useState<AgentSubscription[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'canvas' | 'checklist' | 'agents'>('canvas');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState('');
  const [hireAgentId, setHireAgentId] = useState('');
  const [hireProcessing, setHireProcessing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('businesses').select('id, name, industry, score, status, capital_need, checklist, top_gap, loan_product, notes')
        .eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('questionnaire_results').select('*')
        .eq('user_id', user.id).eq('questionnaire_completed', true).order('updated_at', { ascending: false }),
      supabase.from('rep_notes').select('id, note, visibility, created_at')
        .eq('user_id', user.id).eq('visibility', 'client_visible').order('created_at', { ascending: false }),
      supabase.from('business_agent_subscriptions').select('id, business_id, user_id, agent_type, status, active, price_monthly')
        .eq('user_id', user.id),
    ]).then(([businessResult, questionnaireResult, notesResult, subscriptionResult]) => {
        const businessData = businessResult.data || [];
        const questionnaireData = (questionnaireResult.data || []) as QuestionnaireResult[];
        if (businessData.length > 0) {
          setBusinesses(businessData as BusinessRow[]);
          setSelectedBizId(businessData[0].id);
        } else if (questionnaireData.length > 0) {
          const saved = questionnaireData[0];
          const answers = saved.answers && typeof saved.answers === 'object' && !Array.isArray(saved.answers) ? saved.answers as Record<string, Json> : {};
          const fallbackBusiness: BusinessRow = {
            id: saved.business_id || `questionnaire-${saved.id}`,
            name: String(answers.businessName || 'My Business'),
            industry: null,
            score: saved.score,
            status: 'assessment',
            capital_need: null,
            checklist: saved.checklist,
            top_gap: null,
            loan_product: null,
            notes: null,
          };
          setBusinesses([fallbackBusiness]);
          setSelectedBizId(fallbackBusiness.id);
        }
        if (questionnaireData) setQuestionnaireResults(questionnaireData);
        if (notesResult.data) setRepNotes(notesResult.data as RepNote[]);
        if (subscriptionResult.error) {
          setSubscriptionError(subscriptionResult.error.message);
          setSubscriptions([]);
        } else if (subscriptionResult.data) {
          setSubscriptions(subscriptionResult.data as AgentSubscription[]);
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedBizId) return;
    supabase.from('checklist_submissions').select('*').eq('business_id', selectedBizId)
      .then(({ data }) => { if (data) setSubmissions(data as Submission[]); });
  }, [selectedBizId]);

  const biz = businesses.find(b => b.id === selectedBizId);
  const questionnaire = biz ? questionnaireResults.find(result => result.business_id === biz.id) || questionnaireResults[0] : questionnaireResults[0];
  const storedChecklist = questionnaire?.checklist;
  const checklist: ChecklistItem[] = biz ? (
    Array.isArray(storedChecklist) && storedChecklist.length > 0
      ? storedChecklist as unknown as ChecklistItem[]
      : Array.isArray(biz.checklist) ? biz.checklist as unknown as ChecklistItem[] : []
  ) : [];
  const complete = checklist.filter(c => c.complete).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
  const dashboardScore = questionnaire?.score ?? biz?.score ?? 0;
  const agentScores = biz ? computeAgentScores({ ...biz, score: dashboardScore }, checklist) : [];
  const overallScore = agentScores.length > 0 ? Math.round(agentScores.reduce((s, a) => s + a.score * a.weight, 0)) : 0;
  const canvas = biz ? parseCanvasFromQuestionnaire(biz, questionnaire) : null;
  const getSubmission = (key: string) => submissions.find(s => s.checklist_key === key);
  const selectedGoals = normalizeGoals(questionnaire?.selected_goals || []);
  const roadmap = Array.isArray(questionnaire?.roadmap) ? questionnaire.roadmap as string[] : [];
  const canUploadDocuments = !selectedBizId.startsWith('questionnaire-');
  const canHireAgents = !selectedBizId.startsWith('questionnaire-');

  const isAgentHired = (agentId: string) =>
    subscriptions.some(subscription =>
      subscription.business_id === selectedBizId &&
      subscription.agent_type === getAgentType(agentId) &&
      subscription.active &&
      subscription.status === 'active');

  const confirmHireAgent = async () => {
    if (!user || !selectedBizId || !hireAgentId || !canHireAgents) return;
    setHireProcessing(true);
    try {
      const { data, error } = await supabase.from('business_agent_subscriptions').upsert({
        business_id: selectedBizId,
        user_id: user.id,
        agent_type: getAgentType(hireAgentId),
        price_monthly: MONTHLY_PRICE,
        status: 'active',
        active: true,
        dummy_payment_success: true,
      }, { onConflict: 'business_id,agent_type' }).select('id, business_id, user_id, agent_type, status, active, price_monthly').single();
      if (error) throw error;
      setSubscriptions(prev => [
        ...prev.filter(subscription => !(subscription.business_id === selectedBizId && subscription.agent_type === getAgentType(hireAgentId))),
        data as AgentSubscription,
      ]);
      setSubscriptionError('');
      setHireAgentId('');
    } catch (error: any) {
      setSubscriptionError(error?.message || 'Failed to hire agent');
    } finally {
      setHireProcessing(false);
    }
  };

  const handleUpload = async (checklistKey: string) => { setUploadTarget(checklistKey); fileInputRef.current?.click(); };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedBizId || !uploadTarget) return;
    setUploading(uploadTarget);
    try {
      const filePath = `${user.id}/${selectedBizId}/${uploadTarget.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      await supabase.from('checklist_submissions').upsert({
        business_id: selectedBizId, checklist_key: uploadTarget, file_url: urlData.publicUrl, file_name: file.name,
      }, { onConflict: 'business_id,checklist_key' });
      const updatedChecklist = checklist.map(item => item.label === uploadTarget ? { ...item, complete: true } : item);
      await supabase.from('businesses').update({ checklist: updatedChecklist as unknown as Json }).eq('id', selectedBizId);
      if (questionnaire?.id) {
        await supabase.from('questionnaire_results').update({ checklist: updatedChecklist as unknown as Json }).eq('id', questionnaire.id);
        setQuestionnaireResults(prev => prev.map(result => result.id === questionnaire.id ? { ...result, checklist: updatedChecklist as unknown as Json } : result));
      }
      setSubmissions(prev => [...prev.filter(s => s.checklist_key !== uploadTarget),
        { id: crypto.randomUUID(), checklist_key: uploadTarget, file_name: file.name, file_url: urlData.publicUrl, submitted_at: new Date().toISOString(), verified: false }]);
      setBusinesses(prev => prev.map(b => b.id === selectedBizId ? { ...b, checklist: updatedChecklist as unknown as Json, score: Math.min(100, b.score + 2) } : b));
    } catch (err: any) { alert('Upload failed: ' + (err.message || 'Unknown error')); }
    finally { setUploading(null); setUploadTarget(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="bg-background rounded-2xl border border-border shadow-sm px-8 py-6 text-center">
        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
        <div className="text-sm text-muted-foreground">Loading your dashboard...</div>
      </div>
    </div>
  );

  if (businesses.length === 0) return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-background rounded-2xl border border-border shadow-sm p-10 text-center">
        <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-3">Complete Your Client Onboarding</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your business profile has not been set up yet. Finish onboarding to unlock your fundability score, checklist, and AI dashboard.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-3 rounded-xl no-underline hover:bg-primary/90 transition-colors"
        >
          Complete Onboarding <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  const canvasItems = canvas ? [
    { icon: <Sparkles className="w-4 h-4 text-primary" />, title: 'Value Proposition', content: canvas.valueProposition },
    { icon: <Target className="w-4 h-4 text-primary" />, title: 'Customer Segments', content: canvas.customerSegments },
    { icon: <DollarSign className="w-4 h-4 text-primary" />, title: 'Revenue Streams', content: canvas.revenueStreams },
    { icon: <Zap className="w-4 h-4 text-primary" />, title: 'Key Activities', content: canvas.keyActivities },
    { icon: <FileText className="w-4 h-4 text-primary" />, title: 'Key Resources', content: canvas.keyResources },
    { icon: <TrendingUp className="w-4 h-4 text-primary" />, title: 'Channels', content: canvas.channels },
    { icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, title: 'Growth Opportunities', content: canvas.growthOpportunities },
    { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, title: 'Gaps / Risks', content: canvas.gapsRisks },
  ] : [];

  const tabs = [
    { id: 'canvas' as const, label: 'Business Canvas', Icon: Brain },
    { id: 'checklist' as const, label: 'Checklist', Icon: FileCheck },
    { id: 'agents' as const, label: 'AI Agents', Icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      <AgentHireDialog
        open={!!hireAgentId}
        agentName={agentDefs.find(agent => agent.id === hireAgentId)?.name || 'Agent'}
        onClose={() => setHireAgentId('')}
        onConfirm={confirmHireAgent}
        processing={hireProcessing}
      />
      <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelected} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv" />

      {biz && (
        <>
          {/* Hero */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (2 * Math.PI * 42 * dashboardScore) / 100}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{dashboardScore}%</span>
                  <span className="text-[10px] text-muted-foreground">fundable</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{biz.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{biz.industry || 'Industry TBD'} · Capital needed: ${(biz.capital_need || 0).toLocaleString()}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedGoals.map(goal => (
                    <span key={goal} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{formatGoal(goal)}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{complete}/{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary p-1 rounded-xl">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <tab.Icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Canvas Tab */}
          {activeTab === 'canvas' && canvas && (
            <div className="space-y-4">
            <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">Business Model Canvas</h3>
                  <p className="text-[11px] text-muted-foreground">Auto-generated from your profile</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                {canvasItems.map(item => (
                  <div key={item.title} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {item.icon}
                      <span className="text-xs font-semibold text-foreground">{item.title}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-snug pl-6">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
            {questionnaire?.diagnosis_summary && (
              <div className="bg-primary/5 rounded-xl border border-primary/10 px-5 py-4 text-sm text-foreground">
                <div className="font-bold mb-1">Personalized Diagnosis</div>
                <p className="text-muted-foreground leading-relaxed">{questionnaire.diagnosis_summary}</p>
              </div>
            )}
            {questionnaire && (
              <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                {[
                  ['Credit', questionnaire.credit_score_range || 'N/A'],
                  ['Revenue', questionnaire.revenue_range || 'N/A'],
                  ['Time in Business', questionnaire.time_in_business || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-background rounded-xl border border-border shadow-sm p-4">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-sm font-bold text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            )}
            {roadmap.length > 0 && (
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border font-bold text-sm text-foreground">Roadmap</div>
                <div className="divide-y divide-border">
                  {roadmap.map((step, i) => (
                    <div key={`${step}-${i}`} className="px-5 py-3 text-sm text-muted-foreground flex gap-3">
                      <span className="text-primary font-bold">{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {repNotes.length > 0 && (
              <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border font-bold text-sm text-foreground">Advisor Notes</div>
                <div className="divide-y divide-border">
                  {repNotes.map(note => (
                    <div key={note.id} className="px-5 py-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{note.note}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(note.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Agent Scores
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Overall</span>
                  <span className={`text-lg font-bold ${overallScore >= 70 ? 'text-emerald-600' : overallScore >= 45 ? 'text-amber-500' : 'text-destructive'}`}>{overallScore}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {agentScores.map(agent => {
                  const r = 30; const c = 2 * Math.PI * r;
                  const color = agent.score >= 70 ? '#10b981' : agent.score >= 45 ? '#f59e0b' : '#ef4444';
                  const hired = isAgentHired(agent.id);
                  return (
                    <div key={agent.id} className="bg-background rounded-xl border border-border shadow-sm p-4 text-center hover:border-primary/20 hover:shadow transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mx-auto mb-3`}>
                        <agent.Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg viewBox="0 0 68 68" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                          <circle cx="34" cy="34" r={r} fill="none" stroke={color}
                            strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * agent.score) / 100}
                            className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-foreground">{agent.score}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-foreground">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{agent.desc}</div>
                      <div className="mt-3">
                        {hired ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-600">
                            Hired at ${MONTHLY_PRICE}/mo
                          </span>
                        ) : canHireAgents ? (
                          <button
                            onClick={() => setHireAgentId(agent.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Hire Agent
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                            Complete setup to hire
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {subscriptionError && (
                <div className="rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                  Subscription setup error: {subscriptionError}. Apply the latest Supabase migration so `business_agent_subscriptions` exists, then refresh the dashboard.
                </div>
              )}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">Fundability Checklist</h3>
                    <p className="text-xs text-muted-foreground">Upload documents to improve your score</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/[0.06] px-3 py-1 rounded-full">{complete}/{total}</span>
              </div>
              <div>
                {checklist.map((item, i) => {
                  const sub = getSubmission(item.label);
                  const isUploading = uploading === item.label;
                  return (
                    <div key={i} className={`px-6 py-4 border-b border-border/50 last:border-b-0 flex items-center gap-4 transition-all ${item.complete ? 'bg-emerald-50/50' : 'hover:bg-secondary/50'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.complete ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>
                        {item.complete ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${item.complete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.label}</div>
                        {sub && (
                          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                            📎 {sub.file_name}
                            {sub.verified
                              ? <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Verified</span>
                              : <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>}
                          </div>
                        )}
                      </div>
                      {!item.complete && canUploadDocuments && (
                        <button onClick={() => handleUpload(item.label)} disabled={isUploading}
                          className="text-xs font-semibold text-primary bg-primary/[0.06] border border-primary/10 px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/10 transition-all disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action items */}
          {biz.top_gap && biz.top_gap !== 'None' && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 px-5 py-4 text-sm text-amber-700 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div><strong>Top Priority:</strong> {biz.top_gap}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientDashboard;

