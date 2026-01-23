"use client";

import React, { useState } from 'react';
import { Shield, FileText, Trash2, Search, X, Check, AlertCircle, Edit2 } from 'lucide-react';

const AdminPanel = ({ auditLogs = [], users = [], onCreateUser, onDeleteUser, onUpdateUser, announcement }) => {
    console.log(`[CLIENT] AdminPanel received ${users.length} users`);
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [announcementMsg, setAnnouncementMsg] = useState(announcement || '');
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // Filter Logic
    const filteredUsers = (users || []).filter(u =>
        (u?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLogs = (auditLogs || []).filter(l =>
        (l?.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l?.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        const formData = new FormData(e.target);
        if (onUpdateUser) {
            onUpdateUser({
                id: editingUser.id,
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role')
            });
        }
        setEditingUser(null);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black tracking-tight flex items-center gap-3 uppercase">
                        <div className="p-2 border border-black bg-zinc-100 text-black rounded-lg">
                            <Shield size={24} />
                        </div>
                        System Administration
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Manage users, roles, and view security audits</p>
                </div>

                <div className="flex gap-2 bg-white p-0">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${activeTab === 'users' ? 'bg-black text-white' : 'text-black border border-black hover:bg-zinc-100'
                            }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${activeTab === 'audit' ? 'bg-black text-white' : 'text-black border border-black hover:bg-zinc-100'
                            }`}
                    >
                        Security Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${activeTab === 'settings' ? 'bg-black text-white' : 'text-black border border-black hover:bg-zinc-100'
                            }`}
                    >
                        Global Settings
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden min-h-[500px] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                {/* Search Bar */}
                <div className="p-6 border-b border-black flex items-center justify-between gap-4 bg-zinc-50 rounded-t-xl">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "SEARCH USERS..." : "SEARCH LOGS..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-black rounded-md text-xs text-black focus:outline-none focus:bg-zinc-50 transition-all font-mono uppercase"
                        />
                    </div>
                    {activeTab === 'users' && (
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest px-4 py-2 border border-zinc-300 rounded-md bg-zinc-50">
                            Users auto-create on first Google sign-in
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto">
                    {activeTab === 'settings' ? (
                        <div className="p-10 max-w-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-black pb-4">Global Announcement</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-js-blue-50 border border-js-blue-100">
                                    <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-3 font-mono">Current Banner Message</label>
                                    <textarea
                                        defaultValue={announcementMsg}
                                        id="announcement-input"
                                        className="w-full bg-white border border-black p-4 text-sm font-medium text-js-blue-900 min-h-[100px] outline-none focus:ring-2 focus:ring-js-orange-500/20"
                                        placeholder="Enter announcement text here... (leave blank to hide bar)"
                                    ></textarea>
                                    <p className="mt-4 text-[10px] text-zinc-400 font-mono flex items-center gap-2">
                                        <AlertCircle size={10} /> This will be visible to all users at the top of every page.
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            const val = document.getElementById('announcement-input').value;
                                            setIsUpdatingSettings(true);
                                            const { updateSystemSetting } = await import('@/actions/settings');
                                            const res = await updateSystemSetting('announcement', val);
                                            if (res.success) {
                                                alert("Announcement updated successfully!");
                                                window.location.reload(); // Quick way to sync global state
                                            } else {
                                                alert(res.error || "Update failed");
                                            }
                                            setIsUpdatingSettings(false);
                                        }}
                                        disabled={isUpdatingSettings}
                                        className="bg-js-blue-900 text-white px-10 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-js-blue-800 transition-all border-2 border-transparent disabled:opacity-50"
                                    >
                                        {isUpdatingSettings ? "UPDATING..." : "COMMIT CHANGES"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'users' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                                    <th className="p-6 font-bold">User</th>
                                    <th className="p-6 font-bold">Role</th>
                                    <th className="p-6 font-bold">Status</th>
                                    <th className="p-6 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-black/10 hover:bg-zinc-50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs border border-black">
                                                    {(user.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black uppercase tracking-tight">{user.name}</p>
                                                    <p className="text-zinc-500 text-[10px] font-mono">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-2 py-1 border border-black text-[10px] font-bold uppercase text-black">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-6 text-zinc-500 font-mono text-[10px]">
                                            <span className="flex items-center gap-2 uppercase">
                                                <span className="w-1.5 h-1.5 bg-black"></span> Active
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 border border-transparent hover:border-black transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                {user.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => onDeleteUser && onDeleteUser(user.id)}
                                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-600 transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                                    <th className="p-6 font-bold">Status</th>
                                    <th className="p-6 font-bold">Action</th>
                                    <th className="p-6 font-bold">User</th>
                                    <th className="p-6 font-bold">Details</th>
                                    <th className="p-6 font-bold text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="border-b border-black/10 hover:bg-zinc-50 transition-colors">
                                        <td className="p-6">
                                            {log.status === 'SUCCESS' ? (
                                                <span className="flex items-center gap-2 text-black text-[10px] font-bold uppercase">
                                                    <Check size={12} /> Success
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase">
                                                    <AlertCircle size={12} /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <span className="px-2 py-0.5 bg-zinc-100 border border-black/20 text-[10px] font-bold text-black uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-6 text-black font-bold text-xs uppercase">
                                            {log.userEmail}
                                        </td>
                                        <td className="p-6 text-zinc-500 max-w-sm truncate text-xs">
                                            {log.details || '-'}
                                        </td>
                                        <td className="p-6 text-right text-zinc-400 font-mono text-[10px]">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>


            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-none">
                    <div className="bg-white border border-black w-full max-w-md overflow-hidden relative shadow-none">
                        <button
                            onClick={() => setEditingUser(null)}
                            className="absolute top-4 right-4 p-2 text-black hover:bg-zinc-100 border border-transparent hover:border-black transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                                <Edit2 className="text-black" size={24} /> Edit User
                            </h2>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Full Name</label>
                                    <input name="name" defaultValue={editingUser.name} required className="w-full bg-white border border-black p-3 text-black outline-none focus:bg-zinc-50 transition-colors text-sm uppercase" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Email Address</label>
                                    <input name="email" defaultValue={editingUser.email} type="email" required className="w-full bg-white border border-black p-3 text-black outline-none focus:bg-zinc-50 transition-colors text-sm uppercase font-mono" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Role</label>
                                    <select name="role" defaultValue={editingUser.role} className="w-full bg-white border border-black p-3 text-black outline-none focus:bg-zinc-50 transition-colors text-sm uppercase font-bold">
                                        <option value="Viewer">Viewer</option>
                                        <option value="HR Editor">HR Editor</option>
                                        <option value="Comms Editor">Comms Editor</option>
                                        <option value="IT Editor">IT Editor</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-black mt-6">
                                    <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 text-zinc-500 hover:text-black font-bold uppercase text-xs tracking-widest transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-black text-white hover:bg-zinc-800 font-bold uppercase text-xs tracking-widest transition-all border border-black">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
