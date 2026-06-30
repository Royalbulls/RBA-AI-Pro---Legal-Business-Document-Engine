import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Play, 
  Save, 
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AutomationStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  label: string;
  sublabel: string;
  icon: any;
  config: Record<string, string>;
}

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  steps: AutomationStep[];
}

export default function AutomationBuilderModule() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf_1',
      name: 'Automated Client Onboarding Flow',
      active: true,
      steps: [
        { id: 'step_1', type: 'trigger', label: 'Client Onboarding Form Submitted', sublabel: 'Fires when client completes the intake form', icon: Users, config: { source: 'Google Forms Intake Node' } },
        { id: 'step_2', type: 'action', label: 'Generate Founder Agreement', sublabel: 'Auto-fill with client metadata & default terms', icon: FileText, config: { template: 'Founder Agreement', format: 'PDF' } },
        { id: 'step_3', type: 'action', label: 'Schedule Zoom Meeting & Calendar Sync', sublabel: 'Consultation scheduler link generated', icon: Calendar, config: { duration: '30 mins', calendar: 'Google Calendar' } },
        { id: 'step_4', type: 'action', label: 'WhatsApp Legal Ping Daemon', sublabel: 'Automated mobile notification sent', icon: MessageSquare, config: { recipient: 'Client Phone', message: 'Dear {client_name}, your Founder Agreement has been generated and scheduled.' } }
      ]
    },
    {
      id: 'wf_2',
      name: 'Invoice Payment & Agreement E-Sign Workflow',
      active: false,
      steps: [
        { id: 'step_5', type: 'trigger', label: 'Invoice Marked as Paid', sublabel: 'Triggers when payment is recorded in ledger', icon: Play, config: { threshold: 'Any amount' } },
        { id: 'step_6', type: 'action', label: 'Initiate Aadhaar OTP E-Sign', sublabel: 'Request signature for compiled document', icon: FileText, config: { authority: 'Leegality / UIDAI Gateway' } },
        { id: 'step_7', type: 'action', label: 'Email Executive Counsel Sign-off', sublabel: 'Draft review email dispatch', icon: Mail, config: { to: 'amit@royalbulls.com', template: 'Counsel Approval Request' } }
      ]
    }
  ]);

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf_1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const handleToggleActive = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const handleSimulate = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    
    const logs = [
      '⚡ [Trigger Fired] client completed intake sheet in Google Forms node',
      '🔍 [Condition Checked] "Is Premium Entity" -> Evaluated as TRUE',
      '📃 [AI OS Agent] Pulling profile and compiling: "Founder Agreement"',
      '📁 [Google Drive] Saving document draft in folder "/RBA AI PRO/Agreements/"',
      '📅 [Google Calendar] Generating consult link & booking slots on 2026-07-02 at 11:30 AM',
      '💬 [WhatsApp Daemon] Simulating automated ping to target mobile register (+91 ******9874)',
      '📧 [Gmail Service] Auto-mailing e-sign copy to client email address',
      '✅ [Completed] Workflow executed successfully in 1.4 seconds!'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 450));
      setSimulationLogs(prev => [...prev, logs[i]]);
    }
    setIsSimulating(false);
  };

  const handleAddStep = (type: 'action' | 'condition') => {
    const stepIcons = {
      action: Mail,
      condition: Check
    };
    
    const newStep: AutomationStep = {
      id: `step_${Date.now()}`,
      type,
      label: type === 'action' ? 'Send Automated Email Alert' : 'Check Country of Operation',
      sublabel: type === 'action' ? 'Send a customized white-label draft message' : 'Is country equal to India?',
      icon: stepIcons[type],
      config: {}
    };

    setWorkflows(prev => prev.map(w => {
      if (w.id === activeWorkflowId) {
        return { ...w, steps: [...w.steps, newStep] };
      }
      return w;
    }));
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === activeWorkflowId) {
        return { ...w, steps: w.steps.filter(s => s.id !== stepId) };
      }
      return w;
    }));
  };

  const createNewWorkflow = () => {
    if (!newWorkflowName.trim()) return;
    const newWf: Workflow = {
      id: `wf_${Date.now()}`,
      name: newWorkflowName,
      active: true,
      steps: [
        { id: `step_${Date.now()}_trig`, type: 'trigger', label: 'Client Created in CRM', sublabel: 'Triggers when a new customer profile is registered', icon: Users, config: {} }
      ]
    };
    setWorkflows(prev => [...prev, newWf]);
    setActiveWorkflowId(newWf.id);
    setNewWorkflowName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Workflow list sidebar */}
      <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span>Automation Builder</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono">ZAPIER ENGINE</span>
          </div>

          <div className="space-y-2">
            {workflows.map((wf) => (
              <div 
                key={wf.id}
                onClick={() => setActiveWorkflowId(wf.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  wf.id === activeWorkflowId 
                    ? 'border-gray-900 bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-xs text-gray-900 pr-2 line-clamp-1">{wf.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(wf.id);
                    }}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
                      wf.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {wf.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{wf.steps.length} integration actions configured</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create new workflow */}
        <div className="pt-4 border-t border-gray-150 mt-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Integration Flow</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Lead Alert Zap"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-xs focus:outline-none focus:border-gray-900"
            />
            <button
              onClick={createNewWorkflow}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main visual steps configuration builder */}
      <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 space-y-6 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
          <div>
            <h2 className="font-bold text-base text-gray-900">{activeWorkflow.name}</h2>
            <p className="text-xs text-gray-500">Configure trigger nodes and automatic downstream micro-activities.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-3.5 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>{isSimulating ? 'Executing...' : 'Test Run Flow'}</span>
            </button>
            <button
              onClick={() => alert('Workflow configurations saved successfully on the multi-tenant server!')}
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Zap</span>
            </button>
          </div>
        </div>

        {/* Dynamic visual graph list */}
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 relative py-4 bg-gray-50/40 rounded-xl p-4">
          <AnimatePresence initial={false}>
            {activeWorkflow.steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="relative">
                  {/* Arrow connector */}
                  {index > 0 && (
                    <div className="flex justify-center -my-1 mb-3">
                      <div className="h-6 w-0.5 bg-cyan-600 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-cyan-600 rotate-90 transform shrink-0" />
                      </div>
                    </div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-cyan-500 transition-all shadow-sm flex items-start gap-3.5 justify-between"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        step.type === 'trigger' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : step.type === 'condition' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            step.type === 'trigger' ? 'bg-amber-100 text-amber-800' : step.type === 'condition' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
                          }`}>
                            {step.type} {index + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 mt-1">{step.label}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{step.sublabel}</p>
                        
                        {/* Inline micro configs */}
                        {step.config && Object.keys(step.config).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            {Object.entries(step.config).map(([k, v]) => (
                              <span key={k} className="text-[9px] bg-gray-100 px-2 py-0.5 rounded border text-gray-600">
                                <strong className="text-gray-900 uppercase">{k}:</strong> {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Controls to append steps */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add step to flow:</span>
          
          <button
            onClick={() => handleAddStep('action')}
            className="px-3 py-1.5 border border-dashed border-cyan-300 hover:border-cyan-600 hover:bg-cyan-50 text-cyan-800 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action Node</span>
          </button>
          <button
            onClick={() => handleAddStep('condition')}
            className="px-3 py-1.5 border border-dashed border-purple-300 hover:border-purple-600 hover:bg-purple-50 text-purple-800 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition Node</span>
          </button>
        </div>

        {/* Live Simulation Trace logs */}
        {simulationLogs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-950 text-cyan-400 rounded-xl font-mono text-[10px] space-y-1.5 shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
              <span className="text-gray-400 font-bold tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Zap Run simulation logs</span>
              </span>
              <button onClick={() => setSimulationLogs([])} className="text-gray-500 hover:text-white">Clear</button>
            </div>
            {simulationLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
