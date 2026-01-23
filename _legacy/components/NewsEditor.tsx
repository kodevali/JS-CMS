
import React, { useState, useEffect, useRef } from 'react';
import { Department, NewsItem } from '../types';
import { Sparkles, Send, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { generateNewsDraft } from '../services/geminiService';

interface NewsEditorProps {
  onSave: (news: Partial<NewsItem>) => void;
  onClose: () => void;
  fixedDepartment?: Department;
  authorName: string;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ onSave, onClose, fixedDepartment, authorName }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState<Department>(fixedDepartment || 'Communications');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState<{ thumb: boolean; main: boolean }>({ thumb: false, main: false });

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  // Update internal department if prop changes
  useEffect(() => {
    if (fixedDepartment) setDepartment(fixedDepartment);
  }, [fixedDepartment]);

  const handleAiDraft = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const draft = await generateNewsDraft(aiPrompt, department);
    if (draft) {
      setTitle(draft.title);
      setSummary(draft.summary);
      setContent(draft.content);
    }
    setIsGenerating(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumb' | 'main') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'thumb') setThumbnailUrl(base64);
      else setImageUrl(base64);
      setIsUploading(prev => ({ ...prev, [type]: false }));
    };
    reader.readAsDataURL(file);
  };

  const generateRandomImages = () => {
    const seed = Math.floor(Math.random() * 10000);
    setThumbnailUrl(`https://picsum.photos/seed/${seed}/400/300`);
    setImageUrl(`https://picsum.photos/seed/${seed}/1200/800`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      summary,
      content,
      department,
      isFeatured,
      author: authorName,
      thumbnailUrl,
      imageUrl,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Post to {fixedDepartment || department}</h2>
            <p className="text-sm text-slate-500">Publishing as {authorName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar">
          {/* AI Helper Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 h-fit">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold">
                <Sparkles size={18} />
                <span>JS Bank AI Assistant</span>
              </div>
              <p className="text-xs text-emerald-600 mb-4 leading-relaxed">
                Describe your update and I'll generate a professional banking memo for you.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., HR update about new medical benefits starting in July 2024..."
                className="w-full p-3 rounded-xl border border-emerald-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-32 mb-4"
              />
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={isGenerating || !aiPrompt}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-emerald-500/10"
              >
                {isGenerating ? 'Drafting...' : 'Generate Content'}
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <ImageIcon size={18} />
                  <span>Media Assets</span>
                </div>
                <button 
                  type="button"
                  onClick={generateRandomImages}
                  className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                >
                  Generate Random
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Thumbnail Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Thumbnail (Grid view)</label>
                    <button 
                      type="button"
                      onClick={() => thumbInputRef.current?.click()}
                      className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase hover:bg-emerald-50 px-1.5 py-0.5 rounded transition-colors"
                    >
                      {isUploading.thumb ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      Upload
                    </button>
                    <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumb')} />
                  </div>
                  <input
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://... or uploaded image"
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {thumbnailUrl && (
                    <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-white group relative">
                      <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                      <button 
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Image Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Main Article Image</label>
                    <button 
                      type="button"
                      onClick={() => mainInputRef.current?.click()}
                      className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase hover:bg-emerald-50 px-1.5 py-0.5 rounded transition-colors"
                    >
                      {isUploading.main ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      Upload
                    </button>
                    <input type="file" ref={mainInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'main')} />
                  </div>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or uploaded image"
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {imageUrl && (
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-white group relative">
                      <img src={imageUrl} className="w-full h-full object-cover" alt="Main Image Preview" />
                      <button 
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                <select
                  disabled={!!fixedDepartment}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="Communications">Communications</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      Mark as Featured
                    </span>
                    <Sparkles size={14} className="text-amber-500" />
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Article Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The headline of your news..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Summary (Short)</label>
              <textarea
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A short snippet for the dashboard cards..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Announcement Body</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full announcement details here..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none h-60"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
              >
                <Send size={18} /> Publish to {department}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;
