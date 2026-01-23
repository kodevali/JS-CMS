"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import FileLibrary from '@/components/FileLibrary';
import DepartmentFeed from '@/components/DepartmentFeed';
import AdminPanel from '@/components/AdminPanel';
import { logAction, getAuditLogs } from '@/actions/audit';
import { getNews, createNews, updateNews, deleteNews, seedITNews } from '@/actions/news';
import { getFiles, uploadFile, deleteFile } from '@/actions/files';
import { getSession, getUsers, createUser, deleteUser, updateUser } from '@/actions/auth';
import { getSystemSetting } from '@/actions/settings';
import { checkDatabaseConnection } from '@/actions/diagnostic';
import { Lock, ChevronRight, Briefcase, Monitor, Megaphone, Database, CheckCircle, XCircle, Users, Calendar, ShieldCheck, Shield, X, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  console.log("[HOME] Initializing with actions:", { updateNews: !!updateNews, deleteNews: !!deleteNews });
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [news, setNews] = useState([]);
  const [files, setFiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [dbStatus, setDbStatus] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const itSidebarItems = [
    { label: 'Meet the Team', icon: Users, onClick: () => alert('Team Directory feature coming soon!') },
    { label: 'Events Ongoing', icon: Calendar, onClick: () => alert('Events portal coming soon!') },
    { label: 'Protocols', icon: ShieldCheck, onClick: () => alert('Security Protocols document list coming soon!') },
  ];

  const hrSidebarItems = [
    { label: 'Employee Directory', icon: Users, onClick: () => alert('Employee Directory feature coming soon!') },
    { label: 'Benefits Portal', icon: ShieldCheck, onClick: () => alert('Benefits Portal coming soon!') },
    { label: 'Leave Requests', icon: Calendar, onClick: () => alert('Leave Request system coming soon!') },
  ];

  const commsSidebarItems = [
    { label: 'Brand Guidelines', icon: ShieldCheck, onClick: () => alert('Brand Guidelines coming soon!') },
    { label: 'Media Kit', icon: Megaphone, onClick: () => alert('Media Kit coming soon!') },
    { label: 'Press Releases', icon: Calendar, onClick: () => alert('Press Release archive coming soon!') },
  ];

  // AUTHENTICATION CHECK
  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // Verify role is up to date from database (only check once on mount)
        getUsers().then(users => {
          const dbUser = users.find(u => u.email === session.user.email);
          if (dbUser && dbUser.role !== session.user.role) {
            // Role changed in DB, update current user
            console.log(`[AUTH] Role mismatch detected. DB: ${dbUser.role}, Session: ${session.user.role}. Updating...`);
            setCurrentUser(prev => prev ? { ...prev, role: dbUser.role } : null);
          }
        }).catch(() => {});
      }
      setAuthLoading(false);
    }
    checkSession();
  }, []);

  // DATA FETCHING
  useEffect(() => {
    async function loadAll() {
      if (!currentUser) return;
      setLoadingData(true);
      console.log("[PAGE] Starting data fetch...");

      try {
        // Seed IT department demo content only when explicitly enabled
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_SEED === 'true') {
          await seedITNews().catch(e => console.error("[SEED] Failed:", e));
        }
        const [newsData, filesData, logsData, usersData, announceData, dbStatusData] = await Promise.all([
          getNews().catch(e => { console.error("getNews failed", e); return []; }),
          getFiles().catch(e => { console.error("getFiles failed", e); return []; }),
          getAuditLogs().catch(e => { console.error("getAuditLogs failed", e); return []; }),
          getUsers().catch(e => { console.error("getUsers failed", e); return []; }),
          getSystemSetting('announcement').catch(e => { console.error("getAnnounce failed", e); return ''; }),
          checkDatabaseConnection().catch(e => { console.error("diagnostic failed", e); return { connected: false }; })
        ]);

        console.log(`[PAGE] Fetch Complete: ${newsData.length} news, ${filesData.length} files, ${logsData.length} logs, ${usersData.length} users`);

        setNews(newsData || []);
        setFiles(filesData || []);
        setAuditLogs(logsData || []);
        setUsers(usersData || []);
        setAnnouncement(announceData || '');
        setDbStatus(dbStatusData);
      } catch (err) {
        console.error("[PAGE] Global fetch error:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadAll();
  }, [currentUser]);

  const handleLogout = async () => {
    await logAction('LOGOUT', 'User signed out', currentUser);
    // Redirect to signout route
    window.location.href = '/api/auth/signout';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newItem = {
      title: formData.get('title'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      department: formData.get('department') || 'Communications',
      author: currentUser.name,
      created_at: new Date().toISOString(),
      is_featured: formData.get('isFeatured') === 'on',
      imageUrl: imagePreview
    };

    const result = await createNews(newItem);
    if (result.success) {
      setNews(prev => [result.news, ...prev]);
      logAction('PUBLISH_NEWS', `Title: ${newItem.title}`, currentUser);
      setIsCreatingPost(false);
      setImageFile(null);
      setImagePreview(null);
    } else {
      alert(result.error || 'Failed to create post');
    }
  };

  const currentContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            news={news}
            files={files}
            dbStatus={dbStatus}
            currentUser={currentUser}
            onQuickPost={() => setIsCreatingPost(true)}
            onQuickUpload={() => setActiveTab('files')}
            onUpdateNews={async (data) => {
              const result = await updateNews(data);
              if (result.success) {
                setNews(prev => prev.map(n => n.id === result.news.id ? result.news : n));
                logAction('UPDATE_NEWS', `Title: ${data.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onDeleteNews={async (id) => {
              if (confirm("Permanently delete this post?")) {
                const result = await deleteNews(id);
                if (result.success) {
                  setNews(prev => prev.filter(n => n.id !== id));
                  logAction('DELETE_NEWS', `ID: ${id}`, currentUser);
                } else {
                  alert(result.error);
                }
              }
            }}
          />
        );
      case 'files':
        return (
          <FileLibrary
            files={files}
            currentUser={currentUser}
            onUpload={async (file) => {
              const saved = await uploadFile({ ...file, uploaderEmail: currentUser.email });
              if (saved) {
                setFiles((prev) => [saved, ...prev]);
                logAction('UPLOAD_FILE', file.name, currentUser);
              }
            }}
            onDelete={async (id) => {
              const deleted = await deleteFile(id, currentUser);
              if (deleted) {
                setFiles((prev) => prev.filter((f) => f.id !== id));
                logAction('DELETE_FILE', `ID: ${id}`, currentUser);
              }
            }}
          />
        );
      case 'comms':
        return (
          <DepartmentFeed
            news={news}
            departmentId="Communications"
            title="Internal Comms"
            subtitle="Official corporate announcements and news feed"
            theme="brand"
            icon={Megaphone}
            currentUser={currentUser}
            sidebar={commsSidebarItems}
            onCreateNews={async (newsItem) => {
              const result = await createNews({ ...newsItem, created_at: new Date().toISOString() });
              if (result.success) {
                setNews(prev => [result.news, ...prev]);
                logAction('PUBLISH_COMMS', `Title: ${newsItem.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onUpdateNews={async (data) => {
              const result = await updateNews(data);
              if (result.success) {
                setNews(prev => prev.map(n => n.id === result.news.id ? result.news : n));
                logAction('UPDATE_COMMS', `Title: ${data.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onDeleteNews={async (id) => {
              if (confirm("Permanently delete this broadcast?")) {
                const result = await deleteNews(id);
                if (result.success) {
                  setNews(prev => prev.filter(n => n.id !== id));
                  logAction('DELETE_COMMS', `ID: ${id}`, currentUser);
                } else {
                  alert(result.error);
                }
              }
            }}
          />
        );
      case 'hr':
        return (
          <DepartmentFeed
            news={news}
            departmentId="HR"
            title="Human Resources"
            subtitle="People, policies, and talent updates"
            theme="pink"
            icon={Briefcase}
            currentUser={currentUser}
            sidebar={hrSidebarItems}
            onCreateNews={async (newsItem) => {
              const result = await createNews({ ...newsItem, created_at: new Date().toISOString() });
              if (result.success) {
                setNews(prev => [result.news, ...prev]);
                logAction('PUBLISH_HR', `Title: ${newsItem.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onUpdateNews={async (data) => {
              const result = await updateNews(data);
              if (result.success) {
                setNews(prev => prev.map(n => n.id === result.news.id ? result.news : n));
                logAction('UPDATE_HR', `Title: ${data.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onDeleteNews={async (id) => {
              if (confirm("Permanently delete this broadcast?")) {
                const result = await deleteNews(id);
                if (result.success) {
                  setNews(prev => prev.filter(n => n.id !== id));
                  logAction('DELETE_HR', `ID: ${id}`, currentUser);
                } else {
                  alert(result.error);
                }
              }
            }}
          />
        );
      case 'it':
        return (
          <DepartmentFeed
            news={news}
            departmentId="IT"
            title="IT Department"
            subtitle="System status, maintenance, and tech info"
            theme="blue"
            icon={Monitor}
            currentUser={currentUser}
            sidebar={itSidebarItems}
            onCreateNews={async (newsItem) => {
              const result = await createNews({ ...newsItem, created_at: new Date().toISOString() });
              if (result.success) {
                setNews(prev => [result.news, ...prev]);
                logAction('PUBLISH_IT', `Title: ${newsItem.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onUpdateNews={async (data) => {
              const result = await updateNews(data);
              if (result.success) {
                setNews(prev => prev.map(n => n.id === result.news.id ? result.news : n));
                logAction('UPDATE_IT', `Title: ${data.title}`, currentUser);
                return { success: true };
              } else {
                alert(result.error);
                return { success: false, error: result.error };
              }
            }}
            onDeleteNews={async (id) => {
              if (confirm("Permanently delete this broadcast?")) {
                const result = await deleteNews(id);
                if (result.success) {
                  setNews(prev => prev.filter(n => n.id !== id));
                  logAction('DELETE_IT', `ID: ${id}`, currentUser);
                } else {
                  alert(result.error);
                }
              }
            }}
          />
        );
      case 'admin':
        if (currentUser?.role !== 'Admin') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-js-blue-900 border-dashed bg-white rounded-lg">
              <Shield size={48} className="text-js-blue-100 mb-4" />
              <h2 className="text-xl font-bold text-js-blue-900 mb-2 uppercase tracking-tighter">Access Denied</h2>
              <p className="text-xs text-js-blue-400 font-mono uppercase tracking-widest text-center max-w-xs">
                Your credentials lack the authorization level required for administrative segments.
              </p>
            </div>
          );
        }
        return (
          <AdminPanel
            auditLogs={auditLogs}
            users={users}
            announcement={announcement}
            onCreateUser={async (userData) => {
              const result = await createUser(userData);
              if (result.success) {
                setUsers(prev => [...prev, result.user]);
                logAction('CREATE_USER', `User: ${userData.email}`, currentUser);
                return { success: true };
              } else {
                alert(result.error || "Failed to create user");
                return { success: false };
              }
            }}
            onDeleteUser={async (id) => {
              await deleteUser(id);
              setUsers(prev => prev.filter(u => u.id !== id));
              logAction('DELETE_USER', `ID: ${id}`, currentUser);
            }}
            onUpdateUser={async (userData) => {
              const updated = await updateUser(userData);
              if (updated) {
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                logAction('UPDATE_USER', `User: ${userData.email}`, currentUser);
              }
            }}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] border border-black border-dashed bg-white">
            <h2 className="text-xl font-bold text-black mb-2 uppercase tracking-tighter">System Segment Offline</h2>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">The {activeTab} module is currently under engineering.</p>
          </div>
        );
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Local Access Control...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white font-sans">
        <div className="border border-white/20 p-10 max-w-md w-full relative z-10 bg-black">
          <div className="w-64 h-24 flex items-center justify-center mb-10 mx-auto">
            <img src="/logo-new.png" alt="JS Bank" className="w-full h-full object-contain brightness-0 invert" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-white tracking-tighter uppercase">access portal</h1>
          <p className="text-zinc-500 text-center mb-10 text-xs font-mono uppercase tracking-widest text-js-orange-500">Authorized Personnel Only</p>

          <div className="mb-8 p-4 border border-js-blue-800 bg-js-blue-900/50 flex items-start gap-4">
            <div className="text-js-orange-500 mt-0.5"><Lock size={14} /></div>
            <div className="text-xs text-zinc-400 font-mono">
              <strong className="text-white uppercase tracking-wider">Secure Sign-In</strong><br />
              Use your Google account to access the system
            </div>
          </div>

          <a
            href="/api/auth/signin/google"
            className="w-full bg-white text-black font-bold py-4 hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 group rounded-none uppercase tracking-widest text-xs border border-transparent"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-[10px] text-center mt-12 text-zinc-600 font-mono uppercase">
            System ID: JS-CMS-v2.5.0 <br /> Secured Connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Create Post Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-none">
          <div className="bg-white border-2 border-js-blue-900 w-full max-w-2xl rounded-md overflow-hidden relative shadow-[20px_20px_0px_rgba(0,51,102,0.1)]">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-js-blue-900 tracking-tighter uppercase">Create New Post</h2>
                <button 
                  onClick={() => {
                    setIsCreatingPost(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }} 
                  className="p-2 hover:bg-js-blue-50 text-js-blue-900 border-2 border-transparent hover:border-js-blue-900 rounded-md transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Title</label>
                      <input 
                        name="title" 
                        required 
                        className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md font-bold uppercase" 
                        placeholder="ANNOUNCEMENT TITLE" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Summary</label>
                      <textarea 
                        name="summary" 
                        required 
                        className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md h-24" 
                        placeholder="BRIEF SUMMARY..." 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Department</label>
                      <select 
                        name="department" 
                        className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md font-bold uppercase"
                        defaultValue="Communications"
                      >
                        <option value="Communications">Communications</option>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-js-blue-900 border-dashed rounded-md h-full flex flex-col items-center justify-center p-4 bg-js-blue-50 relative group cursor-pointer min-h-[200px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-md" />
                          <div className="absolute inset-0 bg-js-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setImageFile(null); 
                              setImagePreview(null); 
                            }}
                            className="absolute top-2 right-2 p-1 bg-white text-js-blue-900 rounded-full hover:bg-js-blue-100 transition-colors z-10"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={24} className="text-js-blue-400 mb-2" />
                          <span className="text-js-blue-400 text-xs font-bold uppercase tracking-widest">Upload Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Full Content</label>
                  <textarea 
                    name="content" 
                    required 
                    rows={5} 
                    className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md" 
                    placeholder="DETAILED MESSAGE..." 
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name="isFeatured" 
                    id="feat-new" 
                    className="w-4 h-4 rounded-sm border-js-blue-900 text-js-blue-900 focus:ring-0" 
                  />
                  <label htmlFor="feat-new" className="text-xs font-bold uppercase tracking-wider text-js-blue-900">Mark as Featured</label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t-2 border-js-blue-50 mt-6">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCreatingPost(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }} 
                    className="px-6 py-3 text-js-blue-400 hover:text-js-blue-900 font-bold uppercase text-xs tracking-widest transition-colors rounded-md"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-js-blue-900 text-white hover:bg-js-blue-800 font-bold uppercase text-xs tracking-widest transition-all rounded-md"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        announcement={announcement}
      >
        {currentContent()}
      </Layout>
    </>
  );
}
