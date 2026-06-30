export type DocumentType = 
  // 1. Founder & Ownership
  | 'Founder Agreement'
  | 'Shareholder Agreement'
  | 'Partnership Agreement'
  | 'LLP Agreement'
  | 'Co-Founder Exit Agreement'
  | 'ESOP Agreement'
  | 'Vesting Agreement'
  
  // 2. Employee & HR
  | 'NDA'
  | 'Employment Agreement'
  | 'Offer Letter'
  | 'Non-Compete Agreement'
  | 'Internship Agreement'
  | 'Consultant Agreement'
  | 'Remote Work Agreement'
  | 'Code of Conduct Agreement'
  
  // 3. Client & Customer
  | 'Client Onboarding Form'
  | 'Client Service Agreement'
  | 'Service Level Agreement (SLA)'
  | 'Retainer Agreement'
  | 'Loan Consultancy Agreement'
  | 'Insurance Facilitation Agreement'
  | 'Digital Marketing Contract'
  | 'Website Development Agreement'
  | 'Refund Policy Agreement'
  
  // 4. Sales & Partner
  | 'Referral Partner Agreement'
  | 'Channel Partner Agreement'
  | 'Franchise Agreement'
  | 'Commission Agreement'
  | 'Affiliate Agreement'
  | 'Vendor Agreement'
  | 'Distributor Agreement'
  | 'White Label Agreement'
  | 'Freelancer/Agent Agreement'
  
  // 5. Technology & Data
  | 'Privacy Policy'
  | 'Website Terms & Conditions'
  | 'Cookie Policy'
  | 'SaaS Agreement'
  | 'API Usage Agreement'
  | 'Data Processing Agreement'
  | 'AI Usage Policy'
  | 'Cybersecurity Agreement'
  | 'Digital Marketing Compliance Policy'
  
  // 6. Financial & Investment
  | 'Investment Agreement'
  | 'SAFE Agreement'
  | 'Convertible Note Agreement'
  | 'Loan Agreement'
  | 'Personal Guarantee Agreement'
  | 'Revenue Sharing Agreement'
  | 'Profit Participation Agreement'
  
  // 7. Property & Asset
  | 'Office Lease Agreement'
  | 'Equipment Lease Agreement'
  | 'Vehicle Lease/Usage Agreement'
  | 'IP Assignment Agreement'
  | 'Trademark Licensing Agreement'
  
  // 8. Legal Risk Protection
  | 'Indemnity Agreement'
  | 'Arbitration Agreement'
  | 'Settlement Agreement'
  | 'Cease & Desist Notice'
  | 'Compliance Declaration'
  | '500 Plus Agreement'
  | 'Investor Pitch Legal Disclaimer'
  
  // 9. Specialized Platforms & Services
  | 'Contest Rules Agreement'
  | 'Prize Distribution Policy'
  | 'Community Guidelines'
  | 'User Generated Content Agreement'
  | 'AI Content Ownership Agreement'
  | 'AI Ethics Policy'
  | 'Prompt Usage Terms'
  | 'Deepfake Restriction Policy'
  | 'Risk Disclosure Agreement'
  | 'KYC Consent Form'
  | 'Lead Sharing Agreement'
  | 'Loan Processing Authorization'
  | 'Application Letter'
  | 'Pitch Deck'
  | 'Financial Model';

export interface DocumentParams {
  client_name?: string;
  other_party?: string;
  business_name?: string;
  address?: string;
  location?: string;
  date?: string;
  jurisdiction?: string;
  language?: string;
  special_notes?: string;
  purpose?: string;
  info_type?: string;
  duration?: string;
  founder_names?: string;
  equity_split?: string;
  roles?: string;
  vesting?: string;
  decision_rules?: string;
  exit_terms?: string;
  shareholders?: string;
  share_distribution?: string;
  employee_name?: string;
  position?: string;
  salary?: string;
  joining_date?: string;
  candidate_name?: string;
  service?: string;
  payment?: string;
  platform?: string;
  data_types?: string;
  services?: string;
  problem?: string;
  solution?: string;
  market?: string;
  revenue?: string;
  revenue_streams?: string;
  costs?: string;
  authority?: string;
  signatory_name?: string;
  authorized_signatory?: string;
  registration_number?: string;
  cin_or_reg?: string;
  // Toggles
  include_ip_protection?: boolean;
  include_non_compete?: boolean;
  include_penalty_clause?: boolean;
  include_arbitration?: boolean;
}

export interface DocumentField {
  key: keyof DocumentParams;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'date' | 'toggle';
  description?: string;
}

export interface MultiOutput {
  whatsapp_summary: string;
  email_draft: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  types: DocumentType[];
}

export const AGREEMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'founder',
    name: '1. Founder & Ownership Agreements',
    description: 'Establish clear ownership percentages, vesting conditions, and dispute-free exit terms.',
    types: [
      'Founder Agreement',
      'Shareholder Agreement',
      'Partnership Agreement',
      'LLP Agreement',
      'Co-Founder Exit Agreement',
      'ESOP Agreement',
      'Vesting Agreement'
    ]
  },
  {
    id: 'hr',
    name: '2. Employee & HR Agreements',
    description: 'Ensure statutory compliance with labor standards and safeguard intellectual property.',
    types: [
      'Employment Agreement',
      'Offer Letter',
      'NDA',
      'Non-Compete Agreement',
      'Internship Agreement',
      'Consultant Agreement',
      'Remote Work Agreement',
      'Code of Conduct Agreement'
    ]
  },
  {
    id: 'client',
    name: '3. Client & Customer Agreements',
    description: 'Protect service revenues, define deliverables clearly, and settle payment schedules.',
    types: [
      'Client Onboarding Form',
      'Client Service Agreement',
      'Service Level Agreement (SLA)',
      'Retainer Agreement',
      'Loan Consultancy Agreement',
      'Insurance Facilitation Agreement',
      'Digital Marketing Contract',
      'Website Development Agreement',
      'Refund Policy Agreement'
    ]
  },
  {
    id: 'sales',
    name: '4. Sales & Partner Agreements',
    description: 'Enable business growth and distribution with protected channels and commissions.',
    types: [
      'Referral Partner Agreement',
      'Channel Partner Agreement',
      'Franchise Agreement',
      'Commission Agreement',
      'Affiliate Agreement',
      'Vendor Agreement',
      'Distributor Agreement',
      'White Label Agreement',
      'Freelancer/Agent Agreement'
    ]
  },
  {
    id: 'tech',
    name: '5. Technology & Data Agreements',
    description: 'Achieve zero-leak compliance in cybersecurity, SaaS architectures, and user data privacy.',
    types: [
      'Privacy Policy',
      'Website Terms & Conditions',
      'Cookie Policy',
      'SaaS Agreement',
      'API Usage Agreement',
      'Data Processing Agreement',
      'AI Usage Policy',
      'Cybersecurity Agreement',
      'Digital Marketing Compliance Policy'
    ]
  },
  {
    id: 'finance',
    name: '6. Financial & Investment Agreements',
    description: 'Structure debt and equity-based funding arrangements with precision.',
    types: [
      'Investment Agreement',
      'SAFE Agreement',
      'Convertible Note Agreement',
      'Loan Agreement',
      'Personal Guarantee Agreement',
      'Revenue Sharing Agreement',
      'Profit Participation Agreement'
    ]
  },
  {
    id: 'property',
    name: '7. Property & Asset Agreements',
    description: 'Regulate lease timelines, equipment usage metrics, and IP transfers.',
    types: [
      'Office Lease Agreement',
      'Equipment Lease Agreement',
      'Vehicle Lease/Usage Agreement',
      'IP Assignment Agreement',
      'Trademark Licensing Agreement'
    ]
  },
  {
    id: 'legal',
    name: '8. Legal Risk Protection Agreements',
    description: 'Deploy defensive mechanisms, out-of-court arbitrations, and regulatory declarations.',
    types: [
      'Indemnity Agreement',
      'Arbitration Agreement',
      'Settlement Agreement',
      'Cease & Desist Notice',
      'Compliance Declaration',
      '500 Plus Agreement',
      'Investor Pitch Legal Disclaimer'
    ]
  },
  {
    id: 'specialized',
    name: '9. Specialized Platforms & Services',
    description: 'Custom governance structures for gamified events, finance, pitch desks, and AI services.',
    types: [
      'Contest Rules Agreement',
      'Prize Distribution Policy',
      'Community Guidelines',
      'User Generated Content Agreement',
      'AI Content Ownership Agreement',
      'AI Ethics Policy',
      'Prompt Usage Terms',
      'Deepfake Restriction Policy',
      'Risk Disclosure Agreement',
      'KYC Consent Form',
      'Lead Sharing Agreement',
      'Loan Processing Authorization',
      'Application Letter',
      'Pitch Deck',
      'Financial Model'
    ]
  }
];

// Comprehensive generation helper for types to avoid enormous repetitive mappings
const defaultToggles: DocumentField[] = [
  { key: 'include_ip_protection', label: 'IP Assignment', description: 'Strong work-for-hire assignment of creations' },
  { key: 'include_non_compete', label: 'Non-Compete', description: 'Restrict competitive business engagements' },
  { key: 'include_penalty_clause', label: 'Penalty clause', description: 'Establish liquidated damages for breaches' },
  { key: 'include_arbitration', label: 'Fast-Track ADR', description: 'Resolve disputes via fast-track corporate arbitration' },
];

export const DOCUMENT_TOGGLES: Record<DocumentType, DocumentField[]> = {} as any;
export const DOCUMENT_FIELDS: Record<DocumentType, DocumentField[]> = {} as any;

const allTypes: DocumentType[] = AGREEMENT_CATEGORIES.flatMap(cat => cat.types);

// Define full mapping rules cleanly
allTypes.forEach((type) => {
  // 1. Determine Toggles
  if (['NDA', '500 Plus Agreement', 'Client Service Agreement', 'Employment Agreement', 'Freelancer/Agent Agreement'].includes(type)) {
    DOCUMENT_TOGGLES[type] = [
      { key: 'include_ip_protection', label: 'IP Protection', description: 'Strict intellectual property protection and transfer' },
      { key: 'include_non_compete', label: 'Non-Compete', description: 'Restrict party from engaging in competitive operations' },
      { key: 'include_penalty_clause', label: 'Liquidated Damages', description: 'Define pre-estimated damages for breaches' },
      { key: 'include_arbitration', label: 'Arbitration Clause', description: 'Out-of-court Indian Arbitration Act resolution' },
    ];
  } else if (['Founder Agreement', 'Partnership Agreement', 'LLP Agreement', 'Shareholder Agreement', 'Investment Agreement', 'SAFE Agreement', 'Co-Founder Exit Agreement'].includes(type)) {
    DOCUMENT_TOGGLES[type] = [
      { key: 'include_non_compete', label: 'Non-Compete', description: 'Restrict starting/joining competitive entities' },
      { key: 'include_arbitration', label: 'Fast-Track Arbitration', description: 'Resolve stakeholder disputes out of court' },
    ];
  } else if (['Privacy Policy', 'Cookie Policy', 'Website Terms & Conditions', 'Digital Marketing Compliance Policy'].includes(type)) {
    DOCUMENT_TOGGLES[type] = [
      { key: 'include_arbitration', label: 'Jurisdictional Arbitration', description: 'Mandate user disputes go to arbitration' },
    ];
  } else {
    // Default fallback toggles
    DOCUMENT_TOGGLES[type] = [
      { key: 'include_ip_protection', label: 'IP Assignment', description: 'Standard reciprocal IP and trade secret protection' },
      { key: 'include_arbitration', label: 'Arbitration', description: 'Amicable settlement followed by local arbitration' }
    ];
  }

  // 2. Determine Fields
  // Employee, HR and Staffing types
  if (['Employment Agreement', 'Offer Letter', 'Internship Agreement', 'Consultant Agreement', 'Remote Work Agreement', 'Code of Conduct Agreement'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Employer / Company Name', placeholder: 'e.g. Royal Bulls Advisory Private Limited' },
      { key: 'employee_name', label: 'Employee / Appointee Name', placeholder: 'e.g. Rajesh Kumar' },
      { key: 'position', label: 'Position / Designation', placeholder: 'e.g. Lead Financial Analyst' },
      { key: 'joining_date', label: 'Commencement / Joining Date', type: 'date' },
      { key: 'salary', label: 'Compensation / CTC/ Monthly Salary', placeholder: 'e.g. INR 1,20,000 per month' },
      { key: 'location', label: 'Place of Work / Location', placeholder: 'e.g. Bengaluru, Karnataka' },
      { key: 'jurisdiction', label: 'Governing Law Jurisdiction', placeholder: 'e.g. Courts of Bengaluru' },
    ];
  }
  // Co-ownership, founding, and corporate governance structural types
  else if (['Founder Agreement', 'Shareholder Agreement', 'Partnership Agreement', 'LLP Agreement', 'Co-Founder Exit Agreement', 'Vesting Agreement', 'ESOP Agreement'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Company / Startup / Partnership Name', placeholder: 'e.g. Royal Bulls Advisory' },
      { key: 'founder_names', label: 'Parties / Stakeholders / Founders', placeholder: 'e.g. Amit Sharma, Rahul Varma' },
      { key: 'equity_split', label: 'Equity / Ownership Split Structure', placeholder: 'e.g. Amit: 55%, Rahul: 45%' },
      { key: 'roles', label: 'Core Responsibilities / Portfolios', placeholder: 'e.g. Amit (CEO - Growth), Rahul (CTO - Infrastructure)', type: 'textarea' },
      { key: 'vesting', label: 'Share Vesting Schedule & Cliff', placeholder: 'e.g. 4-year vesting with 1-year cliff' },
      { key: 'decision_rules', label: 'Critical Decision Rules / Voting Majority', placeholder: 'e.g. 75% stakeholder approval required for capital changes', type: 'textarea' },
      { key: 'exit_terms', label: 'Compulsory Buyback / Exit Covenants', placeholder: 'e.g. Right of first refusal (ROFR) at standard valuation', type: 'textarea' },
    ];
  }
  else if (type === 'Client Onboarding Form') {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Client Legal Entity / Company Name', placeholder: 'e.g. Apex Global Solutions Pvt Ltd' },
      { key: 'client_name', label: 'Primary Contact Person (Client Representative)', placeholder: 'e.g. Sarah Jenkins' },
      { key: 'address', label: 'Registered Business Address', placeholder: 'e.g. Sector V, Salt Lake, Kolkata' },
      { key: 'registration_number', label: 'Company Registration / Tax ID / CIN', placeholder: 'e.g. U72200WB2026PTC254890' },
      { key: 'purpose', label: 'Primary Industry & Business Description', type: 'textarea', placeholder: 'e.g. Technology distribution, healthcare SaaS provider' },
      { key: 'service', label: 'Specific Services Requested / Expected Deliverables', type: 'textarea', placeholder: 'e.g. Monthly regulatory reporting, custom legal document drafting, dynamic counsel' },
      { key: 'duration', label: 'Target Launch Date / Onboarding Target Timeline', placeholder: 'e.g. Immediate / Next 15 business days' },
      { key: 'jurisdiction', label: 'Preferred Governing Law Jurisdiction', placeholder: 'e.g. Delhi, India' },
    ];
  }
  // Transactional, partner, affiliate, agent and customer-focused elements
  else if (['Client Service Agreement', 'Service Level Agreement (SLA)', 'Retainer Agreement', 'Loan Consultancy Agreement', 'Insurance Facilitation Agreement', 'Digital Marketing Contract', 'Website Development Agreement', 'Refund Policy Agreement', 'Referral Partner Agreement', 'Channel Partner Agreement', 'Franchise Agreement', 'Commission Agreement', 'Affiliate Agreement', 'Vendor Agreement', 'Distributor Agreement', 'White Label Agreement', 'Freelancer/Agent Agreement'].includes(type) || type === '500 Plus Agreement') {
    DOCUMENT_FIELDS[type] = [
      { key: 'client_name', label: 'First Party (Corporate Entity / Provider)', placeholder: 'e.g. Royal Bulls Advisory' },
      { key: 'other_party', label: 'Second Party (Client / Partner / Agent)', placeholder: 'e.g. Apex Retail Services' },
      { key: 'service', label: 'Core Scope of Work / Deliverables', placeholder: 'e.g. Digital advertising, loan onboarding, and statutory registration packages', type: 'textarea' },
      { key: 'payment', label: 'Payment Consideration / Schedule', placeholder: 'e.g. Retainer of INR 50,000 + 10% commission on loan disbursement' },
      { key: 'duration', label: 'Agreement Period / Duration', placeholder: 'e.g. 1 Year with automatic renewal' },
      { key: 'jurisdiction', label: 'Governing Law Forum', placeholder: 'e.g. New Delhi, India' },
      { key: 'special_notes', label: 'Custom Special Covenants (Disaster metrics, extra penalties)', placeholder: 'e.g. 1.5% delay penalty for payments overdue by 10 days', type: 'textarea' },
    ];
  }
  // Privacy, Data, Cybersecurity, Policy, Platforms & API Compliance Agreements
  else if (['Privacy Policy', 'Website Terms & Conditions', 'Cookie Policy', 'SaaS Agreement', 'API Usage Agreement', 'Data Processing Agreement', 'AI Usage Policy', 'Cybersecurity Agreement', 'Digital Marketing Compliance Policy'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Business / Platform Owner Name', placeholder: 'e.g. Royal Bulls Advisory Private Limited' },
      { key: 'platform', label: 'Platform / App Name / URL Link', placeholder: 'e.g. www.royalbullsadvisory.com' },
      { key: 'data_types', label: 'Specific User Data Collected & Processed', placeholder: 'e.g. Full names, KYC documents, credit scores, IP trackers', type: 'textarea' },
      { key: 'services', label: 'Platform Offerings & Subscription Rules', placeholder: 'e.g. Real-time credit matchmaking, automated PDF drafting, expert consulting', type: 'textarea' },
      { key: 'jurisdiction', label: 'Compliance Jurisdiction Forum', placeholder: 'e.g. IT Act, 2000 (India) & DPDPA, 2023' },
    ];
  }
  // Investment, Funding, Capital Operations
  else if (['Investment Agreement', 'SAFE Agreement', 'Convertible Note Agreement', 'Loan Agreement', 'Personal Guarantee Agreement', 'Revenue Sharing Agreement', 'Profit Participation Agreement'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Issuer / Borrower (Company Name)', placeholder: 'e.g. Royal Bulls Advisory' },
      { key: 'other_party', label: 'Investor / Lender / Guarantor Name', placeholder: 'e.g. Alpha Capital Holdings' },
      { key: 'purpose', label: 'Funding Capital / Principal Amount / Valuation Cap', placeholder: 'e.g. Equity funding of INR 5,00,00,000 at INR 35,00,00,000 Valuation Cap' },
      { key: 'payment', label: 'Repayment / Board Seat / Conversion Rules', placeholder: 'e.g. Automatically converts on Next Qualified Equity Round at 20% discount', type: 'textarea' },
      { key: 'duration', label: 'Maturity Duration / Lock-In Period', placeholder: 'e.g. 36 Months' },
      { key: 'jurisdiction', label: 'Governing Law Forum', placeholder: 'e.g. Mumbai, India' },
    ];
  }
  // Property, Asset, Intellectual Property Assignment
  else if (['Office Lease Agreement', 'Equipment Lease Agreement', 'Vehicle Lease/Usage Agreement', 'IP Assignment Agreement', 'Trademark Licensing Agreement'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'Lessor / Owner / Assignor Name', placeholder: 'e.g. Royal Bulls Realty Holdings' },
      { key: 'other_party', label: 'Lessee / User / Assignee Name', placeholder: 'e.g. Royal Bulls Advisory' },
      { key: 'purpose', label: 'Asset Details / IP Identification Address', placeholder: 'e.g. Office Unit 4B, Koramangala, Bengaluru OR Registered Trademark "Royal Bulls"', type: 'textarea' },
      { key: 'payment', label: 'Rental Fee / Royalty consideration', placeholder: 'e.g. INR 85,000 monthly rental + 3 months security deposit' },
      { key: 'duration', label: 'Lease Period / Agreement Duration', placeholder: 'e.g. 11 Months' },
      { key: 'jurisdiction', label: 'Jurisdiction Forum', placeholder: 'e.g. Bengaluru, India' },
    ];
  }
  // Defensive Law layers, Claim notices, Declarations
  else if (['Indemnity Agreement', 'Arbitration Agreement', 'Settlement Agreement', 'Cease & Desist Notice', 'Compliance Declaration', 'Investor Pitch Legal Disclaimer'].includes(type)) {
    DOCUMENT_FIELDS[type] = [
      { key: 'business_name', label: 'First Party (Business / Operator)', placeholder: 'e.g. Royal Bulls Advisory' },
      { key: 'other_party', label: 'Second Party (Recipient / Claimant)', placeholder: 'e.g. Competitor Corporation LLC' },
      { key: 'purpose', label: 'Dispute / Breach / Indemnity Circumstances', placeholder: 'e.g. Resolving intellectual property copyright dispute regarding visual brand assets', type: 'textarea' },
      { key: 'jurisdiction', label: 'Courts of competent jurisdiction', placeholder: 'e.g. Courts of Kolkata, India' },
    ];
  }
  // All other specialized and utility types
  else {
    DOCUMENT_FIELDS[type] = [
      { key: 'client_name', label: 'First Party Name', placeholder: 'e.g. Royal Bulls Club' },
      { key: 'other_party', label: 'Second Party Name / Authority', placeholder: 'e.g. Regulated Users / Contest Applicants' },
      { key: 'purpose', label: 'Core Purpose / Specific Scope', placeholder: 'e.g. Managing submission rules for Brain Bounty AI Hackathon Rules', type: 'textarea' },
      { key: 'special_notes', label: 'Special notes or Custom guidelines', placeholder: 'e.g. Under Indian Prize Competitions Act, 1955 rules & tax TDS', type: 'textarea' },
      { key: 'jurisdiction', label: 'Jurisdiction Forum', placeholder: 'e.g. Mumbai, India' },
    ];
  }
});

export interface Profile {
  id: string;
  userId: string;
  partyType: 'first_party_company' | 'first_party_individual' | 'second_party';
  name: string;
  authorizedSignatory?: string;
  email?: string;
  phone?: string;
  address?: string;
  jurisdiction?: string;
  regNumber?: string;
  createdAt: any;
  updatedAt: any;
  isDefaultUser?: boolean;
  isDefaultCompany?: boolean;
}

export interface GeneratedDocument {
  id: string;
  userId: string;
  type: string;
  title: string;
  params: DocumentParams;
  content: string;
  emailDraft?: string;
  whatsappSummary?: string;
  createdAt: any;
  updatedAt: any;
}
