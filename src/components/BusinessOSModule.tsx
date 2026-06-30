import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  FolderGit2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { type TenantWorkspace, type TeamMember } from './SaaSData';
import { motion, AnimatePresence } from 'motion/react';

interface BusinessOSProps {
  activeWorkspace: TenantWorkspace;
  onUpdateWorkspace: (updated: TenantWorkspace) => void;
}

export default function BusinessOSModule({ activeWorkspace, onUpdateWorkspace }: BusinessOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'team' | 'departments' | 'tasks'>('team');

  // Local Task Board state
  const [tasks, setTasks] = useState([
    { id: 'tsk_1', title: 'Draft Shareholder Agreement', desc: 'Prepare omnibus corporate bylaws for seed round', dept: 'Legal Team', due: 'July 5', status: 'pending' },
    { id: 'tsk_2', title: 'Form Ingestion Setup', desc: 'Sync Google Forms column triggers for client intake', dept: 'Engineering', due: 'Tomorrow', status: 'completed' },
    { id: 'tsk_3', title: 'Submit MCA Filing Records', desc: 'Reconcile director DIN additions with state registry', dept: 'Compliance', due: 'July 15', status: 'pending' }
  ]);

  // Form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Staff');
  const [newMemberDept, setNewMemberDept] = useState(activeWorkspace.departments[0] || 'Administration');

  const [newDeptName, setNewDeptName] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDept, setNewTaskDept] = useState(activeWorkspace.departments[0] || 'Administration');

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole as any,
      department: newMemberDept,
      status: 'Active'
    };

    const updatedWorkspace = {
      ...activeWorkspace,
      teamMembers: [...activeWorkspace.teamMembers, newMember]
    };
    onUpdateWorkspace(updatedWorkspace);

    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    const updatedWorkspace = {
      ...activeWorkspace,
      teamMembers: activeWorkspace.teamMembers.filter(tm => tm.id !== id)
    };
    onUpdateWorkspace(updatedWorkspace);
  };

  const handleAddDepartment = () => {
    if (!newDeptName.trim() || activeWorkspace.departments.includes(newDeptName)) return;
    
    const updatedWorkspace = {
      ...activeWorkspace,
      departments: [...activeWorkspace.departments, newDeptName]
    };
    onUpdateWorkspace(updatedWorkspace);
    setNewDeptName('');
  };

  const handleRemoveDepartment = (dept: string) => {
    const updatedWorkspace = {
      ...activeWorkspace,
      departments: activeWorkspace.departments.filter(d => d !== dept)
    };
    onUpdateWorkspace(updatedWorkspace);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `tsk_${Date.now()}`,
      title: newTaskTitle,
      desc: 'Operational task allocated under business workflow',
      dept: newTaskDept,
      due: 'July 10',
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* Sub-Module Selector */}
      <div className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Business Modules</p>
        
        <button
          onClick={() => setActiveSubTab('team')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'team' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Directory</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'departments' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Department Allocator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
            activeSubTab === 'tasks' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Operational Kanban Tasks</span>
        </button>
      </div>

      {/* Main OS view */}
      <div className="xl:col-span-9 bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm min-h-[420px]">
        
        {/* Team Directory */}
        {activeSubTab === 'team' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Workspace Team Members</h3>
                <p className="text-xs text-gray-500">Add staff, invite legal advisors, and assign roles for role-based access security.</p>
              </div>
            </div>

            {/* Quick add member */}
            <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priyan Sharma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="e.g. sharma@corp.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Security Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                >
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Staff</option>
                  <option>Client</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleAddMember}
                  className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Member</span>
                </button>
              </div>
            </div>

            {/* Member List */}
            <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto">
              {activeWorkspace.teamMembers.map((tm) => (
                <div key={tm.id} className="p-3 border rounded-xl flex items-center justify-between bg-white hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {tm.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">{tm.name}</h4>
                      <p className="text-[10px] text-gray-450">{tm.email} • Dept: {tm.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-mono">
                      {tm.role}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 uppercase font-mono">
                      {tm.status}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(tm.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department Board */}
        {activeSubTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Workspace Organizational Departments</h3>
                <p className="text-xs text-gray-500">Segment operations, assign separate client folders, and configure RBAC boundaries.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Department..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-950"
                />
                <button
                  onClick={handleAddDepartment}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeWorkspace.departments.map((dept) => {
                const count = activeWorkspace.teamMembers.filter(tm => tm.department === dept).length;
                return (
                  <div key={dept} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center hover:border-gray-300 transition-all">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 uppercase tracking-tight">{dept}</h4>
                      <p className="text-[10px] text-gray-550 mt-1">{count} Team Members Allocated</p>
                    </div>

                    <button
                      onClick={() => handleRemoveDepartment(dept)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Operational Tasks */}
        {activeSubTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Operational Task Manager</h3>
                <p className="text-xs text-gray-500">Track milestones, contracts to be finalized, and client onboarding queues.</p>
              </div>
            </div>

            {/* Quick add task */}
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Describe new operational milestone..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-gray-950"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-2.5 mt-4">
              {tasks.map((tsk) => (
                <div key={tsk.id} className="p-3.5 border rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(tsk.id)}
                      className={`p-1.5 rounded-full border transition-all shrink-0 ${
                        tsk.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-300 hover:bg-emerald-100' 
                          : 'border-gray-300 hover:bg-gray-50 text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className={`font-bold text-xs text-gray-900 ${tsk.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{tsk.title}</h4>
                      <p className="text-[10px] text-gray-500">{tsk.desc}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold tracking-tight uppercase">
                        {tsk.dept}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] text-gray-450 flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Due {tsk.due}</span>
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
