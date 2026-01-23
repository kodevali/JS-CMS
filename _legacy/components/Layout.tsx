
import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  LogOut, 
  Building2, 
  Search, 
  Bell,
  ShieldCheck,
  Megaphone,
  UserCheck,
  Cpu
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout
}) => {
  const isAdmin = currentUser.role === 'Admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { 
      id: 'news-comm', 
      label: 'Communications', 
      icon: Megaphone, 
      show: true // Everyone can view
    },
    { 
      id: 'news-hr', 
      label: 'HR Announcements', 
      icon: UserCheck, 
      show: true // Everyone can view
    },
    { 
      id: 'news-it', 
      label: 'IT Announcements', 
      icon: Cpu, 
      show: true // Everyone can view
    },
    { id: 'files', label: 'File Library', icon: Files, show: true },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, show: isAdmin },
  ];

  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">JS Bank</span>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search CMS..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">{currentUser.name}</p>
                {currentUser.role !== 'Viewer' && (
                  <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-tighter">
                    {currentUser.role}
                  </p>
                )}
              </div>
              <img 
                src={currentUser.avatar} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full border border-slate-200 shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
