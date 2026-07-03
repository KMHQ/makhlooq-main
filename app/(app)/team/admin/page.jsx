'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Shield, Search, LogOut, RefreshCw, Award } from 'lucide-react';

// Modular Components
import {
  ColorPicker,
  AddMemberModal,
  STATUS_COLORS,
  ROLES,
  CATS,
  SEC_LEVELS
} from '../../../../src/components/team/AdminComponents';

export default function AdminPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMemberForAwards, setSelectedMemberForAwards] = useState(null);
  const [session, setSession] = useState(null);
  const [authing, setAuthing] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    // Admin fetches ALL members including unapproved (via ?all=1)
    const res = await window.fetch('/api/team-members?all=1', { cache: 'no-store' });
    const data = await res.json().catch(() => []);
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const loadAdminSession = async () => {
      setAuthing(true);
      const deniedFromRedirect = window.location.search.includes('denied=1');
      const res = await window.fetch('/api/auth/discord/session?admin=1', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!mounted) return;

      if (res.ok && data?.admin) {
        setSession(data.user);
        setAuthed(true);
        await loadMembers();
      } else {
        setSession(res.status === 401 ? null : data.user || null);
        setAuthed(false);
        setMembers([]);
        setLoading(false);
        if (deniedFromRedirect) setSession(data.user || { denied: true });
      }

      if (mounted) setAuthing(false);
    };

    loadAdminSession();

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithDiscord = () => {
    window.location.href = '/api/auth/discord/login?returnTo=/team/admin';
  };

  const logout = async () => {
    await window.fetch('/api/auth/discord/logout', { method: 'POST' });
    setSession(null);
    setAuthed(false);
    setMembers([]);
  };

  const startEdit = (m) => { setEditId(m.id); setEditData({ ...m }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    setSaving(true);
    const { name, node_color, role, category, status, bio, is_admin, avatar_url, joined_at, sec_level, flair_color, flair_icon, awards } = editData;
    await window.fetch(`/api/team-members/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, node_color, role, category, status, bio, is_admin, avatar_url, joined_at, sec_level, flair_color, flair_icon, awards }),
    });
    await loadMembers();
    cancelEdit();
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('Remove this member from the roster?')) return;
    await window.fetch(`/api/team-members/${id}`, { method: 'DELETE' });
    await loadMembers();
  };

  const approveMember = async (id) => {
    await window.fetch(`/api/team-members/approve?id=${id}`, { method: 'PUT' });
    await loadMembers();
  };

  const rejectMember = async (id) => {
    if (!confirm('Reject and remove this applicant from the system?')) return;
    await window.fetch(`/api/team-members/approve?id=${id}`, { method: 'DELETE' });
    await loadMembers();
  };

  const syncDiscord = async () => {
    setSyncing(true);
    try {
      const res = await window.fetch('/api/discord/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully synced ${data.synced} members!`);
        await loadMembers();
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    setSyncing(false);
  };

  const pendingMembers = members.filter(m => !m.is_approved);
  const approvedMembers = members.filter(m => m.is_approved);
  const filtered = filter
    ? approvedMembers.filter(m => [m.name, m.role, m.category].join(' ').toLowerCase().includes(filter.toLowerCase()))
    : approvedMembers;

  if (authing) {
    return (
      <div className="min-h-screen bg-[#040806] text-white flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">Initializing Secure Link...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#040806] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/40 border border-emerald-500/10 rounded-3xl p-10 backdrop-blur-xl"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Shield size={40} className="text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
            <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest font-mono">Restricted Access</p>
            <button
              onClick={loginWithDiscord}
              className="w-full py-4 rounded-xl bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-all shadow-[0_0_20px_rgba(88,101,242,0.2)] flex items-center justify-center gap-3"
            >
              <img src="https://assets-global.website-files.com/6257adef93467e5028da4f2d/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="" className="w-6" />
              Sign in with Discord
            </button>
            <Link href="/team" className="inline-flex items-center gap-2 mt-8 text-gray-500 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold">
              <ArrowLeft size={14} /> Return to Network
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#040806] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/5 border border-red-500/10 rounded-3xl p-10 backdrop-blur-xl"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Shield size={40} className="text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 text-sm mb-8">Identification confirmed, but administrative clearance was not found for this account.</p>
            <button
              onClick={logout}
              className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all mb-4 flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
            <Link href="/team" className="inline-flex items-center gap-2 mt-4 text-gray-600 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold">
              <ArrowLeft size={14} /> Back to Network
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040806] text-white selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06),transparent_55%)]" />

      <div className="relative z-10 w-full px-3 sm:px-5 2xl:px-8 pt-12 pb-24">
        {/* Header */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex items-center justify-between">
            <Link href="/team" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors text-sm font-medium group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Team
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-black uppercase tracking-widest">Administrator</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Crew Management</h1>
              <p className="text-gray-500 text-sm">Crew roster, roles, colors, and admin settings — all managed here</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Filter personnel…"
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-emerald-500/40 w-48 transition-all focus:w-64"
                />
              </div>
              <button
                onClick={syncDiscord}
                disabled={syncing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Discord Sync'}
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Plus size={16} /> Add Member
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Crew', value: approvedMembers.length },
            { label: 'Active Crew', value: approvedMembers.filter(m => m.status === 'active').length },
            { label: 'Admin Power', value: approvedMembers.filter(m => m.is_admin).length },
            { label: 'Pending Review', value: pendingMembers.length, highlight: pendingMembers.length > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border px-6 py-5 backdrop-blur-sm ${s.highlight ? 'border-amber-400/30 bg-amber-500/5' : 'border-emerald-500/10 bg-[#040c08]/50'
              }`}>
              <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ${s.highlight ? 'text-amber-400/70' : 'text-gray-500'}`}>{s.label}</div>
              <div className={`text-3xl font-bold font-mono ${s.highlight && s.value > 0 ? 'text-amber-400' : 'text-white'}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pending Crew Section */}
        {pendingMembers.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black text-[10px] font-black">{pendingMembers.length}</div>
              <h2 className="text-lg font-bold text-white tracking-tight">Pending Crew Requests</h2>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400/70">Awaiting your approval</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingMembers.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-4 backdrop-blur-sm"
                >
                  <div
                    className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border-2 border-amber-400/30"
                  >
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt={m.name} className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center bg-amber-500/20 text-amber-400 font-bold text-lg">{m.name?.[0]}</div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">{m.name}</div>
                    <div className="text-[10px] font-mono text-amber-400/60 uppercase tracking-wider">{m.discord_tag}</div>
                    <div className="mt-1 text-[10px] text-gray-500">Joined {new Date(m.joined_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => approveMember(m.id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-black text-black uppercase tracking-wider hover:bg-emerald-400 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMember(m.id)}
                      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-[11px] font-black text-red-400 uppercase tracking-wider hover:bg-red-500/10 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  {['Crew', 'Role / Rank', 'Status', 'Frame Color', 'Deployed', 'Power', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-widest animate-pulse">Loading crew list...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">No matching members found</td></tr>
                ) : filtered.map(m => {
                  const isEditing = editId === m.id;
                  const d = isEditing ? editData : m;
                  return (
                    <React.Fragment key={m.id}>
                      <tr className="group hover:bg-white/2 transition-colors">
                        {/* Member */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0 shadow-lg"
                              style={{ borderColor: d.node_color || '#10b981' }}
                            >
                              {m.avatar_url
                                ? <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center font-bold" style={{ background: d.node_color || '#10b981', color: '#040806' }}>{m.name?.[0]}</div>
                              }
                            </div>
                            <div className="flex flex-col">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input value={d.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40" placeholder="Name" />
                                  <input value={d.avatar_url || ''} onChange={e => setEditData(p => ({ ...p, avatar_url: e.target.value }))} className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40" placeholder="Avatar URL" />
                                </div>
                              ) : (
                                <>
                                  <div className="text-white font-bold tracking-tight">{m.name}</div>
                                  <div className="text-gray-600 text-[10px] font-mono">{m.discord_tag || 'DISCORD_N/A'}</div>
                                  {m.bio ? (
                                    <div className="text-gray-400 text-[11px] line-clamp-2 mt-1 italic border-l border-emerald-500/30 pl-2 max-w-xs" title={m.bio}>
                                      "{m.bio}"
                                    </div>
                                  ) : (
                                    <div className="text-gray-600 text-[10px] italic mt-0.5">No bio set</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role / Cat */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input type="text" value={d.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))} className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40" placeholder="Flair" />
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <ColorPicker value={d.flair_color || '#10b981'} onChange={c => setEditData(p => ({ ...p, flair_color: c }))} />
                                <select value={d.flair_icon || 'zap'} onChange={e => setEditData(p => ({ ...p, flair_icon: e.target.value }))} className="rounded-lg border border-emerald-500/20 bg-white/5 px-2 py-1 text-white text-[10px] outline-none">
                                  {['crown', 'shield', 'sword', 'users', 'zap', 'terminal', 'none'].map(o => <option key={o} value={o} className="bg-[#0a1a12]">{o}</option>)}
                                </select>
                              </div>
                              <select value={d.category} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40">
                                {CATS.map(c => <option key={c} value={c} className="bg-[#0a1a12]">{c}</option>)}
                              </select>
                              <select value={(d.sec_level && SEC_LEVELS.includes(d.sec_level)) ? d.sec_level : 'R0'} onChange={e => setEditData(p => ({ ...p, sec_level: e.target.value }))} className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40">
                                {SEC_LEVELS.map(s => <option key={s} value={s} className="bg-[#0a1a12]">{s}</option>)}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <div className="text-emerald-400 font-medium text-xs uppercase tracking-wider" style={{ color: m.flair_color || '#10b981' }}>{m.role}</div>
                              <div className="text-gray-600 text-[10px] uppercase tracking-widest">{m.category}</div>
                              <div className="text-gray-500 text-[9px] font-mono mt-0.5">SEC: {(m.sec_level && SEC_LEVELS.includes(m.sec_level)) ? m.sec_level : 'R0'}</div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <select value={d.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))} className="rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40">
                              {['active', 'inactive'].map(s => <option key={s} value={s} className="bg-[#0a1a12]">{s}</option>)}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[m.status] || STATUS_COLORS.inactive, boxShadow: `0 0 10px ${STATUS_COLORS[m.status] || STATUS_COLORS.inactive}` }} />
                              <span className="text-gray-400 text-xs font-medium capitalize">{m.status}</span>
                            </div>
                          )}
                        </td>

                        {/* Node Color */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <div className="flex items-center gap-3">
                              <ColorPicker value={d.node_color} onChange={c => setEditData(p => ({ ...p, node_color: c }))} />
                              <span className="text-white text-xs font-mono bg-white/5 px-2 py-1 rounded">{d.node_color}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg border border-white/10" style={{ background: m.node_color || '#10b981' }} />
                              <span className="text-gray-600 text-xs font-mono">{m.node_color}</span>
                            </div>
                          )}
                        </td>

                        {/* Deployed */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <input
                              type="date"
                              value={d.joined_at ? (() => {
                                try {
                                  return new Date(d.joined_at).toISOString().split('T')[0];
                                } catch {
                                  return '';
                                }
                              })() : ''}
                              onChange={e => setEditData(p => ({ ...p, joined_at: e.target.value ? new Date(e.target.value + 'T12:00:00Z').toISOString() : null }))}
                              className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/40"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs font-mono">
                              {(() => {
                                try {
                                  return d.joined_at ? new Date(d.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                                } catch {
                                  return 'N/A';
                                }
                              })()}
                            </span>
                          )}
                        </td>

                        {/* Admin toggle */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={d.is_admin} onChange={e => setEditData(p => ({ ...p, is_admin: e.target.checked }))} className="sr-only peer" />
                              <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-black"></div>
                            </label>
                          ) : (
                            <span className={m.is_admin ? 'text-emerald-400' : 'text-gray-700'}>
                              <Shield size={18} fill={m.is_admin ? 'currentColor' : 'none'} className="opacity-40" />
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all disabled:opacity-50">
                                <Save size={14} /> {saving ? '...' : 'Commit'}
                              </button>
                              <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-xs font-bold hover:text-white hover:bg-white/5 transition-all">
                                <X size={14} /> Abort
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedMemberForAwards(m)} className="p-2 rounded-xl border border-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10 transition-all" title="Manage Awards">
                                <Award size={16} />
                              </button>
                              <button onClick={() => startEdit(m)} className="p-2 rounded-xl border border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Edit Record">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => remove(m.id)} className="p-2 rounded-xl border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-all" title="Delete Record">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="bg-emerald-500/[0.03] border-b border-emerald-500/20">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/20 bg-[#040c08]/90 p-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                  <span>Biography / Bio Box</span>
                                </label>
                                <span className="text-[10px] text-gray-500 font-mono">Changes will be committed on Save</span>
                              </div>
                              <textarea
                                value={d.bio || ''}
                                onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-3 text-white text-xs outline-none focus:border-emerald-500/40 resize-y transition-colors leading-relaxed font-sans"
                                placeholder="Write or edit member biography / bio box..."
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdded={loadMembers} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedMemberForAwards && (
          <ManageAwardsModal
            member={selectedMemberForAwards}
            onClose={() => setSelectedMemberForAwards(null)}
            onUpdated={loadMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const AWARD_FILE_PREFIXES = {
  Shaqafat: 'Shaqafat',
  Safir: 'safir',
  Ittehad: 'ittehad',
  Khidmat: 'khidmat',
  Alamgiri: 'alamgiri',
  Sultani: 'sultani',
  Khazana: 'khazana',
  Rehla: 'rehla',
  Naqsha: 'naqsha',
  Shaheen: 'shaheen',
  Sipar: 'sipar',
  Bandook: 'bandook',
  Nusrat: 'nusrat',
  Mistri: 'mistri'
};

const AWARD_TIER_SUFFIXES = {
  Ustad: '_1',
  Uncle: '_2',
  Launda: '_3',
  Charsi: '_4'
};

const getAwardImage = (category, tier) => {
  const prefix = AWARD_FILE_PREFIXES[category];
  const suffix = AWARD_TIER_SUFFIXES[tier];
  if (!prefix || !suffix) return null;
  return `/KMHQ Awards/${prefix}${suffix}.png`;
};

function ManageAwardsModal({ member, onClose, onUpdated }) {
  const [awards, setAwards] = useState(member.awards || []);
  const [category, setCategory] = useState('Shaqafat');
  const [tier, setTier] = useState('Ustad');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addAward = () => {
    const exists = awards.some(a => a.category === category && a.tier === tier);
    if (exists) {
      setError('This award/tier is already assigned to this member.');
      return;
    }
    setError('');
    setAwards(prev => [...prev, { category, tier }]);
  };

  const removeAward = (index) => {
    setAwards(prev => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const res = await window.fetch(`/api/team-members/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ awards }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to update awards.');
      setSaving(false);
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#0a1a12] border border-emerald-500/20 rounded-2xl max-w-lg w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Manage Awards</h3>
            <p className="text-xs text-gray-500 mt-1">{member.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Current Awards List */}
        <div className="mb-8">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">Currently Assigned</label>
          {awards.length === 0 ? (
            <p className="text-sm text-gray-600 italic bg-white/2 p-4 rounded-xl border border-white/5 text-center">No awards assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {awards.map((a, i) => {
                const img = getAwardImage(a.category, a.tier);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/2 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {img && <img src={img} alt="" className="w-10 h-10 object-contain" />}
                      <div>
                        <div className="text-white text-sm font-bold">{a.category}</div>
                        <div className="text-emerald-400 text-xs">{a.tier}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAward(i)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Remove Award"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Award Section */}
        <div className="border-t border-white/5 pt-6 mb-8">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">Assign New Award</label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[9px] text-gray-600 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/40"
              >
                {Object.keys(AWARD_FILE_PREFIXES).map(cat => (
                  <option key={cat} value={cat} className="bg-[#0a1a12]">{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-gray-600 uppercase tracking-wider">Tier</label>
              <select
                value={tier}
                onChange={e => setTier(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/40"
              >
                {Object.keys(AWARD_TIER_SUFFIXES).map(t => (
                  <option key={t} value={t} className="bg-[#0a1a12]">{t}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={addAward}
            className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Assign Badge
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mb-6 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

        {/* Footer Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Commit Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
