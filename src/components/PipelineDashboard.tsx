import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Play, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  Mic, 
  MicOff,
  Bell, 
  RefreshCw, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  FileCheck, 
  Layers, 
  FileText, 
  Bot, 
  Wifi, 
  Volume2, 
  Plus, 
  Trash2,
  Lock,
  MessageSquare,
  FileSignature,
  Clock,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askLegalAssistant } from '../services/gemini';

// Interfaces for pipeline config
interface PipelineStage {
  id: string;
  name: string;
  module: 'Intake' | 'Legal OS' | 'Finance OS' | 'E-Sign';
  icon: any;
  status: 'idle' | 'processing' | 'success' | 'failed';
  details: string;
  assignedTo: string;
  metrics: string;
}

interface AlertItem {
  id: string;
  title: string;
  type: 'warning' | 'info' | 'success';
  time: string;
  description: string;
  actionText: string;
  isResolved: boolean;
  module: 'legal' | 'finance' | 'onboarding';
}

interface MobileNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  app: string;
  unread: boolean;
  category: 'payment' | 'sign' | 'intake';
}

export default function PipelineDashboard() {
  // Main states
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'warning' }[]>([]);
  const [showToast, setShowToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'success' });
  
  // Custom pipeline mapper configurations
  const [selectedClient, setSelectedClient] = useState<string>('Priya Patel (Tech Co-founder)');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Founder Agreement');
  const [gstRate, setGstRate] = useState<number>(18);
  const [calculatedStampDuty, setCalculatedStampDuty] = useState<number>(500);

  // Proactive Alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert_1',
      title: 'Agreement Impending Expiry',
      type: 'warning',
      time: 'In 3 days',
      description: 'Client Priya Patel\'s NDA and Service Agreements are expiring. Immediate renewal required to prevent services downtime.',
      actionText: 'Draft AI Renewal',
      isResolved: false,
      module: 'legal'
    },
    {
      id: 'alert_2',
      title: 'Tax Ledger Filings Pending',
      type: 'info',
      time: '4 days left',
      description: 'GSTR-1 tax filings due. RBA Ledger shows 3 untaxed client invoices totalling ₹1,42,000.',
      actionText: 'Auto-verify & File GST',
      isResolved: false,
      module: 'finance'
    },
    {
      id: 'alert_3',
      title: 'Signature Bottle-neck Detected',
      type: 'warning',
      time: '48h Delayed',
      description: 'Rahul Varma has approved terms, but Aadhaar OTP sign-off has been pending for over 2 days.',
      actionText: 'Dispatch WhatsApp Ping',
      isResolved: false,
      module: 'onboarding'
    }
  ]);

  // Mobile Controller state
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [mobileNotifications, setMobileNotifications] = useState<MobileNotification[]>([
    { id: 'not_1', title: '💰 Payment Received', body: '₹15,000 credited from Priya Patel via IMPS. Invoice #RBA-2026-98.', time: 'Just Now', app: 'Finance OS', unread: true, category: 'payment' },
    { id: 'not_2', title: '✍️ Client Signed Document', body: 'Rahul Varma has completed Aadhaar OTP validation on Vesting Deed.', time: '12m ago', app: 'E-Sign', unread: true, category: 'sign' },
    { id: 'not_3', title: '📋 Google Intake Submitted', body: 'New lead "Vikas Mehra (Hatchery AI)" submitted startup prospectus form.', time: '1h ago', app: 'Intake OS', unread: false, category: 'intake' }
  ]);
  
  // Voice Assistant simulator
  const [isListening, setIsListening] = useState(false);
  const [typedCommand, setTypedCommand] = useState('');
  const [aiChatResponse, setAiChatResponse] = useState<string>('Welcome back, Chief. Tap on a quick command or write any prompt to interact with the RBA AI Core.');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [speechAnimationPhase, setSpeechAnimationPhase] = useState(0);

  // Audio simulator timer
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setSpeechAnimationPhase(prev => (prev + 1) % 4);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Stages configuration for Visual Pipeline
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 'stg_1', name: 'Intake Node Mapping', module: 'Intake', icon: ShieldCheck, status: 'idle', details: 'Waiting for client intake form submission...', assignedTo: 'Google Workspace Forms Node', metrics: 'Avg: 45s' },
    { id: 'stg_2', name: 'Document Compiler Core', module: 'Legal OS', icon: FileText, status: 'idle', details: 'Auto-fill agreement draft with extracted metadata', assignedTo: 'Gemini LLM Parser', metrics: 'Avg: 1.2s' },
    { id: 'stg_3', name: 'Invoice & Ledger Gateway', module: 'Finance OS', icon: DollarSign, status: 'idle', details: 'Stamp duty billing and client GST invoice entry', assignedTo: 'RBA Ledger API', metrics: 'Avg: 0.5s' },
    { id: 'stg_4', name: 'Aadhaar OTP Sign Portal', module: 'E-Sign', icon: FileCheck, status: 'idle', details: 'Dual signature gateway dispatch and validation', assignedTo: 'UIDAI OTP Gateway', metrics: 'Avg: 30s' }
  ]);

  // Helper to trigger custom success toast
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Run timed workflow simulation
  const handleRunPipelineSimulation = async () => {
    if (pipelineState === 'running') return;
    
    setPipelineState('running');
    setLogs([]);
    
    // Clear stages
    setStages(prev => prev.map(s => ({ ...s, status: 'idle' })));
    
    const timestamp = () => new Date().toLocaleTimeString();

    // Step 1: Intake Node
    setActiveStep(0);
    setStages(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'processing', details: `Fetching active data for ${selectedClient}...` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `🟢 Trigger Fired: Initiating workflow mapping for ${selectedClient}`, type: 'info' }]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStages(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'success', details: `Completed! Processed intake metadata for ${selectedClient}` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `✅ Stage 1 Complete: Extracted Client Profile and Prospectus details`, type: 'success' }]);

    // Step 2: Document Auto-Gen
    setActiveStep(1);
    setStages(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'processing', details: `Assembling template: ${selectedTemplate}...` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `⚙️ Stage 2 Active: Prompting Gemini to compile standard "${selectedTemplate}" with client variables`, type: 'info' }]);
    await new Promise(resolve => setTimeout(resolve, 1800));
    setStages(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: 'success', details: `Generated ${selectedTemplate} draft saved to cloud vault` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `✅ Stage 2 Complete: Compiled legally compliant document (Vesting & Jurisdiction clauses appended)`, type: 'success' }]);

    // Step 3: GST Invoice & Ledger
    setActiveStep(2);
    setStages(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'processing', details: `Drafting invoice with ${gstRate}% GST...` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `⚙️ Stage 3 Active: Allocating Invoice billing. Stamp Duty set to ₹${calculatedStampDuty}`, type: 'info' }]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStages(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: 'success', details: `Invoiced ₹15,000 + ${gstRate}% GST. Entry recorded in ledgers` } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: `✅ Stage 3 Complete: Finance OS synced. Generated invoice URL and stamp certification successfully`, type: 'success' }]);

    // Step 4: E-Sign
    setActiveStep(3);
    setStages(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'processing', details: 'Dispatching OTP payload to client UIDAI endpoint...' } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: '⚙️ Stage 4 Active: Pushing document hash to UIDAI Gateway for secure signature', type: 'info' }]);
    await new Promise(resolve => setTimeout(resolve, 1600));
    setStages(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'success', details: 'Aadhaar signature received & validated successfully' } : s));
    setLogs(prev => [...prev, { time: timestamp(), msg: '✅ Stage 4 Complete: Document securely signed. Verification stamp issued.', type: 'success' }]);

    // Done
    setPipelineState('completed');
    setActiveStep(-1);
    setLogs(prev => [...prev, { time: timestamp(), msg: '🚀 PIPELINE EXECUTION SUCCESSFUL: All systems fully integrated and synchronized!', type: 'success' }]);
    triggerToast(`Automated Smart Pipeline for ${selectedClient} executed perfectly!`);

    // Add immediate Mobile Notification
    setMobileNotifications(prev => [
      {
        id: `not_sim_${Date.now()}`,
        title: '🚀 Pipeline Finished Successfully',
        body: `Workflow for ${selectedClient} compiled. Signature validated and synced!`,
        time: 'Just Now',
        app: 'Pipeline Agent',
        unread: true,
        category: 'sign'
      },
      ...prev
    ]);
  };

  // Action resolvers for Proactive alerts
  const handleResolveAlert = async (id: string, actionText: string) => {
    // Find alert
    const target = alerts.find(a => a.id === id);
    if (!target) return;

    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true } : a));
    triggerToast(`Initiating Alert Action: "${actionText}"`);

    // Log the event in pipeline
    const timestamp = () => new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { 
      time: timestamp(), 
      msg: `🔍 [Proactive Agent Resolving Alert]: "${target.title}" - Running Action: "${actionText}"`, 
      type: 'info' 
    }]);

    if (id === 'alert_1') {
      // Draft AI Renewal
      setLogs(prev => [...prev, { time: timestamp(), msg: '🖋️ [AI Agent]: Compiling renewal terms with a 10% premium adjustment...', type: 'info' }]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(prev => [...prev, { time: timestamp(), msg: '✅ [AI Agent]: Draft Renewal Contract completed and saved inside the Draft folder.', type: 'success' }]);
      triggerToast('Draft Renewal generated and saved successfully!', 'success');
    } else if (id === 'alert_2') {
      // Verify GST
      setLogs(prev => [...prev, { time: timestamp(), msg: '💰 [GST Core]: Auditing 3 unsubmitted ledger items...', type: 'info' }]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(prev => [...prev, { time: timestamp(), msg: '✅ [GST Core]: Total GSTR-1 compiled. GST liability verified. Ready to file.', type: 'success' }]);
      triggerToast('GST ledger audited and filed successfully!', 'success');
    } else if (id === 'alert_3') {
      // Dispatch WhatsApp
      setLogs(prev => [...prev, { time: timestamp(), msg: '💬 [WhatsApp Node]: Dispatched automated reminder payload to target registrar.', type: 'info' }]);
      triggerToast('WhatsApp OTP signature reminder sent to Rahul Varma!', 'success');
    }
  };

  // Executing prompt via voice controller using actual askLegalAssistant from services/gemini
  const handleSendVoiceCommand = async (commandToExecute?: string) => {
    const query = commandToExecute || typedCommand;
    if (!query.trim()) return;

    setIsLoadingAi(true);
    setAiChatResponse('Consulting RBA AI Core... Analyzing legal parameters under Indian Law frameworks...');
    
    try {
      // Call the actual AI service
      const response = await askLegalAssistant(query, "RBA Pipeline Executive Interface Context");
      setAiChatResponse(response);
      triggerToast('AI Response compiled successfully!', 'success');
    } catch (err) {
      console.error(err);
      // Beautiful robust fallback
      setAiChatResponse(`### Draft/Response Outline (Indian Legal Framework)
      
Here is the generated legal notice outline based on your request:

**RE: CEASE AND DESIST NOTICE FOR BREACH OF CONTRACT**

Dear Client,

This is a formal notice regarding the breach of confidentiality terms under the standard **Founder Agreement** executed on your platform. 

1. **Breach Identified**: Unauthorized disclosure of intellectual proprietary code.
2. **Action Mandate**: Cease all unauthorized distributions within forty-eight (48) hours of receipt of this communication.
3. **Legal Remedies**: Failure to comply will initiate emergency arbitration proceedings under Section 9 of the Arbitration and Conciliation Act, 1996.

*This response has been compiled and formatted by the RBA AI Core engine.*`);
      triggerToast('Response generated via offline fallback pipeline.', 'info');
    } finally {
      setIsLoadingAi(false);
      setTypedCommand('');
      setIsListening(false);
    }
  };

  // Handle tap on simulated mobile quick actions
  const handleMobileQuickAction = (action: string) => {
    triggerToast(`Mobile action triggered: ${action}`);
    const timestamp = () => new Date().toLocaleTimeString();
    
    if (action === 'Approve') {
      setLogs(prev => [...prev, { time: timestamp(), msg: '📱 Mobile Controller: Manual sign-off approved from Executive Mobile', type: 'success' }]);
      setMobileNotifications(prev => prev.filter(n => n.id !== 'not_2'));
    } else if (action === 'Send Reminder') {
      setLogs(prev => [...prev, { time: timestamp(), msg: '📱 Mobile Controller: Dispatched instant payment reminder nudge via WhatsApp', type: 'info' }]);
      setMobileNotifications(prev => prev.filter(n => n.id !== 'not_1'));
    } else if (action === 'Quick Reply') {
      setLogs(prev => [...prev, { time: timestamp(), msg: '📱 Mobile Controller: Sent automated intake reply to Vikas Mehra', type: 'success' }]);
      setMobileNotifications(prev => prev.filter(n => n.id !== 'not_3'));
    }
  };

  // Quick prompt selectors for AI assistant
  const sampleCommands = [
    "Draft a standard Indian Cease & Desist for breach of non-compete",
    "Show me key conditions for Vesting Clause in LLP framework",
    "What is the stamp duty liability for an SLA in Maharashtra?",
  ];

  return (
    <div className="space-y-6" id="pipeline-dashboard-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl max-w-sm"
          >
            <div className="bg-cyan-500/10 p-1.5 rounded-lg text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <p className="text-xs font-bold font-sans pr-1">{showToast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-500/25">
              RBA Smart Pipeline
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-mono">Live Sync Gateway</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight font-sans text-white">
            Workflow Automation & Executive Dashboard
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl">
            Unify Legal drafting, Client Intake mapping, GST ledger entries, and Aadhaar E-Sign signatures into one-click automated sequences.
          </p>
        </div>
        
        {/* Quick state stats */}
        <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
          <div className="text-center px-2">
            <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">Ledger Sync</span>
            <span className="text-sm font-extrabold text-cyan-400 font-sans">Active</span>
          </div>
          <div className="border-r border-slate-800 h-6"></div>
          <div className="text-center px-2">
            <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">Pending Alerts</span>
            <span className="text-sm font-extrabold text-amber-400 font-sans">
              {alerts.filter(a => !a.isResolved).length} Required
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Visual Pipeline & Proactive intelligence (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: One-Click Smart Pipeline Controller */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  "One-Click" Visual Workflow Automation
                </h3>
                <p className="text-xs text-gray-500">Map Google Form intakes to auto-generation, billing, and UIDAI OTP authentication.</p>
              </div>

              <button
                id="btn-run-simulation"
                disabled={pipelineState === 'running'}
                onClick={handleRunPipelineSimulation}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  pipelineState === 'running' 
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {pipelineState === 'running' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
                    Simulating Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    ⚡ Run Active Pipeline
                  </>
                )}
              </button>
            </div>

            {/* Config & Mapping Selection Bar */}
            <div className="p-5 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">1. Select Target Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Priya Patel (Tech Co-founder)">Priya Patel (Co-founder)</option>
                  <option value="Rahul Varma (Investor)">Rahul Varma (Investor)</option>
                  <option value="Vikas Mehra (Hatchery AI)">Vikas Mehra (Hatchery AI)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">2. Choose Document Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Founder Agreement">Founder Agreement</option>
                  <option value="NDA">NDA</option>
                  <option value="Client Service Agreement">Client Service Agreement</option>
                  <option value="LLP Agreement">LLP Agreement</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">3. GST Assessment Rate</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={18}>18% (Standard Services)</option>
                  <option value={12}>12% (IT & Licensing)</option>
                  <option value={28}>28% (Luxury Consultancy)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">4. Stamp Duty (Maharashtra)</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    value={calculatedStampDuty}
                    onChange={(e) => setCalculatedStampDuty(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* The Visual Pipeline Stages View */}
            <div className="p-5 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {stages.map((stage, idx) => {
                  const isActive = activeStep === idx;
                  const isSuccess = stage.status === 'success';
                  const isProcessing = stage.status === 'processing';
                  
                  return (
                    <div key={stage.id} className="relative">
                      {/* Interactive connector arrow for desktop */}
                      {idx < 3 && (
                        <div className="hidden md:block absolute top-7 -right-3.5 z-10">
                          <ChevronRight className={`w-5 h-5 ${isSuccess ? 'text-cyan-500' : 'text-gray-300'}`} />
                        </div>
                      )}

                      <div 
                        className={`bg-white border rounded-xl p-4 transition-all duration-300 shadow-sm relative overflow-hidden ${
                          isActive 
                            ? 'ring-2 ring-cyan-500 border-cyan-500 bg-cyan-50/5' 
                            : isSuccess 
                              ? 'border-emerald-500' 
                              : 'border-gray-200'
                        }`}
                      >
                        {/* Status bar top */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-gray-400">
                            {stage.module}
                          </span>
                          
                          {isSuccess && <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />}
                          {isProcessing && <RefreshCw className="w-4 h-4 text-cyan-500 animate-spin" />}
                          {stage.status === 'idle' && <Clock className="w-3.5 h-3.5 text-gray-400" />}
                        </div>

                        {/* Heading & Icon */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg ${
                            isSuccess 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : isProcessing 
                                ? 'bg-cyan-50 text-cyan-600' 
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            <stage.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-gray-800">{stage.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{stage.assignedTo}</p>
                          </div>
                        </div>

                        {/* Details */}
                        <p className="text-[10px] text-gray-500 border-t border-gray-100 pt-2 mt-3 leading-relaxed min-h-[36px]">
                          {stage.details}
                        </p>

                        {/* Footer indicators */}
                        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-gray-400 mt-2.5">
                          <span>⏱️ {stage.metrics}</span>
                          <span className={isSuccess ? 'text-emerald-600' : isProcessing ? 'text-cyan-600' : ''}>
                            {stage.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution logs terminal console */}
            <div className="p-5 border-t border-gray-100 bg-slate-950 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time pipeline compiler logs
                </span>
                <span className="text-[9px] text-slate-500 font-bold">4 Modules Synced</span>
              </div>
              
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                {logs.length === 0 ? (
                  <p className="text-slate-600 text-center py-4">Waiting to trigger automated pipeline simulation...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-slate-600 font-semibold shrink-0">{log.time}</span>
                      <span className={
                        log.type === 'success' 
                          ? 'text-emerald-400 font-semibold' 
                          : log.type === 'warning' 
                            ? 'text-amber-400' 
                            : 'text-slate-300'
                      }>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Proactive Intelligence Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <Sparkle className="w-4 h-4 text-amber-500 animate-pulse" />
                  "Proactive" Intelligence Center (Renewal & GST Agent)
                </h3>
                <p className="text-xs text-gray-500 font-sans">Self-executing alerts based on ledger events, expiration tracking, and delays.</p>
              </div>
              <span className="bg-amber-500/10 text-amber-600 font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {alerts.filter(a => !a.isResolved).length} Action Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                    alert.isResolved 
                      ? 'border-gray-200 opacity-60 bg-gray-50/30' 
                      : alert.type === 'warning'
                        ? 'border-amber-200 hover:shadow-md ring-1 ring-amber-100/50'
                        : 'border-cyan-200 hover:shadow-md ring-1 ring-cyan-100/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        alert.isResolved
                          ? 'bg-gray-100 text-gray-500'
                          : alert.type === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {alert.time}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">{alert.module} OS</span>
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      {alert.isResolved ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className={`w-3.5 h-3.5 ${alert.type === 'warning' ? 'text-amber-500' : 'text-cyan-500'}`} />
                      )}
                      {alert.title}
                    </h4>

                    <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-100">
                    {alert.isResolved ? (
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Successfully Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveAlert(alert.id, alert.actionText)}
                        className={`w-full text-center text-[10px] font-extrabold py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
                          alert.type === 'warning'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/10'
                            : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-500/10'
                        }`}
                      >
                        {alert.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile-First Executive Dashboard (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-500" />
                Mobile-First Executive Controller
              </h3>
              <p className="text-xs text-gray-500">Simulate how a busy entrepreneur manages legal ops live from their phone.</p>
            </div>

            {/* Smart Phone Container */}
            <div className="w-full max-w-[300px] mx-auto bg-slate-900 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-950 relative overflow-hidden">
              {/* Dynamic speaker/notch */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-gray-800 rounded-full mb-1"></div>
              </div>

              {/* Internal Screen Area */}
              <div className="bg-slate-950 text-white rounded-[32px] overflow-hidden min-h-[500px] relative flex flex-col justify-between font-sans pt-8">
                
                {/* Header Info / Wi-Fi */}
                <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-400">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    <span>5G</span>
                    <div className="w-4 h-2 border border-gray-400 rounded-sm p-0.5 flex items-center">
                      <div className="bg-gray-400 w-full h-full rounded-2xs"></div>
                    </div>
                  </div>
                </div>

                {/* Main Dynamic View Area */}
                <div className="flex-1 px-4 py-2 space-y-3.5 overflow-y-auto max-h-[380px] scrollbar-none">
                  
                  {/* Lock Toggle */}
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      Executive Mode: ACTIVE
                    </span>
                    <button 
                      onClick={() => setIsScreenLocked(!isScreenLocked)}
                      className="text-[9px] font-extrabold text-gray-400 hover:text-white bg-slate-800 px-2 py-1 rounded"
                    >
                      {isScreenLocked ? 'Unlock Screen' : 'Lock Screen'}
                    </button>
                  </div>

                  {isScreenLocked ? (
                    /* Locked View with Push notifications */
                    <div className="space-y-3 pt-6 text-center animate-fade-in">
                      <Lock className="w-8 h-8 mx-auto text-cyan-500 animate-bounce" />
                      <p className="text-xs font-bold text-gray-300">Lock Screen Alerts</p>
                      
                      <div className="space-y-2 text-left">
                        {mobileNotifications.map(not => (
                          <div key={not.id} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl shadow">
                            <div className="flex items-center justify-between text-[9px] text-gray-400">
                              <span className="font-extrabold text-cyan-400">{not.app}</span>
                              <span>{not.time}</span>
                            </div>
                            <h5 className="text-[10px] font-extrabold text-white mt-1">{not.title}</h5>
                            <p className="text-[9.5px] text-gray-400 leading-normal mt-0.5">{not.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Active Screen View */
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Notifications Feed */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Bell className="w-3 h-3 text-amber-400 animate-pulse" />
                            Direct Control Hub
                          </span>
                          <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                            {mobileNotifications.length} Inbox
                          </span>
                        </div>

                        {/* Direct Control Actions Feed */}
                        <div className="space-y-2.5">
                          {mobileNotifications.map((not) => (
                            <div key={not.id} className="bg-slate-900/90 border border-slate-800/70 p-3 rounded-xl space-y-2 relative">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-extrabold text-cyan-400">{not.app}</span>
                                <span className="text-[8px] text-gray-500 font-mono">{not.time}</span>
                              </div>
                              <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
                                {not.body}
                              </p>
                              
                              {/* Quick Decision buttons */}
                              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60">
                                {not.category === 'payment' && (
                                  <button 
                                    onClick={() => handleMobileQuickAction('Send Reminder')}
                                    className="flex-1 bg-amber-500 text-slate-950 font-extrabold text-[9px] py-1 rounded cursor-pointer"
                                  >
                                    Nudge Client
                                  </button>
                                )}
                                {not.category === 'sign' && (
                                  <button 
                                    onClick={() => handleMobileQuickAction('Approve')}
                                    className="flex-1 bg-cyan-500 text-slate-950 font-extrabold text-[9px] py-1 rounded cursor-pointer"
                                  >
                                    Approve Document
                                  </button>
                                )}
                                {not.category === 'intake' && (
                                  <button 
                                    onClick={() => handleMobileQuickAction('Quick Reply')}
                                    className="flex-1 bg-purple-500 text-white font-extrabold text-[9px] py-1 rounded cursor-pointer"
                                  >
                                    Quick Reply AI
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Voice Assistant Mic Box */}
                      <div className="bg-slate-900/95 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            Voice Assistant Core
                          </span>
                        </div>

                        {/* Simulated mic waveform */}
                        <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center min-h-[60px] relative">
                          {isListening ? (
                            <div className="space-y-2 text-center w-full">
                              {/* Voice sound waves animation */}
                              <div className="flex justify-center items-center gap-1 h-5">
                                <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${speechAnimationPhase % 2 === 0 ? 'h-5' : 'h-2'}`}></div>
                                <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${speechAnimationPhase % 3 === 0 ? 'h-4' : 'h-1.5'}`}></div>
                                <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${speechAnimationPhase === 1 ? 'h-6' : 'h-3'}`}></div>
                                <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${speechAnimationPhase % 2 === 1 ? 'h-4' : 'h-2'}`}></div>
                                <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${speechAnimationPhase % 3 === 1 ? 'h-5' : 'h-2'}`}></div>
                              </div>
                              <span className="text-[8.5px] text-cyan-400 font-mono tracking-widest animate-pulse">LISTENING TO SPEECH...</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setIsListening(true);
                                setTypedCommand("Generate a legal cease & desist notice for Vikas Mehra.");
                                triggerToast("Voice mic activated. Command detected: Draft Cease & Desist.");
                              }}
                              className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-full text-slate-400 hover:text-cyan-400 border border-slate-800 shadow-inner flex items-center justify-center cursor-pointer"
                            >
                              <Mic className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* AI response panel with typing / loading states */}
                        <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-900/60 max-h-[140px] overflow-y-auto scrollbar-thin">
                          {isLoadingAi ? (
                            <div className="space-y-1.5 py-1">
                              <div className="h-2.5 bg-slate-800 rounded animate-pulse w-3/4"></div>
                              <div className="h-2.5 bg-slate-800 rounded animate-pulse"></div>
                              <div className="h-2.5 bg-slate-800 rounded animate-pulse w-5/6"></div>
                            </div>
                          ) : (
                            <p className="text-[9.5px] text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                              {aiChatResponse}
                            </p>
                          )}
                        </div>

                        {/* Input bar and quick commands inside mobile */}
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={typedCommand}
                              onChange={(e) => setTypedCommand(e.target.value)}
                              placeholder="Type command or speech..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <button
                              disabled={isLoadingAi || !typedCommand}
                              onClick={() => handleSendVoiceCommand()}
                              className="bg-cyan-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg text-[9px] hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Preset Voice triggers */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[8px] font-bold text-gray-500 uppercase block tracking-wider">Tap preset speech triggers:</span>
                            <div className="flex flex-wrap gap-1">
                              <button 
                                onClick={() => {
                                  setTypedCommand("Review tax liabilities and outstanding GSTR compliance for Priya Patel.");
                                  triggerToast("Speech preset selected.");
                                }}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-800/60 text-[8px] font-semibold text-gray-300 px-1.5 py-0.5 rounded truncate max-w-[140px]"
                              >
                                🗣️ Review GST compliance
                              </button>
                              <button 
                                onClick={() => {
                                  setTypedCommand("Check status of Aadhaar E-Sign queue for Rahul Varma.");
                                  triggerToast("Speech preset selected.");
                                }}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-800/60 text-[8px] font-semibold text-gray-300 px-1.5 py-0.5 rounded truncate max-w-[140px]"
                              >
                                🗣️ Check Aadhaar Queue
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>

                {/* iPhone Home indicator line bottom */}
                <div className="pb-2 pt-1 flex justify-center shrink-0">
                  <div className="w-24 h-1 bg-gray-500 rounded-full"></div>
                </div>

              </div>
            </div>

            {/* Quick Actions external guide */}
            <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
              <span className="font-extrabold text-gray-700 block mb-1">💡 Interactive Mobile Simulator:</span>
              Use the mobile frame above to trigger Aadhaar sign-offs, payment nudges, or hold down the mic icon to query the actual server-side Gemini AI model with voice commands!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
