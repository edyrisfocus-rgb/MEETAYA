'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Calendar, 
  MapPin, 
  AlignLeft, 
  Users, 
  Plus, 
  Sparkles, 
  Search,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Page States
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Form States
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Ready-to-use template applicator
  const templates = [
    { title: 'Board Meeting', agenda: '1. Review Q2 Financial statements.\n2. Voting on new business proposals.\n3. Strategic hiring permissions.', location: 'Executive Boardroom & Zoom' },
    { title: 'Cooperative Meeting', agenda: '1. Member share allocations review.\n2. Operational expense review.\n3. Ratifying new membership rules.', location: 'Cooperative HQ Office' },
    { title: 'Village Meeting', agenda: '1. Public road construction funding.\n2. Citizen requests and community concerns.\n3. Planning clean-water initiatives.', location: 'Village Community Hall' },
    { title: 'Project Review', agenda: '1. Showcase Q1 project milestone updates.\n2. Sprint retrospective & blocker discussion.\n3. Assigning PICs for upcoming releases.', location: 'Project War Room' }
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setTitle(`${tpl.title} - ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`);
    setAgenda(tpl.agenda);
    setLocation(tpl.location);
  };

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load meetings
  const loadMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setMeetings(data.data);
      } else {
        // Mock fallback
        setMeetings([
          { _id: 'mock-1', title: 'Monthly Strategic Alignment', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'Meeting Room A & Zoom', agenda: 'Discuss Q3 deliverables and financial overview.', participants: ['director@meetaya.local', 'cfo@meetaya.local', 'admin@meetaya.local'] },
          { _id: 'mock-2', title: 'Project Village Development Review', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), location: 'Village Hall', agenda: 'Review BUMDes program funding distribution plans.', participants: ['village-head@meetaya.local', 'admin@meetaya.local'] },
          { _id: 'mock-3', title: 'Cooperative Annual Evaluation', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), location: 'Board Room', agenda: 'Approve financial distribution ratios for Q1-Q2.', participants: ['member1@meetaya.local', 'member2@meetaya.local'] }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadMeetings();
    }
  }, [status]);

  // Handle meeting submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!title || !agenda || !location || !date) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const participantsArray = participantsInput
      ? participantsInput.split(',').map(email => email.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          agenda,
          location,
          date,
          participants: participantsArray
        })
      });

      const result = await res.json();
      if (result.success) {
        setFormSuccess(true);
        // Reset form
        setTitle('');
        setAgenda('');
        setLocation('');
        setDate('');
        setParticipantsInput('');
        
        // Reload list and switch tab after short delay
        loadMeetings();
        setTimeout(() => {
          setActiveTab('list');
          setFormSuccess(false);
        }, 1500);
      } else {
        setFormError(result.error || 'Failed to schedule meeting.');
      }
    } catch (err) {
      setFormError('Failed to establish API connection.');
    }
  };

  // Filter meetings by search term
  const filteredMeetings = meetings.filter(mt => 
    mt.title.toLowerCase().includes(search.toLowerCase()) || 
    mt.agenda.toLowerCase().includes(search.toLowerCase()) ||
    mt.location.toLowerCase().includes(search.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Meetings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#090d16] min-h-[calc(100vh-64px)]">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              Meeting Scheduling & Archives
            </h1>
            <p className="text-xs text-slate-400">
              Select, manage, and create schedules using structured agendas.
            </p>
          </div>

          {/* Tab Switcher Button */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Meetings
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Schedule New
            </button>
          </div>
        </div>

        {/* Tab 1: Meetings List */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search meetings by title, agenda, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-10 text-xs"
              />
            </div>

            {/* Meetings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((mt) => {
                  const mDate = new Date(mt.date);
                  return (
                    <div 
                      key={mt._id} 
                      className="glass-panel glass-panel-hover p-6 rounded-3xl bg-slate-900/40 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Date badge */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {mDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">
                            {mDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white mb-2 line-clamp-1">
                          {mt.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {mt.agenda}
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-2">
                        {/* Location */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{mt.location}</span>
                        </div>

                        {/* Action Link */}
                        <Link 
                          href={`/meetings/${mt._id}`}
                          className="w-full text-center block btn-secondary-premium py-2 text-xs font-bold"
                        >
                          View Logs & Action Items
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 glass-panel rounded-3xl bg-white/[0.01]">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <span className="block text-sm font-bold text-white mb-1">No Meetings Found</span>
                  <span className="text-xs text-slate-400">Schedule a meeting or try searching for another keyword.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Create Meeting Form */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl bg-slate-900/60 space-y-6">
              
              {/* Form Statuses */}
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Meeting Scheduled successfully! Switching to List view...
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUMDes Q2 Strategic Alignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Location / Link *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Village Hall / Zoom Link"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Agenda */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-slate-400" />
                  Meeting Agenda *
                </label>
                <textarea
                  rows={4}
                  placeholder="Write topics of discussions, agendas, or specific targets..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full glass-input text-xs resize-none"
                  required
                ></textarea>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  Participants (Comma separated emails)
                </label>
                <input
                  type="text"
                  placeholder="e.g. user1@meetaya.local, moderator@meetaya.local"
                  value={participantsInput}
                  onChange={(e) => setParticipantsInput(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-premium px-8 py-3.5 text-xs font-bold w-full sm:w-auto"
              >
                Schedule & Publish Meeting
              </button>
            </form>

            {/* Premium Templates Sidepanel */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Deploy Templates
                </h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Initialize standard formatting instantly. Select a template type to pre-fill meeting agenda and default settings.
                </p>
              </div>

              <div className="space-y-3">
                {templates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="w-full text-left p-3.5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-indigo-500/20 transition-all group cursor-pointer"
                  >
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors mb-1">
                      {tpl.title}
                    </span>
                    <span className="block text-[9px] text-slate-400 line-clamp-2">
                      {tpl.agenda}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
