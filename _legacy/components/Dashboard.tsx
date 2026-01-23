
import React from 'react';
import { Clock, Plus, Upload, Sparkles, Newspaper } from 'lucide-react';
import { NewsItem, FileItem } from '../types';
import FeaturedSection from './FeaturedSection';

interface DashboardProps {
  news: NewsItem[];
  files: FileItem[];
  onQuickPost?: () => void;
  onQuickUpload?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ news, files, onQuickPost, onQuickUpload }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Quick Actions Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onQuickPost}
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Newspaper size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create Announcement</h3>
            <p className="text-sm text-slate-500 mt-1">Draft a new corporate memo or news update</p>
          </div>
          <Plus className="ml-auto text-slate-300 group-hover:text-emerald-600 transition-colors" size={24} />
        </button>

        <button 
          onClick={onQuickUpload}
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload Document</h3>
            <p className="text-sm text-slate-500 mt-1">Add assets, PDFs, or spreadsheets to the library</p>
          </div>
          <Plus className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors" size={24} />
        </button>
      </div>

      {/* Featured News Grid */}
      <FeaturedSection news={news} />

      {/* Recent Activity Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-500 mt-1">Latest system-wide content updates</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <Sparkles size={12} className="text-amber-500" /> Live Feed
          </div>
        </div>
        
        <div className="space-y-1">
          {news.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="mx-auto mb-3 opacity-20" size={40} />
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            news.slice(0, 8).map((item, idx) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-6 p-4 rounded-xl transition-all hover:bg-slate-50 group ${
                  idx !== news.slice(0, 8).length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Clock className="text-slate-400 w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      item.department === 'HR' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.department === 'IT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {item.department}
                    </span>
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{item.author}</span> • {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                    View Article
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
