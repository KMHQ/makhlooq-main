'use client';

import React, { useState, useEffect } from 'react';
import { Shield, LogOut } from 'lucide-react';
import { AuthScreen, LoginScreen, DeniedScreen } from '../../../src/components/fleet/admin/FleetAdminAuth';
import AboutNewsEditor from '../../../src/components/admin/AboutNewsEditor';

export default function GlobalAdminPage() {
  const [authing, setAuthing] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAdminSession = async () => {
      setAuthing(true);
      const deniedFromRedirect = typeof window !== 'undefined' && window.location.search.includes('denied=1');
      const res = await fetch('/api/auth/discord/session?admin=1', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!mounted) return;

      if (res.ok && data?.admin) {
        setAuthed(true);
        setAccessDenied(false);
        setAdminUser(data.user || null);
      } else {
        setAuthed(false);
        setAccessDenied(res.status === 403 || deniedFromRedirect);
        setAdminUser(null);
      }

      setAuthing(false);
    };

    loadAdminSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/discord/logout', { method: 'POST' });
    setAuthed(false);
    setAccessDenied(false);
    setAdminUser(null);
  };

  if (authing) return <AuthScreen />;
  if (accessDenied) return <DeniedScreen onLogout={handleLogout} />;
  if (!authed) return <LoginScreen onLogin={() => window.location.href = '/api/auth/discord/login?returnTo=/dashboard'} />;

  return (
    <div className="min-h-[100dvh] bg-[#020402] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-[calc(100dvh-4rem)]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono font-black uppercase tracking-[0.35em] text-emerald-500 mb-2">
              <Shield size={14} className="animate-pulse" /> KMHQ Secure
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-4">
              Site <span className="text-emerald-500">Admin</span>
            </h1>
            <p className="text-gray-400 text-sm mt-3 max-w-xl leading-relaxed">
              Global administration portal. Currently editing News Page dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {adminUser && (
              <div className="flex items-center gap-3 mr-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                {adminUser.avatar ? (
                  <img src={adminUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-500/50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {adminUser.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{adminUser.username}</span>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Admin</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all gap-2 text-sm font-bold"
              title="Sign Out"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 shrink-0">
            <a
              href="/admin/collections/news-posts"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-cyan-500/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">✍️</span>
                <h3 className="text-sm font-bold text-cyan-300">Content Studio</h3>
              </div>
              <p className="text-xs text-gray-400">
                Write rich-text news, lore, and alerts with Payload CMS.
              </p>
              <span className="text-[10px] font-mono text-cyan-500 group-hover:text-cyan-300 transition-colors mt-1">
                Open Payload CMS →
              </span>
            </a>

            <a
              href="/fleet/admin"
              className="group relative flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-emerald-500/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🚀</span>
                <h3 className="text-sm font-bold text-emerald-300">Fleet Admin</h3>
              </div>
              <p className="text-xs text-gray-400">
                Manage organization fleet ships, configurations, and slugs.
              </p>
              <span className="text-[10px] font-mono text-emerald-500 group-hover:text-emerald-300 transition-colors mt-1">
                Go to Fleet Admin →
              </span>
            </a>

            <a
              href="/team/admin"
              className="group relative flex flex-col gap-2 rounded-xl border border-lime-500/20 bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-lime-500/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <h3 className="text-sm font-bold text-lime-300">Team Admin</h3>
              </div>
              <p className="text-xs text-gray-400">
                Manage organization members, profiles, and approval requests.
              </p>
              <span className="text-[10px] font-mono text-lime-500 group-hover:text-lime-300 transition-colors mt-1">
                Go to Team Admin →
              </span>
            </a>
          </div>

          <AboutNewsEditor />
        </div>
      </div>
    </div>
  );
}
