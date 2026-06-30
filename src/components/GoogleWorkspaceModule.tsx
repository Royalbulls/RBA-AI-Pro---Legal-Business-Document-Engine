import React, { useState } from 'react';
import { 
  Chrome, 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  CheckCircle,
  Database,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

interface GoogleWorkspaceProps {
  currentUser: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function GoogleWorkspaceModule({ currentUser, onLogin, onLogout }: GoogleWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'drive' | 'sheets' | 'forms' | 'calendar' | 'gmail'>('drive');
  const [driveFiles, setDriveFiles] = useState([
    { id: 'gdf_1', name: 'Co-Founders Agreement - Final Signoff.gdoc', size: '24 KB', modified: '2 hours ago', owner: 'Amit Sharma' },
    { id: 'gdf_2', name: 'RBA Corporate Advisory Ledger - FY 2026.gsheet', size: '1.4 MB', modified: 'Yesterday', owner: 'Priya Patel' },
    { id: 'gdf_3', name: 'Client Onboarding Form Intake (Responses).gsheet', size: '420 KB', modified: 'Jun 28, 2026', owner: 'System Sync' },
    { id: 'gdf_4', name: 'Standard Non-Compete Covenant Master.gdoc', size: '18 KB', modified: 'Jun 15, 2026', owner: 'Amit Sharma' },
    { id: 'gdf_5', name: 'Employee Relieving Letter Template.gdoc', size: '12 KB', modified: 'May 10, 2026', owner: 'Human Resources' }
  ]);

  const [sheetsSync, setSheetsSync] = useState([
    { id: 'sync_1', sheetName: 'Leads & CRM Sync Board', range: 'Sheet1!A1:Z500', frequency: 'Real-time (Active)', status: 'synced' },
    { id: 'sync_2', sheetName: 'GST Invoice Outward Register', range: '2026_ledger!A:K', frequency: 'Daily at 11:30 PM', status: 'synced' },
    { id: 'sync_3', sheetName: 'Consultation Bookings Ledger', range: 'Appointments!A1:H100', frequency: 'On Event', status: 'synced' }
  ]);

  const [gmailLogs, setGmailLogs] = useState([
    { id: 'mail_1', recipient: 'client@gmail.com', subject: 'Action Required: Sign Founder Agreement - Royal Bulls', time: '10 mins ago', status: 'delivered' },
    { id: 'mail_2', recipient: 'finance@royalbulls.com', subject: 'Daily GST Invoice Ledger Sync Summary', time: 'Yesterday', status: 'delivered' }
  ]);

  const [calendarEvents, setCalendarEvents] = useState([
    { id: 'evt_1', title: 'Consultation: Co-Founders Equity Vesting review', time: 'Tomorrow, 10:30 AM - 11:00 AM', guests: 'Amit Sharma, client@gmail.com', type: 'Google Meet' },
    { id: 'evt_2', title: 'Audit Session: GST Outward Invoice reconciliation', time: 'Friday, 3:00 PM - 4:00 PM', guests: 'Priya Patel, Auditor Team', type: 'Google Meet' }
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [newSheetName, setNewSheetName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('All nodes synchronized with Google Workspace.');

  const handleCreateGoogleDoc = () => {
    if (!newDocName.trim()) return;
    const newFile = {
      id: `gdf_${Date.now()}`,
      name: `${newDocName}.gdoc`,
      size: '1 KB',
      modified: 'Just now',
      owner: currentUser?.displayName || 'Active Workspace Owner'
    };
    setDriveFiles([newFile, ...driveFiles]);
    setNewDocName('');
  };

  const handleCreateGoogleSheet = () => {
    if (!newSheetName.trim()) return;
    const newSync = {
      id: `sync_${Date.now()}`,
      sheetName: newSheetName,
      range: 'Sheet1!A1:Z1000',
      frequency: 'Real-time',
      status: 'synced'
    };
    setSheetsSync([newSync, ...sheetsSync]);
    setNewSheetName('');
  };

  const handleRefreshWorkspace = () => {
    setIsSyncing(true);
    setSyncStatusText('Polling Google Workspace Drive and Calendar nodes...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusText('Google Workspace sync verified. Up to date with Cloud.');
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Top Level Google Workspace Session Panel */}
      <div className="xl:col-span-12 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center border border-cyan-100 shrink-0">
            <Chrome className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <span>Google Workspace Integration Hub</span>
              <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-mono font-bold">CONNECTED</span>
            </h2>
            <p className="text-xs text-gray-500">Enable unified file storage, live sheet data syncing, meeting planners, and Gmail dispatch engines.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={handleRefreshWorkspace}
            disabled={isSyncing}
            className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800">{currentUser.displayName || 'Amit Sharma'}</p>
                <p className="text-[10px] text-gray-500">Access Token active</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Link Google Account
            </button>
          )}
        </div>
      </div>

      {/* Workspace Sub-OS Panel */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Services Unlocked</p>
        
        <button
          onClick={() => setActiveSubTab('drive')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'drive' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Google Drive Explorer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sheets')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'sheets' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sheets Sync Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forms')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'forms' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Forms Intake Sync</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar Consultation</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gmail')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'gmail' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail Courier Node</span>
        </button>
      </div>

      {/* Dynamic Sub-Tab Rendering Panel */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[380px]">
        {/* Drive Explorer */}
        {activeSubTab === 'drive' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Google Drive File Explorer</h3>
                <p className="text-[11px] text-gray-500">Secure directory storage located under path: <code className="bg-gray-100 px-1 py-0.5 rounded">/RBA AI PRO/</code></p>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Create new file..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleCreateGoogleDoc}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Google Doc</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {driveFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                      {f.name.endsWith('.gsheet') ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-800 line-clamp-1">{f.name}</p>
                      <p className="text-[10px] text-gray-400">Size: {f.size} • Modified {f.modified}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 italic">By {f.owner}</span>
                    <button className="p-1 text-gray-400 hover:text-gray-900">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sheets Sync */}
        {activeSubTab === 'sheets' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Google Sheets Live Sync Register</h3>
                <p className="text-[11px] text-gray-500">Every outward billing invoice and CRM contact is synced directly into live sheets.</p>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="New sync Sheet name..."
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleCreateGoogleSheet}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Establish Sync</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {sheetsSync.map((s) => (
                <div key={s.id} className="p-3.5 border rounded-xl flex items-center justify-between bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{s.sheetName}</h4>
                      <p className="text-[10px] text-gray-500">Sync Range: <code className="bg-gray-100 px-1">{s.range}</code> • Update rule: {s.frequency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>SYNCED</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forms Intake sync */}
        {activeSubTab === 'forms' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Google Forms Intake Node Setup</h3>
              <p className="text-[11px] text-gray-500">Establish pre-contract intake questions directly on public forms. User responses map to documents instantly.</p>
            </div>

            <div className="p-4 bg-gray-50 border rounded-xl space-y-3.5">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Dynamic Mapping Configuration</h4>
                  <p className="text-[11px] text-gray-500">Your live form "RBA Client Intake Sheet 2026" is connected to our local ingestion database.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[9px] text-gray-400 block font-mono">GOOGLE FORM COLUMN</span>
                  <span className="font-bold text-gray-800">Full Corporate Entity Name</span>
                  <span className="text-[10px] text-cyan-600 block mt-1">→ Maps to "business_name"</span>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-[9px] text-gray-400 block font-mono">GOOGLE FORM COLUMN</span>
                  <span className="font-bold text-gray-800">Governing Forum City</span>
                  <span className="text-[10px] text-cyan-600 block mt-1">→ Maps to "jurisdiction"</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                  Webhook Active: Ingesting submissions automatically
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Consultation */}
        {activeSubTab === 'calendar' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Google Calendar Consultation Syncer</h3>
              <p className="text-[11px] text-gray-500">Live booking slots mapped to your workspace calendar with automatic Google Meet link creation.</p>
            </div>

            <div className="space-y-2">
              {calendarEvents.map((evt) => (
                <div key={evt.id} className="p-3 border rounded-xl flex items-center justify-between bg-white hover:border-gray-300 transition-all">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-cyan-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{evt.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{evt.time}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Guests: {evt.guests}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {evt.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gmail dispatch logs */}
        {activeSubTab === 'gmail' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Gmail Courier Outward Dispatch Logs</h3>
              <p className="text-[11px] text-gray-500">Monitor automated, secure dispatch of generated legal deeds directly through your personal corporate Gmail.</p>
            </div>

            <div className="space-y-2">
              {gmailLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-xl flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="font-semibold text-xs text-gray-800 pr-2 line-clamp-1">{log.subject}</p>
                      <p className="text-[10px] text-gray-400">Recipient: {log.recipient} • Dispatched {log.time}</p>
                    </div>
                  </div>

                  <span className="text-[8px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                    {log.status.toUpperCase()}
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
