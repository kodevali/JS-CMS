
import React from 'react';
import { NewsItem, Department, User } from '../types';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

interface NewsManagementProps {
  news: NewsItem[];
  department: Department;
  onAddNews: () => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  currentUser: User;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ news, department, onAddNews, onDelete, onToggleFeatured, currentUser }) => {
  const filteredNews = news.filter(n => n.department === department);

  const isAdmin = currentUser.role === 'Admin';
  const isDeptManager = currentUser.role === `${department} Content Manager` || (department === 'Communications' && currentUser.role === 'Communications Content Manager');
  const canModify = isAdmin || isDeptManager;

  const getDeptConfig = (dept: Department) => {
    switch (dept) {
      case 'HR': return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', title: 'HR News' };
      case 'IT': return { color: 'bg-blue-50 text-blue-700 border-blue-100', title: 'IT News' };
      case 'Communications': return { color: 'bg-purple-50 text-purple-700 border-purple-100', title: 'Communications News' };
    }
  };

  const config = getDeptConfig(department);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse the latest official announcements from {department}.
          </p>
        </div>
        {canModify && (
          <button 
            onClick={onAddNews}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit"
          >
            <Plus size={20} /> Post New Update
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
              {department}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">{filteredNews.length} Articles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Headline</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Featured</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                {canModify && <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={canModify ? 5 : 4} className="px-8 py-12 text-center text-slate-400">
                    No articles found for this department.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 max-w-md">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img src={item.thumbnailUrl || item.imageUrl || `https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{item.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500 font-medium">{item.author}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center">
                        {canModify ? (
                          <button 
                            onClick={() => onToggleFeatured(item.id)}
                            className={`p-2 rounded-full transition-all ${item.isFeatured ? 'text-amber-500 hover:scale-110' : 'text-slate-200 hover:text-slate-400'}`}
                          >
                            <Star size={20} fill={item.isFeatured ? "currentColor" : "none"} />
                          </button>
                        ) : (
                          item.isFeatured ? (
                            <Star size={20} fill="#f59e0b" className="text-amber-500" />
                          ) : (
                            <div className="w-5 h-5" />
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    {canModify && (
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewsManagement;
