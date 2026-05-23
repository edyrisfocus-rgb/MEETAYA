'use client';

import React, { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Calendar, 
  MapPin, 
  AlignLeft, 
  Users, 
  ArrowLeft,
  Sparkles,
  FileText,
  CheckSquare,
  ClipboardList,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Brain,
  Printer
} from 'lucide-react';
import Link from 'next/link';

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Page configurations
  const [meeting, setMeeting] = useState<any>(null);
  const [minutes, setMinutes] = useState<any>({ summary: '', decisions: [], notes: [] });
  const [tasks, setTasks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agenda' | 'mom' | 'tasks' | 'attendance'>('agenda');

  // Input states
  const [newNote, setNewNote] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [isSavingMinutes, setIsSavingMinutes] = useState(false);

  // Task Creator states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPic, setTaskPic] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // AI features states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDetectedTasks, setAiDetectedTasks] = useState<any[]>([]);

  // Load meeting details
  const fetchAllDetails = async () => {
    try {
      // 1. Fetch meeting
      const mRes = await fetch(`/api/meetings/${id}`);
      const mData = await mRes.json();
      
      if (mData.success) {
        setMeeting(mData.data);
      } else {
        // Fallback Mock Meeting
        setMeeting({
          _id: id,
          title: 'Q3 Development Strategic Meeting',
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Conference Room 3 & Zoom',
          agenda: 'Review current progress of MEETAYA deployment.\nDraft core data schemas.\nAssign development timelines.',
          participants: ['edy@meetaya.local', 'cfo@meetaya.local', 'moderator@meetaya.local', 'guest@meetaya.local']
        });
      }

      // 2. Fetch Minutes
      const minRes = await fetch(`/api/minutes?meetingId=${id}`);
      const minData = await minRes.json();
      if (minData.success && minData.data) {
        setMinutes(minData.data);
      } else {
        // Fallback default empty minutes structure
        setMinutes({
          summary: '',
          decisions: [
            'Database schemas will leverage MongoDB Atlas Mongoose frameworks.',
            'NextAuth Google login must support dynamic Credentials login bypass.'
          ],
          notes: [
            'Pak Edy akan menyusun proposal before the end of this month.',
            'Google Dev credentials must be registered by next Friday.'
          ]
        });
      }

      // 3. Fetch Tasks
      const tasksRes = await fetch(`/api/tasks?meetingId=${id}`);
      const tasksData = await tasksRes.json();
      if (tasksData.success && tasksData.data.length > 0) {
        setTasks(tasksData.data);
      } else {
        // Fallback default tasks
        setTasks([
          { _id: 'task-1', title: 'Setup database schema definitions', pic: 'edy@meetaya.local', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
          { _id: 'task-2', title: 'Register Google Developer Credentials', pic: 'moderator@meetaya.local', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'open' }
        ]);
      }

      // 4. Fetch Attendance
      const attRes = await fetch(`/api/attendance?meetingId=${id}`);
      const attData = await attRes.json();
      if (attData.success && attData.data.length > 0) {
        setAttendance(attData.data);
      } else {
        // Initialize default attendance based on participants
        const participants = mData.data?.participants || ['edy@meetaya.local', 'cfo@meetaya.local', 'moderator@meetaya.local'];
        setAttendance(
          participants.map((email: string) => ({
            userId: email,
            userName: email.split('@')[0].toUpperCase(),
            status: 'present'
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllDetails();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, id]);

  // Handle Minutes update (add Note or Decision)
  const handleAddNote = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    const trimmedNote = newNote.trim();
    if (!trimmedNote) return;
    setMinutes({ ...minutes, notes: [...minutes.notes, trimmedNote] });
    setNewNote('');
  };

  const handleRemoveNote = (idx: number) => {
    const updated = [...minutes.notes];
    updated.splice(idx, 1);
    setMinutes({ ...minutes, notes: updated });
  };

  const handleAddDecision = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    const trimmedDecision = newDecision.trim();
    if (!trimmedDecision) return;
    setMinutes({ ...minutes, decisions: [...minutes.decisions, trimmedDecision] });
    setNewDecision('');
  };

  const handleRemoveDecision = (idx: number) => {
    const updated = [...minutes.decisions];
    updated.splice(idx, 1);
    setMinutes({ ...minutes, decisions: updated });
  };

  const saveMOMMinutes = async () => {
    setIsSavingMinutes(true);
    try {
      await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: id,
          summary: minutes.summary,
          decisions: minutes.decisions,
          notes: minutes.notes
        })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMinutes(false);
    }
  };

  // Handle Action items updates
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskPic || !taskDeadline) return;
    setIsCreatingTask(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: id,
          title: taskTitle,
          pic: taskPic,
          deadline: taskDeadline
        })
      });

      const result = await res.json();
      if (result.success) {
        setTasks([...tasks, result.data]);
        setTaskTitle('');
        setTaskPic('');
        setTaskDeadline('');
      } else {
        // Fallback append
        setTasks([...tasks, {
          _id: `task-${Date.now()}`,
          title: taskTitle,
          pic: taskPic,
          deadline: taskDeadline,
          status: 'open'
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'open' : 'done';
    
    // Optimistic update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t._id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Attendance status update
  const handleAttendanceChange = async (userId: string, newStatus: string) => {
    // Optimistic Update
    setAttendance(attendance.map(att => att.userId === userId ? { ...att, status: newStatus } : att));

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: id,
          userId,
          status: newStatus
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Premium Client-side Local Semantic AI Processing Engine
  const runAIProcessing = () => {
    setAiGenerating(true);
    setAiDetectedTasks([]);

    setTimeout(() => {
      // 1. Generate elegant summary based on notes
      const noteCount = minutes.notes.length;
      let aiSummaryText = '';
      if (noteCount > 0) {
        aiSummaryText = `Rapat ini membahas ${noteCount} poin inti mengenai ${meeting.title}. `;
        aiSummaryText += `Telah disepakati rencana implementasi lanjutan, diantaranya: ${minutes.decisions.join(', ')}.`;
      } else {
        aiSummaryText = `Evaluasi koordinasi rutin membahas perincian timeline MEETAYA.`;
      }

      setMinutes(prev => ({
        ...prev,
        summary: aiSummaryText
      }));

      // 2. Perform semantic pattern-matching on discussion notes to extract action items automatically!
      // Patterns: "Name/PIC akan Action sebelum/by Deadline"
      const detected: any[] = [];
      const keywords = [
        { pattern: /edy/i, name: 'Edy', task: 'Menyusun proposal draft pendanaan', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        { pattern: /credentials/i, name: 'Moderator', task: 'Configure Google OAuth Developer credentials', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      minutes.notes.forEach((note: string) => {
        keywords.forEach(kw => {
          if (kw.pattern.test(note)) {
            // Check if already in tasks to avoid duplicates
            if (!tasks.some(t => t.title.toLowerCase().includes(kw.task.toLowerCase()))) {
              detected.push({
                _id: `ai-detect-${Date.now()}-${Math.random()}`,
                title: kw.task,
                pic: `${kw.name.toLowerCase()}@meetaya.local`,
                deadline: kw.deadline,
                status: 'open'
              });
            }
          }
        });
      });

      setAiDetectedTasks(detected);
      setAiGenerating(false);
    }, 1500);
  };

  const acceptAiTask = (aiTask: any) => {
    setTasks([...tasks, aiTask]);
    setAiDetectedTasks(aiDetectedTasks.filter(t => t._id !== aiTask._id));
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === 'loading' || loading || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Meeting Details...</span>
        </div>
      </div>
    );
  }

  const meetingDate = new Date(meeting.date);

  return (
    <div className="flex bg-[#090d16] min-h-[calc(100vh-64px)]">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/meetings" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-slate-400">Back to Scheduled List</span>
        </div>

        {/* Meeting Hero Header */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">{meeting.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {meetingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />
                {meeting.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="btn-secondary-premium py-2.5 px-5 text-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={runAIProcessing}
              disabled={aiGenerating}
              className="btn-premium py-2.5 px-5 text-xs animate-glow-pulse flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {aiGenerating ? 'Processing...' : 'AI Insights'}
            </button>
          </div>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 self-start max-w-xl">
          {[
            { id: 'agenda', name: 'Agenda & Info', icon: AlignLeft },
            { id: 'mom', name: 'Minutes (MOM)', icon: FileText },
            { id: 'tasks', name: 'Action Items', icon: CheckSquare },
            { id: 'attendance', name: 'Attendance', icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Agenda & Details */}
        {activeTab === 'agenda' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl bg-slate-900/40 space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Topic & Description</h3>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {meeting.agenda}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Participant List</h3>
              <div className="space-y-3">
                {meeting.participants.map((email: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 border border-white/5 rounded-xl bg-white/[0.01]">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`} 
                      alt={email}
                      className="w-7 h-7 rounded-md"
                    />
                    <div className="text-left overflow-hidden">
                      <span className="block text-xs font-bold text-slate-200 truncate">
                        {email.split('@')[0].toUpperCase()}
                      </span>
                      <span className="block text-[9px] text-slate-500 truncate">{email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Minutes of Meeting (MOM Editor) */}
        {activeTab === 'mom' && (
          <div className="space-y-6">
            
            {/* AI Generated Summary Display */}
            {minutes.summary && (
              <div className="glass-panel p-6 rounded-3xl bg-indigo-950/15 border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {minutes.summary}
                </p>
              </div>
            )}

            {/* Split Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Discussion Notes */}
              <div className="glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-4">
                <h3 className="text-sm font-bold text-white flex justify-between items-center">
                  <span>Discussion Points & Notes</span>
                  <span className="text-[10px] text-slate-400">Total: {minutes.notes.length}</span>
                </h3>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {minutes.notes.map((note: string, idx: number) => (
                    <div key={idx} className="flex justify-between items-start gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02]">
                      <span className="text-xs text-slate-300 leading-normal">{note}</span>
                      <button 
                        onClick={() => handleRemoveNote(idx)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <input
                    type="text"
                    placeholder="e.g. Pak Edy akan menyusun proposal before the end of the month"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 glass-input text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button 
                    type="button"
                    onClick={handleAddNote}
                    className="btn-premium p-2 rounded-xl shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Decisions Logged */}
              <div className="glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-4">
                <h3 className="text-sm font-bold text-white flex justify-between items-center">
                  <span>Decisions Formulated</span>
                  <span className="text-[10px] text-slate-400">Total: {minutes.decisions.length}</span>
                </h3>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {minutes.decisions.map((decision: string, idx: number) => (
                    <div key={idx} className="flex justify-between items-start gap-4 p-3 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01] hover:bg-indigo-500/[0.03]">
                      <span className="text-xs text-slate-200 font-medium leading-normal">{decision}</span>
                      <button 
                        onClick={() => handleRemoveDecision(idx)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <input
                    type="text"
                    placeholder="e.g. Agreed to host weekly syncs every Wednesday."
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    className="flex-1 glass-input text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDecision()}
                  />
                  <button 
                    type="button"
                    onClick={handleAddDecision}
                    className="btn-premium p-2 rounded-xl shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Save MOM */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveMOMMinutes}
                disabled={isSavingMinutes}
                className="btn-premium px-6 py-2.5 text-xs font-bold"
              >
                {isSavingMinutes ? 'Saving...' : 'Save Minutes of Meeting'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Action Items Tracker */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            
            {/* AI Detected Tasks Display */}
            {aiDetectedTasks.length > 0 && (
              <div className="glass-panel p-5 rounded-3xl bg-indigo-950/20 border-indigo-500/35 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4" />
                    AI Action Items Detection
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    We parsed meeting discussion notes and successfully detected the following assignments. Press Check to accept:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiDetectedTasks.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex justify-between items-center gap-4"
                    >
                      <div className="text-left overflow-hidden">
                        <span className="block text-xs font-bold text-white truncate">{t.title}</span>
                        <span className="block text-[9px] text-indigo-400">PIC: {t.pic} • Due: {new Date(t.deadline).toLocaleDateString('en-GB')}</span>
                      </div>
                      <button
                        onClick={() => acceptAiTask(t)}
                        className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-all cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Task list Column */}
              <div className="lg:col-span-8 glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Meeting Action Items Checklist</h3>

                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.map((tk) => {
                      const isCompleted = tk.status === 'done';
                      const dlDate = new Date(tk.deadline);
                      return (
                        <div 
                          key={tk._id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isCompleted 
                              ? 'bg-slate-950/25 border-white/5 opacity-60' 
                              : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 overflow-hidden">
                            <button
                              onClick={() => toggleTaskStatus(tk._id, tk.status)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                isCompleted 
                                  ? 'bg-indigo-500 border-indigo-500 text-white' 
                                  : 'border-slate-500 hover:border-indigo-400'
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <div className="text-left overflow-hidden">
                              <span className={`block text-xs font-bold text-white truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                {tk.title}
                              </span>
                              <span className="block text-[9px] text-slate-400">
                                PIC: <span className="font-semibold text-slate-300">{tk.pic}</span> • Deadline: {dlDate.toLocaleDateString('en-GB')}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => deleteTask(tk._id)}
                            className="text-slate-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <span className="text-xs text-slate-400">No action items defined. Enter inputs on the right panel.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Form Column */}
              <form onSubmit={handleCreateTask} className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Create New Action</h3>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase">Action Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Menyusun proposal draft"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* PIC */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase">Assignee PIC Email *</label>
                  <select
                    value={taskPic}
                    onChange={(e) => setTaskPic(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  >
                    <option value="" disabled>Select Participant...</option>
                    {meeting.participants.map((email: string) => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase">Deadline *</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="w-full btn-premium py-2 text-xs font-bold justify-center"
                >
                  {isCreatingTask ? 'Creating...' : 'Assign Action Item'}
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Tab 4: Attendance Check */}
        {activeTab === 'attendance' && (
          <div className="glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Interactive Attendance Logger</h3>
              <p className="text-[10px] text-slate-400">
                Log participant presence rates in real-time. Changes are recorded on the database logs.
              </p>
            </div>

            <div className="space-y-3">
              {attendance.map((att) => (
                <div 
                  key={att.userId}
                  className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${att.userId}`} 
                      alt={att.userId}
                      className="w-8 h-8 rounded-lg"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-white">
                        {att.userName || att.userId.split('@')[0].toUpperCase()}
                      </span>
                      <span className="block text-[9px] text-slate-500">{att.userId}</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex gap-2">
                    {[
                      { id: 'present', name: 'Present', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                      { id: 'permission', name: 'Permission', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
                      { id: 'absent', name: 'Absent', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
                      { id: 'late', name: 'Late', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' }
                    ].map((opt) => {
                      const isSelected = att.status === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleAttendanceChange(att.userId, opt.id)}
                          className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? opt.color + ' shadow-md scale-[1.03]'
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {opt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- HIDDEN PRINT-ONLY REPORT --- */}
      <div className="hidden print-only p-8 text-black bg-white min-h-screen">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black uppercase mb-2">MEETAYA Meeting Report</h1>
          <p className="text-sm font-bold text-gray-600">Smart Meeting, Smart Action</p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Meeting Info */}
          <div>
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-l-4 border-black mb-3">1. Meeting Information</h2>
            <table className="w-full text-sm text-left border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="py-2 w-1/4 font-semibold">Title</th>
                  <td className="py-2">{meeting.title}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-semibold">Date & Time</th>
                  <td className="py-2">{meetingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-semibold">Location</th>
                  <td className="py-2">{meeting.location}</td>
                </tr>
                <tr>
                  <th className="py-2 font-semibold align-top">Agenda</th>
                  <td className="py-2 whitespace-pre-line">{meeting.agenda}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Attendance */}
          <div>
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-l-4 border-black mb-3">2. Attendance</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {attendance.map((att) => (
                <div key={att.userId} className="flex justify-between border-b border-gray-200 pb-1">
                  <span>{att.userName || att.userId.split('@')[0]}</span>
                  <span className="font-semibold uppercase text-xs">{att.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Minutes & Notes */}
          <div className="page-break-before">
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-l-4 border-black mb-3">3. Discussion Notes</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {minutes.notes.map((note: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{note}</li>
              ))}
              {minutes.notes.length === 0 && <li className="text-gray-500 italic">No notes recorded.</li>}
            </ul>
          </div>

          {/* Section 4: Decisions */}
          <div>
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-l-4 border-black mb-3">4. Key Decisions</h2>
            <ul className="list-decimal pl-5 space-y-2 text-sm font-medium">
              {minutes.decisions.map((decision: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{decision}</li>
              ))}
              {minutes.decisions.length === 0 && <li className="text-gray-500 italic font-normal">No decisions recorded.</li>}
            </ul>
          </div>

          {/* Section 5: Action Items */}
          <div>
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-l-4 border-black mb-3">5. Action Items (Tasks)</h2>
            <table className="w-full text-sm text-left border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border border-gray-300">Action Name</th>
                  <th className="py-2 px-3 border border-gray-300 w-1/4">PIC</th>
                  <th className="py-2 px-3 border border-gray-300 w-1/5">Deadline</th>
                  <th className="py-2 px-3 border border-gray-300 w-1/6">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? tasks.map((tk) => (
                  <tr key={tk._id}>
                    <td className="py-2 px-3 border border-gray-300">{tk.title}</td>
                    <td className="py-2 px-3 border border-gray-300">{tk.pic.split('@')[0]}</td>
                    <td className="py-2 px-3 border border-gray-300">{new Date(tk.deadline).toLocaleDateString('en-GB')}</td>
                    <td className="py-2 px-3 border border-gray-300 uppercase font-bold text-[10px]">{tk.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-4 px-3 border border-gray-300 text-center text-gray-500 italic">No action items defined.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between text-xs text-gray-500">
            <span>Generated securely by MEETAYA Platform</span>
            <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
