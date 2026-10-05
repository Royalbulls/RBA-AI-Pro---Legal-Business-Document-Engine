import { 
  Scale, Shield, Users, Briefcase, FileText, Landmark, FileCheck, 
  Percent, Globe, Eye, Zap, AlertTriangle, HelpCircle, BookOpen, 
  Heart, Gavel, Award, DollarSign, Activity, FileSpreadsheet
} from 'lucide-react';

export interface LawyerType {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  primaryAct: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  address: string;
  activeCases: string[];
  payments: { date: string; amount: number; purpose: string; status: 'Paid' | 'Pending' }[];
  meetings: { date: string; time: string; purpose: string; status: 'Scheduled' | 'Completed' }[];
  agreements: string[];
  communicationHistory: { date: string; type: 'Email' | 'Call' | 'In-Person'; notes: string }[];
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  lawyerType: string;
  court: string;
  judge: string;
  oppositeParty: string;
  oppositeLawyer: string;
  hearingDates: string[];
  nextHearing: string;
  status: 'Active' | 'Adjourned' | 'Closed' | 'Pre-Litigation';
  timeline: { date: string; event: string; type: 'hearing' | 'filing' | 'order' | 'evidence' }[];
  evidenceList: { name: string; dateAdded: string; submittedBy: string; status: 'Admitted' | 'Pending' | 'Rejected' }[];
  notes: string;
  billingAmount: number;
  paidAmount: number;
}

export interface DocumentTemplate {
  id: string;
  category: 'Civil' | 'Criminal' | 'Family' | 'Corporate' | 'Property' | 'Tax' | 'Cyber' | 'IP';
  name: string;
  description: string;
  fields: { name: string; label: string; placeholder: string; type: 'text' | 'textarea' }[];
  defaultPrompt: string;
}

export interface SpecializedAgent {
  id: string;
  name: string;
  title: string;
  description: string;
  focusArea: string;
  systemPrompt: string;
}

export const LAWYER_TYPES: LawyerType[] = [
  {
    id: 'civil',
    name: 'Civil Lawyer',
    description: 'Specializes in disputes over contracts, properties, torts, and civil rights declarations.',
    iconName: 'Scale',
    badge: 'Code of Civil Procedure',
    color: '#3B82F6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
    primaryAct: 'Code of Civil Procedure, 1908'
  },
  {
    id: 'criminal',
    name: 'Criminal Lawyer',
    description: 'Handles defense & prosecution representation for bails, trials, FIR counter-actions, and criminal appeals.',
    iconName: 'Shield',
    badge: 'BNS & BNSS Codes',
    color: '#EF4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
    primaryAct: 'Bharatiya Nyaya Sanhita (BNS), 2023'
  },
  {
    id: 'family',
    name: 'Family Lawyer',
    description: 'Deals with matrimonial disputes, divorce petitions, child custody, alimony, and adoption actions.',
    iconName: 'Heart',
    badge: 'Personal Laws',
    color: '#EC4899', // Pink
    bgColor: 'rgba(236, 72, 153, 0.05)',
    borderColor: 'rgba(236, 72, 153, 0.15)',
    primaryAct: 'Hindu Marriage Act, 1955 / Special Marriage Act'
  },
  {
    id: 'corporate',
    name: 'Corporate Lawyer',
    description: 'Advises on corporate governance, M&A transactions, venture financing, and commercial compliance.',
    iconName: 'Briefcase',
    badge: 'Companies Act',
    color: '#10B981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    primaryAct: 'Companies Act, 2013'
  },
  {
    id: 'labour',
    name: 'Labour & Employment Lawyer',
    description: 'Focuses on employment contracts, workplace harassment, union disputes, and compliance with labour codes.',
    iconName: 'Users',
    badge: 'Labour Codes',
    color: '#8B5CF6', // Purple
    bgColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
    primaryAct: 'Industrial Disputes Act, 1947 & New Labour Codes'
  },
  {
    id: 'property',
    name: 'Property & Real Estate Lawyer',
    description: 'Specializes in land title checks, sale deeds, lease disputes, RERA filings, and partition litigation.',
    iconName: 'Landmark',
    badge: 'RERA & Transfer of Property',
    color: '#F59E0B', // Amber
    bgColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    primaryAct: 'Transfer of Property Act, 1882 / RERA Act 2016'
  },
  {
    id: 'banking',
    name: 'Banking & Finance Lawyer',
    description: 'Handles debt recovery tribunal (DRT) litigation, SARFAESI notices, structured financing, and IBC filings.',
    iconName: 'FileSpreadsheet',
    badge: 'SARFAESI & DRT',
    color: '#06B6D4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.05)',
    borderColor: 'rgba(6, 182, 212, 0.15)',
    primaryAct: 'SARFAESI Act, 2002 / DRT Provisions'
  },
  {
    id: 'tax',
    name: 'Tax Lawyer',
    description: 'Manages direct & indirect taxation, income tax appeals, GST dispute notices, and corporate tax structuring.',
    iconName: 'Percent',
    badge: 'GST & Income Tax',
    color: '#10B981', // Green
    bgColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    primaryAct: 'Income Tax Act, 1961 / CGST Act, 2017'
  },
  {
    id: 'ip',
    name: 'Intellectual Property Lawyer',
    description: 'Advises on patent draftings, trademark registrations, copyright infringements, and trade secret actions.',
    iconName: 'Award',
    badge: 'Trademark & Patents',
    color: '#F43F5E', // Rose
    bgColor: 'rgba(244, 63, 94, 0.05)',
    borderColor: 'rgba(244, 63, 94, 0.15)',
    primaryAct: 'Trade Marks Act, 1999 / Patents Act, 1970'
  },
  {
    id: 'cyber',
    name: 'Cyber Lawyer',
    description: 'Specializes in electronic evidence, ransomware frauds, privacy violations, DPDP compliance, and IT Act disputes.',
    iconName: 'Globe',
    badge: 'IT Act & DPDP',
    color: '#6366F1', // Indigo
    bgColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
    primaryAct: 'Information Technology Act, 2000 / DPDP Act, 2023'
  },
  {
    id: 'consumer',
    name: 'Consumer Lawyer',
    description: 'Handles product liability, service negligence petitions, and consumer forum litigations under NCDRC/SCDRC.',
    iconName: 'Users',
    badge: 'Consumer Protection',
    color: '#14B8A6', // Teal
    bgColor: 'rgba(20, 184, 166, 0.05)',
    borderColor: 'rgba(20, 184, 166, 0.15)',
    primaryAct: 'Consumer Protection Act, 2019'
  },
  {
    id: 'environmental',
    name: 'Environmental Lawyer',
    description: 'Focuses on environmental clearance permits, NGT petitions, climate regulations, and pollution control notices.',
    iconName: 'Scale',
    badge: 'NGT Provisions',
    color: '#059669', // Emerald Deep
    bgColor: 'rgba(5, 150, 105, 0.05)',
    borderColor: 'rgba(5, 150, 105, 0.15)',
    primaryAct: 'National Green Tribunal (NGT) Act, 2010'
  },
  {
    id: 'immigration',
    name: 'Immigration Lawyer',
    description: 'Handles global visa petitions, corporate cross-border mobility, citizenship applications, and passport disputes.',
    iconName: 'Globe',
    badge: 'Citizenship & Visas',
    color: '#4F46E5', // Royal Indigo
    bgColor: 'rgba(79, 70, 229, 0.05)',
    borderColor: 'rgba(79, 70, 229, 0.15)',
    primaryAct: 'Citizenship Act, 1955 / Passport Act, 1967'
  },
  {
    id: 'constitutional',
    name: 'Constitutional Lawyer',
    description: 'Represents clients in writ petitions, fundamental rights enforcement, and constitutional challenges before High Courts/Supreme Court.',
    iconName: 'Gavel',
    badge: 'Writs & Public Law',
    color: '#D97706', // Amber Dark
    bgColor: 'rgba(217, 119, 6, 0.05)',
    borderColor: 'rgba(217, 119, 6, 0.15)',
    primaryAct: 'Constitution of India (Articles 32 & 226)'
  },
  {
    id: 'arbitration',
    name: 'Arbitration & Mediation Lawyer',
    description: 'Handles fast-track corporate arbitrations, private mediations, enforcement of foreign awards, and ADR tribunals.',
    iconName: 'FileCheck',
    badge: 'ADR & MCIA',
    color: '#059669', // Emerald
    bgColor: 'rgba(5, 150, 105, 0.05)',
    borderColor: 'rgba(5, 150, 105, 0.15)',
    primaryAct: 'Arbitration and Conciliation Act, 1996'
  },
  {
    id: 'competition',
    name: 'Competition Lawyer',
    description: 'Advises on anti-trust litigation, cartel investigations, abuse of dominance, and mergers reviews before CCI.',
    iconName: 'Shield',
    badge: 'CCI Enforcement',
    color: '#9333EA', // Violet
    bgColor: 'rgba(147, 51, 234, 0.05)',
    borderColor: 'rgba(147, 51, 234, 0.15)',
    primaryAct: 'Competition Act, 2002'
  },
  {
    id: 'insolvency',
    name: 'Insolvency & Bankruptcy Lawyer',
    description: 'Specializes in corporate insolvency resolution process (CIRP), NCLT hearings, creditor representations, and liquidations.',
    iconName: 'Briefcase',
    badge: 'IBC & NCLT',
    color: '#DC2626', // Crimson Red
    bgColor: 'rgba(220, 38, 38, 0.05)',
    borderColor: 'rgba(220, 38, 38, 0.15)',
    primaryAct: 'Insolvency and Bankruptcy Code (IBC), 2016'
  },
  {
    id: 'insurance',
    name: 'Insurance Lawyer',
    description: 'Manages commercial insurance claims, maritime cover disputes, reinsurance structures, and IRDAI regulatory filings.',
    iconName: 'FileText',
    badge: 'IRDAI Regulatory',
    color: '#2563EB', // Blue Indigo
    bgColor: 'rgba(37, 99, 235, 0.05)',
    borderColor: 'rgba(37, 99, 235, 0.15)',
    primaryAct: 'Insurance Act, 1938 / IRDAI Act, 1999'
  },
  {
    id: 'medical',
    name: 'Medical Negligence Lawyer',
    description: 'Handles compensation petitions for surgical failures, hospital malpractice litigation, and NMC ethical trials.',
    iconName: 'Activity',
    badge: 'Malpractice Disputes',
    color: '#E11D48', // Crimson Rose
    bgColor: 'rgba(225, 29, 72, 0.05)',
    borderColor: 'rgba(225, 29, 72, 0.15)',
    primaryAct: 'Consumer Protection Act / Indian Penal Code Malpractice Rules'
  },
  {
    id: 'startup',
    name: 'Startup & Technology Lawyer',
    description: 'Advises digital platforms, AI ventures, Web3 networks, founder vesting, and tech licensing covenants.',
    iconName: 'Zap',
    badge: 'Tech & FDI Regulations',
    color: '#0D9488', // Teal Dark
    bgColor: 'rgba(13, 148, 136, 0.05)',
    borderColor: 'rgba(13, 148, 136, 0.15)',
    primaryAct: 'Information Technology Act / Startup India Guidelines'
  }
];

export const SPECIALIZED_AGENTS: SpecializedAgent[] = [
  {
    id: 'civil_agent',
    name: 'Civil Agent',
    title: 'Civil & Declaratory Litigation AI',
    description: 'Expert on CPC, Specific Relief Act, Limitation Act, and civil pleadings.',
    focusArea: 'Civil suits, injunctions, declarations, summary suits under Order 37.',
    systemPrompt: 'You are an elite Civil litigation agent. You excel at drafting plaints, written statements, application for injunctions under Order 39, and civil review petitions. Align your thinking with the CPC 1908.'
  },
  {
    id: 'criminal_agent',
    name: 'Criminal Agent',
    title: 'Criminal Justice & Defense AI',
    description: 'Master of Bharatiya Nyaya Sanhita (BNS) and BNSS procedural guidelines.',
    focusArea: 'Bail applications, anticipatory bail drafts, FIR quashing petitions, and criminal defense strategies.',
    systemPrompt: 'You are a veteran Criminal defense and prosecution agent. You possess deep knowledge of the Bharatiya Nyaya Sanhita (BNS) 2023, Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA). Focus on bails, quash petitions, and cross-examination strategies.'
  },
  {
    id: 'corporate_agent',
    name: 'Corporate Agent',
    title: 'Corporate Counsel & Transaction AI',
    description: 'Advises on Companies Act, equity investments, shareholder structures, and governance.',
    focusArea: 'SHA drafting, investor clauses, board resolutions, and director liability concerns.',
    systemPrompt: 'You are a high-level Corporate Counsel AI. Your expertise covers the Companies Act 2013, FDI policies, corporate mergers, and cross-border commercial transactions. Highlight venture deal structures and governance codes.'
  },
  {
    id: 'property_agent',
    name: 'Property Agent',
    title: 'Real Estate & Conveyancing AI',
    description: 'Deals with Transfer of Property Act, RERA regulations, and registration laws.',
    focusArea: 'Due diligence check-sheets, sale deed drafting, partition suit pleadings, and RERA claims.',
    systemPrompt: 'You are a brilliant Property and Conveyancing AI. You are a specialist in the Transfer of Property Act 1882, Real Estate (Regulation and Development) Act 2016, and the Registration Act 1908. Focus on land title search, conveyancing drafts, and builder-buyer disputes.'
  },
  {
    id: 'tax_agent',
    name: 'Tax Agent',
    title: 'Taxation & Fiscal Appeals AI',
    description: 'Advises on Income Tax Act, CGST/SGST Acts, and double tax treaties.',
    focusArea: 'GST show cause notice replies, income tax tribunal appeals, and international tax transfer pricing.',
    systemPrompt: 'You are a Senior Tax Consultant AI. Your expertise is in direct taxation (Income Tax Act 1961) and indirect taxation (CGST/SGST Acts 2017). Assist in structuring tax-efficient transaction models and drafting tax appeal replies.'
  },
  {
    id: 'cyber_agent',
    name: 'Cyber Agent',
    title: 'Cyber Security & Digital Evidence AI',
    description: 'Expert on IT Act, electronic record admissibility, and DPDP rules.',
    focusArea: 'Cyber complaints (Section 66/67), privacy policies, DPDP data protection officer frameworks.',
    systemPrompt: 'You are an elite Cyber Law and Digital Rights AI. You are highly skilled in Section 65B Certificate generation under the Evidence Act/BSA, drafting cyber-crime complaint applications, and DPDP Act 2023 compliance Auditing.'
  },
  {
    id: 'ip_agent',
    name: 'IP Agent',
    title: 'Intellectual Property Asset Protection AI',
    description: 'Manages trademarks, patent registrations, copyright licenses, and infringement audits.',
    focusArea: 'Trademark oppositions, IP assignment covenants, cease-and-desist warnings.',
    systemPrompt: 'You are an elite Intellectual Property Attorney AI. You understand patentability audits under the Patents Act, trademark protection strategies, copyright licenses, and trade secret litigation drafts.'
  },
  {
    id: 'family_agent',
    name: 'Family Agent',
    title: 'Family Law & Matrimonial Dispute AI',
    description: 'Master of matrimonial pleadings, custody law, and personal succession codes.',
    focusArea: 'Divorce petitions, mutual consent terms, maintenance, guardianship.',
    systemPrompt: 'You are a compassionate and legally precise Family Lawyer AI. You advise on Hindu Marriage Act, Special Marriage Act, Guardians and Wards Act, and Domestic Violence Act. Focus on drafting petitions, custody frameworks, and settlement terms.'
  },
  {
    id: 'research_agent',
    name: 'Research Agent',
    title: 'Global Legal Research & Citation AI',
    description: 'Retrieves core judicial doctrines, case law briefs, and legislative definitions.',
    focusArea: 'Finding Supreme Court precedents, ratio decidendi briefs, and Bare Act section extractions.',
    systemPrompt: 'You are a Supreme Court Researcher AI. You synthesize core ratios, find leading judgments (SCR, SCC, AIR), state established legal doctrines (like Res Judicata, Promissory Estoppel), and compile section guides.'
  },
  {
    id: 'compliance_agent',
    name: 'Compliance Agent',
    title: 'Enterprise Regulatory Auditing AI',
    description: 'Checks industrial filings, FEMA compliance, ESG regulations, and factory laws.',
    focusArea: 'FDI thresholds, environmental approvals, POSH policy reviews, corporate compliance calendars.',
    systemPrompt: 'You are a Corporate Compliance Auditor AI. You analyze corporate operations against FEMA, POSH Act, Air & Water Environmental Acts, and SEBI regulations. Detail mandatory statutory logs and disclosures.'
  }
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // Civil
  {
    id: 'civil_suit',
    category: 'Civil',
    name: 'Civil Suit for Recovery of Money',
    description: 'Standard plaint draft under Order VII Rule 1 of CPC for recovery of commercial dues.',
    fields: [
      { name: 'plaintiff', label: 'Plaintiff Name & Details', placeholder: 'e.g. M/s Royal Bulls Advisory Pvt Ltd represented by Director', type: 'text' },
      { name: 'defendant', label: 'Defendant Name & Details', placeholder: 'e.g. Acme Tech Solutions represented by MD', type: 'text' },
      { name: 'amount', label: 'Debt Amount (₹)', placeholder: 'e.g. Rs. 4,50,000/- with interest', type: 'text' },
      { name: 'cause', label: 'Cause of Action Specifics', placeholder: 'e.g. Unpaid invoice dated 12th Jan for software services', type: 'textarea' }
    ],
    defaultPrompt: 'Draft a Civil Suit (Plaint) for recovery of money under Code of Civil Procedure 1908. Plaintiff: {plaintiff}. Defendant: {defendant}. Recovery Amount: {amount}. Cause of action Details: {cause}. Ensure detailed paragraphs detailing contract, delivery of service, failure to pay, statutory notice, jurisdiction, and prayer.'
  },
  {
    id: 'civil_injunction',
    category: 'Civil',
    name: 'Suit for Permanent & Temporary Injunction',
    description: 'Pleading to restrain a party from committing trespass, construction, or contract breaches.',
    fields: [
      { name: 'plaintiff', label: 'Plaintiff Name', placeholder: 'e.g. Amit Sharma, Son of Dev Sharma', type: 'text' },
      { name: 'defendant', label: 'Defendant Name', placeholder: 'e.g. Municipal Corporation / Local Builders', type: 'text' },
      { name: 'property', label: 'Description of Schedule Property', placeholder: 'e.g. Plot No 42, Sector 5, Dwarka, New Delhi', type: 'textarea' },
      { name: 'threat', label: 'Specific Threat/Encroachment Action', placeholder: 'e.g. Defendant attempting to break boundary wall without notice', type: 'textarea' }
    ],
    defaultPrompt: 'Draft a Suit Plaint for Permanent Injunction and an Application for Temporary Injunction under Order 39 Rules 1 & 2 of CPC. Plaintiff: {plaintiff}, Defendant: {defendant}, Property details: {property}, Imminent Threat details: {threat}. Draft with all necessary ingredients like prima facie case, balance of convenience, and irreparable injury.'
  },
  // Criminal
  {
    id: 'crim_bail',
    category: 'Criminal',
    name: 'Regular Bail Application (Section 482 of BNSS / 439 CrPC)',
    description: 'Urgent petition before Sessions Court or High Court for release from judicial custody.',
    fields: [
      { name: 'accused', label: 'Accused Name & Custody Date', placeholder: 'e.g. Vikram Hegde, currently in Tihar Jail since 15th June', type: 'text' },
      { name: 'fir_details', label: 'FIR No., Police Station & Sections', placeholder: 'e.g. FIR No. 124/2026, PS Connaught Place, under Sec 318 of BNS', type: 'text' },
      { name: 'grounds', label: 'Key Bail Grounds', placeholder: 'e.g. Accused falsely implicated, ready to cooperate with probe, no flight risk', type: 'textarea' }
    ],
    defaultPrompt: 'Draft a Regular Bail Application under Section 482 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023. Accused: {accused}. FIR Details: {fir_details}. Specific grounds for bail: {grounds}. Structure it with facts, grounds, and final prayer for release on personal bond.'
  },
  {
    id: 'crim_fir_draft',
    category: 'Criminal',
    name: 'FIR Complainant Draft / Police Complaint',
    description: 'Detailed written complaint to Station House Officer (SHO) for cognizable offenses.',
    fields: [
      { name: 'complainant', label: 'Complainant Details', placeholder: 'e.g. Rajesh Kumar, age 34, resident of Mumbai', type: 'text' },
      { name: 'accused_suspects', label: 'Accused Suspects Details', placeholder: 'e.g. Sanjay Sen and other unknown associates', type: 'text' },
      { name: 'incident', label: 'Description of Offense & Date', placeholder: 'e.g. Unauthorized server breach and theft of proprietary code on 28th June', type: 'textarea' }
    ],
    defaultPrompt: 'Draft a criminal complaint to the Station House Officer (SHO) under Section 173 of BNSS, 2023 for registration of an FIR. Complainant: {complainant}. Accused: {accused_suspects}. Incident & Offense facts: {incident}. Use legal terms, point out BNS violations (e.g., criminal breach of trust, cyber theft), and demand urgent investigation.'
  },
  // Family
  {
    id: 'fam_divorce',
    category: 'Family',
    name: 'Petition for Divorce by Mutual Consent',
    description: 'Joint petition under Section 13B of Hindu Marriage Act for amicable separation.',
    fields: [
      { name: 'husband', label: 'Husband Details', placeholder: 'e.g. Rohan Roy, age 32, resident of Bangalore', type: 'text' },
      { name: 'wife', label: 'Wife Details', placeholder: 'e.g. Neha Sen Roy, age 30, resident of Bangalore', type: 'text' },
      { name: 'marriage_date', label: 'Date of Marriage & Separation Date', placeholder: 'e.g. Married on 12-12-2022, living separately since 01-01-2025', type: 'text' },
      { name: 'terms', label: 'Settlement Terms (Alimony/Custody)', placeholder: 'e.g. Full settlement of ₹15,000,000 paid, no child custody disputes', type: 'textarea' }
    ],
    defaultPrompt: 'Draft a Joint Petition for Divorce by Mutual Consent under Section 13-B of the Hindu Marriage Act, 1955. Husband: {husband}. Wife: {wife}. Marriage & separation dates: {marriage_date}. Settlement and Alimony terms: {terms}. Draft formal legal petitions with verified affidavit blocks.'
  },
  // Corporate
  {
    id: 'corp_nda',
    category: 'Corporate',
    name: 'Mutual Non-Disclosure Agreement',
    description: 'High-stakes bilateral corporate NDA with strict confidentiality and IP protection clauses.',
    fields: [
      { name: 'party1', label: 'Disclosing/First Party', placeholder: 'e.g. M/s Royal Bulls Advisory Pvt Ltd', type: 'text' },
      { name: 'party2', label: 'Receiving/Second Party', placeholder: 'e.g. Zenith Analytics Inc', type: 'text' },
      { name: 'purpose', label: 'Core Discussion/Collaboration Purpose', placeholder: 'e.g. Strategic partnership discussions for AI model deployment', type: 'text' },
      { name: 'duration', label: 'Confidentiality Term', placeholder: 'e.g. 5 Years from execution date', type: 'text' }
    ],
    defaultPrompt: 'Draft a comprehensive Mutual Non-Disclosure Agreement. First Party: {party1}. Second Party: {party2}. Purpose: {purpose}. Term: {duration}. Include absolute confidentiality definitions, remedy multipliers, governing law (Indian), and dispute resolution clauses.'
  },
  // Property
  {
    id: 'prop_sale_deed',
    category: 'Property',
    name: 'Absolute Sale Deed of Residential Property',
    description: 'Conveyance deed to transfer ownership title of apartments, houses, or land parcels.',
    fields: [
      { name: 'vendor', label: 'Vendor (Seller) Details', placeholder: 'e.g. Mr. Devendra Pal, resident of Noida', type: 'text' },
      { name: 'vendee', label: 'Vendee (Buyer) Details', placeholder: 'e.g. Mrs. Sunita Rao, resident of Delhi', type: 'text' },
      { name: 'prop_desc', label: 'Complete Schedule of Property', placeholder: 'e.g. Flat No. 302, Block B, Silver Oak Apartments, Sector 120, Noida', type: 'textarea' },
      { name: 'consideration', label: 'Sale Consideration Amount (₹)', placeholder: 'e.g. ₹85,00,000/- paid via Bank Draft', type: 'text' }
    ],
    defaultPrompt: 'Draft an Absolute Sale Deed of residential property. Vendor: {vendor}. Vendee: {vendee}. Property description: {prop_desc}. Sale Consideration: {consideration}. Include clauses for clear marketable title, indemnity against encumbrances, delivery of possession, and execution signatures.'
  },
  // Cyber
  {
    id: 'cyber_complaint',
    category: 'Cyber',
    name: 'Cyber Crime Cell Complaint',
    description: 'Notice to Cyber Superintendent for phishing frauds, data breaches, or impersonation.',
    fields: [
      { name: 'victim', label: 'Victim / Entity Details', placeholder: 'e.g. Indus Legal Associates represented by IT Head', type: 'text' },
      { name: 'fraud_details', label: 'Mode of Fraud & Bank/Platform Dues', placeholder: 'e.g. Unauthorized transfer of ₹2,50,000 via SIM swap cloned numbers', type: 'textarea' },
      { name: 'suspect_info', label: 'Digital Trails (IPs/Accounts/Links)', placeholder: 'e.g. Target IP: 192.168.4.15, Phone No. +91 98765 43210', type: 'textarea' }
    ],
    defaultPrompt: 'Draft an Official Cyber Crime Complaint to the Cyber Crime Cell / Police Station under the IT Act 2000 and BNS. Victim: {victim}. Fraud specifics: {fraud_details}. Suspect digital footprints: {suspect_info}. Emphasize urgent blockages of accounts, collection of server logs, and preservation of electronic evidence.'
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'cli_1',
    name: 'Anil Ambani (Representative for Reliance Tech)',
    email: 'anil@reliancetech.in',
    phone: '+91 98112 34567',
    aadhaar: 'XXXX-XXXX-8912',
    pan: 'ABCDE1234F',
    address: 'Maker Chambers IV, Nariman Point, Mumbai, MH - 400021',
    activeCases: ['case_1'],
    payments: [
      { date: '2026-06-15', amount: 150000, purpose: 'Retainer for Arbitration Advisory', status: 'Paid' },
      { date: '2026-06-28', amount: 75000, purpose: 'Drafting SHA Covenants', status: 'Paid' },
      { date: '2026-06-30', amount: 120000, purpose: 'Hearing Representation Fee (NCLT)', status: 'Pending' }
    ],
    meetings: [
      { date: '2026-06-12', time: '11:00 AM', purpose: 'Initial intake and document signing', status: 'Completed' },
      { date: '2026-07-05', time: '02:30 PM', purpose: 'Review reply draft for NCLT opposition', status: 'Scheduled' }
    ],
    agreements: ['doc_nda_reliance', 'doc_sha_reliance'],
    communicationHistory: [
      { date: '2026-06-12', type: 'In-Person', notes: 'Client explained NCLT disputes regarding insolvency proceedings initiated by vendor.' },
      { date: '2026-06-20', type: 'Email', notes: 'Sent NDA draft to corporate office for signatures.' }
    ]
  },
  {
    id: 'cli_2',
    name: 'Sneha Reddy',
    email: 'sneha@reddylabs.co',
    phone: '+91 99001 22334',
    aadhaar: 'XXXX-XXXX-4567',
    pan: 'FGHJK5678L',
    address: 'Gachibowli High-Tech Phase II, Hyderabad, TS - 500032',
    activeCases: ['case_2'],
    payments: [
      { date: '2026-05-10', amount: 50000, purpose: 'Trademark Registration & Search', status: 'Paid' },
      { date: '2026-06-25', amount: 90000, purpose: 'Patent Audit Advisory', status: 'Paid' }
    ],
    meetings: [
      { date: '2026-06-25', time: '04:00 PM', purpose: 'IP Audit presentation', status: 'Completed' }
    ],
    agreements: ['doc_tm_app_reddylabs'],
    communicationHistory: [
      { date: '2026-06-25', type: 'In-Person', notes: 'Presented IP Audit report. Approved trademark filing in Class 42.' }
    ]
  }
];

export const INITIAL_CASES: LegalCase[] = [
  {
    id: 'case_1',
    caseNumber: 'CP/204(ND)/2026',
    title: 'Reliance Tech Solutions Pvt Ltd v. Delta Vendors Inc',
    lawyerType: 'corporate',
    court: 'National Company Law Tribunal (NCLT), New Delhi',
    judge: 'Justice Ramalingam Sudhakar',
    oppositeParty: 'Delta Vendors Inc',
    oppositeLawyer: 'Adv. Harish Salve & Associates',
    hearingDates: ['2026-05-20', '2026-06-15', '2026-07-10'],
    nextHearing: '2026-07-10',
    status: 'Active',
    timeline: [
      { date: '2026-05-02', event: 'Petition filed under Section 9 of IBC', type: 'filing' },
      { date: '2026-05-20', event: 'First Hearing. Court issued notice to respondent', type: 'hearing' },
      { date: '2026-06-15', event: 'Reply filed by respondent. Directed to file rejoinder', type: 'order' }
    ],
    evidenceList: [
      { name: 'Service Level Agreement (Signed)', dateAdded: '2026-05-02', submittedBy: 'Plaintiff', status: 'Admitted' },
      { name: 'Unpaid Invoices & Bank Statements', dateAdded: '2026-05-02', submittedBy: 'Plaintiff', status: 'Admitted' },
      { name: 'E-mail correspondence admitting liability', dateAdded: '2026-06-15', submittedBy: 'Plaintiff', status: 'Pending' }
    ],
    notes: 'Important case representing high-stakes client. Need to file Rejoinder detailing that the dispute raised by respondent is spurious and an afterthought.',
    billingAmount: 300000,
    paidAmount: 225000
  },
  {
    id: 'case_2',
    caseNumber: 'OS/5024/2026',
    title: 'Reddy Labs Co v. Hyderabad Municipal Corporation',
    lawyerType: 'property',
    court: 'City Civil Court, Hyderabad',
    judge: 'Sri G. Radha Krishna',
    oppositeParty: 'Municipal Commissioner, GHMC',
    oppositeLawyer: 'Adv. M. Surender Rao (GP for GHMC)',
    hearingDates: ['2026-06-05', '2026-07-18'],
    nextHearing: '2026-07-18',
    status: 'Adjourned',
    timeline: [
      { date: '2026-05-28', event: 'Suit for injunction and interim relief filed', type: 'filing' },
      { date: '2026-06-05', event: 'Emergency Hearing on Ad-interim status. Notice issued.', type: 'hearing' }
    ],
    evidenceList: [
      { name: 'Land Title Deed & Approved Building Plan', dateAdded: '2026-05-28', submittedBy: 'Plaintiff', status: 'Admitted' },
      { name: 'Notice photos of municipal encroachment threat', dateAdded: '2026-05-28', submittedBy: 'Plaintiff', status: 'Admitted' }
    ],
    notes: 'Municipal officers threatened to demolish external utility block. Injunction is critical. Advocate must present arguments on balance of convenience.',
    billingAmount: 140000,
    paidAmount: 140000
  }
];

export const WORKSPACE_MODES = [
  { id: 'solo', name: 'Solo Advocate Chamber', description: 'Tailored for independent lawyers, maximizing ease of billing and fast legal drafting.' },
  { id: 'firm', name: 'Premium Law Firm Suite', description: 'Coordinated workspaces, team departments, client managers, and role-based access audits.' },
  { id: 'corp', name: 'Corporate Legal Department', description: 'For corporate in-house counsels, managing NDAs, risk reviews, and compliance checklists.' },
  { id: 'gov', name: 'Government Legal Dept', description: 'Specialized cause lists, statutory notifications, and administrative pleadings vault.' },
  { id: 'consult', name: 'Boutique Legal Consultancy', description: 'Focused on opinion generation, citation briefs, contract risk reviews, and billing.' }
];

export const SECURITY_ROLES = [
  { name: 'Managing Partner / Super Admin', capabilities: 'Full financial access, client assignment, HSM key rotation, audit log decryption, digital signatures.' },
  { name: 'Senior Associate Advocate', capabilities: 'Drafting pleadings, representation schedules, evidence management, direct client CRM logging.' },
  { name: 'Junior Associate / Legal Clerk', capabilities: 'Draft preparation, document retrieval, research assistant queries, cause list compilation.' },
  { name: 'In-House Compliance Auditor', capabilities: 'Compliance checker runs, Bare Act references extraction, corporate filings checking.' },
  { name: 'Client Advocate / Guest View', capabilities: 'Securely review assigned contracts, view e-signature requests, chat with advocate.' }
];
