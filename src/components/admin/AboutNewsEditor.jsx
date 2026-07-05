'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Save, 
  Image as ImageIcon, 
  Loader2, 
  Send, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Plus, 
  Link as LinkIcon, 
  Radio, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  Newspaper, 
  User, 
  Search, 
  Eye, 
  ExternalLink,
  Calendar,
  FileText,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  FolderKanban
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'announcement', label: 'Announcement', icon: Flame, color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'ops', label: 'Tactical Ops', icon: ShieldAlert, color: 'border-red-500/40 bg-red-500/10 text-red-300' },
  { id: 'fleet', label: 'Fleet Updates', icon: Sparkles, color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  { id: 'lore', label: 'Org Lore', icon: Newspaper, color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { id: 'community', label: 'Community', icon: User, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
];

export default function AboutNewsEditor() {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [category, setCategory] = useState('announcement');
  const [authorHandle, setAuthorHandle] = useState('');
  
  // Media State
  const [mediaMode, setMediaMode] = useState('upload'); // 'upload' | 'url'
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video' | 'link'
  const [keepMedia, setKeepMedia] = useState(true);
  
  // UI & Feedback State
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', message: '' }
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Handle file drop / input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setStatus({ type: 'error', message: 'Only image or video files are allowed.' });
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreviewUrl(objectUrl);
    setMediaType(isVideo ? 'video' : 'image');
    setKeepMedia(false);
    setStatus(null);
  };

  // Handle external URL input change
  const handleUrlInputChange = (url) => {
    setMediaUrlInput(url);
    setMediaFile(null);
    if (!url.trim()) {
      setMediaPreviewUrl('');
      return;
    }

    const trimmed = url.trim().toLowerCase();
    let detectedType = 'image';
    if (trimmed.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/) || trimmed.includes('youtube.com') || trimmed.includes('vimeo.com')) {
      detectedType = 'video';
    } else if (!trimmed.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/)) {
      detectedType = 'link';
    }

    setMediaPreviewUrl(url.trim());
    setMediaType(detectedType);
    setKeepMedia(false);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaUrlInput('');
    setMediaPreviewUrl('');
    setMediaType('image');
    setKeepMedia(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    setPublishedAt('');
    setCategory('announcement');
    setAuthorHandle('');
    setMediaMode('upload');
    setMediaFile(null);
    setMediaUrlInput('');
    setMediaPreviewUrl('');
    setMediaType('image');
    setKeepMedia(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setStatus(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setBody(item.body || '');
    setPublishedAt(item.published_at ? item.published_at.substring(0, 10) : '');
    setCategory(item.category || 'announcement');
    setAuthorHandle(item.author_handle || item.authorHandle || '');
    setMediaPreviewUrl(item.media_url || '');
    setMediaUrlInput(item.media_url || '');
    setMediaType(item.media_type || 'image');
    setMediaMode(item.media_url && !item.media_url.includes('supabase') ? 'url' : 'upload');
    setMediaFile(null);
    setKeepMedia(true);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, dispatchTitle) => {
    if (!confirm(`Are you sure you want to delete dispatch "${dispatchTitle}"?`)) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/about-news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatus({ type: 'success', message: 'News dispatch deleted successfully.' });
        if (editingId === id) resetForm();
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

  // Quick formatting helper for body textarea
  const insertFormatting = (prefix, suffix = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      setStatus({ type: 'error', message: 'Title and body content are required.' });
      return;
    }

    setSaving(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('category', category);
    if (authorHandle) formData.append('author_handle', authorHandle);
    if (publishedAt) formData.append('published_at', publishedAt);

    if (editingId) {
      formData.append('keep_media', keepMedia);
    }

    if (mediaFile) {
      formData.append('media_file', mediaFile);
      formData.append('media_type', mediaType);
    } else if (mediaUrlInput.trim()) {
      formData.append('media_url', mediaUrlInput.trim());
      formData.append('media_type', mediaType);
    }

    const url = editingId ? `/api/about-news/${editingId}` : '/api/about-news';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        setStatus({ type: 'success', message: `News dispatch ${editingId ? 'updated' : 'published'} successfully!` });
        resetForm();
        fetchNews();
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || `Failed to ${editingId ? 'update' : 'publish'} news.` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setSaving(false);
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
        (item.body && String(item.body).toLowerCase().includes(query)) ||
        (item.author_handle && item.author_handle.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [news, categoryFilter, searchFilter]);

  return (
    <div className="flex flex-col gap-8 w-full pb-24 text-white">
      
      {/* HEADER COMMAND BAR & METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#050B08] rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              News Dispatches Admin <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">PRO STUDIO</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Publish articles, media attachments, external links & fleet bulletins.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2">
            <FileText size={14} className="text-emerald-400" />
            <span className="font-bold text-white">{news.length}</span> Dispatches Total
          </div>
          <a
            href="/admin/collections/news-posts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold transition-all"
          >
            <FolderKanban size={14} /> Open Payload CMS →
          </a>
          <button
            onClick={fetchNews}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh Feed"
          >
            <RefreshCw size={16} className={loadingNews ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS TOAST */}
      {status && (
        <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-semibold shadow-xl transition-all ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{status.message}</span>
          </div>
          <button onClick={() => setStatus(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* DISPATCH EDITOR FORM */}
      <div className="bg-[#050B08] rounded-[2.5rem] border border-white/10 p-6 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.35em] text-emerald-400 mb-1">
              <Send size={12} /> Dispatch Publishing Console
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              {editingId ? <Edit3 size={24} className="text-cyan-400" /> : <Plus size={24} className="text-emerald-400" />}
              {editingId ? 'Edit News Dispatch' : 'Create New Dispatch'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              disabled={!title.trim() || !body.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-mono font-bold transition-all disabled:opacity-40"
            >
              <Eye size={14} className="text-cyan-400" /> Live Site Preview
            </button>

            {editingId && (
              <button 
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono font-bold transition-all border border-white/15"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN FORM FIELDS (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                  Article Title <span className="text-emerald-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-gray-500">{title.length} chars</span>
              </div>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operation Aegis Shield: Fleet Re-Deployment Directive"
                className="w-full bg-black/60 border border-white/15 rounded-2xl px-5 py-3.5 text-base text-white placeholder-gray-500 outline-none focus:border-emerald-500/70 focus:bg-black/90 transition-all font-semibold"
              />
            </div>

            {/* Category Selector Pills */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                Category Theme <span className="text-emerald-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                        isSelected 
                          ? cat.color + ' ring-2 ring-emerald-500/50 scale-105 shadow-lg' 
                          : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <CatIcon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Author Handle & Published Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                  Author Discord / Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">@</span>
                  <input 
                    type="text"
                    value={authorHandle}
                    onChange={(e) => setAuthorHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="CommanderAlpha"
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/70 focus:bg-black/90 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                  Publication Date
                </label>
                <input 
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/70 focus:bg-black/90 transition-all font-mono"
                />
              </div>
            </div>

            {/* Body Rich Article Content */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                  Article Body <span className="text-emerald-400">*</span>
                </label>

                {/* Quick Formatting Buttons */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  <button type="button" onClick={() => insertFormatting('### ')} className="px-2 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Header">H3</button>
                  <button type="button" onClick={() => insertFormatting('**', '**')} className="px-2 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Bold">B</button>
                  <button type="button" onClick={() => insertFormatting('* ', '')} className="px-2 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Bullet">- Bullet</button>
                  <button type="button" onClick={() => insertFormatting('> ')} className="px-2 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Quote">Quote</button>
                  <button type="button" onClick={() => insertFormatting('[Link Text](', ')')} className="px-2 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded" title="Link">Link</button>
                </div>
              </div>

              <textarea 
                ref={textareaRef}
                rows="8"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the full dispatch report, tactical updates, or lore chronicle..."
                className="w-full bg-black/60 border border-white/15 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/70 focus:bg-black/90 transition-all font-sans leading-relaxed resize-y"
              />
            </div>

          </div>

          {/* MEDIA ATTACHMENTS & PREVIEW STUDIO (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <label className="block text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} className="text-emerald-400" /> Attached Media & Links
                </label>
                
                {/* Media Mode Switcher */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setMediaMode('upload')}
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition-all ${mediaMode === 'upload' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaMode('url')}
                    className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition-all ${mediaMode === 'url' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    External Link
                  </button>
                </div>
              </div>

              {/* MEDIA PREVIEW CARD OR UPLOADER */}
              {mediaPreviewUrl ? (
                <div className="relative rounded-2xl border border-white/20 overflow-hidden bg-black/80 aspect-video flex items-center justify-center group shadow-2xl">
                  {mediaType === 'video' || mediaPreviewUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/) ? (
                    <video src={mediaPreviewUrl} className="w-full h-full object-cover" controls />
                  ) : mediaType === 'link' ? (
                    <div className="p-6 text-center space-y-3">
                      <ExternalLink size={32} className="mx-auto text-emerald-400" />
                      <a href={mediaPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan-300 underline block truncate max-w-xs">
                        {mediaPreviewUrl}
                      </a>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">External Web Article Attached</span>
                    </div>
                  ) : (
                    <img src={mediaPreviewUrl} className="w-full h-full object-cover" alt="Media Preview" />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      type="button"
                      onClick={removeMedia}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X size={14} /> Remove Attachment
                    </button>
                  </div>
                </div>
              ) : mediaMode === 'upload' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-52 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group p-6 text-center"
                >
                  <div className="p-3.5 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all">
                    <ImageIcon size={28} className="text-gray-400 group-hover:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-200 group-hover:text-white block">Click to upload image or video file</span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mt-1">Supports JPG, PNG, WEBP, MP4, WEBM</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 border border-white/15 rounded-2xl bg-black/50">
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <LinkIcon size={12} className="text-cyan-400" /> Image, Video or Article URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrlInput}
                    onChange={(e) => handleUrlInputChange(e.target.value)}
                    placeholder="https://cdn.example.com/image.jpg or https://youtube.com/..."
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500/70 transition-all font-mono"
                  />
                  <p className="text-[10px] text-gray-400 font-mono">
                    Direct image CDN links or YouTube/RSI article links will be embedded in the dispatch.
                  </p>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*,video/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            {/* ACTION SAVE BUTTON */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-mono font-bold uppercase transition-all"
              >
                Clear Form
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={saving || !title.trim() || !body.trim()}
                className={`flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl disabled:opacity-40 cursor-pointer ${
                  editingId 
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_30px_rgba(34,211,238,0.4)]' 
                    : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-[0_0_30px_rgba(52,211,153,0.4)]'
                }`}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Publishing...' : (editingId ? 'Update Dispatch' : 'Publish Dispatch Now')}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* DISPATCHES MANAGEMENT COMMAND TABLE */}
      <div className="bg-[#050B08] rounded-[2.5rem] border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Manage Published Dispatches
            </h3>
            <p className="text-xs text-gray-400 mt-1">Search, edit, or delete dispatches from the active feed.</p>
          </div>

          {/* SEARCH & CATEGORY FILTER */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
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

            {/* Search Input */}
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
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all gap-4 ${
                    editingId === item.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
                      : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-black/60'
                  }`}
                >
                  {/* Item Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Media Thumbnail */}
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
                          {new Date(item.published_at || item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {item.author_handle && (
                          <span className="text-[10px] font-mono text-gray-400">
                            by <strong className="text-white">@{item.author_handle}</strong>
                          </span>
                        )}
                      </div>

                      <h4 className="text-white font-bold text-base truncate drop-shadow">{item.title}</h4>
                      <p className="text-gray-400 text-xs truncate max-w-2xl">{item.body}</p>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                    <button 
                      onClick={() => copyLiveLink(item.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors border border-white/10"
                      title="Copy Live Dispatch Anchor Link"
                    >
                      {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span className="hidden sm:inline">{copiedId === item.id ? 'Copied!' : 'Link'}</span>
                    </button>

                    <button 
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-mono font-bold transition-all border border-cyan-500/30"
                      title="Edit Dispatch"
                    >
                      <Edit3 size={14} /> Edit
                    </button>

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

      {/* LIVE SITE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#020402] border border-white/20 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                <Eye size={16} /> Live Dispatch Card Preview
              </div>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated Live News Card */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-black/60 p-8 shadow-2xl space-y-6">
              {mediaPreviewUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative max-h-72">
                  {mediaType === 'video' ? (
                    <video controls src={mediaPreviewUrl} className="w-full h-full object-cover bg-black" />
                  ) : (
                    <img src={mediaPreviewUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={13} />
                  {publishedAt ? new Date(publishedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                  {category}
                </span>
              </div>

              <h2 className="text-3xl font-black uppercase text-white tracking-wide">{title || 'Untitled Dispatch'}</h2>

              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{body || 'Article content body preview...'}</p>

              {authorHandle && (
                <div className="pt-4 border-t border-white/10 font-mono text-xs text-gray-300 uppercase tracking-widest">
                  Posted by <strong className="text-white">@{authorHandle}</strong>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold uppercase hover:bg-white/20 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
