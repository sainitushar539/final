import type { Json } from '@/integrations/supabase/types';

export type GoalId = 'loan' | 'fundability' | 'credit' | 'grow' | 'exploring';

export interface ChecklistItem {
  label: string;
  complete: boolean;
}

export interface QuestionnaireInput {
  businessName: string;
  email: string;
  selectedGoals: string[];
  creditScoreRange: string;
  revenueRange: string;
  timeInBusiness: string;
  score: number;
  answers?: Record<string, unknown>;
}

export const goalLabels: Record<string, string> = {
  loan: 'Business funding',
  funding: 'Business funding',
  fundability: 'Funding readiness',
  credit: 'Credit improvement',
  grow: 'Business growth',
  growth: 'Business growth',
  exploring: 'Exploring options',
  lead_gen: 'More customers',
  coaching: 'Coaching',
  documents: 'Documentation',
  financial_health: 'Financial health',
  business_plan: 'Business plan',
};

export const normalizeGoals = (goals: string[] | string | null | undefined) => {
  const rawGoals = Array.isArray(goals) ? goals : goals ? [goals] : [];
  const normalized = rawGoals.map(goal => String(goal));
  const mapped = normalized.map(goal => {
    if (['funding', 'loan'].includes(goal)) return 'loan';
    if (goal === 'growth') return 'grow';
    if (['financial_health', 'business_plan', 'documents'].includes(goal)) return 'fundability';
    return goal;
  });
  return Array.from(new Set(mapped.length > 0 ? mapped : ['fundability']));
};

export const formatGoal = (goal: string) => goalLabels[goal] || goal.replace(/_/g, ' ');

const hasGoal = (goals: string[], targets: string[]) => goals.some(goal => targets.includes(goal));

export const buildGoalChecklist = (goals: string[]): ChecklistItem[] => {
  const items: ChecklistItem[] = [
    { label: 'Business License / Registration', complete: false },
    { label: 'EIN / Tax ID', complete: false },
    { label: 'Business Bank Account', complete: false },
  ];

  if (hasGoal(goals, ['loan', 'fundability'])) {
    items.push(
      { label: 'Bank Statements (3 months)', complete: false },
      { label: 'Tax Returns (2 years)', complete: false },
      { label: 'Profit & Loss Statement', complete: false },
      { label: 'Balance Sheet', complete: false },
      { label: 'Debt Schedule', complete: false },
      { label: 'Personal Financial Statement', complete: false },
    );
  }

  if (hasGoal(goals, ['credit'])) {
    items.push(
      { label: 'Credit Report Review', complete: false },
      { label: 'Dispute / Correction Plan', complete: false },
      { label: 'Business Credit Accounts', complete: false },
    );
  }

  if (hasGoal(goals, ['grow'])) {
    items.push(
      { label: 'Growth Plan', complete: false },
      { label: 'Revenue Forecast', complete: false },
      { label: 'Marketing Channel Review', complete: false },
    );
  }

  if (hasGoal(goals, ['exploring'])) {
    items.push({ label: 'Advisor Strategy Session', complete: false });
  }

  return items;
};

export const buildRoadmap = (input: QuestionnaireInput) => {
  const goals = normalizeGoals(input.selectedGoals);
  const roadmap: string[] = [];

  if (hasGoal(goals, ['loan', 'fundability'])) {
    roadmap.push('Package bank statements, tax returns, and financial statements for lender review.');
    roadmap.push(input.revenueRange === 'pre' || input.revenueRange === 'under100k'
      ? 'Stabilize revenue before pursuing larger funding products.'
      : 'Match funding options to current revenue and time in business.');
  }

  if (hasGoal(goals, ['credit'])) {
    roadmap.push(input.creditScoreRange === '780+' || input.creditScoreRange === '740-779'
      ? 'Protect strong credit while building business tradelines.'
      : 'Prioritize credit cleanup, utilization reduction, and business credit separation.');
  }

  if (hasGoal(goals, ['grow'])) {
    roadmap.push('Clarify growth bottlenecks, revenue model, and acquisition channels.');
  }

  if (roadmap.length === 0) {
    roadmap.push('Complete an advisor review to choose the best readiness path.');
  }

  return roadmap;
};

export const buildDiagnosisSummary = (input: QuestionnaireInput) => {
  const goals = normalizeGoals(input.selectedGoals);
  const goalText = goals.map(formatGoal).join(' + ');
  const creditNeedsWork = ['<600', '600-680', '680-739'].includes(input.creditScoreRange);
  const revenueNeedsWork = ['pre', 'under100k'].includes(input.revenueRange);
  const newerBusiness = ['not-started', '<2'].includes(input.timeInBusiness);
  const focus: string[] = [];

  if (hasGoal(goals, ['loan', 'fundability'])) focus.push(revenueNeedsWork ? 'build stronger cash-flow proof' : 'prepare a lender-ready package');
  if (hasGoal(goals, ['credit'])) focus.push(creditNeedsWork ? 'repair and optimize credit' : 'protect strong credit while building business credit');
  if (hasGoal(goals, ['grow'])) focus.push('tighten the growth plan and revenue engine');
  if (newerBusiness) focus.push('choose programs that fit newer businesses');

  return `${input.businessName || 'Your business'} is at ${input.score}/100 for ${goalText}. The next focus is to ${Array.from(new Set(focus)).join(', ') || 'complete your readiness plan'}.`;
};

export const buildQuestionnaireResult = (input: QuestionnaireInput) => {
  const selectedGoals = normalizeGoals(input.selectedGoals);
  const checklist = buildGoalChecklist(selectedGoals);
  const roadmap = buildRoadmap({ ...input, selectedGoals });
  const diagnosis = buildDiagnosisSummary({ ...input, selectedGoals });

  return {
    selectedGoals,
    checklist,
    roadmap,
    diagnosis,
    answers: {
      ...(input.answers || {}),
      businessName: input.businessName,
      selectedGoals,
      creditScoreRange: input.creditScoreRange,
      revenueRange: input.revenueRange,
      timeInBusiness: input.timeInBusiness,
    } as Record<string, unknown>,
  };
};

export const toJson = (value: unknown) => value as Json;
