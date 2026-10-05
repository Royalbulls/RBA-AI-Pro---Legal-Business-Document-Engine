import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, Shield, Heart, Briefcase, Users, Landmark, FileSpreadsheet, Percent, 
  Award, Globe, Gavel, FileText, Zap, Activity, Clock, Plus, Trash2, 
  Calendar, Search, Lock, MessageSquare, FileSignature, CheckCircle, 
  AlertTriangle, HelpCircle, BookOpen, PlusCircle, UserCheck, ArrowRight, 
  ClipboardList, TrendingUp, AlertCircle, RefreshCw, Send, Check, ChevronRight, 
  Download, Copy, Edit, CheckSquare, Eye, Key, Database, ShieldAlert, FileCode,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { askLegalAssistant } from '../services/gemini';
import { 
  LAWYER_TYPES, 
  SPECIALIZED_AGENTS, 
  DOCUMENT_TEMPLATES, 
  INITIAL_CLIENTS, 
  INITIAL_CASES, 
  WORKSPACE_MODES, 
  SECURITY_ROLES, 
  LawyerType, 
  ClientProfile, 
  LegalCase, 
  DocumentTemplate 
} from './LawyerOSData';

// Map icon names to components for dynamic rendering
const IconMap: Record<string, any> = {
  Scale, Shield, Heart, Briefcase, Users, Landmark, FileSpreadsheet, Percent, 
  Award, Globe, Gavel, FileText, Zap, Activity, Clock, FileCheck: FileSignature
};

export function LawyerOSModule() {
  // Theme state: default 'dark' as legal practices love high-prestige dark setups, but fully supports light
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  
  // Lawyer Types Category selection
  const [selectedLawyerType, setSelectedLawyerType] = useState<LawyerType | null>(null);
  
  // Tab inside selected workspace
  const [selectedSubTab, setSelectedSubTab] = useState<'dashboard' | 'assistant' | 'tools' | 'templates' | 'cases' | 'crm' | 'calendar' | 'billing' | 'security'>('dashboard');

  // Dynamic Workspace Data (uses React State for fully functional simulations)
  const [cases, setCases] = useState<LegalCase[]>(INITIAL_CASES);
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  
  // Selected single entities for detail views
  const [activeCaseId, setActiveCaseId] = useState<string | null>(INITIAL_CASES[0]?.id || null);
  const [activeClientId, setActiveClientId] = useState<string | null>(INITIAL_CLIENTS[0]?.id || null);

  // New Case Modal & State
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseData, setNewCaseData] = useState<Partial<LegalCase>>({
    caseNumber: '',
    title: '',
    lawyerType: 'civil',
    court: '',
    judge: '',
    oppositeParty: '',
    oppositeLawyer: '',
    hearingDates: [''],
    nextHearing: '',
    status: 'Active',
    notes: '',
    billingAmount: 100000,
    paidAmount: 0
  });

  // New Client Modal & State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<ClientProfile>>({
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    pan: '',
    address: ''
  });

  // AI Agent States
  const [selectedAgentId, setSelectedAgentId] = useState<string>('supervisor');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'agent'; text: string; timestamp: string; agentName?: string }[]>([
    { 
      sender: 'agent', 
      text: 'Greetings. I am the Supervisor AI Agent of Lawyer OS. I coordinate our specialized legal agents (Civil, Criminal, Corporate, Property, etc.) to evaluate cases, cross-examine compliance risks, and construct flawless draft pleadings. How may I represent your firm today?', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: 'Supervisor AI Agent'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Legal Tools State
  const [selectedTool, setSelectedTool] = useState<string>('agreement');
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({
    title: '',
    partyA: '',
    partyB: '',
    duration: '',
    customTerms: '',
    noticeTo: '',
    reason: '',
    petitionReason: '',
    courtName: '',
    affidavitDeclare: '',
    riskText: '',
    clausePurpose: '',
    researchQuery: '',
    complianceQuery: ''
  });
  const [aiGeneratedText, setAiGeneratedText] = useState<string>('');
  const [isToolGenerating, setIsToolGenerating] = useState(false);

  // Document Library Templates states
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});

  // Court Calendar states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [newAdjournmentCaseId, setNewAdjournmentCaseId] = useState('');
  const [newAdjournmentDate, setNewAdjournmentDate] = useState('');

  // Security, Workspace & Digital Signatures states
  const [workspaceMode, setWorkspaceMode] = useState<'solo' | 'firm' | 'corp' | 'gov' | 'consult'>('firm');
  const [signatureKeyApplied, setSignatureKeyApplied] = useState(false);
  const [hsmStatus, setHsmStatus] = useState<'active' | 'rotated'>('active');
  const [auditLogs, setAuditLogs] = useState<{ id: string; timestamp: string; user: string; action: string; category: string; severity: 'info' | 'secure' | 'warning' }[]>([
    { id: 'log_1', timestamp: '2026-06-30 11:15:30', user: 'Partner Advocate', action: 'Accessed Client Confidential CRM for Anil Ambani', category: 'CRM Access', severity: 'secure' },
    { id: 'log_2', timestamp: '2026-06-30 11:20:12', user: 'System Service', action: 'Rotated 256-bit HSM document storage keys', category: 'Key Rotation', severity: 'secure' },
    { id: 'log_3', timestamp: '2026-06-30 11:35:05', user: 'Associate Counsel', action: 'Drafted temporary injunction petition via Civil AI Tool', category: 'Draft Generation', severity: 'info' }
  ]);

  // Sync state to local storage when changes happen
  useEffect(() => {
    const savedCases = localStorage.getItem('lawyer_os_cases');
    const savedClients = localStorage.getItem('lawyer_os_clients');
    const savedLogs = localStorage.getItem('lawyer_os_audit_logs');
    if (savedCases) setCases(JSON.parse(savedCases));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
  }, []);

  const saveToLocal = (updatedCases?: LegalCase[], updatedClients?: ClientProfile[], updatedLogs?: any[]) => {
    if (updatedCases) {
      setCases(updatedCases);
      localStorage.setItem('lawyer_os_cases', JSON.stringify(updatedCases));
    }
    if (updatedClients) {
      setClients(updatedClients);
      localStorage.setItem('lawyer_os_clients', JSON.stringify(updatedClients));
    }
    if (updatedLogs) {
      setAuditLogs(updatedLogs);
      localStorage.setItem('lawyer_os_audit_logs', JSON.stringify(updatedLogs));
    }
  };

  // Add an audit log dynamically
  const addAuditLog = (action: string, category: string, severity: 'info' | 'secure' | 'warning' = 'info') => {
    const newLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Managing Partner (You)',
      action,
      category,
      severity
    };
    const updated = [newLog, ...auditLogs];
    saveToLocal(undefined, undefined, updated);
  };

  // Chat with Specialized AI Agents & Supervisor
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isAiLoading) return;
    
    const userMsgText = currentMessage;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Append user message
    const updatedHistory = [...chatHistory, { sender: 'user' as const, text: userMsgText, timestamp: timestampStr }];
    setChatHistory(updatedHistory);
    setCurrentMessage('');
    setIsAiLoading(true);

    try {
      // Find agent system prompt
      let systemPrompt = "You are a professional legal expert.";
      let agentName = "Supervisor AI Agent";
      
      if (selectedAgentId !== 'supervisor') {
        const foundAgent = SPECIALIZED_AGENTS.find(a => a.id === selectedAgentId);
        if (foundAgent) {
          systemPrompt = foundAgent.systemPrompt;
          agentName = foundAgent.name;
        }
      } else {
        systemPrompt = "You are the Coordinator/Supervisor AI Agent of RBA Lawyer OS. Route queries to appropriate sub-agents or answer directly using Supreme Court rulings and relevant codes.";
      }

      // Prepend current lawyer type context to focus advice
      const specializationContext = selectedLawyerType 
        ? `Specialized context: The user is currently operating in the ${selectedLawyerType.name} workspace.`
        : `General Workspace Portal`;

      const responseText = await askLegalAssistant(userMsgText, specializationContext, systemPrompt);

      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'agent', 
          text: responseText, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName
        }
      ]);
      addAuditLog(`Consulted AI Agent (${agentName}) for: "${userMsgText.substring(0, 30)}..."`, 'AI Advisory', 'info');
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'agent', 
          text: `Error connecting to RBA AI services: ${err?.message || 'Server timeout'}. Please check your API configuration.`, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'System Error'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run AI Legal Tools
  const handleRunTool = async () => {
    if (isToolGenerating) return;
    setIsToolGenerating(true);
    setAiGeneratedText('');

    let prompt = '';
    let categoryName = 'Contract Drafting';
    
    switch (selectedTool) {
      case 'agreement':
        prompt = `Draft a customized legal contract/agreement titled "${toolInputs.title || 'Service Level Agreement'}" between Party A: "${toolInputs.partyA || 'Disclosing Entity'}" and Party B: "${toolInputs.partyB || 'Receiving Entity'}". Standard duration is ${toolInputs.duration || '12 Months'}. Custom special covenants: "${toolInputs.customTerms || 'None provided'}". Make it highly professional and enforceable in India, following the Indian Contract Act 1872. Include formal recitals, covenants, liabilities, arbitration, and signature blocks.`;
        categoryName = 'Agreement Drafting';
        break;
      case 'notice':
        prompt = `Draft a formal legal notice addressed to "${toolInputs.noticeTo || 'Default Respondent'}" on behalf of our client. Key grievance/reason for notice: "${toolInputs.reason || 'Breach of commercial payment commitments'}". Outline legal violations under appropriate Indian laws (e.g. Section 138 of NI Act, or breach under Contract Act). Demand remedy within 15 days or face civil/criminal litigation.`;
        categoryName = 'Legal Notice Drafting';
        break;
      case 'petition':
        prompt = `Draft a formal legal Petition/Plea to be filed before the "${toolInputs.courtName || 'Honorable District Court'}" under appropriate legal grounds. Main grievance: "${toolInputs.petitionReason || 'Default on property boundary markers'}". Structure the petition with formal title, jurisdiction paragraphs, facts of the dispute, grounds of appeal, and final prayer for relief.`;
        categoryName = 'Petition Drafting';
        break;
      case 'affidavit':
        prompt = `Draft a legally binding Affidavit/Solemn Declaration. Declarant Name and details: "${toolInputs.partyA || 'Plaintiff Advocate Agent'}". Facts solemnly declared and verified: "${toolInputs.affidavitDeclare || 'I declare that the documents submitted herewith are authentic copies of the originals'}". Include appropriate oath statement, Verification block, and Signature of Declarant before Oath Commissioner.`;
        categoryName = 'Affidavit Drafting';
        break;
      case 'reply':
        prompt = `Draft a written reply/rejoinder response defending against an opposite party claims. Original opposition allegations: "${toolInputs.reason || 'Unfounded complaints of delays in project delivery'}". Construct a solid legal rebuttal, paragraph-wise denials, specific defenses under the Limitation Act/CPC, and prayer to dismiss opposite suit with heavy compensatory costs.`;
        categoryName = 'Written Reply Drafting';
        break;
      case 'review':
        prompt = `Perform an exhaustive legal review of the following contract/clause text: "${toolInputs.riskText || 'All ownership rights of work created shall belong exclusively to the client, and contractor shall not be allowed to perform work for any competitors within 3 years.'}". Evaluate enforcing capabilities, validity in India, and alignment with corporate precedents.`;
        categoryName = 'Contract Review';
        break;
      case 'risk':
        prompt = `Conduct a rigorous AI Contract Risk Analysis on: "${toolInputs.riskText || 'Indemnity: Contractor shall fully indemnify, hold harmless and defend client from any loss, damage, cyber breach, penalty, legal fee without limit, regardless of actual negligence.'}". Detail potential landmines, risk levels (High/Medium/Low), exposure analysis, and provide safer alternative counter-draft clauses.`;
        categoryName = 'Risk Analysis';
        break;
      case 'clause':
        prompt = `Generate a modern, ironclad contract clause for: "${toolInputs.clausePurpose || 'Limitation of liability capped at 100% of fees paid, excluding intellectual property indemnities'}". Draft it in clean standard enterprise legal prose ready to be copy-pasted into master service agreements.`;
        categoryName = 'Clause Generation';
        break;
      case 'research':
        prompt = `Perform extensive AI Legal Research regarding: "${toolInputs.researchQuery || 'Doctrine of frustration of contract under Section 56 of Indian Contract Act in post-COVID scenarios'}". Cite leading Supreme Court of India precedents, key ratio decidendi, and legal application guidance.`;
        categoryName = 'AI Legal Research';
        break;
      case 'summarizer':
        prompt = `Summarize and simplify the following legal text or section: "${toolInputs.riskText || 'Section 138 of NI Act: Dishonour of cheque for insufficiency, etc., of funds in the account...'}" into clear plain-English and plain-Hindi (आम आदमी की भाषा). Highlight essential ingredients required to constitute the offence.`;
        categoryName = 'Legal Summarizer';
        break;
      case 'citation':
        prompt = `Generate specific high-court and Supreme Court citation suggestions for: "${toolInputs.researchQuery || 'Default of installment payments and applicability of SARFAESI Act securitization notices'}" with brief summaries of the ratios.`;
        categoryName = 'Citation Generator';
        break;
      case 'caselaw':
        prompt = `Search and structure case law summaries concerning: "${toolInputs.researchQuery || 'Joint liability under Section 34 of IPC / BNS equivalents'}". State case title, bench details, key facts, and final ruling ratio.`;
        categoryName = 'Case Law Search';
        break;
      case 'compliance':
        prompt = `Run a comprehensive regulatory Compliance Check for: "${toolInputs.complianceQuery || 'Mandatory disclosures, POSH policies, and filing requirements for a FinTech startup in India with 25 employees'}". Outline required filings, acts applicable, and penality warnings for missing milestones.`;
        categoryName = 'Compliance Checker';
        break;
      default:
        prompt = `Conduct legal research and advisory drafting regarding current inputs.`;
    }

    try {
      const response = await askLegalAssistant(prompt, `Lawyer Category Focus: ${selectedLawyerType?.name || 'General Law'}`);
      setAiGeneratedText(response);
      addAuditLog(`Generated AI Legal Draft: ${categoryName}`, 'Document Generation', 'secure');
    } catch (err: any) {
      setAiGeneratedText(`Draft generation encountered a service error: ${err?.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsToolGenerating(false);
    }
  };

  // Pre-populate tool from Document Library templates
  const handleSelectTemplate = (tpl: DocumentTemplate) => {
    setSelectedTemplate(tpl);
    const inputs: Record<string, string> = {};
    tpl.fields.forEach(f => {
      inputs[f.name] = '';
    });
    setTemplateInputs(inputs);
  };

  const handleGenerateFromTemplate = async () => {
    if (!selectedTemplate || isToolGenerating) return;
    setIsToolGenerating(true);
    setAiGeneratedText('');

    // Replace placeholders
    let renderedPrompt = selectedTemplate.defaultPrompt;
    selectedTemplate.fields.forEach(f => {
      const val = templateInputs[f.name] || `[${f.label}]`;
      renderedPrompt = renderedPrompt.replace(`{${f.name}}`, val);
    });

    try {
      setSelectedSubTab('tools'); // Shift to tools tab to watch generation
      setSelectedTool('agreement'); // Default tool to render output
      
      const response = await askLegalAssistant(renderedPrompt, `Template category: ${selectedTemplate.category}`);
      setAiGeneratedText(response);
      addAuditLog(`Drafted ${selectedTemplate.name} from templates vault`, 'Document Generation', 'secure');
      setSelectedTemplate(null);
    } catch (err: any) {
      setAiGeneratedText(`Error generating from template: ${err?.message}`);
    } finally {
      setIsToolGenerating(false);
    }
  };

  // Case Management Actions
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseData.caseNumber || !newCaseData.title) return;

    const createdCase: LegalCase = {
      id: 'case_' + Date.now(),
      caseNumber: newCaseData.caseNumber,
      title: newCaseData.title,
      lawyerType: selectedLawyerType?.id || 'civil',
      court: newCaseData.court || 'High Court of Delhi',
      judge: newCaseData.judge || 'Honorable Justice',
      oppositeParty: newCaseData.oppositeParty || 'Opposite Party Inc',
      oppositeLawyer: newCaseData.oppositeLawyer || 'Unknown Advocate',
      hearingDates: newCaseData.hearingDates || [new Date().toISOString().substring(0, 10)],
      nextHearing: newCaseData.nextHearing || new Date().toISOString().substring(0, 10),
      status: 'Active',
      timeline: [
        { date: new Date().toISOString().substring(0, 10), event: 'Case registered on Lawyer OS and assigned', type: 'filing' }
      ],
      evidenceList: [],
      notes: newCaseData.notes || '',
      billingAmount: Number(newCaseData.billingAmount) || 100000,
      paidAmount: Number(newCaseData.paidAmount) || 0
    };

    const updated = [...cases, createdCase];
    saveToLocal(updated);
    setActiveCaseId(createdCase.id);
    setShowNewCaseModal(false);
    addAuditLog(`Created Case ${createdCase.caseNumber}: ${createdCase.title}`, 'Case Registry', 'secure');

    // Reset form
    setNewCaseData({
      caseNumber: '',
      title: '',
      lawyerType: 'civil',
      court: '',
      judge: '',
      oppositeParty: '',
      oppositeLawyer: '',
      hearingDates: [''],
      nextHearing: '',
      status: 'Active',
      notes: '',
      billingAmount: 100000,
      paidAmount: 0
    });
  };

  const handleToggleCaseStatus = (caseId: string) => {
    const updated = cases.map(c => {
      if (c.id === caseId) {
        const newStatus: 'Active' | 'Closed' = c.status === 'Closed' ? 'Active' : 'Closed';
        addAuditLog(`Toggled case status for ${c.caseNumber} to ${newStatus}`, 'Case Updates', 'info');
        return { ...c, status: newStatus };
      }
      return c;
    });
    saveToLocal(updated);
  };

  const handleAddCaseNote = (caseId: string, text: string) => {
    if (!text.trim()) return;
    const updated = cases.map(c => {
      if (c.id === caseId) {
        return { ...c, notes: text };
      }
      return c;
    });
    saveToLocal(updated);
    addAuditLog(`Updated internal research notes for case ID: ${caseId}`, 'Case Updates', 'info');
  };

  // Client CRM Actions
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name) return;

    const createdClient: ClientProfile = {
      id: 'cli_' + Date.now(),
      name: newClientData.name,
      email: newClientData.email || 'client@firm.com',
      phone: newClientData.phone || '+91 ',
      aadhaar: newClientData.aadhaar || 'XXXX-XXXX-XXXX',
      pan: newClientData.pan || 'XXXXX0000X',
      address: newClientData.address || 'India',
      activeCases: [],
      payments: [],
      meetings: [],
      agreements: [],
      communicationHistory: [
        { date: new Date().toISOString().substring(0, 10), type: 'In-Person', notes: 'Client registered into CRM' }
      ]
    };

    const updated = [...clients, createdClient];
    saveToLocal(undefined, updated);
    setActiveClientId(createdClient.id);
    setShowNewClientModal(false);
    addAuditLog(`Registered Client Profile: ${createdClient.name}`, 'CRM Intake', 'secure');

    // Reset Form
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      aadhaar: '',
      pan: '',
      address: ''
    });
  };

  // Court Adjournments & Sync simulation
  const handleTriggerGoogleSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    addAuditLog('Initiated secure OAuth sync with court cause lists & Google Calendar', 'Integrations', 'secure');
    setTimeout(() => {
      setSyncStatus('synced');
      addAuditLog('Successfully synchronized court diaries, hearings schedules, and Google Calendar', 'Integrations', 'secure');
    }, 1500);
  };

  const handleAddAdjournment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdjournmentCaseId || !newAdjournmentDate) return;

    const updated = cases.map(c => {
      if (c.id === newAdjournmentCaseId) {
        const revisedTimeline = [
          ...c.timeline,
          { date: new Date().toISOString().substring(0, 10), event: `Hearing adjourned by Hon'ble court. Next hearing fixed for ${newAdjournmentDate}`, type: 'hearing' as const }
        ];
        addAuditLog(`Logged adjournment for case ${c.caseNumber}. Next hearing: ${newAdjournmentDate}`, 'Adjournments', 'warning');
        return {
          ...c,
          status: 'Adjourned' as const,
          nextHearing: newAdjournmentDate,
          hearingDates: [...c.hearingDates, newAdjournmentDate],
          timeline: revisedTimeline
        };
      }
      return c;
    });

    saveToLocal(updated);
    setNewAdjournmentCaseId('');
    setNewAdjournmentDate('');
  };

  // Digital Signature Simulation
  const handleApplyDigitalSignature = () => {
    if (signatureKeyApplied) {
      setSignatureKeyApplied(false);
      return;
    }
    setSignatureKeyApplied(true);
    addAuditLog('Digitally signed active draft using encrypted e-Sign certificate token (FIPS 140-2 Level 3)', 'Digital Signatures', 'secure');
  };

  const handleRotateHsmKeys = () => {
    setHsmStatus('rotated');
    addAuditLog('Enforced zero-trust cryptographic key rotation across legal database schemas', 'Cryptography', 'secure');
    setTimeout(() => {
      setHsmStatus('active');
    }, 2000);
  };

  // Helper function to get icons dynamically
  const renderIcon = (name: string, className: string = "w-5 h-5") => {
    const Component = IconMap[name] || Scale;
    return <Component className={className} />;
  };

  // Active sub-theme class sets
  const themeBg = themeMode === 'dark' ? 'bg-[#0B0C10] text-[#E0E2EC]' : 'bg-[#FAF9F6] text-[#1E2028]';
  const cardBg = themeMode === 'dark' ? 'bg-[#12141D] border-[#1E2230]' : 'bg-white border-stone-200';
  const textTitle = themeMode === 'dark' ? 'text-white' : 'text-stone-900';
  const textMuted = themeMode === 'dark' ? 'text-[#8C93A8]' : 'text-stone-500';
  const borderCol = themeMode === 'dark' ? 'border-[#1E2230]' : 'border-stone-200';
  const inputBg = themeMode === 'dark' ? 'bg-[#181A25] border-[#25293C] text-white' : 'bg-stone-50 border-stone-300 text-stone-900';
  const sidebarBg = themeMode === 'dark' ? 'bg-[#0E1017] border-[#1A1E2B]' : 'bg-stone-100 border-stone-300';

  return (
    <div className={`flex flex-col h-full w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${themeBg}`}>
      
      {/* HEADER BAR */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${borderCol} ${themeMode === 'dark' ? 'bg-[#0E1017]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Scale className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded">RBA AI PRO Suite</span>
              <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">Active Session</span>
            </div>
            <h1 className={`text-lg font-black tracking-tight ${textTitle}`}>
              Lawyer & Law Firm OS <span className="font-light text-sm text-stone-400">| Practice Administration System</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Workspace mode selector */}
          <div className="hidden md:flex items-center gap-2 bg-[#1C2030]/20 p-1 rounded-lg border border-amber-500/10">
            {WORKSPACE_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setWorkspaceMode(mode.id as any);
                  addAuditLog(`Switched administrative mode to ${mode.name}`, 'Workspace config', 'info');
                }}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${workspaceMode === mode.id ? 'bg-amber-500 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                {mode.id}
              </button>
            ))}
          </div>

          {/* Theme switcher */}
          <button 
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className={`p-2.5 rounded-xl border ${borderCol} transition-all hover:scale-105`}
            title="Toggle theme mode"
          >
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Reset selection if active workspace selected */}
          {selectedLawyerType && (
            <button
              onClick={() => {
                addAuditLog(`Exited ${selectedLawyerType.name} workspace`, 'Navigation', 'info');
                setSelectedLawyerType(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-stone-500 hover:bg-stone-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              🏛️ Main Hub
            </button>
          )}
        </div>
      </div>

      {/* CORE WORKSPACE SCREEN */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* NO SELECTED LAWYER TYPE - SHOW 20 CATEGORY CARDS */}
        {!selectedLawyerType ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Introduction Panel */}
              <div className={`p-6 rounded-2xl border ${borderCol} ${cardBg} flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
                <div className="space-y-2 max-w-xl">
                  <h2 className={`text-xl font-black ${textTitle} tracking-tight`}>Advocate Chambers & Law Practice OS</h2>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    This suite coordinates practice operations across 20 legal domains. Select any category card to access tailored case file dashboards, client CRM pipelines, custom document templates, Court diaries, and specialized Coordinated AI Legal Agents supervised by our central Supervisor LLM.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[10px] font-bold bg-[#E11D48]/10 text-[#E11D48] px-2.5 py-1 rounded-full border border-[#E11D48]/20">FIPS Cryptography</span>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20">Google Calendar Sync</span>
                    <span className="text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] px-2.5 py-1 rounded-full border border-[#10B981]/20">Coordinated AI Agents</span>
                  </div>
                </div>
                
                {/* Global Status indicators */}
                <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/[0.02]">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Vault State: <span className="text-green-500 font-bold">DURABLE FIREBASE</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Keys: <span className="text-blue-400 font-bold">HSM-ENCRYPTED (256b)</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Sync Diaries: <span className="text-cyan-400 font-bold">LIVE ONLINE</span></span>
                  </div>
                </div>
              </div>

              {/* Grid Header */}
              <div className="flex items-center justify-between pt-4 border-b pb-2 border-stone-800">
                <h3 className={`text-xs font-extrabold uppercase tracking-widest ${textMuted}`}>Category Cards ({LAWYER_TYPES.length})</h3>
                <span className="text-xs text-amber-500 font-mono">Select a specialty to enter court workspace</span>
              </div>

              {/* THE 20 CATEGORY CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {LAWYER_TYPES.map((lawyer, idx) => {
                  return (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      className={`flex flex-col h-full rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${cardBg} hover:border-amber-500/40 hover:shadow-lg`}
                      onClick={() => {
                        setSelectedLawyerType(lawyer);
                        setSelectedSubTab('dashboard');
                        addAuditLog(`Opened ${lawyer.name} administrative workspace`, 'Navigation', 'info');
                      }}
                    >
                      {/* Top Accent bar */}
                      <div className="h-1" style={{ backgroundColor: lawyer.color }} />
                      
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: lawyer.color + '15', color: lawyer.color }}>
                              {renderIcon(lawyer.iconName, "w-5 h-5")}
                            </div>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border" style={{ borderColor: lawyer.color + '30', color: lawyer.color, backgroundColor: lawyer.color + '05' }}>
                              {lawyer.badge}
                            </span>
                          </div>
                          
                          <h4 className={`text-sm font-black tracking-tight ${textTitle}`}>{lawyer.name}</h4>
                          <p className="text-[11px] leading-relaxed line-clamp-3 text-stone-400">
                            {lawyer.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-800/10 flex items-center justify-between text-[10px]">
                          <span className="text-stone-500 font-mono">Act: {lawyer.primaryAct.substring(0, 18)}...</span>
                          <span className="flex items-center gap-1 font-bold text-amber-500 hover:underline">
                            Open OS <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Information */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-amber-500/[0.02] rounded-xl border border-amber-500/10 text-[11px] text-stone-400">
                <span>⚡ System Configured for: <strong>{workspaceMode === 'solo' ? 'Independent Chambers' : workspaceMode === 'firm' ? 'Cooperative Multi-Partner Firm' : 'Enterprise Counsel Teams'}</strong></span>
                <span>Audit security logs available at bottom of every panel.</span>
              </div>
            </div>
          </div>
        ) : (
          
          /* ACTIVE SPECIALTY WORKSPACE VIEW */
          <div className="flex-1 flex overflow-hidden">
            
            {/* WORKSPACE LEFT SIDE DIARY TAB RAIL */}
            <div className={`w-64 flex flex-col justify-between border-r ${borderCol} ${sidebarBg} shrink-0`}>
              
              {/* Header inside rail */}
              <div className="p-4 border-b border-stone-800/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg text-white shrink-0" style={{ backgroundColor: selectedLawyerType.color }}>
                    {renderIcon(selectedLawyerType.iconName, "w-4 h-4")}
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-amber-500 line-clamp-1">{selectedLawyerType.name} OS</h2>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed font-mono bg-stone-900/40 p-1.5 rounded">
                  Act: {selectedLawyerType.primaryAct}
                </p>
              </div>

              {/* Subtabs list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard & Logs', icon: Landmark, color: 'text-amber-500' },
                  { id: 'assistant', label: 'Coordinated Agents', icon: MessageSquare, color: 'text-blue-400' },
                  { id: 'tools', label: 'AI Drafting Tools', icon: Zap, color: 'text-rose-400' },
                  { id: 'templates', label: 'Document Templates', icon: FileSpreadsheet, color: 'text-emerald-400' },
                  { id: 'cases', label: 'Case Management', icon: Gavel, color: 'text-red-400' },
                  { id: 'crm', label: 'Client CRM', icon: Users, color: 'text-purple-400' },
                  { id: 'calendar', label: 'Court Diaries & Sync', icon: Calendar, color: 'text-cyan-400' },
                  { id: 'billing', label: 'Invoices & Reports', icon: Percent, color: 'text-indigo-400' },
                  { id: 'security', label: 'Security & Signatures', icon: Lock, color: 'text-amber-400' }
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = selectedSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedSubTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:bg-[#1A1F2D]/50 hover:text-white'}`}
                    >
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-stone-950' : tab.color}`} />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-stone-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer user profile */}
              <div className="p-3.5 border-t border-stone-800/20 bg-[#0E1017]/50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs border border-amber-500/20">
                  JD
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-[11px] font-bold text-stone-300 truncate">Adv. J. Dev (Partner)</h4>
                  <p className="text-[9px] font-mono text-green-500">Law Firm OS Mode</p>
                </div>
              </div>
            </div>

            {/* WORKSPACE DETAILED SUB-VIEW PANEL */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0E1017]/10 flex flex-col justify-between">
              
              <div className="space-y-6">
                
                {/* SUB TAB 1: DASHBOARD & SUMMARY */}
                {selectedSubTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl border border-amber-500/10">
                      <div>
                        <h3 className={`text-base font-black ${textTitle}`}>Active Advocacy Portfolio – {selectedLawyerType.name}</h3>
                        <p className="text-xs text-stone-400 mt-1">Real-time status of files, court summons, and drafting compliance audits.</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <button 
                          onClick={() => setShowNewCaseModal(true)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-lg transition-all shadow-md"
                        >
                          <Plus className="w-4 h-4" /> New Case File
                        </button>
                        <button 
                          onClick={() => setShowNewClientModal(true)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-black rounded-lg border border-stone-700 transition-all"
                        >
                          <Users className="w-4 h-4" /> Intake Client
                        </button>
                      </div>
                    </div>

                    {/* Stats Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} flex items-center gap-3.5`}>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                          <Gavel className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-stone-400">Active Cases</p>
                          <h4 className="text-lg font-black">{cases.filter(c => c.status !== 'Closed').length} Case Files</h4>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} flex items-center gap-3.5`}>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                          <Calendar className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-stone-400">Next Court Date</p>
                          <h4 className="text-sm font-black text-amber-500">10th July (NCLT)</h4>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} flex items-center gap-3.5`}>
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-stone-400">Total Billable</p>
                          <h4 className="text-lg font-black">₹{cases.reduce((sum, c) => sum + c.billingAmount, 0).toLocaleString()}</h4>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} flex items-center gap-3.5`}>
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-stone-400">Active CRM profiles</p>
                          <h4 className="text-lg font-black">{clients.length} Clients</h4>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Next Hearings & Adjournment warnings */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      
                      {/* Left Block: Urgent Court Dates */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4 lg:col-span-1`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" /> Court Dates Schedule
                        </h4>
                        
                        <div className="space-y-3">
                          {cases.map(c => (
                            <div key={c.id} className="p-3 bg-stone-900/40 rounded-lg border border-stone-800 flex flex-col justify-between space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded truncate max-w-[120px]">{c.caseNumber}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-xs font-bold line-clamp-1">{c.title}</p>
                              <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800">
                                <span>Court: {c.court.substring(0, 20)}...</span>
                                <span className="text-amber-500 font-mono font-bold">Hearing: {c.nextHearing}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Block: Active Case Timeline tracker */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4 lg:col-span-2`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">
                          Consolidated Practice Timeline
                        </h4>
                        
                        <div className="relative border-l-2 border-stone-800 ml-4 pl-6 space-y-5">
                          {cases.map((c, idx) => (
                            <div key={c.id} className="relative">
                              {/* Timeline indicator node */}
                              <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full bg-stone-900 border-2 border-amber-500 flex items-center justify-center text-[9px] text-amber-500 font-bold">
                                {idx + 1}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-stone-400">{c.nextHearing}</span>
                                  <span className="text-xs font-extrabold text-amber-500 truncate">{c.caseNumber}</span>
                                </div>
                                <h5 className="text-xs font-black">{c.title}</h5>
                                <p className="text-xs text-stone-400 bg-stone-900/10 p-2 rounded-lg border border-stone-800/40 font-mono">
                                  {c.notes || 'No custom notes set on this case file.'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 2: COORDINATED AI AGENTS HUB */}
                {selectedSubTab === 'assistant' && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left: Agents directory selector */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} space-y-3`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Coordinated Agents</h4>
                        <p className="text-[10px] text-stone-400">Supervisor coordinates specialized sub-agents below.</p>
                        
                        <div className="space-y-1 max-h-[350px] overflow-y-auto">
                          {/* Supervisor Coordinator */}
                          <button
                            onClick={() => {
                              setSelectedAgentId('supervisor');
                              addAuditLog('Set active chat to Supervisor Agent Coordinator', 'AI Advisory', 'info');
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs font-bold transition-all ${selectedAgentId === 'supervisor' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-[#1A1F2D]'}`}
                          >
                            <Scale className="w-4 h-4 shrink-0" />
                            <div className="truncate">
                              <p className="font-extrabold">Supervisor Agent</p>
                              <p className="text-[9px] opacity-75">Coordinating Supervisor</p>
                            </div>
                          </button>

                          {/* Specialized Agents */}
                          {SPECIALIZED_AGENTS.map(agent => (
                            <button
                              key={agent.id}
                              onClick={() => {
                                setSelectedAgentId(agent.id);
                                addAuditLog(`Activated specialized agent: ${agent.name}`, 'AI Advisory', 'info');
                              }}
                              className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs font-bold transition-all ${selectedAgentId === agent.id ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-[#1A1F2D]'}`}
                            >
                              <MessageSquare className="w-4 h-4 shrink-0 text-amber-500" />
                              <div className="truncate">
                                <p className="font-extrabold">{agent.name}</p>
                                <p className="text-[9px] opacity-75">{agent.title.substring(0, 20)}...</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Agent Brief Card */}
                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} space-y-2`}>
                        <h5 className="text-[10px] font-mono uppercase text-amber-500">Agent Capabilities</h5>
                        {selectedAgentId === 'supervisor' ? (
                          <div className="space-y-1">
                            <p className="text-xs font-black">Central Supervisor LLM</p>
                            <p className="text-[11px] text-stone-400 leading-relaxed">Aggregates reasoning, assigns legal research, flags regulatory compliance risks, and reviews client disputes.</p>
                          </div>
                        ) : (
                          (() => {
                            const agent = SPECIALIZED_AGENTS.find(a => a.id === selectedAgentId);
                            return agent ? (
                              <div className="space-y-1">
                                <p className="text-xs font-black">{agent.title}</p>
                                <p className="text-[11px] text-stone-400 leading-relaxed">{agent.description}</p>
                                <p className="text-[10px] font-bold text-amber-500 font-mono bg-[#E0E2EC]/5 p-1.5 rounded">Focus: {agent.focusArea}</p>
                              </div>
                            ) : null;
                          })()
                        )}
                      </div>
                    </div>

                    {/* Right: Live Interactive chat window */}
                    <div className="lg:col-span-3 flex flex-col h-[520px] rounded-xl border border-stone-800 bg-stone-950 overflow-hidden">
                      {/* Chat Header */}
                      <div className="px-4 py-3 bg-[#0E1017] border-b border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                            {selectedAgentId === 'supervisor' ? 'Central AI Supervisor Coordinated Channel' : `Agent Channel: ${SPECIALIZED_AGENTS.find(a => a.id === selectedAgentId)?.name}`}
                          </h4>
                        </div>
                        <button 
                          onClick={() => {
                            setChatHistory([
                              { 
                                sender: 'agent', 
                                text: 'History reset. Supervisor Agent ready for prompts.', 
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                agentName: 'Supervisor AI Agent'
                              }
                            ]);
                            addAuditLog('Cleared current AI agent conversation history', 'AI Advisory', 'info');
                          }}
                          className="text-[10px] font-bold text-stone-500 hover:text-amber-500 uppercase font-mono transition-all"
                        >
                          Clear Chat
                        </button>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.map((chat, idx) => (
                          <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl p-3.5 space-y-1.5 shadow-md ${chat.sender === 'user' ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-none' : 'bg-stone-900 text-stone-100 rounded-tl-none border border-stone-800'}`}>
                              {chat.agentName && chat.sender === 'agent' && (
                                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-amber-500 bg-stone-950/45 px-1.5 py-0.5 rounded">
                                  {chat.agentName}
                                </span>
                              )}
                              <div className="text-xs leading-relaxed markdown-body">
                                <ReactMarkdown>{chat.text}</ReactMarkdown>
                              </div>
                              <span className="block text-[9px] text-right opacity-60 font-mono">{chat.timestamp}</span>
                            </div>
                          </div>
                        ))}

                        {isAiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-xl p-3 rounded-tl-none flex items-center gap-3">
                              <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                              <span className="text-xs font-mono">Supervisor routing query to specialized legal agent...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input bar */}
                      <div className="p-3 bg-[#0E1017] border-t border-stone-800 flex gap-2">
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={`Ask ${selectedAgentId === 'supervisor' ? 'Supervisor Agent' : SPECIALIZED_AGENTS.find(a => a.id === selectedAgentId)?.name} regarding Indian legal codes...`}
                          className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-4 py-2 bg-amber-500 text-stone-950 rounded-lg hover:bg-amber-600 transition-all font-bold text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" /> Send
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 3: AI LEGAL TOOLS & DRAFTING */}
                {selectedSubTab === 'tools' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Panel: 13 AI tools selector & parameters form */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Select AI Legal Tool</h4>
                        
                        <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto">
                          {[
                            { id: 'agreement', label: 'Agreement Generator' },
                            { id: 'notice', label: 'Legal Notice Generator' },
                            { id: 'petition', label: 'Petition Generator' },
                            { id: 'affidavit', label: 'Affidavit Generator' },
                            { id: 'reply', label: 'Reply Draft Generator' },
                            { id: 'review', label: 'Contract Review' },
                            { id: 'risk', label: 'Contract Risk Analysis' },
                            { id: 'clause', label: 'AI Clause Generator' },
                            { id: 'research', label: 'AI Legal Research' },
                            { id: 'summarizer', label: 'AI Summarizer' },
                            { id: 'citation', label: 'Citation Generator' },
                            { id: 'caselaw', label: 'Case Law Search' },
                            { id: 'compliance', label: 'Compliance Checker' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setSelectedTool(t.id);
                                addAuditLog(`Activated AI Legal Tool: ${t.label}`, 'AI Tools', 'info');
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-bold transition-all ${selectedTool === t.id ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-[#1A1F2D]'}`}
                            >
                              <span>{t.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tool Parameters Form */}
                      <div className={`p-4 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">Draft Parameters</h4>
                        
                        <div className="space-y-3">
                          {selectedTool === 'agreement' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Contract Title</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Non-Disclosure Agreement" 
                                  value={toolInputs.title}
                                  onChange={(e) => setToolInputs({...toolInputs, title: e.target.value})}
                                  className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Party A</label>
                                  <input 
                                    type="text" 
                                    placeholder="Disclosing Party" 
                                    value={toolInputs.partyA}
                                    onChange={(e) => setToolInputs({...toolInputs, partyA: e.target.value})}
                                    className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Party B</label>
                                  <input 
                                    type="text" 
                                    placeholder="Receiving Party" 
                                    value={toolInputs.partyB}
                                    onChange={(e) => setToolInputs({...toolInputs, partyB: e.target.value})}
                                    className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Covenants / Special Terms</label>
                                <textarea 
                                  placeholder="Specify proprietary IP rights, non-competes, jurisdiction..." 
                                  value={toolInputs.customTerms}
                                  onChange={(e) => setToolInputs({...toolInputs, customTerms: e.target.value})}
                                  className={`w-full h-16 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {selectedTool === 'notice' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Notice Addressed To</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Delta Vendors Inc" 
                                  value={toolInputs.noticeTo}
                                  onChange={(e) => setToolInputs({...toolInputs, noticeTo: e.target.value})}
                                  className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Grievance & Remedies Demanded</label>
                                <textarea 
                                  placeholder="e.g. Failure to pay outstanding dues of ₹4,50,000 for server management despite multiple reminders." 
                                  value={toolInputs.reason}
                                  onChange={(e) => setToolInputs({...toolInputs, reason: e.target.value})}
                                  className={`w-full h-20 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {(selectedTool === 'petition' || selectedTool === 'affidavit' || selectedTool === 'reply') && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Target Court / Forum</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. City Civil Court, Dwarka, New Delhi" 
                                  value={toolInputs.courtName}
                                  onChange={(e) => setToolInputs({...toolInputs, courtName: e.target.value})}
                                  className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Grievance Facts / Solemn Affirmation</label>
                                <textarea 
                                  placeholder="Specific facts to be submitted to Court..." 
                                  value={selectedTool === 'affidavit' ? toolInputs.affidavitDeclare : toolInputs.petitionReason}
                                  onChange={(e) => setToolInputs(selectedTool === 'affidavit' ? {...toolInputs, affidavitDeclare: e.target.value} : {...toolInputs, petitionReason: e.target.value})}
                                  className={`w-full h-24 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {(selectedTool === 'review' || selectedTool === 'risk' || selectedTool === 'summarizer') && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Legal Text for Review</label>
                                <textarea 
                                  placeholder="Paste the contract clauses, statutory section texts here..." 
                                  value={toolInputs.riskText}
                                  onChange={(e) => setToolInputs({...toolInputs, riskText: e.target.value})}
                                  className={`w-full h-28 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {selectedTool === 'clause' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Clause Objective & Purpose</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Force Majeure including pandemic shutdowns" 
                                  value={toolInputs.clausePurpose}
                                  onChange={(e) => setToolInputs({...toolInputs, clausePurpose: e.target.value})}
                                  className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {(selectedTool === 'research' || selectedTool === 'citation' || selectedTool === 'caselaw') && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Research Subject / Topic</label>
                                <textarea 
                                  placeholder="e.g. Enforceability of electronic stamp papers and signatures under IT Act and Evidence Act" 
                                  value={toolInputs.researchQuery}
                                  onChange={(e) => setToolInputs({...toolInputs, researchQuery: e.target.value})}
                                  className={`w-full h-24 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          {selectedTool === 'compliance' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Compliance Scope Details</label>
                                <textarea 
                                  placeholder="e.g. Corporate startup filings, FDI regulations, environmental consents..." 
                                  value={toolInputs.complianceQuery}
                                  onChange={(e) => setToolInputs({...toolInputs, complianceQuery: e.target.value})}
                                  className={`w-full h-24 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                />
                              </div>
                            </>
                          )}

                          <button
                            onClick={handleRunTool}
                            disabled={isToolGenerating}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-black rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 shadow-md"
                          >
                            {isToolGenerating ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Supervisor AI Working...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" /> Execute AI Tool
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Output Draft viewer with digital signatures */}
                    <div className="lg:col-span-2 flex flex-col h-[520px] rounded-xl border border-stone-800 bg-stone-950 overflow-hidden">
                      <div className="px-4 py-3 bg-[#0E1017] border-b border-stone-800 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Live generated legal draft</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiGeneratedText);
                              addAuditLog('Copied AI generated draft to system clipboard', 'Document Vault', 'info');
                            }}
                            className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded transition-all"
                            title="Copy Draft"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={handleApplyDigitalSignature}
                            className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${signatureKeyApplied ? 'bg-green-500 text-stone-950' : 'bg-stone-800 text-stone-400 hover:text-white border border-stone-700'}`}
                          >
                            <FileSignature className="w-3 h-3" /> {signatureKeyApplied ? 'Digitally Signed ✓' : 'Digital Sign'}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 text-stone-200">
                        {aiGeneratedText ? (
                          <div className="space-y-4">
                            {signatureKeyApplied && (
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-[11px] text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>Secured and Signed. Digital Signature Certificate ID: <strong>DSC-982-FIPS-2026</strong> verified. Integrity check: Passed.</span>
                              </div>
                            )}
                            <div className="markdown-body prose prose-invert text-xs leading-relaxed">
                              <ReactMarkdown>{aiGeneratedText}</ReactMarkdown>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-stone-600 text-center space-y-2">
                            <FileText className="w-12 h-12 text-stone-800" />
                            <p className="text-xs font-bold">No draft generated yet</p>
                            <p className="text-[11px] max-w-xs">Fill in parameters on the left and click "Execute AI Tool" to trigger high-fidelity legal drafting.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUB TAB 4: DOCUMENT LIBRARY & TEMPLATES */}
                {selectedSubTab === 'templates' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-base font-black ${textTitle}`}>Document Library Templates</h3>
                        <p className="text-xs text-stone-400">Select any template category card to pre-populate and draft instant litigation forms.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Block: Categorized list */}
                      <div className="lg:col-span-1 space-y-3 max-h-[450px] overflow-y-auto">
                        {DOCUMENT_TEMPLATES.map(tpl => (
                          <button
                            key={tpl.id}
                            onClick={() => handleSelectTemplate(tpl)}
                            className={`w-full flex flex-col p-3.5 rounded-xl border text-left transition-all ${selectedTemplate?.id === tpl.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-stone-900/40 hover:bg-stone-900 border-stone-800'}`}
                          >
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full self-start mb-2">{tpl.category}</span>
                            <h5 className="text-xs font-extrabold text-stone-200 line-clamp-1">{tpl.name}</h5>
                            <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{tpl.description}</p>
                          </button>
                        ))}
                      </div>

                      {/* Right Block: Selected Template pre-fill parameters form */}
                      <div className="lg:col-span-2">
                        {selectedTemplate ? (
                          <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                            <div className="flex items-center justify-between border-b pb-2 border-stone-800">
                              <h4 className="text-sm font-black text-amber-500">{selectedTemplate.name}</h4>
                              <span className="text-xs text-stone-400">Template Pre-fill</span>
                            </div>

                            <p className="text-xs text-stone-400 leading-relaxed">{selectedTemplate.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedTemplate.fields.map(field => (
                                <div key={field.name} className={field.type === 'textarea' ? 'col-span-2' : 'col-span-1'}>
                                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">{field.label}</label>
                                  {field.type === 'text' ? (
                                    <input
                                      type="text"
                                      placeholder={field.placeholder}
                                      value={templateInputs[field.name] || ''}
                                      onChange={(e) => setTemplateInputs({ ...templateInputs, [field.name]: e.target.value })}
                                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                    />
                                  ) : (
                                    <textarea
                                      placeholder={field.placeholder}
                                      value={templateInputs[field.name] || ''}
                                      onChange={(e) => setTemplateInputs({ ...templateInputs, [field.name]: e.target.value })}
                                      className={`w-full h-20 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2.5 pt-2">
                              <button
                                onClick={handleGenerateFromTemplate}
                                className="px-5 py-2 bg-amber-500 text-stone-950 text-xs font-black rounded-lg hover:bg-amber-600 transition-all shadow-md"
                              >
                                Generate with AI Draft Suite
                              </button>
                              <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg hover:bg-stone-700 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[350px] bg-stone-950/20 rounded-xl border border-dashed border-stone-800/80 text-center text-stone-600">
                            <FileSpreadsheet className="w-12 h-12 mb-2 text-stone-800" />
                            <h5 className="text-xs font-bold">No template selected</h5>
                            <p className="text-[11px] max-w-xs">Select any standardized contract or litigation template from the left list to pre-populate parameters.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 5: CASE MANAGEMENT SYSTEM */}
                {selectedSubTab === 'cases' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-base font-black ${textTitle}`}>Case Management System</h3>
                        <p className="text-xs text-stone-400">Add, track, close, and review litigation case files on standard record panels.</p>
                      </div>
                      <button
                        onClick={() => setShowNewCaseModal(true)}
                        className="px-4 py-2 bg-amber-500 text-stone-950 text-xs font-black rounded-lg hover:bg-amber-600 transition-all shadow-md flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> New Case File
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Case index list */}
                      <div className="lg:col-span-1 space-y-2.5 max-h-[450px] overflow-y-auto">
                        {cases.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveCaseId(c.id);
                              addAuditLog(`Reviewed details for Case file ${c.caseNumber}`, 'Case Registry', 'info');
                            }}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${activeCaseId === c.id ? 'bg-amber-500/10 border-amber-500' : 'bg-stone-900/40 border-stone-800 hover:bg-stone-900'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">{c.caseNumber}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.status === 'Closed' ? 'bg-stone-800 text-stone-400' : 'bg-green-500/10 text-green-500'}`}>{c.status}</span>
                            </div>
                            <h5 className="text-xs font-black truncate text-stone-200">{c.title}</h5>
                            <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">Court: {c.court}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-stone-800 mt-2 text-[9px] text-stone-500">
                              <span>Opposite: {c.oppositeParty}</span>
                              <span className="font-bold text-amber-500">Hearing: {c.nextHearing}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Selected Case Detail Card */}
                      <div className="lg:col-span-2">
                        {(() => {
                          const activeCase = cases.find(c => c.id === activeCaseId);
                          return activeCase ? (
                            <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-5`}>
                              
                              {/* Header details */}
                              <div className="flex items-center justify-between border-b pb-3 border-stone-800">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-amber-500">{activeCase.caseNumber}</span>
                                    <span className="text-[10px] uppercase font-mono bg-stone-900 text-stone-400 px-2 py-0.5 rounded">{activeCase.lawyerType} case</span>
                                  </div>
                                  <h4 className="text-sm font-black text-white">{activeCase.title}</h4>
                                </div>
                                <button
                                  onClick={() => handleToggleCaseStatus(activeCase.id)}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activeCase.status === 'Closed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
                                >
                                  {activeCase.status === 'Closed' ? 'Re-open Case' : 'Archive / Close File'}
                                </button>
                              </div>

                              {/* Parameters list Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">HON'BLE COURT</p>
                                  <p className="font-bold text-stone-200 mt-0.5">{activeCase.court}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">PRESIDING JUDGE</p>
                                  <p className="font-bold text-stone-200 mt-0.5">{activeCase.judge}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">OPPOSITE PARTY</p>
                                  <p className="font-bold text-stone-200 mt-0.5">{activeCase.oppositeParty}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">OPPOSITE ADVOCATE</p>
                                  <p className="font-bold text-stone-200 mt-0.5">{activeCase.oppositeLawyer}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">NEXT COURT HEARING</p>
                                  <p className="font-bold text-amber-500 mt-0.5 font-mono">{activeCase.nextHearing}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">FINANCIAL BALANCE</p>
                                  <p className="font-bold text-green-500 mt-0.5">
                                    ₹{(activeCase.billingAmount - activeCase.paidAmount).toLocaleString()} unpaid
                                  </p>
                                </div>
                              </div>

                              {/* Interactive notes and evidence */}
                              <div className="space-y-3 pt-3 border-t border-stone-800">
                                <h5 className="text-xs font-bold text-stone-300">Internal Advocate Notes / Research Logs</h5>
                                <textarea
                                  defaultValue={activeCase.notes}
                                  onBlur={(e) => handleAddCaseNote(activeCase.id, e.target.value)}
                                  placeholder="Update internal court trial notes, precedents cited or arguments checklist. Changes save instantly on blur..."
                                  className={`w-full h-16 px-2.5 py-2 rounded text-xs ${inputBg}`}
                                />
                              </div>

                              {/* Evidence Inventory */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-stone-300">Case Evidence & Documents Inventory</h5>
                                  <span className="text-[10px] font-mono text-stone-500">Encrypted Storage Logs</span>
                                </div>
                                <div className="space-y-1">
                                  {activeCase.evidenceList.length > 0 ? (
                                    activeCase.evidenceList.map((ev, i) => (
                                      <div key={i} className="flex items-center justify-between p-2 bg-stone-900/60 rounded border border-stone-800 text-[11px]">
                                        <span className="font-mono text-stone-300 truncate max-w-[280px]">{ev.name}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] text-stone-500">By: {ev.submittedBy}</span>
                                          <span className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold scale-90">{ev.status}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-[11px] text-stone-500">No evidence documents locked yet. Generate agreements or affidavits to lock files into case vaults.</p>
                                  )}
                                </div>
                              </div>

                            </div>
                          ) : null;
                        })()}
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 6: CLIENT CRM SYSTEM */}
                {selectedSubTab === 'crm' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-base font-black ${textTitle}`}>Client CRM Pipeline</h3>
                        <p className="text-xs text-stone-400">Manage client profiles, contact cards, financial histories, PAN, and Aadhaar identifiers securely.</p>
                      </div>
                      <button
                        onClick={() => setShowNewClientModal(true)}
                        className="px-4 py-2 bg-amber-500 text-stone-950 text-xs font-black rounded-lg hover:bg-amber-600 transition-all shadow-md flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Intake Client
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Client index list */}
                      <div className="lg:col-span-1 space-y-2 max-h-[450px] overflow-y-auto">
                        {clients.map(cli => (
                          <button
                            key={cli.id}
                            onClick={() => {
                              setActiveClientId(cli.id);
                              addAuditLog(`Accessed Client confidential CRM folder for: ${cli.name}`, 'CRM Access', 'secure');
                            }}
                            className={`w-full p-3.5 rounded-xl border text-left transition-all ${activeClientId === cli.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-stone-900/40 border-stone-800 hover:bg-stone-900'}`}
                          >
                            <h5 className="text-xs font-extrabold text-stone-200">{cli.name}</h5>
                            <p className="text-[10px] text-stone-400 mt-1 truncate">{cli.email}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 mt-2 text-[9px] text-stone-500">
                              <span>PAN: {cli.pan}</span>
                              <span className="font-mono text-green-500">Verified ID</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Selected Client Profile Details */}
                      <div className="lg:col-span-2">
                        {(() => {
                          const activeClient = clients.find(c => c.id === activeClientId);
                          return activeClient ? (
                            <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-5`}>
                              
                              <div className="flex items-center justify-between border-b pb-3 border-stone-800">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black text-white">{activeClient.name}</h4>
                                  <p className="text-[10px] text-stone-400 font-mono">PAN: {activeClient.pan} | Aadhaar: {activeClient.aadhaar}</p>
                                </div>
                                <span className="text-[9px] font-mono bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 uppercase font-black">
                                  KyC Verified
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">EMAIL ADDRESS</p>
                                  <p className="font-bold text-stone-200 mt-0.5 truncate">{activeClient.email}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-stone-400">PHONE NUMBER</p>
                                  <p className="font-bold text-stone-200 mt-0.5">{activeClient.phone}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px] font-mono text-stone-400">RESIDENTIAL / REGISTERED OFFICE ADDRESS</p>
                                  <p className="font-bold text-stone-200 mt-0.5 leading-relaxed">{activeClient.address}</p>
                                </div>
                              </div>

                              {/* Active cases matching */}
                              <div className="space-y-2 pt-3 border-t border-stone-800">
                                <h5 className="text-xs font-bold text-stone-300">Associated Litigation Case Files</h5>
                                <div className="space-y-1">
                                  {cases.filter(c => c.id === activeClient.activeCases[0] || c.oppositeParty.includes(activeClient.name)).map(c => (
                                    <div key={c.id} className="p-2.5 bg-[#0E1017]/60 rounded border border-stone-800 text-[11px] flex items-center justify-between">
                                      <span className="font-bold text-amber-500">{c.caseNumber}</span>
                                      <span className="text-stone-300 truncate max-w-[200px]">{c.title}</span>
                                      <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold scale-90">{c.status}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Historical transaction lists */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-stone-300">Payments & Receipts Ledger</h5>
                                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                                  {activeClient.payments.map((p, i) => (
                                    <div key={i} className="p-2 bg-stone-900/60 rounded border border-stone-800 text-[11px] flex items-center justify-between font-mono">
                                      <span className="text-stone-400">{p.date}</span>
                                      <span className="text-stone-300">{p.purpose}</span>
                                      <span className="text-green-500 font-bold">₹{p.amount.toLocaleString()}</span>
                                      <span className={`px-1 rounded text-[9px] font-bold ${p.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          ) : null;
                        })()}
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 7: COURT MANAGEMENT & CALENDAR */}
                {selectedSubTab === 'calendar' && (
                  <div className="space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0E1017] rounded-xl border border-stone-800">
                      <div>
                        <h3 className="text-sm font-black text-amber-500 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-amber-500 animate-pulse" /> Supreme Court Cause Diary & Sync Portal
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">
                          Synchronize court cause lists, hearing schedules, and adjournments directly with registered advocate diaries.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleTriggerGoogleSync}
                        disabled={syncStatus === 'syncing'}
                        className="px-5 py-2.5 bg-amber-500 text-stone-950 font-black text-xs rounded-xl hover:bg-amber-600 transition-all shadow-md flex items-center gap-2 self-start md:self-auto shrink-0"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        {syncStatus === 'idle' ? 'Sync Google Calendar & Cause Lists' : syncStatus === 'syncing' ? 'Authorizing OAuth Sync...' : 'Sync Successful ✓'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Panel: Log Court Adjournment Form */}
                      <div className="lg:col-span-1">
                        <form onSubmit={handleAddAdjournment} className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Record Court Adjournment</h4>
                          
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Target Case File</label>
                            <select
                              value={newAdjournmentCaseId}
                              onChange={(e) => setNewAdjournmentCaseId(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                              required
                            >
                              <option value="">Select Case File...</option>
                              {cases.map(c => (
                                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title.substring(0, 30)}...</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Next Hearing Date fixed by Judge</label>
                            <input
                              type="date"
                              value={newAdjournmentDate}
                              onChange={(e) => setNewAdjournmentDate(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-lg transition-all border border-stone-700 shadow"
                          >
                            Record Adjournment & Update Timeline
                          </button>
                        </form>
                      </div>

                      {/* Right Panel: Upcoming Hearing schedules */}
                      <div className="lg:col-span-2">
                        <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">Active Cause List Schedules</h4>
                          
                          <div className="space-y-2.5">
                            {cases.map(c => (
                              <div key={c.id} className="p-3 bg-stone-900/60 rounded-lg border border-stone-800 flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">{c.caseNumber}</span>
                                  <h5 className="text-xs font-black text-stone-200 line-clamp-1">{c.title}</h5>
                                  <p className="text-[10px] text-stone-400 truncate">Bench: {c.judge} | Court: {c.court}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] font-mono text-amber-500 font-extrabold">{c.nextHearing}</p>
                                  <p className="text-[9px] text-stone-500 uppercase">Docket Listing</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 8: BILLING, INVOICING & REPORTS */}
                {selectedSubTab === 'billing' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Billing Metrics */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4 lg:col-span-1`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Practice Accounts Summary</h4>
                        
                        <div className="space-y-3.5 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400">Total Practice Invoice Dues:</span>
                            <span className="font-mono font-bold text-white">
                              ₹{cases.reduce((sum, c) => sum + c.billingAmount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-400">Total Revenue Recovered:</span>
                            <span className="font-mono font-bold text-green-500">
                              ₹{cases.reduce((sum, c) => sum + c.paidAmount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-stone-800 pt-2 font-bold">
                            <span className="text-stone-300">Outstanding Receivables:</span>
                            <span className="font-mono text-red-400">
                              ₹{cases.reduce((sum, c) => sum + (c.billingAmount - c.paidAmount), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Payment links simulator */}
                        <div className="pt-4 border-t border-stone-800 space-y-2">
                          <h5 className="text-[10px] uppercase font-mono text-amber-500">Fast UPI Payment Link</h5>
                          <p className="text-[10px] text-stone-400">Generate instantly to send WhatsApp payment links to client.</p>
                          <button
                            onClick={() => {
                              addAuditLog('Generated rapid UPI payment request link for WhatsApp delivery', 'Invoicing', 'info');
                              alert('Rapid UPI payment checkout link generated: upi://pay?pa=rba.lawfirm@okaxis&pn=RBA-LawyerOS&am=50000');
                            }}
                            className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs"
                          >
                            Generate UPI Request Link
                          </button>
                        </div>
                      </div>

                      {/* Case Invoices Lists */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4 lg:col-span-2`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">Case Invoices & Retainers Ledger</h4>
                        
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                          {cases.map(c => (
                            <div key={c.id} className="p-3 bg-stone-900/60 rounded-lg border border-stone-800 flex items-center justify-between text-xs">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">{c.caseNumber}</span>
                                <h5 className="font-bold text-stone-200 line-clamp-1">{c.title}</h5>
                                <p className="text-[10px] text-stone-500">Outstanding: ₹{(c.billingAmount - c.paidAmount).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-green-500">₹{c.paidAmount.toLocaleString()} recovered</p>
                                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold ${c.paidAmount >= c.billingAmount ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {c.paidAmount >= c.billingAmount ? 'Paid' : 'Unpaid Balance'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUB TAB 9: WORKSPACE CONFIG, SECURITY & DIGITAL SIGNATURES */}
                {selectedSubTab === 'security' && (
                  <div className="space-y-6">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* HSM Crypto Management */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-500" /> Cryptographic HSM Vault
                        </h4>
                        
                        <p className="text-xs text-stone-400 leading-relaxed">
                          All drafted legal notices, NDA templates, and confidential PAN/Aadhaar indices are encrypted client-side using FIPS 140-2 hardware security module (HSM) keys before hitting Google Cloud servers.
                        </p>

                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-300">HSM Status:</span>
                            <span className="font-mono font-bold text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Online</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-300">Enforced Algorithm:</span>
                            <span className="font-mono text-stone-400">AES-GCM-256 (SHA-384)</span>
                          </div>
                        </div>

                        <button
                          onClick={handleRotateHsmKeys}
                          disabled={hsmStatus === 'rotated'}
                          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold transition-all border border-stone-700 shadow"
                        >
                          {hsmStatus === 'rotated' ? 'Rotating cryptographic schemas...' : 'Rotate HSM Security Keys'}
                        </button>
                      </div>

                      {/* RBAC Role configurations */}
                      <div className={`p-5 rounded-xl border ${borderCol} ${cardBg} space-y-4`}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">Role-Based Access Control (RBAC)</h4>
                        
                        <p className="text-xs text-stone-400">
                          Configure access privileges for advocates, partners, clerks and client accounts.
                        </p>

                        <div className="space-y-2 max-h-[180px] overflow-y-auto">
                          {SECURITY_ROLES.map((role, idx) => (
                            <div key={idx} className="p-2.5 bg-stone-900/60 rounded border border-stone-800 text-[11px] space-y-1">
                              <p className="font-bold text-amber-500">{role.name}</p>
                              <p className="text-stone-400 leading-relaxed">{role.capabilities}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* AUDIT LOG FOOTER STATUS LIST (Always rendered for security monitoring) */}
              <div className="mt-8 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C93A8] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> 
                    Practice Auditing Logs – Regulatory Security compliance ledger
                  </span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('lawyer_os_audit_logs');
                      setAuditLogs([]);
                    }}
                    className="text-[9px] text-stone-500 hover:text-red-400 uppercase font-mono"
                  >
                    Clear Logs
                  </button>
                </div>
                
                <div className="bg-[#0B0C10] rounded-xl border border-stone-800 p-2.5 max-h-[140px] overflow-y-auto space-y-1.5">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono p-2 bg-stone-900/30 rounded border border-stone-800/60 gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8C93A8] shrink-0">{log.timestamp}</span>
                        <span className="font-extrabold text-amber-500 shrink-0">[{log.category}]</span>
                        <span className="text-stone-300">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-stone-500 shrink-0">Operator: {log.user}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase shrink-0 scale-90 ${log.severity === 'secure' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : log.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-[#E0E2EC]/5 text-[#8C93A8]'}`}>
                          {log.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* NEW CASE FILING MODAL */}
      <AnimatePresence>
        {showNewCaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg p-6 rounded-2xl border ${borderCol} ${cardBg} shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-stone-800">
                <h3 className="text-sm font-black text-amber-500">Create New Legal Case File Record</h3>
                <button 
                  onClick={() => setShowNewCaseModal(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Case Number / Docket ID</label>
                    <input
                      type="text"
                      placeholder="e.g. CP/204(ND)/2026"
                      value={newCaseData.caseNumber}
                      onChange={(e) => setNewCaseData({...newCaseData, caseNumber: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Litigation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Reliance Tech v. Delta Inc"
                      value={newCaseData.title}
                      onChange={(e) => setNewCaseData({...newCaseData, title: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Hon'ble Court</label>
                    <input
                      type="text"
                      placeholder="e.g. National Company Law Tribunal"
                      value={newCaseData.court}
                      onChange={(e) => setNewCaseData({...newCaseData, court: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Presiding Judge</label>
                    <input
                      type="text"
                      placeholder="e.g. Justice Ramalingam Sudhakar"
                      value={newCaseData.judge}
                      onChange={(e) => setNewCaseData({...newCaseData, judge: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Opposite Respondent Party</label>
                    <input
                      type="text"
                      placeholder="e.g. Delta Vendors Inc"
                      value={newCaseData.oppositeParty}
                      onChange={(e) => setNewCaseData({...newCaseData, oppositeParty: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Opposite Lead Advocate</label>
                    <input
                      type="text"
                      placeholder="e.g. Harish Salve & Assoc."
                      value={newCaseData.oppositeLawyer}
                      onChange={(e) => setNewCaseData({...newCaseData, oppositeLawyer: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Hearing Date</label>
                    <input
                      type="date"
                      value={newCaseData.nextHearing}
                      onChange={(e) => setNewCaseData({...newCaseData, nextHearing: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Billing Retainer (₹)</label>
                    <input
                      type="number"
                      value={newCaseData.billingAmount}
                      onChange={(e) => setNewCaseData({...newCaseData, billingAmount: Number(e.target.value)})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Initially Paid (₹)</label>
                    <input
                      type="number"
                      value={newCaseData.paidAmount}
                      onChange={(e) => setNewCaseData({...newCaseData, paidAmount: Number(e.target.value)})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Internal Trial strategy notes</label>
                  <textarea
                    placeholder="Describe pleadings arguments and precedents to research..."
                    value={newCaseData.notes}
                    onChange={(e) => setNewCaseData({...newCaseData, notes: e.target.value})}
                    className={`w-full h-16 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-lg transition-all"
                  >
                    File Case
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCaseModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW CLIENT CRM INTAKE MODAL */}
      <AnimatePresence>
        {showNewClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg p-6 rounded-2xl border ${borderCol} ${cardBg} shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-stone-800">
                <h3 className="text-sm font-black text-amber-500">Intake New Client Profile</h3>
                <button 
                  onClick={() => setShowNewClientModal(false)}
                  className="text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Full Client Name / Entity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sneha Reddy"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. client@email.com"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 99000 00000"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Aadhaar ID (Masked)</label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-4567"
                      value={newClientData.aadhaar}
                      onChange={(e) => setNewClientData({...newClientData, aadhaar: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">PAN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={newClientData.pan}
                      onChange={(e) => setNewClientData({...newClientData, pan: e.target.value})}
                      className={`w-full px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Permanent Residential / Registered Office Address</label>
                  <textarea
                    placeholder="Complete corporate HQ address or resident description..."
                    value={newClientData.address}
                    onChange={(e) => setNewClientData({...newClientData, address: e.target.value})}
                    className={`w-full h-16 px-2.5 py-1.5 rounded text-xs ${inputBg}`}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-lg transition-all"
                  >
                    Register CRM Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
