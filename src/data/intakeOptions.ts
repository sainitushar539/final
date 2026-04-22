export const NAICS_INDUSTRIES = [
  // Agriculture, Forestry, Fishing & Hunting (11)
  { code: '111', label: 'Crop Production' },
  { code: '112', label: 'Animal Production & Aquaculture' },
  { code: '113', label: 'Forestry & Logging' },
  { code: '114', label: 'Fishing, Hunting & Trapping' },
  { code: '115', label: 'Agriculture & Forestry Support Activities' },

  // Mining, Quarrying & Oil/Gas (21)
  { code: '211', label: 'Oil & Gas Extraction' },
  { code: '212', label: 'Mining (except Oil & Gas)' },
  { code: '213', label: 'Mining Support Activities' },

  // Utilities (22)
  { code: '2211', label: 'Electric Power Generation & Distribution' },
  { code: '2212', label: 'Natural Gas Distribution' },
  { code: '2213', label: 'Water, Sewage & Other Systems' },

  // Construction (23)
  { code: '236', label: 'Construction of Buildings' },
  { code: '237', label: 'Heavy & Civil Engineering Construction' },
  { code: '238', label: 'Specialty Trade Contractors' },

  // Manufacturing (31-33)
  { code: '311', label: 'Food Manufacturing' },
  { code: '312', label: 'Beverage & Tobacco Manufacturing' },
  { code: '313', label: 'Textile Mills' },
  { code: '314', label: 'Textile Product Mills' },
  { code: '315', label: 'Apparel Manufacturing' },
  { code: '316', label: 'Leather & Allied Product Manufacturing' },
  { code: '321', label: 'Wood Product Manufacturing' },
  { code: '322', label: 'Paper Manufacturing' },
  { code: '323', label: 'Printing & Related Support' },
  { code: '324', label: 'Petroleum & Coal Products Manufacturing' },
  { code: '325', label: 'Chemical Manufacturing' },
  { code: '326', label: 'Plastics & Rubber Products Manufacturing' },
  { code: '327', label: 'Nonmetallic Mineral Product Manufacturing' },
  { code: '331', label: 'Primary Metal Manufacturing' },
  { code: '332', label: 'Fabricated Metal Product Manufacturing' },
  { code: '333', label: 'Machinery Manufacturing' },
  { code: '334', label: 'Computer & Electronic Product Manufacturing' },
  { code: '335', label: 'Electrical Equipment & Appliance Manufacturing' },
  { code: '336', label: 'Transportation Equipment Manufacturing' },
  { code: '337', label: 'Furniture & Related Product Manufacturing' },
  { code: '339', label: 'Miscellaneous Manufacturing' },

  // Wholesale Trade (42)
  { code: '423', label: 'Merchant Wholesalers, Durable Goods' },
  { code: '424', label: 'Merchant Wholesalers, Nondurable Goods' },
  { code: '425', label: 'Wholesale Electronic Markets & Agents/Brokers' },

  // Retail Trade (44-45)
  { code: '441', label: 'Motor Vehicle & Parts Dealers' },
  { code: '442', label: 'Furniture & Home Furnishings Stores' },
  { code: '443', label: 'Electronics & Appliance Stores' },
  { code: '444', label: 'Building Material & Garden Equipment Stores' },
  { code: '445', label: 'Food & Beverage Stores' },
  { code: '446', label: 'Health & Personal Care Stores' },
  { code: '447', label: 'Gasoline Stations' },
  { code: '448', label: 'Clothing & Clothing Accessories Stores' },
  { code: '451', label: 'Sporting Goods, Hobby, Book & Music Stores' },
  { code: '452', label: 'General Merchandise Stores' },
  { code: '453', label: 'Miscellaneous Store Retailers' },
  { code: '454', label: 'Nonstore Retailers (E-Commerce)' },

  // Transportation & Warehousing (48-49)
  { code: '481', label: 'Air Transportation' },
  { code: '482', label: 'Rail Transportation' },
  { code: '483', label: 'Water Transportation' },
  { code: '484', label: 'Truck Transportation' },
  { code: '485', label: 'Transit & Ground Passenger Transportation' },
  { code: '486', label: 'Pipeline Transportation' },
  { code: '487', label: 'Scenic & Sightseeing Transportation' },
  { code: '488', label: 'Transportation Support Activities' },
  { code: '491', label: 'Postal Service' },
  { code: '492', label: 'Couriers & Messengers' },
  { code: '493', label: 'Warehousing & Storage' },

  // Information & Technology (51)
  { code: '511210', label: 'Software Publishers (SaaS, Apps, Enterprise Software)' },
  { code: '512', label: 'Motion Picture & Sound Recording' },
  { code: '515', label: 'Broadcasting (except Internet)' },
  { code: '517', label: 'Telecommunications, ISPs & Wireless Carriers' },
  { code: '518210', label: 'Cloud Hosting, Data Centers & SaaS Infrastructure' },
  { code: '519130', label: 'Internet Publishing, Streaming & Web Portals' },

  // Finance & Insurance (52)
  { code: '521', label: 'Monetary Authorities (Central Bank)' },
  { code: '522', label: 'Credit Intermediation & Related Activities' },
  { code: '523', label: 'Securities, Commodity Contracts & Investments' },
  { code: '524', label: 'Insurance Carriers & Related Activities' },
  { code: '525', label: 'Funds, Trusts & Other Financial Vehicles' },

  // Real Estate (53)
  { code: '531', label: 'Real Estate' },
  { code: '532', label: 'Rental & Leasing Services' },
  { code: '533', label: 'Lessors of Nonfinancial Intangible Assets' },

  // Professional, Scientific & Technical (54)
  { code: '5411', label: 'Legal Services' },
  { code: '5412', label: 'Accounting, Tax & Payroll Services' },
  { code: '541511', label: 'Custom Software Development & Mobile Apps' },
  { code: '541512', label: 'Computer Systems Design & Integration' },
  { code: '541513', label: 'Managed IT Services & Tech Support' },
  { code: '541519', label: 'Web Design, Development & Digital Agencies' },
  { code: '541611', label: 'AI, Machine Learning & Data Science Consulting' },
  { code: '541618', label: 'Cybersecurity & Information Security Services' },
  { code: '541690', label: 'Hardware Engineering, IoT & Robotics Development' },
  { code: '541715', label: 'Research & Development in Physical Sciences' },
  { code: '5418', label: 'Advertising, PR & Digital Marketing' },
  { code: '5419', label: 'Other Professional & Technical Services' },

  // Management of Companies (55)
  { code: '551', label: 'Management of Companies & Enterprises' },

  // Administrative & Support (56)
  { code: '561', label: 'Administrative & Support Services' },
  { code: '562', label: 'Waste Management & Remediation Services' },

  // Educational Services (61)
  { code: '6111', label: 'Elementary & Secondary Schools' },
  { code: '6112', label: 'Junior Colleges' },
  { code: '6113', label: 'Colleges, Universities & Professional Schools' },
  { code: '6114', label: 'Business Schools & Training' },
  { code: '6115', label: 'Technical & Trade Schools' },
  { code: '6116', label: 'Other Schools & Instruction' },
  { code: '6117', label: 'Educational Support Services' },

  // Health Care & Social Assistance (62)
  { code: '621', label: 'Ambulatory Health Care Services' },
  { code: '622', label: 'Hospitals' },
  { code: '623', label: 'Nursing & Residential Care Facilities' },
  { code: '624', label: 'Social Assistance' },

  // Arts, Entertainment & Recreation (71)
  { code: '711', label: 'Performing Arts, Spectator Sports & Related' },
  { code: '712', label: 'Museums, Historical Sites & Similar' },
  { code: '713', label: 'Amusement, Gambling & Recreation Industries' },

  // Accommodation & Food Services (72)
  { code: '721', label: 'Accommodation (Hotels, Motels, B&Bs)' },
  { code: '722', label: 'Food Services & Drinking Places (Restaurants, Bars)' },

  // Other Services (81)
  { code: '811', label: 'Repair & Maintenance' },
  { code: '812', label: 'Personal & Laundry Services' },
  { code: '813', label: 'Religious, Grantmaking, Civic & Professional Organizations' },
  { code: '814', label: 'Private Households' },

  // Public Administration (92)
  { code: '921', label: 'Executive, Legislative & General Government' },
  { code: '922', label: 'Justice, Public Order & Safety Activities' },
  { code: '923', label: 'Administration of Human Resource Programs' },
  { code: '924', label: 'Administration of Environmental Programs' },
  { code: '925', label: 'Community & Housing Program Administration' },
  { code: '926', label: 'Administration of Economic Programs' },
  { code: '927', label: 'Space Research & Technology' },
  { code: '928', label: 'National Security & International Affairs' },
];

export const CREDIT_SCORE_RANGES = [
  { value: 'excellent', label: '750+  (Excellent)', min: 750 },
  { value: 'good', label: '700–749  (Good)', min: 700 },
  { value: 'fair', label: '650–699  (Fair)', min: 650 },
  { value: 'below-average', label: '600–649  (Below Average)', min: 600 },
  { value: 'poor', label: 'Below 600  (Needs Work)', min: 0 },
  { value: 'unsure', label: "I'm Not Sure", min: -1 },
];

export const FUNDING_AMOUNTS = [
  { value: 'under-10k', label: 'Under $10,000', amount: 10000 },
  { value: '10k-25k', label: '$10,000 – $25,000', amount: 25000 },
  { value: '25k-50k', label: '$25,000 – $50,000', amount: 50000 },
  { value: '50k-100k', label: '$50,000 – $100,000', amount: 100000 },
  { value: '100k-250k', label: '$100,000 – $250,000', amount: 250000 },
  { value: '250k-500k', label: '$250,000 – $500,000', amount: 500000 },
  { value: '500k-plus', label: '$500,000+', amount: 500001 },
  { value: 'not-sure', label: "I'm Not Sure Yet", amount: 0 },
];

export const BUSINESS_NEEDS = [
  { value: 'funding', label: 'I need funding for my business', icon: '💰' },
  { value: 'coaching', label: 'I need coaching on growing my business', icon: '🧭' },
  { value: 'financial-health', label: 'I need help with financial health & cash flow', icon: '📊' },
  { value: 'documentation', label: 'I need help organizing business documents', icon: '📋' },
  { value: 'business-plan', label: 'I need a business plan or strategy', icon: '📝' },
  { value: 'credit-repair', label: 'I need to improve my credit', icon: '🔧' },
  { value: 'marketing', label: 'I need help with marketing & outreach', icon: '📣' },
  { value: 'just-exploring', label: "I'm just exploring what's available", icon: '🔍' },
];

export const TIME_IN_BUSINESS = [
  { value: '10+', label: '10+ years' },
  { value: '2-5', label: '2-5 years' },
  { value: '<2', label: 'Less than 2 years' },
  { value: 'not-started', label: 'Not started yet' },
];

export const ANNUAL_REVENUE = [
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: 'under-50k', label: 'Under $50,000' },
  { value: '50k-100k', label: '$50,000 – $100,000' },
  { value: '100k-250k', label: '$100,000 – $250,000' },
  { value: '250k-500k', label: '$250,000 – $500,000' },
  { value: '500k-1m', label: '$500,000 – $1M' },
  { value: '1m-plus', label: '$1M+' },
];

export function determineFunnel(data: {
  needs: string[];
  creditScore: string;
  revenue: string;
  timeInBusiness: string;
  amountSeeking: string;
}): { funnel: string; label: string; description: string } {
  const { needs, creditScore, revenue, timeInBusiness } = data;

  const wantsFunding = needs.includes('funding');
  const wantsCoaching = needs.includes('coaching') || needs.includes('business-plan');
  const isEarlyStage = ['not-started', '<2', 'pre-revenue', 'under-1'].includes(timeInBusiness);
  const hasStrongCredit = creditScore === 'excellent' || creditScore === 'good';
  const hasRevenue = revenue !== 'pre-revenue' && revenue !== 'under-50k';

  if (wantsFunding && hasStrongCredit && hasRevenue && !isEarlyStage) {
    return {
      funnel: 'funding-ready',
      label: 'Funding Ready',
      description: 'You have a strong foundation. Let\'s get you matched with the right funding options and strengthen your application.',
    };
  }

  if (wantsFunding && !hasStrongCredit) {
    return {
      funnel: 'credit-building',
      label: 'Credit Building Path',
      description: 'Let\'s work on strengthening your credit profile first, so you can access better funding terms when you\'re ready.',
    };
  }

  if (wantsFunding && isEarlyStage) {
    return {
      funnel: 'early-stage-funding',
      label: 'Early-Stage Funding',
      description: 'We\'ll help you build the foundation lenders want to see — business structure, documentation, and early traction.',
    };
  }

  if (wantsCoaching && !wantsFunding) {
    return {
      funnel: 'growth-coaching',
      label: 'Growth Coaching',
      description: 'Your focus is growth. We\'ll build your Business Model Canvas and create a personalized strategy to scale.',
    };
  }

  if (isEarlyStage) {
    return {
      funnel: 'startup-guidance',
      label: 'Startup Guidance',
      description: 'You\'re just getting started — and that\'s great. We\'ll help you build a clear roadmap and strong business foundation.',
    };
  }

  return {
    funnel: 'general-guidance',
    label: 'Business Guidance',
    description: 'We\'ll create your Business Model Canvas and help you identify the best next steps for your specific situation.',
  };
}
