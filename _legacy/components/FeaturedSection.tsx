
import React from 'react';
import { NewsItem, Department } from '../types';
import { Newspaper, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedSectionProps {
  news: NewsItem[];
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ news }) => {
  const departments: Department[] = ['HR', 'IT', 'Communications'];
  
  const getFeaturedForDept = (dept: Department) => {
    // Priority: Featured item for that department, otherwise latest item for that department
    const deptItems = news.filter(n => n.department === dept);
    const featured = deptItems.find(n => n.isFeatured);
    return featured || deptItems[0];
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          <h2 className="text-xl font-bold text-slate-900">Department Spotlights</h2>
        </div>
        <span className="text-sm text-slate-500 font-medium">Curated highlights</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const item = getFeaturedForDept(dept);
          const bgColors = {
            HR: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            IT: 'bg-blue-50 text-blue-700 border-blue-100',
            Communications: 'bg-purple-50 text-purple-700 border-purple-100'
          };

          return (
            <div key={dept} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-44 overflow-hidden relative bg-slate-100">
                {item ? (
                  <img 
                    src={item.imageUrl || item.thumbnailUrl || `https://picsum.photos/seed/${dept}/600/400`} 
                    alt={dept} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Newspaper size={48} />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${bgColors[dept]}`}>
                    {dept}
                  </span>
                </div>
                {item?.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg border border-amber-400">
                      <Sparkles size={12} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {item?.title || `Welcome to ${dept}`}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed min-h-[40px]">
                  {item?.summary || `Stay informed with the latest updates and key announcements from the ${dept} team.`}
                </p>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-emerald-600 font-bold text-xs group-hover:gap-3 transition-all uppercase tracking-wider">
                    Read Story <ArrowRight size={14} />
                  </button>
                  {item && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedSection;
