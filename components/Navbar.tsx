'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Calendar, LogOut, Menu, X, Bell, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (session) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch('/api/notifications');
          const data = await res.json();
          if (data.success) {
            setNotifications(data.data);
          } else {
            // Mock fallback if DB is empty
            setNotifications([
              { _id: 'n1', title: 'Task Assigned', message: 'You have been assigned to "Draft BUMDes Proposal".', isRead: false, createdAt: new Date().toISOString() },
              { _id: 'n2', title: 'Meeting Scheduled', message: 'Board Meeting has been scheduled for tomorrow.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
            ]);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchNotifications();
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    for (const id of unreadIds) {
      if (!id.startsWith('n')) { // Skip mocks
        try {
          fetch(`/api/notifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true })
          });
        } catch (e) {}
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'admin': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'moderator': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'member': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getFriendlyRoleName = (role?: string) => {
    if (!role) return 'Guest';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  MEETAYA
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                  Smart Meeting, Smart Action
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {session && (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Dashboard
                </Link>
                <Link href="/meetings" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Meetings
                </Link>
              </>
            )}

            {session ? (
              <div className="flex items-center gap-4">
                
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowProfileMenu(false);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel bg-slate-900/95 border border-white/10 p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                        <span className="text-sm font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {notifications.length > 0 ? notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => !n.isRead && markAsRead(n._id)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${n.isRead ? 'bg-white/[0.01] border-white/5 opacity-70' : 'bg-indigo-500/10 border-indigo-500/20'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-bold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</span>
                              {!n.isRead && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1"></span>}
                            </div>
                            <p className="text-[10px] text-slate-400 mb-1 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        )) : (
                          <div className="text-center py-6 text-xs text-slate-500">
                            No recent notifications.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center gap-3 p-1.5 pr-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer"
                  >
                    <img 
                      src={session.user?.image || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                      alt={session.user?.name || 'User'} 
                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-semibold text-white leading-tight">
                        {session.user?.name}
                      </span>
                      <span className={`inline-block px-1.5 py-0.5 mt-0.5 text-[9px] font-bold border rounded-full ${getRoleBadgeColor((session.user as any).role)}`}>
                        {getFriendlyRoleName((session.user as any).role)}
                      </span>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel bg-slate-900/95 border border-white/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <span className="block text-xs text-slate-400">Signed in as</span>
                        <span className="block text-xs font-medium text-white truncate">{session.user?.email}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-premium py-1.5 px-4 text-sm">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {session && (
              <button 
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setIsOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-slate-900"></span>}
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setShowNotifMenu(false);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menus */}
      {showNotifMenu && (
        <div className="md:hidden glass-panel border-t border-white/5 bg-slate-950/95 p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
            <span className="text-sm font-bold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Mark all as read
              </button>
            )}
          </div>
          <div className="space-y-2">
            {notifications.length > 0 ? notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${n.isRead ? 'bg-white/[0.01] border-white/5 opacity-70' : 'bg-indigo-500/10 border-indigo-500/20'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{n.message}</p>
              </div>
            )) : (
              <div className="text-center py-4 text-xs text-slate-500">No notifications.</div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 bg-slate-950/95 backdrop-blur-lg animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-b border-white/5 mb-2">
                  <img 
                    src={session.user?.image || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt={session.user?.name || 'User'} 
                    className="w-10 h-10 rounded-lg border border-white/10"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-white">{session.user?.name}</span>
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold border rounded-full mt-0.5 ${getRoleBadgeColor((session.user as any).role)}`}>
                      {getFriendlyRoleName((session.user as any).role)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/meetings"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Meetings
                </Link>

                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 mt-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="px-3 py-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center block btn-premium py-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
