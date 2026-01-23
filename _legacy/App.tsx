
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NewsManagement from './components/NewsManagement';
import FileLibrary from './components/FileLibrary';
import NewsEditor from './components/NewsEditor';
import AdminPortal from './components/AdminPortal';
import { NewsItem, FileItem, User, Role, Department, AuditLog } from './types';

// Initial fallback news
const INITIAL_NEWS: NewsItem[] = [
  { 
    id: '1', 
    title: 'Welcome to JS Bank CMS', 
    summary: 'The central hub for all corporate communications.', 
    content: 'Welcome to the new internal CMS system...', 
    department: 'Communications', 
    author: 'System', 
    createdAt: new Date().toISOString(), 
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=200'
  }
];

// Use lowercase for comparisons to be safe
const ADMIN_EMAILS = ['kodev.ali@jsbl.com'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('js_bank_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('js_bank_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('js_bank_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('js_bank_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent role mapping: email -> role
  const [userRoles, setUserRoles] = useState<Record<string, Role>>(() => {
    const saved = localStorage.getItem('js_bank_user_roles');
    const roles = saved ? JSON.parse(saved) : {};
    
    // FORCE admin access to the requested emails, overriding whatever is in storage
    ADMIN_EMAILS.forEach(email => {
      roles[email.toLowerCase()] = 'Admin';
    });
    
    return roles;
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('js_bank_news', JSON.stringify(news)); }, [news]);
  useEffect(() => { localStorage.setItem('js_bank_files', JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem('js_bank_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('js_bank_user_roles', JSON.stringify(userRoles)); }, [userRoles]);
  useEffect(() => { localStorage.setItem('js_bank_auth_user', JSON.stringify(currentUser)); }, [currentUser]);

  // Google SSO Initialization
  useEffect(() => {
    /* global google */
    const handleCredentialResponse = (response: any) => {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const email = payload.email.toLowerCase(); // Consistent lowercase
      const name = payload.name;
      const picture = payload.picture;
      
      // Force admin if in list, otherwise check storage, otherwise default to Viewer
      const isAdminEmail = ADMIN_EMAILS.includes(email);
      const role: Role = isAdminEmail ? 'Admin' : (userRoles[email] || 'Viewer');
      
      const user: User = {
        id: payload.sub,
        name,
        email,
        avatar: picture,
        role: role,
        department: 'Communications' // Default
      };

      setCurrentUser(user);
      
      // Update role mapping to ensure it's saved/forced
      setUserRoles(prev => ({ ...prev, [email]: role }));
    };

    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: "936145652014-tq1mdn7q8gj2maa677vi2e1k13o0ub4b.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      
      if (!currentUser) {
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large" }
        );
      }
    }
  }, [currentUser, userRoles]);

  const addAuditLog = useCallback((action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action,
      details,
      status: 'SUCCESS'
    };
    setLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const handleAddNews = (newItem: Partial<NewsItem>) => {
    if (!currentUser) return;
    const newsItem: NewsItem = {
      ...newItem as NewsItem,
      id: Math.random().toString(36).substr(2, 9),
      department: activeDepartment || (newItem.department as Department) || 'Communications',
      author: currentUser.name,
      imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${Math.random()}/1200/800`,
      thumbnailUrl: newItem.thumbnailUrl || `https://picsum.photos/seed/${Math.random()}/400/300`
    };
    setNews([newsItem, ...news]);
    setIsEditorOpen(false);
    addAuditLog('PUBLISH_NEWS', `Published "${newsItem.title}" to ${newsItem.department}`);
  };

  const handleDeleteNews = (id: string) => {
    const item = news.find(n => n.id === id);
    setNews(news.filter(n => n.id !== id));
    addAuditLog('DELETE_NEWS', `Deleted article: ${item?.title || id}`);
  };

  const handleToggleFeatured = (id: string) => {
    setNews(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isFeatured;
        addAuditLog('TOGGLE_FEATURED', `${nextState ? 'Featured' : 'Unfeatured'} article: ${item.title}`);
        return { ...item, isFeatured: nextState };
      }
      return item;
    }));
  };

  const handleUpdateRole = (email: string, newRole: Role) => {
    const normalizedEmail = email.toLowerCase();
    setUserRoles(prev => ({ ...prev, [normalizedEmail]: newRole }));
    if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    addAuditLog('UPDATE_ROLE', `Changed role of ${normalizedEmail} to ${newRole}`);
  };

  const handleAddUser = (email: string, role: Role) => {
    const normalizedEmail = email.toLowerCase();
    if (userRoles[normalizedEmail]) {
      return false; // Already exists
    }
    setUserRoles(prev => ({ ...prev, [normalizedEmail]: role }));
    addAuditLog('ADD_USER', `Added new user ${normalizedEmail} with role ${role}`);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            news={news} 
            files={files} 
            onQuickPost={() => {
              if (currentUser.role !== 'Viewer') {
                setIsEditorOpen(true);
              } else {
                setActiveTab('news-comm');
              }
            }}
            onQuickUpload={() => setActiveTab('files')}
          />
        );
      case 'news-hr':
        return <NewsManagement currentUser={currentUser} department="HR" news={news} onAddNews={() => setIsEditorOpen(true)} onDelete={handleDeleteNews} onToggleFeatured={handleToggleFeatured} />;
      case 'news-it':
        return <NewsManagement currentUser={currentUser} department="IT" news={news} onAddNews={() => setIsEditorOpen(true)} onDelete={handleDeleteNews} onToggleFeatured={handleToggleFeatured} />;
      case 'news-comm':
        return <NewsManagement currentUser={currentUser} department="Communications" news={news} onAddNews={() => setIsEditorOpen(true)} onDelete={handleDeleteNews} onToggleFeatured={handleToggleFeatured} />;
      case 'files':
        return <FileLibrary files={files} onUpload={(f) => { setFiles([f, ...files]); addAuditLog('UPLOAD', f.name); }} onDelete={(id) => { setFiles(files.filter(f => f.id !== id)); addAuditLog('DELETE_FILE', id); }} />;
      case 'admin':
        return <AdminPortal userRoles={userRoles} onUpdateRole={handleUpdateRole} onAddUser={handleAddUser} />;
      default:
        return <Dashboard news={news} files={files} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">JS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Internal CMS</h1>
          <p className="text-slate-500 mb-8">Sign in with your corporate account to manage content.</p>
          <div id="google-signin-btn" className="flex justify-center"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab.startsWith('news-')) {
          const deptKey = tab.replace('news-', '').toUpperCase();
          const resolvedDept = deptKey === 'COMM' ? 'Communications' : (deptKey as Department);
          setActiveDepartment(resolvedDept);
        } else {
          setActiveDepartment(null);
        }
      }} 
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
      
      {isEditorOpen && (
        <NewsEditor 
          fixedDepartment={activeDepartment || undefined}
          onSave={handleAddNews} 
          onClose={() => setIsEditorOpen(false)} 
          authorName={currentUser.name}
        />
      )}
    </Layout>
  );
};

export default App;
