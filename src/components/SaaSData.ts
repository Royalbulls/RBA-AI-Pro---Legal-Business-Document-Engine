export interface TenantWorkspace {
  id: string;
  name: string;
  logo: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  colors: {
    primary: string; // Tailwind hex or class name
    accent: string;
    bg: string;
  };
  domain: string;
  customLogoUrl?: string;
  emailTemplate: string;
  departments: string[];
  teamMembers: TeamMember[];
  usage: {
    tokens: number;
    tokensLimit: number;
    esign: number;
    esignLimit: number;
    invoices: number;
    invoicesLimit: number;
    bandwidth: string;
  };
  apiKeys: { key: string; name: string; createdAt: string }[];
  webhooks: { url: string; trigger: string; id: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Workspace Owner' | 'Admin' | 'Manager' | 'Staff' | 'Client' | 'Guest';
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
}

export const WORKSPACE_ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Admin': ['all_access', 'manage_billing', 'white_label', 'delete_workspace', 'manage_api_keys', 'view_all_os'],
  'Workspace Owner': ['all_access', 'manage_billing', 'white_label', 'manage_team', 'view_all_os'],
  'Admin': ['manage_team', 'create_documents', 'view_crm', 'use_ai', 'view_all_os'],
  'Manager': ['create_documents', 'view_crm', 'use_ai', 'manage_tasks'],
  'Staff': ['create_documents', 'view_own_crm', 'use_ai'],
  'Client': ['view_shared_documents', 'e_sign_documents', 'submit_forms', 'chat_with_staff'],
  'Guest': ['read_only_view', 'submit_forms_only']
};

export const INITIAL_WORKSPACES: TenantWorkspace[] = [
  {
    id: 'workspace_rba',
    name: 'Royal Bulls Advisory',
    logo: '🐂 RBA',
    plan: 'Enterprise',
    colors: {
      primary: '#0F172A', // Slate 900
      accent: '#06B6D4',  // Cyan 500
      bg: '#F8FAFC'       // Slate 50
    },
    domain: 'portal.royalbullsadvisory.com',
    emailTemplate: 'Dear {client_name},\n\nPlease review the attached document prepared by Royal Bulls Advisory. For any questions, contact our support desk.\n\nBest Regards,\nRoyal Bulls Legal Operations Team',
    departments: ['Legal Advisory', 'GST & Taxation', 'Corporate Finance', 'Human Resources'],
    teamMembers: [
      { id: 'tm_1', name: 'Amit Sharma', email: 'amit@royalbulls.com', role: 'Workspace Owner', department: 'Legal Advisory', status: 'Active' },
      { id: 'tm_2', name: 'Rahul Varma', email: 'rahul@royalbulls.com', role: 'Admin', department: 'Corporate Finance', status: 'Active' },
      { id: 'tm_3', name: 'Priya Patel', email: 'priya@royalbulls.com', role: 'Manager', department: 'GST & Taxation', status: 'Active' },
      { id: 'tm_4', name: 'Rajesh Kumar', email: 'rajesh@royalbulls.com', role: 'Staff', department: 'Legal Advisory', status: 'Active' },
      { id: 'tm_5', name: 'User Client', email: 'royalbullsadvisory412@gmail.com', role: 'Client', department: 'External Clients', status: 'Active' }
    ],
    usage: {
      tokens: 385000,
      tokensLimit: 1000000,
      esign: 18,
      esignLimit: 100,
      invoices: 45,
      invoicesLimit: 250,
      bandwidth: '1.2 GB / 10 GB'
    },
    apiKeys: [
      { key: 'rba_live_pk_8f79f8e02d398f5a', name: 'Production Backend API', createdAt: '2026-01-15' },
      { key: 'rba_test_sk_9d09e8f192aa0cbb', name: 'Staging Sandbox key', createdAt: '2026-03-20' }
    ],
    webhooks: [
      { id: 'wh_1', url: 'https://api.crm-connect.com/webhook/rba-intake', trigger: 'Client Created' },
      { id: 'wh_2', url: 'https://hooks.zapier.com/hooks/catch/198421', trigger: 'Agreement Generated' }
    ]
  },
  {
    id: 'workspace_pub_inc',
    name: 'Bounty Writers & Publishers',
    logo: '📖 BWP',
    plan: 'Pro',
    colors: {
      primary: '#1E1B4B', // Indigo 950
      accent: '#EC4899',  // Pink 500
      bg: '#FDF2F8'       // Pink 50
    },
    domain: 'bountybooks.in',
    emailTemplate: 'Hello {client_name},\n\nWe have drafted your book manuscript chapter / contract. Kindly review and approve via our self-service portal.\n\nWarm regards,\nBounty Editorial Team',
    departments: ['Book Editing', 'eBook Design', 'Magazine Distribution', 'Podcast Operations'],
    teamMembers: [
      { id: 'tm_201', name: 'Vikram Seth', email: 'vikram@bountybooks.in', role: 'Workspace Owner', department: 'Book Editing', status: 'Active' },
      { id: 'tm_202', name: 'Ananya Roy', email: 'ananya@bountybooks.in', role: 'Manager', department: 'eBook Design', status: 'Active' },
      { id: 'tm_203', name: 'Kabir Das', email: 'kabir@bountybooks.in', role: 'Staff', department: 'Podcast Operations', status: 'Active' }
    ],
    usage: {
      tokens: 420000,
      tokensLimit: 500000,
      esign: 34,
      esignLimit: 50,
      invoices: 89,
      invoicesLimit: 100,
      bandwidth: '4.8 GB / 5 GB'
    },
    apiKeys: [],
    webhooks: []
  },
  {
    id: 'workspace_law_firm',
    name: 'Indus Legal Associates',
    logo: '⚖️ ILA',
    plan: 'Enterprise',
    colors: {
      primary: '#1C1917', // Stone 900
      accent: '#D97706',  // Amber 600
      bg: '#FAF9F6'       // Off White
    },
    domain: 'induslegal.co.in',
    emailTemplate: 'Respected {client_name},\n\nPlease discover the legal document for your verification under Indus Legal Associates.\n\nSincerely,\nPartner Advocate\nIndus Legal Associates',
    departments: ['Supreme Court Litigation', 'Corporate Drafting', 'IP & Trademark Auditing', 'RERA Regulatory'],
    teamMembers: [
      { id: 'tm_301', name: 'Arundhati Roy', email: 'arundhati@induslegal.com', role: 'Workspace Owner', department: 'Supreme Court Litigation', status: 'Active' },
      { id: 'tm_302', name: 'Rohan Hegde', email: 'rohan@induslegal.com', role: 'Admin', department: 'Corporate Drafting', status: 'Active' }
    ],
    usage: {
      tokens: 720000,
      tokensLimit: 2500000,
      esign: 120,
      esignLimit: 500,
      invoices: 310,
      invoicesLimit: 1000,
      bandwidth: '8.4 GB / 25 GB'
    },
    apiKeys: [
      { key: 'ila_sk_f89f2a93b49911e3', name: 'Clio Sync Connection', createdAt: '2026-02-10' }
    ],
    webhooks: []
  }
];

export const SUBSCRIPTION_PLANS = [
  {
    name: 'Starter',
    price: '₹2,499 / mo',
    features: [
      'Single Isolated Workspace',
      'Up to 3 Team Members',
      'Agreement Generator & 100+ templates',
      'Standard Google Drive & Docs sync',
      '10,000 AI Token Credits / mo',
      '5 Aadhaar OTP E-Signs / mo'
    ],
    limits: 'Ideal for Individual Consultants & Freelancers'
  },
  {
    name: 'Pro',
    price: '₹7,999 / mo',
    features: [
      '3 Isolated Shared Workspaces',
      'Up to 15 Team Members',
      '500+ Legal Templates & Custom Fields',
      'Full CRM & GST Billing Invoicing',
      'Google Sheets & Forms Intake Engine',
      'Publisher & Marketing OS Suites',
      '500,000 AI Token Credits / mo',
      '50 Aadhaar OTP E-Signs / mo',
      'Zapier-like Workflow Automation'
    ],
    limits: 'Perfect for fast-growing DSAs, MSMEs, CAs & Agencies'
  },
  {
    name: 'Enterprise',
    price: '₹19,999 / mo',
    features: [
      'Unlimited Isolated Workspaces',
      'Unlimited Team Members & RBAC Roles',
      'Full White Label (Own logo, Brand color, domain)',
      'Enterprise API Keys & Webhook Channels',
      'All 8 Operating System modules unlocked',
      'Unlimited Document Vault size with OCR',
      '2.5M AI Token Credits / mo',
      'Unlimited Aadhaar OTP E-Signs',
      'Dedicated legal/regulatory audit logging'
    ],
    limits: 'Unmatched scale for corporate enterprises and law firms'
  }
];

export const MARKETPLACE_ITEMS = [
  {
    id: 'mp_1',
    name: 'GST Direct Filing Node',
    category: 'Plugins',
    rating: 4.8,
    installs: 1250,
    price: 'Free',
    desc: 'Connect your invoice ledger directly with the Indian GSTIN portal for 1-click GSTR-1 preparation.'
  },
  {
    id: 'mp_2',
    name: 'MCA Corporate Search',
    category: 'Plugins',
    rating: 4.9,
    installs: 840,
    price: '₹199 / mo',
    desc: 'Direct integration with Ministry of Corporate Affairs data to auto-pull CIN, company addresses, and directors list.'
  },
  {
    id: 'mp_3',
    name: 'RERA Court Alert Daemon',
    category: 'AI Agents',
    rating: 4.7,
    installs: 410,
    price: '₹499 / mo',
    desc: 'An AI lawyer agent that continuously monitors property tribunals and alerts RERA agents on litigation schedules.'
  },
  {
    id: 'mp_4',
    name: 'Premium Minimalist Ivory',
    category: 'Themes',
    rating: 5.0,
    installs: 190,
    price: 'Free (Enterprise)',
    desc: 'A premium, ultra-light layout with high-contrast stone typography mimicking elite high-court chambers.'
  },
  {
    id: 'mp_5',
    name: 'Aadhaar eSign bulk plugin',
    category: 'Extensions',
    rating: 4.6,
    installs: 2100,
    price: '₹1.5 / esign',
    desc: 'Send electronic signatures in bulk to thousands of clients at once with standard Excel template uploads.'
  }
];
