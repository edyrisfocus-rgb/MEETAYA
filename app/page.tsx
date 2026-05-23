import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  Sparkles, 
  Shield, 
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const templates = [
    { title: 'Board Meeting', desc: 'Strategic high-level sessions, voting, and director resolutions.', color: 'from-blue-500 to-indigo-500' },
    { title: 'Cooperative Meeting', desc: 'Member updates, financial allocations, and governance.', color: 'from-indigo-500 to-purple-500' },
    { title: 'Village Meeting', desc: 'Community development, budget distributions, and public feedback.', color: 'from-purple-500 to-pink-500' },
    { title: 'Project Review', desc: 'Sprint retrospectives, milestones alignment, and blocker mitigations.', color: 'from-pink-500 to-rose-500' },
    { title: 'Evaluation Meeting', desc: 'KPI check-ins, performance summaries, and goal settings.', color: 'from-emerald-500 to-teal-500' },
    { title: 'BUMDes Meeting', desc: 'Village-owned business modeling, updates, and profits monitoring.', color: 'from-amber-500 to-orange-500' },
  ];

  const features = [
    { icon: FileText, title: 'Smart MOM Generation', desc: 'Create minutes of meetings with clean sections for notes, decisions, and outcomes instantly.' },
    { icon: CheckSquare, title: 'Action Item Tracker', desc: 'Assign actions with PICs and due dates. Turn discussions into direct action steps.' },
    { icon: Clock, title: 'Automatic Deadlines', desc: 'Keep track of overdue tasks and set due-date alerts automatically.' },
    { icon: Users, title: 'Attendance Analytics', desc: 'Log attendance rates and status patterns (present, permission, absent, late) elegantly.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center relative z-10">
        
        {/* Glow Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel bg-white/5 border-white/10 mb-8 animate-glow-pulse">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Transforming Meetings into Actions
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="block text-white">Smart Meeting,</span>
          <span className="block bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Action.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
          MEETAYA is not just a meeting note application. We bridge the gap between minutes and execution. 
          Manage agendas, compile decisions, assign action items, and monitor progress in one beautiful ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <Link href="/auth/login" className="btn-premium px-8 py-3.5 text-base w-full sm:w-auto justify-center">
            Start Meeting Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#templates" className="btn-secondary-premium px-8 py-3.5 text-base w-full sm:w-auto justify-center">
            Explore Templates
          </Link>
        </div>

        {/* Dynamic Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-28">
          {[
            { label: 'Meeting Setup', value: '10s' },
            { label: 'Action Completion Rate', value: '94%' },
            { label: 'Active Organization', value: '250+' },
            { label: 'AI Summaries Generated', value: '10K+' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl bg-white/[0.02] border-white/5 text-center">
              <span className="block text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Value Prop Columns */}
        <div className="mb-28">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Engineered for Seamless Execution</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-12 text-center text-sm">
            Everything you need to go from an agenda to structured, accountable outcomes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-panel glass-panel-hover p-6 rounded-2xl text-left bg-slate-900/40">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Templates Section */}
        <div id="templates" className="scroll-mt-20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Ready-to-Use Meeting Templates</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-12 text-center text-sm">
            Deploy standardization instantly. Save time and format professional logs using curated layouts.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover p-6 rounded-3xl text-left bg-gradient-to-b from-slate-900/60 to-slate-950/80 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${tpl.color} opacity-[0.05] group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`}></div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${tpl.color}`}></span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tpl.title}</h3>
                <p className="text-xs text-slate-400 leading-normal">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/60 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MEETAYA. Designed for maximum productivity. "Smart Meeting, Smart Action".
          </p>
        </div>
      </footer>
    </div>
  );
}
