import React, { useState } from 'react';
import { 
  Megaphone, 
  Share2, 
  Sparkles, 
  Clock, 
  Layout, 
  Send, 
  Trash2, 
  Plus, 
  CheckCircle,
  TrendingUp,
  Flame,
  Download,
  FileText,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketingOSProps {
  onAiPrompt: (prompt: string, context?: string) => Promise<string>;
  onExportToGoogleDocs?: (title: string, text: string) => Promise<void>;
}

export default function MarketingOSModule({ onAiPrompt, onExportToGoogleDocs }: MarketingOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'scheduler' | 'copywriter' | 'funnels'>('scheduler');
  const [copyPlatform, setCopyPlatform] = useState<'linkedin' | 'twitter' | 'instagram'>('linkedin');
  const [copyPrompt, setCopyPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');

  // Social Scheduler
  const [posts, setPosts] = useState([
    { id: 'post_1', channel: 'LinkedIn', content: 'Exciting news! Royal Bulls Advisory is scaling with the newly unlocked RBA AI PRO Multi-Tenant Business Operating System. 🚀 #SaaS #Consulting #AI', date: 'Tomorrow, 9:00 AM', status: 'Scheduled' },
    { id: 'post_2', channel: 'Twitter', content: 'Why draft corporate agreements manually when RBA AI PRO can compile an airtight 500+ parameter founder alliance covenant in 5 seconds flat? Check it out!', date: 'Jul 3, 2:30 PM', status: 'Scheduled' }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostChannel, setNewPostChannel] = useState('LinkedIn');

  // Lead Funnels
  const [funnels, setFunnels] = useState([
    { id: 'fun_1', name: 'Startup Founder NDA Squeeze Page', visits: 1250, conversion: '18%', leads: 225, status: 'Active' },
    { id: 'fun_2', name: 'Book Manuscript Release Pre-Launch Funnel', visits: 840, conversion: '12%', leads: 100, status: 'Active' },
    { id: 'fun_3', name: 'Elite High-Court Corporate Litigations Landing Page', visits: 410, conversion: '24%', leads: 98, status: 'Active' }
  ]);
  const [newFunnelName, setNewFunnelName] = useState('');

  const handleGenerateCopy = async () => {
    if (!copyPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedCopy('');

    const systemPrompt = `Draft a highly viral, professional social media post for ${copyPlatform.toUpperCase()}.
Topic / Request: ${copyPrompt}
Incorporate engaging headings, bullet points, hashtags, and strong call-to-actions tailored for business owners. Make it crisp and highly engaging.`;

    try {
      const result = await onAiPrompt(systemPrompt, `Marketing Channel: ${copyPlatform}`);
      setGeneratedCopy(result);
    } catch (e) {
      setGeneratedCopy(`📢 **OFFICIAL LAUNCH**\n\nWe are absolutely thrilled to introduce our newly unlocked corporate engine. Scale your operations instantly.\n\n*Draft created under ${copyPlatform.toUpperCase()} backup protocols. Please customize before dispatch.*`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPost = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: `post_${Date.now()}`,
      channel: newPostChannel,
      content: newPostContent,
      date: 'Next week (Pending date)',
      status: 'Scheduled'
    };
    setPosts([...posts, newPost]);
    setNewPostContent('');
  };

  const handleAddFunnel = () => {
    if (!newFunnelName.trim()) return;
    const newFun = {
      id: `fun_${Date.now()}`,
      name: newFunnelName,
      visits: 0,
      conversion: '0%',
      leads: 0,
      status: 'Active'
    };
    setFunnels([...funnels, newFun]);
    setNewFunnelName('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Sub-Module Selector */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Marketing Modules</p>
        
        <button
          onClick={() => setActiveSubTab('scheduler')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'scheduler' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Campaign Scheduler</span>
        </button>

        <button
          onClick={() => setActiveSubTab('copywriter')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'copywriter' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Copywriter & Ads</span>
        </button>

        <button
          onClick={() => setActiveSubTab('funnels')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'funnels' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Landing Pages & Funnels</span>
        </button>
      </div>

      {/* Main OS view */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[420px]">
        
        {/* Campaign Scheduler */}
        {activeSubTab === 'scheduler' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Unified Campaign & Post Scheduler</h3>
                <p className="text-xs text-gray-500">Auto-publish updates, articles, and newsletters directly to social channels.</p>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto gap-1">
                {['LinkedIn', 'Twitter', 'Facebook'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setNewPostChannel(ch)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer uppercase ${
                      newPostChannel === ch ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick add post */}
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder={`Type a quick post draft for ${newPostChannel}...`}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-gray-950"
              />
              <button
                onClick={handleAddPost}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
            </div>

            {/* Scheduled List */}
            <div className="space-y-2 mt-4">
              {posts.map((post) => (
                <div key={post.id} className="p-3.5 border rounded-xl flex items-start justify-between bg-white shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5 shrink-0">
                      <Share2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-mono uppercase">{post.channel}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{post.date}</span>
                      </div>
                      <p className="text-[11px] text-gray-700 mt-1.5 leading-relaxed font-medium select-all">{post.content}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono">
                    {post.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Copywriter */}
        {activeSubTab === 'copywriter' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">AI Copywriter & Viral Ad Generator</h3>
                <p className="text-xs text-gray-500">Draft high-converting ad copy, landing pages hooks, and industry outreach pitches.</p>
              </div>

              {/* Platform selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                {(['linkedin', 'twitter', 'instagram'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setCopyPlatform(plat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase ${
                      copyPlatform === plat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Copy Topic / Product Campaign Goal</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you are promoting (e.g., launching an Indian Corporate Law firm workspace that optimizes client KYC by 40% with automated reminders)..."
                    value={copyPrompt}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateCopy}
                  disabled={isGenerating || !copyPrompt.trim()}
                  className="w-full py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isGenerating ? 'Synthesizing creative hook...' : 'Write with Copywriter AI'}</span>
                </button>
              </div>

              {/* Copywriter Output Preview */}
              <div className="bg-gray-50 rounded-xl border border-gray-250 p-4 relative flex flex-col justify-between min-h-[240px]">
                {isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                    <Flame className="w-7 h-7 text-amber-500 animate-bounce" />
                    <p className="text-xs text-gray-500 font-bold">Drafting high-conversion posts...</p>
                  </div>
                ) : generatedCopy ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="overflow-y-auto max-h-[180px] text-xs leading-relaxed text-gray-700 select-text">
                      <div className="whitespace-pre-wrap font-medium">{generatedCopy}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCopy);
                          alert('Copied copy draft to clipboard!');
                        }}
                        className="flex-1 py-1.5 border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 bg-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </button>

                      {onExportToGoogleDocs && (
                        <button 
                          onClick={async () => {
                            const title = `AI Ad Copy - ${copyPlatform.toUpperCase()} - ${copyPrompt.slice(0, 20)}...`;
                            await onExportToGoogleDocs(title, generatedCopy);
                          }}
                          className="flex-1 py-1.5 border border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Chrome className="w-3.5 h-3.5 text-amber-600" />
                          <span>Save to Google</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Megaphone className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-500">Draft Panel Empty</p>
                    <p className="text-[10px] text-gray-400 mt-1">Configure parameters and hit generate to draft high-conversion social assets.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Funnels */}
        {activeSubTab === 'funnels' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Lead-Funnels & Custom Squeeze Pages</h3>
                <p className="text-xs text-gray-500">Host beautiful pre-built landing pages to capture leads and direct them into your workspace CRM.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Squeeze Page/Funnel..."
                  value={newFunnelName}
                  onChange={(e) => setNewFunnelName(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleAddFunnel}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Funnel</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {funnels.map((fun) => (
                <div key={fun.id} className="p-4 border rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{fun.name}</h4>
                      <p className="text-[10px] text-gray-500">Visits: {fun.visits} • Conversions: {fun.conversion} • Captured Leads: {fun.leads}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {fun.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
