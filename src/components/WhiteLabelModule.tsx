import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Mail, 
  Upload, 
  Eye, 
  Save, 
  CheckCircle,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface WhiteLabelProps {
  currentWorkspace: {
    id: string;
    name: string;
    logo: string;
    plan: string;
    colors: { primary: string; accent: string; bg: string };
    domain: string;
    emailTemplate: string;
  };
  onSaveBranding: (branding: {
    name: string;
    domain: string;
    emailTemplate: string;
    colors: { primary: string; accent: string; bg: string };
  }) => void;
}

export default function WhiteLabelModule({ currentWorkspace, onSaveBranding }: WhiteLabelProps) {
  const [brandName, setBrandName] = useState(currentWorkspace.name);
  const [customDomain, setCustomDomain] = useState(currentWorkspace.domain);
  const [emailTemplate, setEmailTemplate] = useState(currentWorkspace.emailTemplate);
  const [selectedPrimaryColor, setSelectedPrimaryColor] = useState(currentWorkspace.colors.primary);
  const [selectedAccentColor, setSelectedAccentColor] = useState(currentWorkspace.colors.accent);
  const [isSaved, setIsSaved] = useState(false);

  // Predefined gorgeous palettes
  const palettes = [
    { name: 'Royal Slate & Cyan', primary: '#0F172A', accent: '#06B6D4', bg: '#F8FAFC' },
    { name: 'Obsidian & Gold', primary: '#1C1917', accent: '#D97706', bg: '#FAF9F6' },
    { name: 'Midnight Navy & Fuchsia', primary: '#1E1B4B', accent: '#EC4899', bg: '#FDF2F8' },
    { name: 'Forest Velvet & Emerald', primary: '#064E3B', accent: '#10B981', bg: '#F0FDF4' },
    { name: 'Deep Amethyst & Coral', primary: '#312E81', accent: '#F97316', bg: '#FDF8F6' }
  ];

  const handleApplyPalette = (palette: typeof palettes[0]) => {
    setSelectedPrimaryColor(palette.primary);
    setSelectedAccentColor(palette.accent);
  };

  const handleSave = () => {
    onSaveBranding({
      name: brandName,
      domain: customDomain,
      emailTemplate: emailTemplate,
      colors: {
        primary: selectedPrimaryColor,
        accent: selectedAccentColor,
        bg: '#F8FAFC'
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Brand Configurator Inputs */}
      <div className="xl:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 space-y-6 shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-base text-gray-900">Custom Brand Identity Settings</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">ENTERPRISE OS</span>
          </div>
          <p className="text-xs text-gray-500">Configure white-labeled branding parameters for clients, partners, and public intake forms.</p>
        </div>

        {/* Brand Name & Domain */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Company Display Name</label>
              <input 
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                placeholder="Enter workspace name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Custom Domain Address</label>
              <div className="flex">
                <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-[10px] text-gray-500 font-mono">https://</span>
                <input 
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-r-xl text-xs bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gray-900 focus:outline-none focus:border-gray-900 transition-all font-mono"
                  placeholder="portal.mycompany.com"
                />
              </div>
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Workspace Color Theme</label>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Apply a pre-designed corporate palette or set precise codes.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {palettes.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleApplyPalette(p)}
                    className="flex items-center justify-between p-2 rounded-xl border border-gray-150 hover:border-gray-300 text-left bg-white transition-all text-xs cursor-pointer"
                  >
                    <span className="font-medium text-gray-700 truncate pr-2">{p.name}</span>
                    <div className="flex gap-1 shrink-0">
                      <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: p.primary }}></span>
                      <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: p.accent }}></span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Exact Codes Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Primary Color</span>
                  <div className="flex gap-1.5 items-center">
                    <input 
                      type="color" 
                      value={selectedPrimaryColor} 
                      onChange={(e) => setSelectedPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded border cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={selectedPrimaryColor} 
                      onChange={(e) => setSelectedPrimaryColor(e.target.value)}
                      className="flex-1 text-[10px] uppercase font-mono px-2 py-1 bg-gray-50 border rounded" 
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Accent Accent</span>
                  <div className="flex gap-1.5 items-center">
                    <input 
                      type="color" 
                      value={selectedAccentColor} 
                      onChange={(e) => setSelectedAccentColor(e.target.value)}
                      className="w-7 h-7 rounded border cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={selectedAccentColor} 
                      onChange={(e) => setSelectedAccentColor(e.target.value)}
                      className="flex-1 text-[10px] uppercase font-mono px-2 py-1 bg-gray-50 border rounded" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Template */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">E-Sign & Document Dispatch Email Signature</label>
            <p className="text-[10px] text-gray-400 mb-1.5">This custom draft wraps invitations and files dispatched to clients.</p>
            <textarea 
              rows={4}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-900 transition-all font-sans leading-relaxed"
              placeholder="Enter email signature content"
            />
          </div>

          {/* Custom logo uploading simulation */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Custom Corporate Logo</label>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl p-4 bg-gray-50 cursor-pointer transition-colors">
              <div className="text-center space-y-1">
                <Upload className="w-5 h-5 text-gray-400 mx-auto" />
                <p className="text-[10px] font-bold text-gray-600">Drag or click to choose SVG/PNG file</p>
                <p className="text-[8px] text-gray-400">Dimensions strictly 120x32px for sidebar layout alignment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Updates sync across team instantly</span>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Branding Updated!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Apply Brand Rules</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Side-by-Side White Label Previewer */}
      <div className="xl:col-span-6 bg-gray-900 rounded-2xl p-5 lg:p-6 text-white shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-[10px] font-mono text-gray-400 font-bold bg-gray-800 px-3 py-1 rounded-full border border-gray-700 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{customDomain || 'portal.yourbrand.com'}</span>
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Client View Mock</p>
            
            {/* Live responsive mockup of workspace interface */}
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-[#1A1A1A] space-y-4 shadow-inner min-h-[340px] flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-extrabold"
                    style={{ backgroundColor: selectedPrimaryColor }}
                  >
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-extrabold text-xs text-gray-800 tracking-tight">{brandName} Client Hub</span>
                </div>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-mono">CLIENT PORTAL</span>
              </div>

              {/* Central Box */}
              <div className="space-y-3 my-4">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[11px] text-gray-900">E-Sign Awaiting Signature</h4>
                      <p className="text-[9px] text-gray-500 mt-0.5">Please authorize the Indian Partnership Deed via Aadhaar OTP.</p>
                    </div>
                    <FileText className="w-5 h-5" style={{ color: selectedAccentColor }} />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[8px] text-gray-400 font-mono">
                    <span>DOC ID: doc_rba_8231</span>
                    <span>SENT: Today 11:45 AM</span>
                  </div>

                  <button 
                    className="w-full text-[10px] font-bold text-white py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    style={{ backgroundColor: selectedPrimaryColor }}
                  >
                    <span>Validate & Aadhaar Sign</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white rounded-lg border text-center space-y-0.5">
                    <p className="text-[14px] font-bold text-gray-900">₹8,500</p>
                    <p className="text-[8px] text-gray-400 uppercase font-mono">Pending Dues</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border text-center space-y-0.5">
                    <p className="text-[14px] font-bold text-emerald-600">3</p>
                    <p className="text-[8px] text-gray-400 uppercase font-mono">Active Projects</p>
                  </div>
                </div>
              </div>

              {/* Footer and credit line white labeled */}
              <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[8px] text-gray-400">
                <span>Secure SSL Encryption</span>
                <span>Powered exclusively by {brandName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative advice */}
        <div className="border-t border-gray-800 pt-4 mt-4 text-[10px] text-gray-400 leading-relaxed">
          <strong>Enterprise Routing Rule:</strong> Point your custom domain's CNAME record to <code className="text-cyan-400 bg-gray-800 px-1 py-0.5 rounded">custom.rba.ai</code> to establish secure, white-labeled SSL routing across your isolated client base.
        </div>
      </div>
    </div>
  );
}
