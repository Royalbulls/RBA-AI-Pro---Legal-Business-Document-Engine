import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Trash2, 
  PieChart, 
  User, 
  FileCheck2,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FinanceOSProps {
  initialInvoices: any[];
}

export default function FinanceOSModule({ initialInvoices }: FinanceOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'expenses' | 'revenue'>('billing');
  
  // Custom Invoice/Quotation State
  const [invoices, setInvoices] = useState<any[]>(() => {
    if (initialInvoices && initialInvoices.length > 0) {
      return initialInvoices;
    }
    return [
      { id: 'inv_101', client: 'Acme Corporates India', service: 'Omnibus Founder Alliance Drafting', amount: 15000, gst: 2700, total: 17700, date: 'Today', status: 'unpaid' },
      { id: 'inv_102', client: 'Bounty Writers Ltd', service: 'eBook Layout Compilation Fee', amount: 8500, gst: 1530, total: 10030, date: 'Yesterday', status: 'paid' },
      { id: 'inv_103', client: 'Pioneer DSAs Bangalore', service: 'Aadhaar Bulk Verification Sync Node', amount: 25000, gst: 4500, total: 29500, date: 'Jun 22, 2026', status: 'paid' }
    ];
  });

  const [expenses, setExpenses] = useState([
    { id: 'exp_1', item: 'Gemini AI API Key Overhead', category: 'API Infrastructure', amount: 4500, date: 'Jun 25, 2026' },
    { id: 'exp_2', item: 'Aadhaar OTP Signature Gateway (UIDAI)', category: 'Compliance Gates', amount: 1200, date: 'Jun 10, 2026' }
  ]);

  // Form State
  const [invClient, setInvClient] = useState('');
  const [invService, setInvService] = useState('Omnibus Founder Alliance Drafting');
  const [invAmount, setInvAmount] = useState('');
  const [invGstRate, setInvGstRate] = useState('18');

  const [expItem, setExpItem] = useState('');
  const [expCategory, setExpCategory] = useState('Infrastructure');
  const [expAmount, setExpAmount] = useState('');

  const handleCreateInvoice = () => {
    if (!invClient.trim() || !invAmount.trim()) return;
    const baseAmount = parseFloat(invAmount);
    const gstPct = parseFloat(invGstRate);
    const calculatedGst = (baseAmount * gstPct) / 100;
    const finalTotal = baseAmount + calculatedGst;

    const newInv = {
      id: `inv_${Date.now()}`,
      client: invClient,
      service: invService,
      amount: baseAmount,
      gst: calculatedGst,
      total: finalTotal,
      date: 'Today',
      status: 'unpaid'
    };

    setInvoices([newInv, ...invoices]);
    setInvClient('');
    setInvAmount('');
  };

  const handleCreateExpense = () => {
    if (!expItem.trim() || !expAmount.trim()) return;
    const newExp = {
      id: `exp_${Date.now()}`,
      item: expItem,
      category: expCategory,
      amount: parseFloat(expAmount),
      date: 'Today'
    };
    setExpenses([newExp, ...expenses]);
    setExpItem('');
    setExpAmount('');
  };

  const handleMarkPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv));
  };

  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'unpaid').reduce((acc, i) => acc + i.total, 0);
  const totalInvoiced = totalCollected + totalOutstanding;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Sub-Module Selector */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Finance Modules</p>
        
        <button
          onClick={() => setActiveSubTab('billing')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'billing' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>GST Billing & Quotations</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'expenses' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Expense Logs & Outlays</span>
        </button>

        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'revenue' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Revenue Ledger Insights</span>
        </button>
      </div>

      {/* Main OS view */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[420px]">
        
        {/* GST Invoicing */}
        {activeSubTab === 'billing' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">GST Outward Invoice Generator</h3>
              <p className="text-xs text-gray-500">Auto-calculate SGST, CGST, IGST (default 18% professional services) and track unpaid ledgers.</p>
            </div>

            {/* Quick Generator Panel */}
            <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Client Business</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={invClient}
                  onChange={(e) => setInvClient(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Service</label>
                <select
                  value={invService}
                  onChange={(e) => setInvService(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option>Omnibus Founder Alliance Drafting</option>
                  <option>eBook Design & Publishing</option>
                  <option>Corporate Advisory retainer</option>
                  <option>Consultation & KYC Sync Service</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Base Amount (INR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                  <select
                    value={invGstRate}
                    onChange={(e) => setInvGstRate(e.target.value)}
                    className="px-1 py-1 bg-white border rounded-lg text-[10px] font-bold"
                  >
                    <option value="18">18%</option>
                    <option value="12">12%</option>
                    <option value="5">5%</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  onClick={handleCreateInvoice}
                  className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-3 border rounded-xl flex items-center justify-between bg-white hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded">
                      <FileText className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{inv.client}</h4>
                      <p className="text-[10px] text-gray-400">{inv.service} • {inv.date}</p>
                      <p className="text-[9px] text-gray-500 font-medium">Base: ₹{inv.amount.toLocaleString()} + GST: ₹{inv.gst.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-gray-900">₹{inv.total.toLocaleString()}</span>
                    {inv.status === 'unpaid' ? (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[9px] rounded font-mono transition-all cursor-pointer"
                      >
                        MARK PAID
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded font-mono flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>PAID</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense loggers */}
        {activeSubTab === 'expenses' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Workspace Business Outlay Tracker</h3>
              <p className="text-xs text-gray-500">Record recurring digital subscriptions, agent API tokens, and courier dispatch overheads.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Expense Item</label>
                <input
                  type="text"
                  placeholder="e.g. Server hosting"
                  value={expItem}
                  onChange={(e) => setExpItem(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option>Infrastructure</option>
                  <option>Compliance Gates</option>
                  <option>Marketing</option>
                  <option>Office & Sundry</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Cost (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 2400"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <button
                  onClick={handleCreateExpense}
                  className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Outlay</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-3 border rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{exp.item}</h4>
                      <p className="text-[10px] text-gray-400">{exp.category} • {exp.date}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-red-600">- ₹{exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue insight metrics */}
        {activeSubTab === 'revenue' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Workspace Earning Ledger Dashboard</h3>
              <p className="text-xs text-gray-500">Real-time outstanding vs collected metrics compiled across your entire tenant workspace database.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Invoiced Amount</p>
                <p className="text-2xl font-extrabold text-gray-900">₹{totalInvoiced.toLocaleString()}</p>
                <span className="text-[9px] text-gray-400">All posted tax bills</span>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Collected Revenue</p>
                <p className="text-2xl font-extrabold text-emerald-700">₹{totalCollected.toLocaleString()}</p>
                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <FileCheck2 className="w-3 h-3" />
                  <span>Settled & Reconciled</span>
                </span>
              </div>

              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Outstanding Claims</p>
                <p className="text-2xl font-extrabold text-rose-700">₹{totalOutstanding.toLocaleString()}</p>
                <button 
                  onClick={() => alert('Dispatched invoice reminder pings to outstanding client balances.')}
                  className="text-[9px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <BellRing className="w-3 h-3" />
                  <span>Send Reminders</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border rounded-xl flex items-center gap-4">
              <span className="text-2xl">📈</span>
              <p className="text-xs text-gray-500">
                <strong>Tax Compliance Note:</strong> Direct GSTR-1 and GSTR-3B filings are ready for generation. Your next compliance filing window closes on the 10th of next month. Ensure all pending invoices are recorded.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
