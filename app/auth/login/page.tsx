'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Shield, Sparkles, User, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@meetaya.local');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rolesList = [
    { id: 'super_admin', name: 'Super Admin', desc: 'Full application control & global config' },
    { id: 'admin', name: 'Admin', desc: 'Organization management, user control & meeting creator' },
    { id: 'moderator', name: 'Moderator', desc: 'Schedule meetings & compile minutes of meetings' },
    { id: 'member', name: 'Member', desc: 'Join assigned meetings & complete task monitoring' },
    { id: 'guest', name: 'Guest', desc: 'Read-only dashboard view & meeting log inspection' },
  ];

  const handleRoleSelect = (roleId: string) => {
    setRole(roleId);
    setEmail(`${roleId}@meetaya.local`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        role,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (res?.error) {
        setError('Login failed. Please check credentials.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl bg-slate-900/60 shadow-2xl relative border border-white/5">
        
        {/* Form Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Calendar className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Welcome to MEETAYA</h2>
          <p className="text-xs text-slate-400">
            Choose a developer persona to explore the app instantly.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10 transition-all"
            >
              <span className="w-4 h-4 inline-block">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path d="M12 11.5v2.9h6.3c-.3 1.9-2 5.6-6.3 5.6-3.8 0-7-3.1-7-7s3.2-7 7-7c2.2 0 3.7.9 4.6 1.7l1.6-1.6C16.4 4.2 14.4 3.2 12 3.2 6.8 3.2 2.8 7.2 2.8 12.4s4 9.2 9.2 9.2c5.3 0 8.9-3.7 8.9-8.9 0-.6-.1-1.1-.2-1.6H12z" fill="#4285F4" />
                  <path d="M4.9 7.1l2.7 2.1C8 7.6 9.8 6.5 12 6.5c1.6 0 3 .6 4 1.6l2.3-2.3C17 3.9 14.7 3 12 3 9 3 6.5 4 4.9 7.1z" fill="#34A853" opacity="0.001" />
                </svg>
              </span>
              Continue with Google
            </button>
            <div className="text-center text-[10px] text-slate-500">or use developer persona below</div>
          </div>

          {/* Persona Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              Select Developer Role
            </label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {rolesList.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-500/15 border-indigo-500/60 shadow-md shadow-indigo-500/5' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {r.name}
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                    </div>
                    <span className="block text-[10px] text-slate-400 leading-normal">
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input text-sm pl-4 pr-4"
                placeholder="developer@meetaya.local"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium py-3 text-sm justify-center font-bold relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In as {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
