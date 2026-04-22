export interface Business {
  id: string;
  name: string;
  industry: string;
  score: number;
  status: 'assessment' | 'improving' | 'capital-ready' | 'under-review' | 'funded';
  capitalNeed: number;
  loanProduct?: string;
  checklist: ChecklistItem[];
  topGap: string;
  notes: string;
}

export interface ChecklistItem {
  label: string;
  complete: boolean;
}

const defaultChecklist = (overrides: Record<string, boolean> = {}): ChecklistItem[] => {
  const items = [
    'EIN / Tax ID',
    'Business License',
    'Operating Agreement',
    'Articles of Incorporation',
    'Business Bank Account (3mo)',
    'Business Bank Statements (6mo)',
    'Tax Returns (2yr)',
    'Personal Credit Report',
    'Business Credit Report',
    'Use of Funds Statement',
    'Revenue Documentation',
    'Debt Schedule',
  ];
  return items.map(label => ({
    label,
    complete: overrides[label] ?? false,
  }));
};

export const businesses: Business[] = [
  {
    id: '1', name: 'Williams Catering Co.', industry: 'Food Service', score: 78,
    status: 'capital-ready', capitalNeed: 45000, loanProduct: 'Revolving Loan Fund',
    topGap: 'None — All docs complete',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Use of Funds Statement': true, 'Revenue Documentation': true, 'Debt Schedule': true,
    }),
    notes: '',
  },
  {
    id: '2', name: 'Park Tech Solutions', industry: 'Technology', score: 82,
    status: 'capital-ready', capitalNeed: 35000, loanProduct: 'SBA Microloan',
    topGap: 'None — Package ready',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Use of Funds Statement': true, 'Revenue Documentation': true, 'Debt Schedule': true,
    }),
    notes: '',
  },
  {
    id: '3', name: 'Johnson & Sons Const.', industry: 'Construction', score: 58,
    status: 'improving', capitalNeed: 38000, loanProduct: 'AR Financing',
    topGap: 'Operating Agreement, Tax Returns (2yr)',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Personal Credit Report': true,
      'Business Credit Report': true, 'Revenue Documentation': true, 'Debt Schedule': true,
      'Use of Funds Statement': true, 'Articles of Incorporation': true,
    }),
    notes: '',
  },
  {
    id: '4', name: 'Chen Medical Spa', industry: 'Healthcare', score: 62,
    status: 'improving', capitalNeed: 50000,
    topGap: '1yr tax return only, 3mo statements',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Revenue Documentation': true, 'Debt Schedule': true, 'Use of Funds Statement': true,
    }),
    notes: '',
  },
  {
    id: '5', name: 'Davis Auto Group', industry: 'Automotive', score: 67,
    status: 'improving', capitalNeed: 60000,
    topGap: 'Credit score 641',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Business Credit Report': true, 'Revenue Documentation': true,
      'Debt Schedule': true, 'Use of Funds Statement': true,
    }),
    notes: '',
  },
  {
    id: '6', name: 'Sunrise Daycare', industry: 'Childcare', score: 71,
    status: 'improving', capitalNeed: 25000,
    topGap: 'Use of funds missing',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Revenue Documentation': true, 'Debt Schedule': true,
    }),
    notes: '',
  },
  {
    id: '7', name: 'Rivera Logistics', industry: 'Transport', score: 34,
    status: 'assessment', capitalNeed: 40000,
    topGap: 'No credit file, No tax returns',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Business Bank Account (3mo)': true,
    }),
    notes: '',
  },
  {
    id: '8', name: 'Metro Beauty Supply', industry: 'Retail', score: 44,
    status: 'assessment', capitalNeed: 30000,
    topGap: 'No operating agreement, No tax returns',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Business Bank Account (3mo)': true,
      'Personal Credit Report': true, 'Revenue Documentation': true,
    }),
    notes: '',
  },
  {
    id: '9', name: 'Thompson Builders', industry: 'Construction', score: 85,
    status: 'funded', capitalNeed: 75000, loanProduct: 'Revolving Fund',
    topGap: 'None',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Use of Funds Statement': true, 'Revenue Documentation': true, 'Debt Schedule': true,
    }),
    notes: '',
  },
  {
    id: '10', name: 'Green Valley Farm', industry: 'Agriculture', score: 79,
    status: 'funded', capitalNeed: 45000, loanProduct: 'SBA Microloan',
    topGap: 'None',
    checklist: defaultChecklist({
      'EIN / Tax ID': true, 'Business License': true, 'Operating Agreement': true,
      'Articles of Incorporation': true, 'Business Bank Account (3mo)': true,
      'Business Bank Statements (6mo)': true, 'Tax Returns (2yr)': true,
      'Personal Credit Report': true, 'Business Credit Report': true,
      'Use of Funds Statement': true, 'Revenue Documentation': true, 'Debt Schedule': true,
    }),
    notes: '',
  },
];

export const getScoreColor = (score: number) => {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
};

export const getStatusLabel = (status: Business['status']) => {
  switch (status) {
    case 'assessment': return { label: 'Assessment', cls: 'bg-info/15 text-info border border-info' };
    case 'improving': return { label: 'Improving', cls: 'bg-warning/15 text-warning border border-warning' };
    case 'capital-ready': return { label: 'Capital Ready', cls: 'bg-success/15 text-success border border-success' };
    case 'under-review': return { label: 'Under Review', cls: 'bg-primary/15 text-primary border border-primary' };
    case 'funded': return { label: 'Funded ✓', cls: 'bg-success/30 text-success-lt border border-success-lt' };
  }
};
