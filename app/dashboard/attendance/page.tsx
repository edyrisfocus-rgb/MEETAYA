'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { CalendarCheck, Users, ShieldCheck, AlertCircle, TrendingUp, BarChart3, Clock } from 'lucide-react';

export default function AttendanceDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchAttendanceData = async () => {
      try {
        const [attRes, meetingsRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/meetings'),
        ]);

        const attData = await attRes.json();
        const meetingData = await meetingsRes.json();

        if (attData.success && attData.data.length > 0) {
          setAttendance(attData.data);
        } else {
          setAttendance([
            { _id: 'att-1', meetingId: 'meet-1', userId: 'edy@meetaya.local', userName: 'Edy', status: 'present' },
            { _id: 'att-2', meetingId: 'meet-1', userId: 'cfo@meetaya.local', userName: 'CFO', status: 'permission' },
            { _id: 'att-3', meetingId: 'meet-2', userId: 'moderator@meetaya.local', userName: 'Moderator', status: 'present' },
            { _id: 'att-4', meetingId: 'meet-2', userId: 'member1@meetaya.local', userName: 'Member1', status: 'late' },
            { _id: 'att-5', meetingId: 'meet-3', userId: 'member2@meetaya.local', userName: 'Member2', status: 'absent' },
            { _id: 'att-6', meetingId: 'meet-3', userId: 'admin@meetaya.local', userName: 'Admin', status: 'present' },
          ]);
        }

        if (meetingData.success && meetingData.data.length > 0) {
          setMeetings(meetingData.data);
        } else {
          setMeetings([
            { _id: 'meet-1', title: 'Monthly Strategic Alignment', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'Meeting Room A & Zoom' },
            { _id: 'meet-2', title: 'Project Village Development Review', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), location: 'Village Hall' },
            { _id: 'meet-3', title: 'Cooperative Annual Evaluation', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), location: 'Board Room' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load attendance data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Attendance Analytics...</span>
        </div>
      </div>
    );
  }

  const totalRecords = attendance.length;
  const presentCount = attendance.filter((item) => item.status === 'present').length;
  const permissionCount = attendance.filter((item) => item.status === 'permission').length;
  const lateCount = attendance.filter((item) => item.status === 'late').length;
  const absentCount = attendance.filter((item) => item.status === 'absent').length;
  const attendanceRate = totalRecords ? Math.round((presentCount / totalRecords) * 100) : 0;

  const meetingSummary = meetings.map((meeting) => {
    const records = attendance.filter((item) => item.meetingId === meeting._id);
    const present = records.filter((item) => item.status === 'present').length;
    const rate = records.length ? Math.round((present / records.length) * 100) : 0;
    return {
      ...meeting,
      records,
      present,
      rate,
      total: records.length,
    };
  });

  const sortedMeetings = [...meetingSummary].sort((a, b) => b.rate - a.rate).slice(0, 3);

  return (
    <div className="flex bg-[#090d16] min-h-[calc(100vh-64px)]">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              Attendance Analytics
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Monitor attendance performance across meetings, identify trends, and see who is consistently present or absent.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-xs text-slate-400">
            Updated on {new Date().toLocaleDateString('en-GB')} • {totalRecords} records
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CalendarCheck, accent: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Present', value: presentCount, icon: Users, accent: 'text-indigo-400 bg-indigo-500/10' },
            { label: 'Late', value: lateCount, icon: Clock, accent: 'text-purple-400 bg-purple-500/10' },
            { label: 'Absent / Permit', value: `${absentCount} / ${permissionCount}`, icon: ShieldCheck, accent: 'text-amber-400 bg-amber-500/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-panel p-5 rounded-3xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">{stat.label}</span>
                  <span className={`p-3 rounded-2xl ${stat.accent}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 glass-panel p-6 rounded-3xl bg-slate-900/40">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Attendance by Meeting</h2>
                <p className="text-[11px] text-slate-400">Top meetings with the highest attendance rate.</p>
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-4">
              {sortedMeetings.length > 0 ? sortedMeetings.map((meeting) => (
                <div key={meeting._id} className="p-4 rounded-3xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white truncate">{meeting.title}</p>
                      <p className="text-[10px] text-slate-400">{meeting.location}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{meeting.total} attendees</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>Present: {meeting.present}</span>
                    <span>Rate: {meeting.rate}%</span>
                  </div>
                  <div className="h-2 mt-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${meeting.rate}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-xs text-slate-500">Attendance records are not available yet.</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-slate-900/40 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Breakdown</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Present', value: presentCount, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
                { label: 'Permission', value: permissionCount, color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
                { label: 'Late', value: lateCount, color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
                { label: 'Absent', value: absentCount, color: 'bg-red-500/10 text-red-300 border-red-500/20' },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${item.color}`}>
                  <span className="text-[11px] text-slate-200">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl bg-slate-900/40">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Attendance Activity Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 uppercase tracking-[0.2em] text-[10px]">
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Meeting</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const meeting = meetings.find((m) => m._id === record.meetingId);
                  const meetingDate = meeting ? new Date(meeting.date) : null;
                  return (
                    <tr key={record._id} className="bg-white/5 rounded-3xl mb-2">
                      <td className="px-4 py-3 align-top text-slate-200 font-medium">{record.userName || record.userId.split('@')[0]}</td>
                      <td className="px-4 py-3 align-top text-slate-400">{meeting?.title || 'Unknown meeting'}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                          record.status === 'present' ? 'bg-emerald-500/15 text-emerald-300' :
                          record.status === 'late' ? 'bg-purple-500/15 text-purple-300' :
                          record.status === 'permission' ? 'bg-amber-500/15 text-amber-300' :
                          'bg-red-500/15 text-red-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-400">
                        {meetingDate ? meetingDate.toLocaleDateString('en-GB') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
