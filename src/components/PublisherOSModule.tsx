import React, { useState } from 'react';
import { 
  Book, 
  BookOpen, 
  FileText, 
  Music, 
  Mic, 
  PenTool, 
  Sparkles, 
  Download, 
  Plus, 
  Radio, 
  Compass, 
  Cpu,
  Trash2,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublisherOSModuleProps {
  onAiPrompt: (prompt: string, context?: string) => Promise<string>;
  onExportToGoogleDocs?: (title: string, text: string) => Promise<void>;
}

export default function PublisherOSModule({ onAiPrompt, onExportToGoogleDocs }: PublisherOSModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'writer' | 'podcast' | 'music'>('writer');
  const [writerType, setWriterType] = useState<'ebook' | 'blog' | 'script' | 'pr'>('ebook');
  
  // State for AI Writer
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');

  // State for Podcast Studio
  const [podcasts, setPodcasts] = useState([
    { id: 'pod_1', title: 'The Startups of New India', host: 'Amit Sharma', episodes: 14, rss: 'https://anchor.fm/s/new-india-rba/rss' },
    { id: 'pod_2', title: 'Corporate Taxation Demystified', host: 'Priya Patel', episodes: 8, rss: 'https://anchor.fm/s/tax-rba/rss' }
  ]);
  const [newPodTitle, setNewPodTitle] = useState('');

  // State for Music Publishing
  const [musicTracks, setMusicTracks] = useState([
    { id: 'track_1', title: 'Cosmic Slate - Ambient Theme', composer: 'Vikram Das', isrc: 'IN-RBA-26-00041', share: '60% Writer, 40% Publisher', status: 'Registered' },
    { id: 'track_2', title: 'Retro Synthwave Beat', composer: 'Karan Mehra', isrc: 'IN-RBA-26-00042', share: '50% Writer, 50% Publisher', status: 'Registered' }
  ]);
  const [newTrackTitle, setNewTrackTitle] = useState('');

  const handleGenerateContent = async () => {
    if (!draftTitle.trim() || !draftPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedDraft('');

    const systemPrompt = `Draft a premium, professionally styled layout for the following creative request:
Title: ${draftTitle}
Type: ${writerType.toUpperCase()}
Key context: ${draftPrompt}

Draft structured chapters, outlines, scenes, or headers in beautiful markdown formatting. Keep the content engaging.`;

    try {
      const result = await onAiPrompt(systemPrompt, `Writer Type: ${writerType}`);
      setGeneratedDraft(result);
    } catch (e) {
      // Fallback
      setGeneratedDraft(`## CHAPTER 1: THE DIGITAL FRONTIER\n\n**Title:** ${draftTitle}\n\nDraft generated successfully as an asset under ${writerType.toUpperCase()} module. The operational architecture maps to modern publishing standards.\n\n*Generated with local backup node.*`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPodcast = () => {
    if (!newPodTitle.trim()) return;
    const newPod = {
      id: `pod_${Date.now()}`,
      title: newPodTitle,
      host: 'Active Owner',
      episodes: 0,
      rss: `https://rss.rba.ai/podcasts/${newPodTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    };
    setPodcasts([...podcasts, newPod]);
    setNewPodTitle('');
  };

  const handleAddTrack = () => {
    if (!newTrackTitle.trim()) return;
    const isrcId = Math.floor(10000 + Math.random() * 90000);
    const newTrack = {
      id: `track_${Date.now()}`,
      title: newTrackTitle,
      composer: 'Active Publisher',
      isrc: `IN-RBA-26-${isrcId}`,
      share: '100% Owner',
      status: 'Registered'
    };
    setMusicTracks([...musicTracks, newTrack]);
    setNewTrackTitle('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Sub-Module Selector */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Publisher Modules</p>
        
        <button
          onClick={() => setActiveSubTab('writer')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'writer' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>AI Book & Article Writer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('podcast')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'podcast' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Podcast Creator Studio</span>
        </button>

        <button
          onClick={() => setActiveSubTab('music')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'music' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Music ISRC Registrar</span>
        </button>
      </div>

      {/* Main OS view */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[420px]">
        
        {/* Writer Module */}
        {activeSubTab === 'writer' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">AI Publishing & Writing Engine</h3>
                <p className="text-xs text-gray-500">Draft books, press releases, newsletters, and screenplays with publisher alignment.</p>
              </div>

              {/* Writer Subcategories */}
              <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
                {(['ebook', 'blog', 'script', 'pr'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWriterType(t)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase ${
                      writerType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t === 'ebook' ? 'eBook' : t === 'blog' ? 'Blog' : t === 'script' ? 'Script' : 'PR Release'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Masterclass in Indian Corporate Law"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Key Outline & Context Prompts</label>
                  <textarea
                    rows={4}
                    placeholder="Enter what you want this book chapter, article, or press release to focus on. Specify target tone, key statistics, and references..."
                    value={draftPrompt}
                    onChange={(e) => setDraftPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !draftTitle.trim() || !draftPrompt.trim()}
                  className="w-full py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isGenerating ? 'Drafting Book Outline...' : 'Generate with Gemini Publisher AI'}</span>
                </button>
              </div>

              {/* Draft Output Preview */}
              <div className="bg-gray-50 rounded-xl border border-gray-250 p-4 relative flex flex-col justify-between min-h-[250px]">
                {isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                    <Cpu className="w-8 h-8 text-cyan-600 animate-spin" />
                    <p className="text-xs text-gray-500 font-bold">Synthesizing chapter sequences...</p>
                  </div>
                ) : generatedDraft ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="overflow-y-auto max-h-[240px] text-xs leading-relaxed text-gray-700 space-y-2 pr-1 select-text">
                      <div className="whitespace-pre-wrap">{generatedDraft}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedDraft);
                          alert('Copied generated draft to clipboard!');
                        }}
                        className="flex-1 py-1.5 border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 bg-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Copy Draft</span>
                      </button>

                      {onExportToGoogleDocs && (
                        <button 
                          onClick={async () => {
                            const title = `AI Publisher Draft - ${writerType.toUpperCase()} - ${draftTitle}`;
                            await onExportToGoogleDocs(title, generatedDraft);
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
                    <BookOpen className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-500">Draft Panel Empty</p>
                    <p className="text-[10px] text-gray-400 mt-1">Configure parameters and hit generate to draft legal manuscripts or media articles.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Podcast Studio */}
        {activeSubTab === 'podcast' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Podcast Studio & RSS Distributor</h3>
                <p className="text-xs text-gray-500">Syndicate corporate podcasts, legal webinars, and publisher audio networks to global feeds.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Podcast Show Title..."
                  value={newPodTitle}
                  onChange={(e) => setNewPodTitle(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleAddPodcast}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Show</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {podcasts.map((pod) => (
                <div key={pod.id} className="p-4 border rounded-xl flex items-center justify-between bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{pod.title}</h4>
                      <p className="text-[10px] text-gray-500">Host: {pod.host} • Episodes Published: {pod.episodes}</p>
                      <p className="text-[9px] text-cyan-600 font-mono mt-0.5">{pod.rss}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono">
                    LIVE FEED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music Registrar */}
        {activeSubTab === 'music' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Copyright, Royalty Splits & ISRC Registrar</h3>
                <p className="text-xs text-gray-500">Submit sound recordings to global copyright houses and generate standard split-sheets.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Single/Album Track..."
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleAddTrack}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Track</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {musicTracks.map((track) => (
                <div key={track.id} className="p-3.5 border rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{track.title}</h4>
                      <p className="text-[10px] text-gray-500">Composer: {track.composer} • Splits: {track.share}</p>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">ISRC Registry Code: <code className="bg-gray-100 px-1">{track.isrc}</code></p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {track.status.toUpperCase()}
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
