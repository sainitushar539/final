import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { buildQuestionnaireResult, toJson } from './questionnaire';

export const PENDING_FUNDING_SNAPSHOT_KEY = 'cs_pending_funding_snapshot';

export interface FundingSnapshot {
  businessName: string;
  email?: string;
  phone?: string;
  website?: string;
  goals?: string[];
  credit: string;
  revenue: string;
  timeInBusiness: string;
  score: number;
  source?: string;
}

const isMissingQuestionnaireResultsTable = (error: unknown) => {
  const err = error as { code?: string; message?: string } | null;
  if (!err) return false;
  if (err.code === 'PGRST205' || err.code === '42P01') return true;
  return (err.message || '').toLowerCase().includes('questionnaire_results');
};

const defaultChecklist = [
  { label: 'Business License / Registration', complete: false },
  { label: 'EIN / Tax ID', complete: false },
  { label: 'Business Bank Account', complete: false },
  { label: 'Bank Statements (3 months)', complete: false },
  { label: 'Tax Returns (2 years)', complete: false },
  { label: 'Profit & Loss Statement', complete: false },
  { label: 'Balance Sheet', complete: false },
  { label: 'Business Plan', complete: false },
  { label: 'Financial Projections', complete: false },
  { label: 'Operating Agreement', complete: false },
  { label: 'Debt Schedule', complete: false },
  { label: 'Personal Financial Statement', complete: false },
  { label: 'Insurance Documentation', complete: false },
];

const getTopGap = (snapshot: FundingSnapshot) => {
  if (snapshot.score >= 80) return 'Documentation';
  if (snapshot.score >= 60) return 'Funding package readiness';
  if (snapshot.revenue === 'pre' || snapshot.revenue === 'under100k') return 'Revenue';
  return 'Credit & Documentation';
};

export const savePendingFundingSnapshot = (snapshot: FundingSnapshot) => {
  try {
    localStorage.setItem(PENDING_FUNDING_SNAPSHOT_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
  } catch { /* ignore */ }
};

export const consumePendingFundingSnapshot = () => {
  try {
    const raw = localStorage.getItem(PENDING_FUNDING_SNAPSHOT_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_FUNDING_SNAPSHOT_KEY);
    return JSON.parse(raw) as FundingSnapshot & { savedAt?: number };
  } catch {
    return null;
  }
};

export const persistFundingSnapshot = async (userId: string, snapshot: FundingSnapshot) => {
  const questionnaire = buildQuestionnaireResult({
    businessName: snapshot.businessName || 'My Business',
    email: snapshot.email || '',
    selectedGoals: snapshot.goals || ['fundability'],
    creditScoreRange: snapshot.credit,
    revenueRange: snapshot.revenue,
    timeInBusiness: snapshot.timeInBusiness,
    score: snapshot.score || 10,
    answers: {
      phone: snapshot.phone || '',
      website: snapshot.website || '',
      source: snapshot.source || 'homepage_ai_flow',
    },
  });
  const payload = {
    user_id: userId,
    name: snapshot.businessName || 'My Business',
    industry: null,
    capital_need: null,
    checklist: (questionnaire.checklist.length > 0 ? questionnaire.checklist : defaultChecklist) as unknown as Json,
    score: snapshot.score || 10,
    status: snapshot.score >= 80 ? 'capital-ready' : 'assessment',
    top_gap: getTopGap(snapshot),
    loan_product: snapshot.score >= 80 ? 'standard' : snapshot.score >= 60 ? 'revenue-based' : 'building',
    notes: [
      `Credit: ${snapshot.credit}`,
      `Revenue: ${snapshot.revenue}`,
      `Time: ${snapshot.timeInBusiness}`,
      `Website: ${snapshot.website || ''}`,
      `Source: ${snapshot.source || 'homepage_ai_flow'}`,
    ].join('. '),
  };

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const result = await supabase.from('businesses').update(payload).eq('id', existing.id);
    if (result.error) return result;
    const questionnaireWrite = await supabase.from('questionnaire_results').upsert({
      user_id: userId,
      business_id: existing.id,
      email: (snapshot.email || '').toLowerCase(),
      selected_goals: questionnaire.selectedGoals,
      credit_score_range: snapshot.credit,
      revenue_range: snapshot.revenue,
      time_in_business: snapshot.timeInBusiness,
      answers: toJson(questionnaire.answers),
      score: snapshot.score || 10,
      diagnosis_summary: questionnaire.diagnosis,
      roadmap: toJson(questionnaire.roadmap),
      checklist: toJson(questionnaire.checklist),
      questionnaire_completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (questionnaireWrite.error && !isMissingQuestionnaireResultsTable(questionnaireWrite.error)) {
      return questionnaireWrite;
    }
    return { data: questionnaireWrite.data, error: null };
  }

  const inserted = await supabase.from('businesses').insert(payload).select('id').single();
  if (inserted.error) return inserted;
  const questionnaireWrite = await supabase.from('questionnaire_results').upsert({
    user_id: userId,
    business_id: inserted.data.id,
    email: (snapshot.email || '').toLowerCase(),
    selected_goals: questionnaire.selectedGoals,
    credit_score_range: snapshot.credit,
    revenue_range: snapshot.revenue,
    time_in_business: snapshot.timeInBusiness,
    answers: toJson(questionnaire.answers),
    score: snapshot.score || 10,
    diagnosis_summary: questionnaire.diagnosis,
    roadmap: toJson(questionnaire.roadmap),
    checklist: toJson(questionnaire.checklist),
    questionnaire_completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (questionnaireWrite.error && !isMissingQuestionnaireResultsTable(questionnaireWrite.error)) {
    return questionnaireWrite;
  }
  return { data: questionnaireWrite.data, error: null };
};

export const claimClientIntakeFromLead = async (userId: string, email?: string | null) => {
  const cleanEmail = email?.toLowerCase().trim();
  if (!cleanEmail) return false;

  const { data, error } = await supabase.rpc('claim_client_intake_from_lead', {
    _email: cleanEmail,
    _user_id: userId,
  });

  if (error) {
    console.warn('Unable to claim saved intake', error.message);
    return false;
  }

  return Boolean(data);
};
