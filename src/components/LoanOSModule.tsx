import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Users, 
  CheckCircle, 
  Calculator, 
  Layers, 
  HelpCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoanOSModule() {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'calculator' | 'banks'>('leads');
  
  // Borrower leads
  const [borrowers, setBorrowers] = useState([
    { id: 'bor_1', name: 'Ramesh Chawla', type: 'Business Loan', amount: 3500000, bank: 'HDFC Bank', status: 'Sanctioned' },
    { id: 'bor_2', name: 'Shreya Iyer', type: 'Home Loan', amount: 7500000, bank: 'State Bank of India', status: 'KYC Pending' },
    { id: 'bor_3', name: 'Naveen Reddy', type: 'LAP (Loan Against Prop)', amount: 5000000, bank: 'ICICI Bank', status: 'Disbursed' }
  ]);

  const [newBorName, setNewBorName] = useState('');
  const [newBorType, setNewBorType] = useState('Business Loan');
  const [newBorAmount, setNewBorAmount] = useState('');
  const [newBorBank, setNewBorBank] = useState('HDFC Bank');

  // Calculator State
  const [income, setIncome] = useState<number>(75000); // monthly net
  const [emi, setEmi] = useState<number>(5000);       // existing EMI
  const [tenure, setTenure] = useState<number>(15);     // years

  const handleAddBorrower = () => {
    if (!newBorName.trim() || !newBorAmount.trim()) return;
    const newBor = {
      id: `bor_${Date.now()}`,
      name: newBorName,
      type: newBorType,
      amount: parseFloat(newBorAmount),
      bank: newBorBank,
      status: 'KYC Pending'
    };
    setBorrowers([newBor, ...borrowers]);
    setNewBorName('');
    setNewBorAmount('');
  };

  // Eligibility Calculation Logic (Standard FOIR - Fixed Obligation to Income Ratio, e.g. 50%)
  const maxEMIAllowed = (income * 0.50) - emi;
  // Reducing rate calculation: PV = (EMI / r) * [1 - (1 + r)^-n]
  const assumedInterestRate = 8.5; // average reducing rate (8.5% p.a.)
  const r = (assumedInterestRate / 12) / 100;
  const n = tenure * 12;
  const borrowCapacity = maxEMIAllowed > 0 ? (maxEMIAllowed / r) * (1 - Math.pow(1 + r, -n)) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Sub-Module Selector */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Loan OS Modules</p>
        
        <button
          onClick={() => setActiveSubTab('leads')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'leads' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Borrower Pipeline CRM</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'calculator' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Eligibility Checker</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banks')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'banks' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Bank Rate Comparer</span>
        </button>
      </div>

      {/* Main OS view */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[420px]">
        
        {/* Borrower CRM */}
        {activeSubTab === 'leads' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Borrower CRM Pipeline</h3>
              <p className="text-xs text-gray-500">Log customer loans, manage verification states, and assign partner banking nodes.</p>
            </div>

            {/* Quick lead input */}
            <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Borrower Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={newBorName}
                  onChange={(e) => setNewBorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Loan Category</label>
                <select
                  value={newBorType}
                  onChange={(e) => setNewBorType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option>Business Loan</option>
                  <option>Home Loan</option>
                  <option>Personal Loan</option>
                  <option>LAP (Loan Against Prop)</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Target Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={newBorAmount}
                  onChange={(e) => setNewBorAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Banking Partner</label>
                <select
                  value={newBorBank}
                  onChange={(e) => setNewBorBank(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleAddBorrower}
                  className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Loan</span>
                </button>
              </div>
            </div>

            {/* Borrower List */}
            <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto">
              {borrowers.map((bor) => (
                <div key={bor.id} className="p-3 border rounded-xl flex items-center justify-between bg-white hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
                      <Layers className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{bor.name}</h4>
                      <p className="text-[10px] text-gray-400">{bor.type} • Partner: {bor.bank}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-gray-900">₹{bor.amount.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 font-bold text-[9px] rounded font-mono ${
                      bor.status === 'Disbursed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : bor.status === 'Sanctioned' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {bor.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Calculator */}
        {activeSubTab === 'calculator' && (
          <div className="space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Borrower Eligibility Estimator</h3>
              <p className="text-xs text-gray-500">Calculate estimated loan borrowing power using standard Indian banking FOIR ratios (50% rule).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>MONTHLY NET SALARY / INCOME</span>
                    <span className="text-gray-900">₹{income.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="300000"
                    step="5000"
                    value={income}
                    onChange={(e) => setIncome(parseInt(e.target.value))}
                    className="w-full accent-gray-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>EXISTING MONTHLY EMIs</span>
                    <span className="text-gray-900">₹{emi.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="2000"
                    value={emi}
                    onChange={(e) => setEmi(parseInt(e.target.value))}
                    className="w-full accent-gray-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>LOAN TENURE (YEARS)</span>
                    <span className="text-gray-900">{tenure} Years</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value))}
                    className="w-full accent-gray-900"
                  />
                </div>
              </div>

              {/* Borrow capacity output card */}
              <div className="bg-gray-50 rounded-2xl border p-5 flex flex-col justify-between shadow-inner">
                <div>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full uppercase font-mono">
                    Estimated Borrowing Power
                  </span>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2 select-all">
                    {borrowCapacity > 0 ? `₹${Math.floor(borrowCapacity).toLocaleString()}` : '₹0'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    Estimated maximum loan based on interest rate of **{assumedInterestRate}% p.a.** and a monthly disposable EMI threshold of **₹{maxEMIAllowed > 0 ? maxEMIAllowed.toLocaleString() : '0'}**.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-4 text-[9px] text-gray-400">
                  Disclaimer: Dynamic calculations are for initial lead check purposes. Actual sanction limits fluctuate depending on credit bureau scores.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Rate Comparer */}
        {activeSubTab === 'banks' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Banking Rate Comparison Directory</h3>
              <p className="text-xs text-gray-500">Live directory of current retail lending interest rates across premier banking partners.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs bg-white border rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gray-50 border-b font-bold text-gray-700 uppercase font-mono text-[9px]">
                    <th className="p-3">Bank Partner</th>
                    <th className="p-3">Home Loan %</th>
                    <th className="p-3">Business Loan %</th>
                    <th className="p-3">Processing Fee</th>
                    <th className="p-3">Sanction Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-800">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> State Bank of India</td>
                    <td className="p-3">8.40% - 9.15%</td>
                    <td className="p-3">10.50% - 13.00%</td>
                    <td className="p-3">0.35% (Max ₹10k)</td>
                    <td className="p-3 font-bold text-amber-600">7 - 10 Days</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> HDFC Bank</td>
                    <td className="p-3">8.50% - 9.50%</td>
                    <td className="p-3">11.25% - 14.50%</td>
                    <td className="p-3">0.50% + GST</td>
                    <td className="p-3 font-bold text-green-600">3 - 5 Days</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> ICICI Bank</td>
                    <td className="p-3">8.60% - 9.80%</td>
                    <td className="p-3">11.50% - 15.00%</td>
                    <td className="p-3">₹4,999 onwards</td>
                    <td className="p-3 font-bold text-green-600">4 - 6 Days</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Axis Bank</td>
                    <td className="p-3">8.75% - 9.95%</td>
                    <td className="p-3">12.00% - 15.50%</td>
                    <td className="p-3">1.00% of limit</td>
                    <td className="p-3 font-bold text-amber-600">5 - 7 Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
