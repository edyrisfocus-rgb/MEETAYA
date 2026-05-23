'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Users, 
  ArrowRight,
  TrendingUp,
  Plus,
  AlertCircle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Dashboard states
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirection if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load dashboard data
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          const [meetingsRes, tasksRes] = await Promise.all([
            fetch('/api/meetings'),
            fetch('/api/tasks')
          ]);
          
          const mData = await meetingsRes.json();
          const tData = await tasksRes.json();

          if (mData.success && mData.data.length > 0) {
            setMeetings(mData.data);
          } else {
            // Mock dynamic data fallback if DB is empty
            setMeetings([
              { _id: 'mock-1', title: 'Monthly Strategic Alignment', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'Meeting Room A & Zoom', agenda: 'Discuss Q3 deliverables and financial overview.' },
              { _id: 'mock-2', title: 'Project Village Development Review', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), location: 'Village Hall', agenda: 'Review BUMDes program funding distribution plans.' },
              { _id: 'mock-3', title: 'Cooperative Annual Evaluation', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), location: 'Board Room', agenda: 'Approve financial distribution ratios for Q1-Q2.' }
            ]);
          }

          if (tData.success && tData.data.length > 0) {
            setTasks(tData.data);
          } else {
            // Mock tasks fallback
            setTasks([
              { _id: 'task-1', title: 'Compile Cooperative Financial Statements', pic: session.user?.email || 'admin@meetaya.local', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress', description: 'Compile all transaction logs from January to May.' },
              { _id: 'task-2', title: 'Formulate Village Proposal Draft', pic: session.user?.email || 'admin@meetaya.local', deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'open', description: 'Draft funding application for village road construction.' },
              { _id: 'task-3', title: 'Audit BUMDes Inventory Assets', pic: 'moderator@meetaya.local', deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'overdue', description: 'Confirm physical assets count at central warehouse.' },
              { _id: 'task-4', title: 'Approve Budget Allotment Excel', pic: session.user?.email || 'admin@meetaya.local', deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'done', description: 'Final check on the allocation sheet.' }
            ]);
          }
        } catch (e) {
          console.error('Failed to load data', e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalMeetings = meetings.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'done' && new Date(t.deadline) < new Date())).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex bg-[#090d16] min-h-[calc(100vh-64px)]">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Workspace Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              Welcome Back, {session?.user?.name || 'Developer'}
            </h1>
            <p className="text-xs text-slate-400">
              Workspace Overview • <span className="font-semibold text-indigo-400">MEETAYA Enterprise</span>
            </p>
          </div>
          <Link href="/meetings" className="btn-premium py-2.5 text-xs">
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Link>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Meetings', value: totalMeetings, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Total Tasks Assigned', value: totalTasks, icon: CheckSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Completed Actions', value: `${completedTasks} (${completionRate}%)`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Overdue Actions', value: overdueTasks, icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl bg-white/[0.01] border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block text-2xl font-black text-white mb-1">{stat.value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upcoming Meetings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl bg-slate-900/40">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Upcoming Meetings
                </h3>
                <Link href="/meetings" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {meetings.slice(0, 3).map((mt) => {
                  const mDate = new Date(mt.date);
                  const isUpcoming = mDate > new Date();
                  return (
                    <Link
                      key={mt._id}
                      href={`/meetings/${mt._id}`}
                      className="block p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-indigo-500/25 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {mt.title}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                          isUpcoming ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {isUpcoming ? 'Scheduled' : 'Passed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">{mt.agenda}</p>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{mDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="truncate max-w-[150px]">{mt.location}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Active Task Monitor */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-2xl bg-slate-900/40">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-purple-400" />
                  Action Items Checklist
                </h3>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {tasks.map((tk) => {
                  const tDeadline = new Date(tk.deadline);
                  const isOverdue = tk.status === 'overdue' || (tk.status !== 'done' && tDeadline < new Date());

                  const getStatusBadge = (status: string) => {
                    if (isOverdue) return 'bg-red-500/20 text-red-300 border-red-500/30';
                    switch (status) {
                      case 'done': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      case 'in_progress': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                    }
                  };

                  return (
                    <div 
                      key={tk._id} 
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-slate-200 leading-snug">
                          {tk.title}
                        </span>
                        <span className={`shrink-0 px-1.5 py-0.5 text-[8px] font-extrabold border rounded-full uppercase tracking-wider ${getStatusBadge(tk.status)}`}>
                          {isOverdue ? 'Overdue' : tk.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-500">
                        <span>PIC: {tk.pic.split('@')[0]}</span>
                        <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                          Due {tDeadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
