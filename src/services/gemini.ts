import { GoogleGenAI, Type } from "@google/genai";
import { DocumentType, DocumentParams, MultiOutput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MASTER_SYSTEM_PROMPT = `
You are a senior legal, financial, and business documentation expert for India.
Your job is to generate professional, legally structured, and business-ready documents.

AUTO-FILL SYSTEM:
- If the user provides minimal input (e.g., just Name, Address, Purpose, Duration), you MUST intelligently fill in the rest.
- Automatically generate appropriate legal wording, standard clauses, jurisdiction (default to India/State if not specified), and professional formatting.
- Ensure the document is complete and ready-to-use even with minimal user input.

Rules:
- Always use clear headings, clauses, numbering
- Use formal professional tone
- Ensure Indian legal context unless specified otherwise
- Fill missing gaps intelligently but mark assumptions if needed
- Keep documents concise but complete
- Output must be ready-to-use and printable

Output Format:
- Title
- Parties
- Definitions (if needed)
- Clauses (numbered)
- Signature section
- Date & Place

If user input is incomplete:
- Make reasonable assumptions
- Do not stop generation
`;

const SPECIFIC_PROMPTS: Record<DocumentType, (params: DocumentParams) => string> = {
  'NDA': (p) => `
Generate a Non-Disclosure Agreement (NDA) between:
Disclosing Party: ${p.client_name || '[Client Name]'}
Receiving Party: ${p.other_party || '[Other Party]'}
Purpose: ${p.purpose || '[Purpose]'}
Confidential Information: ${p.info_type || '[Info Type]'}
Duration: ${p.duration || '[Duration]'}
Jurisdiction: ${p.jurisdiction || '[Jurisdiction]'}

Toggles:
- IP Protection: ${p.include_ip_protection ? 'YES' : 'NO'}
- Non-Compete: ${p.include_non_compete ? 'YES' : 'NO'}
- Penalty Clause: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Arbitration Clause: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Definition of confidential information
- Obligations of receiving party
- Exclusions
- Term & termination
- Legal remedies
- ${p.include_ip_protection ? 'Strong Intellectual Property protection clauses' : ''}
- ${p.include_non_compete ? 'Non-compete and non-solicitation clauses' : ''}
- ${p.include_penalty_clause ? 'Specific penalty and liquidated damages clauses' : ''}
- ${p.include_arbitration ? 'Arbitration and dispute resolution clauses' : ''}
Make it professional and enforceable in India.
`,
  '500 Plus Agreement': (p) => `
Generate an exhaustive, highly detailed 500 Plus Omnibus Master Business Agreement / Covenant suite between:
First Party (Corporate/Client): ${p.client_name || '[First Party Entity]'}
Second Party (Contractor/Independent): ${p.other_party || '[Second Party Entity]'}
Core Alliance Purpose: ${p.purpose || '[Alliance/Transaction Purpose]'}
Special Covenants & Parameters: ${p.special_notes || '[Custom Special Notes]'}
Duration: ${p.duration || '[Duration]'}
Jurisdiction: ${p.jurisdiction || '[Governing Jurisdiction Forum]'}

Toggles:
- Full IP Protection Checklist: ${p.include_ip_protection ? 'YES' : 'NO'}
- Strict Non-Compete / Non-Solicit Restrictions: ${p.include_non_compete ? 'YES' : 'NO'}
- Liquidation Damages Penalty Multiplier: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Comprehensive Arbitration Covenant: ${p.include_arbitration ? 'YES' : 'NO'}

This is a premium, high-stakes relationship. Generate a comprehensive legal structure comprising:
1. EXHAUSTIVE PREAMBLE & RECITALS
2. SECTION 1-5: CORE INTENT & OPERATIONAL MILESTONES (tailored to Purpose: ${p.purpose || '[Alliance/Transaction Purpose]'})
3. SECTION 6-10: INTELLECTUAL PROPERTY REPOSITORIES, IP TRANSFERS, AND COVENANTS
   - ${p.include_ip_protection ? 'Explicit irrevocable work-for-hire assignment, absolute trade secret definitions, and downstream sub-licensing restrictions.' : 'Standard reciprocal background IP license.'}
4. SECTION 11-15: MUTUAL COMPLIANCE MANDATES & STATUTORY REMEDIES
   - ${p.include_non_compete ? 'Stringent non-compete within industry boundaries, and non-solicitation of key developers, leadership, and existing clients.' : ''}
   - ${p.include_penalty_clause ? 'Liquidated penalty damages clause establishing automated 1.5x penalty multipliers on direct and indirect breach costs.' : ''}
5. SECTION 16-20: TERM, MUTUAL TERMINATION EVENTS, AND RECONCILIATIONS
6. SECTION 21-25: INDEMNIFICATION, DISCLOSURE STANDARDS, AND ESCALATION MATRICES (500+ parameter scope)
7. SECTION 26-30: FAST-TRACK DISPUTE RESOLUTION & ARBITRATION
   - ${p.include_arbitration ? 'Comprehensive ADR: Arbitration under MCIA/SIAC rules with 3-member panels, hosted in ' + (p.jurisdiction || 'selected forum') + ', fast-track 90-day resolution.' : 'Amicable settlement followed by escalation to courts.'}
8. EXECUTION SECTION & SIGNATURE ATTESTATION BLOCKS
`,
  'Founder Agreement': (p) => `
Generate a Founder Agreement for a startup with:
Founders: ${p.founder_names || '[Founders]'}
Equity Split: ${p.equity_split || '[Equity Split]'}
Roles: ${p.roles || '[Roles]'}
Vesting Period: ${p.vesting || '[Vesting]'}
Decision Making: ${p.decision_rules || '[Decision Rules]'}
Exit Clause: ${p.exit_terms || '[Exit Terms]'}

Toggles:
- IP Protection: ${p.include_ip_protection ? 'YES' : 'NO'}
- Non-Compete: ${p.include_non_compete ? 'YES' : 'NO'}
- Arbitration Clause: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Ownership structure
- Roles & responsibilities
- Vesting & dilution
- Dispute resolution
- Exit conditions
- ${p.include_ip_protection ? 'IP assignment to the company' : ''}
- ${p.include_non_compete ? 'Non-compete for founders' : ''}
Make it startup-friendly and legally structured.
`,
  'Shareholder Agreement': (p) => `
Generate a Shareholder Agreement with:
Company Name: ${p.business_name || '[Business Name]'}
Shareholders: ${p.shareholders || '[Shareholders]'}
Shareholding: ${p.share_distribution || '[Share Distribution]'}

Toggles:
- Arbitration Clause: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Voting rights
- Dividend policy
- Transfer restrictions
- Exit rights
- Minority protection
Ensure corporate compliance style.
`,
  'Employment Agreement': (p) => `
You are a senior Indian corporate lawyer and employment law specialist. Generate a highly formal, legally structured, and enforceable Employment Agreement compliant with Indian labor standards (including the applicable state Shops and Establishments Act, the Indian Contract Act, 1872, and standard Indian employment conditions).

Key Details:
- Employer/Company: ${p.business_name || '[Employer / Company Name]'}
- Employee Name: ${p.employee_name || '[Employee Name]'}
- Position/Designation: ${p.position || '[Position / Designation]'}
- Remuneration/Salary: ${p.salary || '[Compensation / Salary Base]'}
- Commencement/Joining Date: ${p.joining_date || '[Commencement Date]'}
- Place of Work/Location: ${p.location || '[Work Location]'}
- Governing Law Forum: ${p.jurisdiction || 'India'}

Toggles:
- IP Assignment / Work-for-Hire: ${p.include_ip_protection ? 'YES' : 'NO'}
- Non-Compete and Non-Solicit Restrictions: ${p.include_non_compete ? 'YES' : 'NO'}
- Liquidated Damages Penalty Clause: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Arbitration / Alternative Dispute Resolution: ${p.include_arbitration ? 'YES' : 'NO'}

Drafting Style:
1. Use formal, traditional legal formatting with structured recital sections ("WHEREAS...").
2. Organize into clearly numbered and titled clauses (e.g., Clause 1, Clause 2).
3. Utilize precise Indian legal and corporate terminology (e.g., "Contract of Service", "Proprietary Information", "Intellectual Property Rights", "Restrictive Covenants", "Relieving Letter", "Garden Leave", "Termination with or without Cause").

Required Sections:
- COVENANT OF APPOINTMENT AND DESIGNATION
- SCOPE OF SERVICES, RECONCILIATIONS AND PERFORMANCE STANDARDS
- COMPENSATION AND REMUNERATION STRUCTURE (Detailed Monthly CTC components, tax deductions TDS pursuant to Income Tax Act, 1961)
- STANDARD LEAVE POLICY AND PROBATION PERIOD
- STRICT CONFIDENTIALITY & PROPRIETARY INFORMATION DISCLOSURE COVENANTS
- ${p.include_ip_protection ? 'CLAUSE FOR ORIGINAL CREATIONS AND INTELLECTUAL PROPERTY RIGHTS (Irrevocable, worldwide, royalty-free assignment to the Employer as "Work-for-Hire" under the Indian Copyright Act, 1957)' : 'Basic Work-for-hire assignment.'}
- ${p.include_non_compete ? 'RESTRICTIVE COVENANTS: POST-EMPLOYMENT NON-COMPETE AND NON-SOLICITATION (Active for 1 year post-separation, covering direct competitors and non-solicitation of active clients, consultants, and personnel)' : ''}
- TERMINATION PROTOCOLS AND NOTICE PERIOD (30-day/60-day notice, termination for cause with immediate dismissal, Garden Leave options)
- ${p.include_penalty_clause ? 'DAMAGES AND INDEMNITY (Liquidated damages for material breach or unauthorized leak of proprietary data, setting a clear and reasonable estimate of loss)' : ''}
- GOVERNING LAW AND RESOLUTION OF DISPUTES
  - ${p.include_arbitration ? 'Comprehensive Arbitration under the Indian Arbitration and Conciliation Act, 1996, with a sole arbitrator, hosted in ' + (p.jurisdiction || 'the selected forum') + ', conducted in English.' : 'Submission to Courts of competent jurisdiction.'}
`,
  'Offer Letter': (p) => `
Generate an Offer Letter for:
Candidate Name: ${p.candidate_name || '[Candidate Name]'}
Position: ${p.position || '[Position]'}
Salary: ${p.salary || '[Salary]'}
Joining Date: ${p.joining_date || '[Joining Date]'}

Tone: welcoming but professional
Include:
- Role
- Salary breakup
- Terms & conditions
- Acceptance section
`,
  'Client Onboarding Form': (p) => `
Generate an exhaustive Client Onboarding & Business Intake Confirmation Sheet:
Company/Client Name: ${p.business_name || '[Client Company Name]'}
Client Representative/Signatory: ${p.client_name || '[Representative Name]'}
Address: ${p.address || '[Registered Address]'}
Tax Id/CIN/Registration Number: ${p.registration_number || '[Tax ID/CIN]'}
Industry & Business Objectives: ${p.purpose || '[Business Purpose]'}
Requested Services & Deliverables: ${p.service || '[Services Description]'}
Target Launch Date / Engagement Period: ${p.duration || '[Target Timeline]'}
Governing Law & Forum: ${p.jurisdiction || 'Delhi, India'}

Format:
- Title Checklist: CLIENT ONBOARDING & BUSINESS INTAKE PROTOCOL
- Sections:
  1. Corporate Setup & Directorship Details
  2. Operating Scope & Onboarding Metrics
  3. Governing Law, Data Compliance Regulations (DPDPA 2023), and Confidentiality Covenants
  4. Checklist of Pending Deliverables
  5. Executive Authorization Sign-off signatures
`,
  'Client Service Agreement': (p) => `
Generate a Client Service Agreement (CSA) between:
Service Provider / Agency: ${p.client_name || '[Client Name]'}
Client: ${p.other_party || '[Other Party]'}
Service Description: ${p.service || '[Service]'}
Payment Terms: ${p.payment || '[Payment]'}
Duration: ${p.duration || '[Duration]'}

Toggles:
- IP Protection: ${p.include_ip_protection ? 'YES' : 'NO'}
- Penalty Clause: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Arbitration Clause: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Scope of work & Service Level Agreement (SLA)
- Payment terms, retaining structure & invoicing schedule
- Liability limitation & mutual indemnification
- Termination clause (with and without cause)
- Dispute resolution
- ${p.include_ip_protection ? 'Intellectual Property assignment and license to use deliverables' : ''}
- ${p.include_penalty_clause ? 'Service credit or delay penalty clauses' : ''}
`,
  'Freelancer/Agent Agreement': (p) => `
Generate a Freelancer/Agent independent contractor agreement between:
Company/Client: ${p.client_name || '[Client / Company Name]'}
Freelancer / Independent Contractor / Agent: ${p.other_party || '[Freelancer / Agent Name]'}
Scope of freelancing services: ${p.service || '[Scope of Work]'}
Compensation/Fees: ${p.payment || '[Compensation / Flat Fee]'}
Duration: ${p.duration || '[Duration]'}

Toggles:
- IP assignment: ${p.include_ip_protection ? 'YES' : 'NO'}
- Non-compete/Non-solicit: ${p.include_non_compete ? 'YES' : 'NO'}
- Penalty clause: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Arbitration: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Clear statement of independent contractor relationship status (not employment)
- Ownership of work outputs, design assets, and code
- Confidentiality and data protection
- ${p.include_ip_protection ? 'All work outputs assigned as work-for-hire to company' : ''}
- ${p.include_non_compete ? 'Non-solicitation of company clients and employees' : ''}
- Dispute resolution via arbitration in preferred jurisdiction
`,
  'Referral Partner Agreement': (p) => `
Generate a Referral Partner Agreement (Affiliate/Partner Program) between:
Company: ${p.client_name || '[Company Name]'}
Referral Partner: ${p.other_party || '[Referral Partner / Affiliate Name]'}
Referral scope/Target: ${p.service || '[Referral scope]'}
Referral fees & payout: ${p.payment || '[Referral Fees / Commission]'}
Duration: ${p.duration || '[Duration]'}

Toggles:
- Penalty Clause: ${p.include_penalty_clause ? 'YES' : 'NO'}
- Arbitration: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- Partner eligibility & promotional guidelines (no spam, ethical marketing)
- Payout conditions (qualified lead definitions, payout thresholds)
- Intellectual property and trademark license to use company banners/logos
- Direct disclaimer of partnership, agency, or employment relationship
- Termination terms of partner status
`,
  'Investor Pitch Legal Disclaimer': (p) => `
Generate a professional legal disclaimer/confidentiality notice for a Pitch Deck, Startup Presentation or Private Placement Memorandum:
Company Name: ${p.business_name || '[Startup Name]'}
Target Audience/Scope: ${p.purpose || '[Presentation context]'}
Primary Governing Jurisdiction: ${p.jurisdiction || '[Applicable Jurisdiction]'}

Include:
- No offer to sell or solicitation of buy orders declaration
- Forward-looking statements safe harbor (projections are estimates only)
- Private and confidential distribution control notice (no sharing without permission)
- Standard disclaimers on financial data completeness
- Governing laws of ${p.jurisdiction || 'India'}
`,
  'Digital Marketing Compliance Policy': (p) => `
Generate a comprehensive Digital Marketing Compliance Guidelines for:
Company: ${p.business_name || '[Business Name]'}
Compliance Channels: ${p.platform || '[Target Platforms]'}
Governing Laws: ${p.jurisdiction || '[Applicable Compliance Laws]'}

Include:
- Strict guidelines for promotional messaging (adhering to local consumer protection acts and ASCI code in India if applicable)
- Consent requirements for Email and SMS marketing (opt-in/opt-out mandates)
- Disclosure rules for sponsored/affiliate influencers
- Privacy protection mandates when deploying pixel trackers/cookies
- Sanction policies for vendors violating these rules
`,
  'Privacy Policy': (p) => `
Generate a Privacy Policy for:
Business Name: ${p.business_name || '[Business Name]'}
Website/App: ${p.platform || '[Platform]'}
Data Collected: ${p.data_types || '[Data Types]'}

Include:
- Data usage
- User rights
- Cookies
- Third-party sharing
- Security measures
Make it compliant with Indian IT laws.
`,
  'Website Terms & Conditions': (p) => `
Generate Website Terms and Conditions for:
Platform Name: ${p.platform || '[Platform]'}
Services: ${p.services || '[Services]'}

Toggles:
- Arbitration Clause: ${p.include_arbitration ? 'YES' : 'NO'}

Include:
- User obligations
- Limitations
- Payment terms
- Termination
- Legal jurisdiction
`,
  'Pitch Deck': (p) => `
Generate a startup pitch deck outline for:
Startup Name: ${p.business_name || '[Business Name]'}
Problem: ${p.problem || '[Problem]'}
Solution: ${p.solution || '[Solution]'}
Market: ${p.market || '[Market]'}
Revenue Model: ${p.revenue || '[Revenue]'}

Output sections:
- Problem
- Solution
- Market Size
- Business Model
- Traction
- Financials
- Ask
`,
  'Financial Model': (p) => `
Generate a 3-year financial projection for:
Business: ${p.business_name || '[Business Name]'}
Revenue Streams: ${p.revenue_streams || '[Revenue Streams]'}
Costs: ${p.costs || '[Costs]'}

Include:
- Revenue forecast
- Expense breakdown
- Profit estimate
- Growth assumptions
`,
  'Application Letter': (p) => `
Generate a formal application letter:
Applicant Name: ${p.client_name || '[Client Name]'}
Purpose: ${p.purpose || '[Purpose]'}
Authority: ${p.authority || '[Authority]'}

Tone: respectful and clear
Include:
- Introduction
- Request
- Justification
- Closing
`
} as any;

function buildGenericPrompt(type: string, p: DocumentParams): string {
  return `
You are a senior Indian corporate lawyer and high-stakes legal documentation consultant.
Generate an exhaustive, highly formal, and legally structured legal agreement of type: "${type}".

Key Details Provided:
- Entity / Company Name (First Party): ${p.business_name || p.client_name || '[First Party Entity]'}
- Partner / Customer / Employee (Second Party): ${p.other_party || p.employee_name || p.candidate_name || '[Second Party Entity]'}
- Core Purpose / Deliverables: ${p.purpose || p.service || p.services || '[Core Purpose & Deliverables]'}
- Core Consideration / Payments: ${p.payment || p.salary || '[Compensation / Payments Terms]'}
- Term / Duration: ${p.duration || p.joining_date || '[Duration of Agreement]'}
- Place / Work Location: ${p.location || '[Location]'}
- Governing Law & Forum: ${p.jurisdiction || 'India'}
- Special Custom Notes / Covenants: ${p.special_notes || '[None designated]'}

Toggles and Strategic Parameters:
- IP Assignment / Asset protection check: ${p.include_ip_protection ? 'YES (Clause for complete Work-for-Hire ownership transfer and irrevocable worldwide brand trademark assignments)' : 'NO (Standard mutual backup/background rights protection)'}
- Non-Compete and Non-Solicit restrictor: ${p.include_non_compete ? 'YES (Post-termination block for 1 year from directly / indirectly competing or soliciting agency staff/clients)' : 'NO'}
- Specific Liquidated Damages clause: ${p.include_penalty_clause ? 'YES (Detailed damage estimations under Section 73 & 74 of the Indian Contract Act, 1872)' : 'NO'}
- Fast-Track Dispute Arbitration: ${p.include_arbitration ? 'YES (Fast-track sole arbitrator panel governed under Indian Arbitration and Conciliation Act, 1996 in ' + (p.jurisdiction || 'India') + ')' : 'NO (Courts of competent jurisdiction)'}

Drafting Requirements:
1. Provide a beautiful title and structured Recital / Preamble section ("WHEREAS...").
2. Number all clauses and sections in logical legal formatting (Clause 1.0, Clause 2.0, etc.).
3. Infuse formal Indian legal and corporate vocabulary ("Contract of Service", "Proprietary Data", "Force Majeure", "Arbitration Act 1996").
4. Include signature attestation block layouts at the bottom.
`;
}

export async function generateDocument(type: DocumentType, params: DocumentParams) {
  const specificPrompt = SPECIFIC_PROMPTS[type] ? SPECIFIC_PROMPTS[type]!(params) : buildGenericPrompt(type, params);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: specificPrompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
    },
  });
  return response.text;
}

export async function generateMultiOutput(documentText: string): Promise<MultiOutput> {
  const prompt = `
Based on the following document, generate:
1. A short, professional WhatsApp summary (bullet points, key terms).
2. A professional email draft to send this document to the other party.

Document:
${documentText}
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          whatsapp_summary: { type: Type.STRING },
          email_draft: { type: Type.STRING },
        },
        required: ["whatsapp_summary", "email_draft"],
      },
    },
  });
  return JSON.parse(response.text);
}

export async function getSmartWarnings(type: DocumentType, params: DocumentParams): Promise<string[]> {
  const prompt = `
Analyze the following document request and provide 1-2 "Smart Warnings" or recommendations.
Type: ${type}
Details: ${JSON.stringify(params)}

Example: ["AI project detected -> IP assignment clause strongly recommended.", "High value transaction -> Arbitration clause advised."]
Keep it short, professional, and actionable.
Return as a JSON array of strings.
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior legal and business advisor for India.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
  });
  return JSON.parse(response.text);
}

export async function smartBundle(intent: string) {
  const prompt = `
User Intent: ${intent}

Based on this intent:
- Identify required documents
- Generate all relevant documents

Example:
If intent = "startup setup"
Then generate:
- Founder Agreement
- NDA
- Cap Table
- Incorporation Checklist

Output:
Multiple documents clearly separated
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
    },
  });
  return response.text;
}

export async function autoSuggest(type: DocumentType, params: DocumentParams) {
  const prompt = `
Analyze the user's request for a ${type}:
Details: ${JSON.stringify(params)}

Suggest:
- Additional documents needed
- Risks if missing
- Best practices

Keep it short and actionable
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior legal and business advisor for India.",
    },
  });
  return response.text;
}

export async function validateDocument(type: DocumentType, documentText: string) {
  const prompt = `
Review this ${type} document:
${documentText}

- Check for missing clauses
- Identify risks
- Suggest improvements

Output:
- Issues
- Fix suggestions
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior legal and business advisor for India.",
    },
  });
  return response.text;
}

export async function askLegalAssistant(query: string, documentContext?: string, specialization?: string) {
  const prompt = `
${specialization ? `Advisory Specialization Focus: ${specialization}\n` : ''}
User Query: ${query}
${documentContext ? `\nRelated Document Context:\n${documentContext}\n` : ''}

Provide a helpful, precise, and legally-grounded response as a Senior Indian Legal and Business Advisor. Explain relevant Indian acts or sections if applicable (e.g., Information Technology Act 2000, Contract Act 1872, Companies Act 2013, GST, PAN, Aadhaar rules). Ensure the response is clear and professional. Keep suggestions constructive.
`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are RBA Lawyer – Royal Bulls Advisory Legal AI, an elite All-in-One AI Legal Advisor by Royal Bulls Advisory. Your traits: 1) Speak in 120+ languages (fluent in Hindi, English, Hinglish, etc.). 2) Expert in 190+ countries' laws (e.g., India, US, Dubai, etc.). 3) Fully capable of drafting documents like Agreements, Contracts, and Notices. 4) Empower users by explaining their legal rights and simplifying complex legalese into everyday clear language (आम आदमी की भाषा). Give actionable, helpful, precise advice, but politely remind them that AI advice is for general advisory purposes and they should double-check with registered advocates for high-stakes decisions.",
    },
  });
  return response.text;
}

