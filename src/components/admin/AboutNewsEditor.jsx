'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ExternalLink,
  Search, 
  RefreshCw,
  FolderKanban,
  Calendar,
  FileText,
  Copy,
  Check,
  Trash2,
  Loader2,
  ShieldAlert,
  Flame,
  ShieldAlert as ShieldAlertIcon,
  Sparkles,
  Newspaper,
  User,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'announcement', label: 'Announcement', icon: Flame, color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'ops', label: 'Tactical Ops', icon: ShieldAlertIcon, color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  { id: 'fleet', label: 'Fleet Updates', icon: Sparkles, color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  { id: 'lore', label: 'Org Lore', icon: Newspaper, color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { id: 'community', label: 'Community', icon: User, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
];

export default function AboutNewsEditor() {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  
  // UI & Feedback State
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', message: '' }
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/about-news');
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id, dispatchTitle) => {
    if (!confirm(`Are you sure you want to delete dispatch "${dispatchTitle}"?`)) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/about-news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus({ type: 'success', message: 'News dispatch deleted successfully.' });
        fetchNews();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to delete news dispatch.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setDeletingId(null);
    }
  };

  const copyLiveLink = (id) => {
    const url = `${window.location.origin}/news#dispatch-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter dispatches in admin view
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || (item.category || 'announcement').toLowerCase() === categoryFilter.toLowerCase();
      const query = searchFilter.toLowerCase().trim();
      const matchesSearch = !query || 
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.author_handle && item.author_handle.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [news, categoryFilter, searchFilter]);

  return (
    <div className="flex flex-col gap-8 w-full pb-24 text-white">
      
      {/* HEADER COMMAND BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#050B08] rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Dispatch Comms Hub <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SECURE LINK</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Author and manage dispatches using Payload's native visual blocks editor.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2">
            <FileText size={14} className="text-emerald-400" />
            <span className="font-bold text-white">{news.length}</span> Dispatches
          </div>
          <button
            onClick={fetchNews}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh Feed"
          >
            <RefreshCw size={16} className={loadingNews ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* STATUS METER */}
      {status && (
        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-semibold shadow-xl transition-all ${
          status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{status.message}</span>
          </div>
          <button onClick={() => setStatus(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* MASTER CREATION PANEL */}
      <div className="bg-[#050B08] rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent)] pointer-events-none" />
        
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-white">
            Create Comms Dispatch
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Initialize Payload CMS to draft rich block layouts, drag & drop media attachments, align team authors, and compile secure broadcasts.
          </p>

          <div className="pt-4">
            <a 
              href="/admin/collections/news-posts/create"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(52,211,153,0.35)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)]"
            >
              <Plus size={18} strokeWidth={3} />
              Open CMS Editor
            </a>
          </div>
        </div>
      </div>

      {/* DISPATCHES MANAGEMENT */}
      <div className="bg-[#050B08] rounded-[2.5rem] border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Manage Published Dispatches
            </h3>
            <p className="text-xs text-gray-400 mt-1">Search or edit published news feed details.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black/60 border border-white/15 text-xs font-mono text-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="announcement">Announcements</option>
              <option value="ops">Tactical Ops</option>
              <option value="fleet">Fleet Updates</option>
              <option value="lore">Org Lore</option>
              <option value="community">Community</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {loadingNews ? (
          <div className="py-16 flex flex-col items-center justify-center text-emerald-400 gap-4">
            <Loader2 size={36} className="animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest">Loading Dispatches Feed...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-white/10 rounded-2xl bg-black/40 p-8">
            <ShieldAlert size={40} className="mx-auto text-gray-500 mb-3" />
            <p className="font-mono text-xs uppercase tracking-widest">No dispatches match your search filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item) => {
              const catKey = (item.category || 'announcement').toLowerCase();
              const catObj = CATEGORY_OPTIONS.find(c => c.id === catKey) || CATEGORY_OPTIONS[0];

              return (
                <div 
                  key={item.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60 transition-all gap-4"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {item.media_url ? (
                      <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0 relative">
                        {item.media_type === 'video' ? (
                          <video src={item.media_url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-500 shrink-0 font-mono text-[10px]">
                        TEXT
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${catObj.color}`}>
                          {catObj.label}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase">
                          {new Date(item.published_at || item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {item.author_handle && (
                          <span className="text-[10px] font-mono text-gray-400 font-bold">
                            by <span className="text-white">@{item.author_handle}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-white font-bold text-base truncate drop-shadow">{item.title}</h4>
                      <p className="text-gray-400 text-xs truncate max-w-2xl">
                        {item.body && typeof item.body === 'string' ? item.body : 'Structured Dispatch Content Blocks'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 font-mono">
                    <button 
                      onClick={() => copyLiveLink(item.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs transition-colors border border-white/10"
                      title="Copy Live Link"
                    >
                      {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedId === item.id ? 'Copied!' : 'Link'}</span>
                    </button>

                    <a 
                      href={`/admin/collections/news-posts/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-all border border-cyan-500/30"
                      title="Edit in CMS"
                    >
                      <ExternalLink size={14} /> Edit in CMS
                    </a>

                    <button 
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 disabled:opacity-50"
                      title="Delete Dispatch"
                    >
                      {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
