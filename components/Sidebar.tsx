'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Users, 
  Settings, 
  FileText,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Users },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-slate-950/20 backdrop-blur-md h-[calc(100vh-64px)] sticky top-16 p-4">
      {/* Primary Links */}
      <div className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-500/15 border-l-4 border-indigo-500 text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Helpful Quick Tip Card */}
      <div className="glass-panel p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/10">
        <h4 className="text-xs font-bold text-indigo-300 tracking-wider uppercase mb-1 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          MOM Tip
        </h4>
        <p className="text-[11px] text-slate-400 leading-normal">
          Always write down decisions immediately after the meeting to auto-notify all members.
        </p>
      </div>
    </aside>
  );
}
