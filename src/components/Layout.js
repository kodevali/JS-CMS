"use client";

import React, { useState } from 'react';
import {
    LayoutGrid,
    MessageSquare,
    Users,
    Server,
    FolderOpen,
    Shield,
    LogOut,
    Menu
} from 'lucide-react';

import AnnouncementBar from './AnnouncementBar';

const Layout = ({
    children,
    activeTab,
    setActiveTab,
    currentUser,
    onLogout,
    announcement
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'comms', label: 'Communications', icon: MessageSquare },
        { id: 'hr', label: 'HR Announcements', icon: Users },
        { id: 'it', label: 'IT Announcements', icon: Server },
        { id: 'files', label: 'Files', icon: FolderOpen },
        ...(currentUser?.role === 'Admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    ];

    return (
        <div className="flex flex-col h-screen w-full bg-white text-black font-sans overflow-hidden" >
            <AnnouncementBar
                message={announcement}
                isAdmin={currentUser?.role === 'Admin'}
            />
            {/* Main Horizontal Header */}
            <header className="h-20 flex items-center justify-between px-6 border-b-2 border-js-blue-900 bg-white z-50 shrink-0" >
                <div className="flex items-center gap-10 h-full">
                    <div className="flex items-center gap-4">
                        <img src="/logo-new.png" alt="JS Bank" className="h-12 w-auto" />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center h-full">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    px-6 h-full flex items-center gap-2 border-r border-zinc-100 transition-all
                                    ${activeTab === item.id
                                        ? 'bg-js-blue-900 text-white border-b-4 border-b-js-orange-500'
                                        : 'text-js-blue-900 hover:bg-js-blue-50 font-medium'}
                                    ${item.id === 'dashboard' ? 'border-l' : ''}
                                `}
                            >
                                <item.icon size={16} className={activeTab === item.id ? 'text-js-orange-400' : 'text-js-blue-700'} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* User Profile Area */}
                    <div className="hidden md:flex items-center gap-4 pl-6 border-l-2 border-js-blue-100 h-10">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-js-blue-50 border border-js-blue-200 rounded-lg">
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-xs uppercase bg-js-blue-900 text-white rounded-md ring-2 ring-js-orange-500 ring-offset-1">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-[11px] font-bold uppercase text-js-blue-900">{currentUser?.name}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 hover:bg-js-orange-500 hover:text-white text-js-blue-900 transition-colors border-2 border-js-blue-900 rounded-md"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 border-2 border-js-blue-900 text-js-blue-900 rounded-md"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header >

            {/* Mobile Navigation Dropdown */}
            {
                isMobileMenuOpen && (
                    <div className="md:hidden border-b border-black bg-white absolute top-16 left-0 w-full z-40 shadow-2xl">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                w-full flex items-center gap-3 px-6 py-4 border-b border-black transition-colors
                                ${activeTab === item.id ? 'bg-black text-white' : 'text-black bg-white'}
                            `}
                            >
                                <item.icon size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                            </button>
                        ))}
                        <div className="p-4 bg-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center font-bold text-xs bg-black text-white">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-xs font-bold uppercase">{currentUser?.name}</span>
                            </div>
                            <button onClick={onLogout} className="p-2 border border-black bg-white">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                {/* Secondary Header / Breadcrumbs */}
                <div className="h-10 flex items-center px-6 border-b border-black/5 bg-zinc-50 shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">
                        System <span className="text-black/20 mx-2">/</span> {activeTab}
                    </span>
                </div>

                {/* Content Scroll View */}
                <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 lg:px-12">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div >
    );
};

export default Layout;
