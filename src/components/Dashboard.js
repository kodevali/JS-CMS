import React from 'react';
import { Megaphone, FileText, ArrowUpRight, TrendingUp, Users, ShieldCheck, Clock, Plus } from 'lucide-react';
import FeaturedCarousel from './FeaturedCarousel';

const Dashboard = ({ news = [], files = [], dbStatus, onQuickPost, onQuickUpload, onUpdateNews, onDeleteNews, currentUser }) => {
    const isViewer = currentUser?.role === 'Viewer';
    // Get latest news for each department
    const latestComms = news.filter(n => n.department === 'Communications')[0];
    const latestHR = news.filter(n => n.department === 'HR')[0];
    const latestIT = news.filter(n => n.department === 'IT')[0];

    return (
        <div className="space-y-12 pb-12 font-sans">
            {/* Featured Carousel */}
            <FeaturedCarousel items={news} />

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-js-blue-900 pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-js-blue-900 tracking-tighter uppercase relative -left-[2px]">Overview</h2>
                    </div>
                    <p className="text-js-blue-700 font-mono text-xs uppercase tracking-widest font-bold">System Status: <span className="text-green-600">Operational</span></p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {!isViewer && (
                        <>
                            <button onClick={onQuickUpload} className="w-full sm:w-auto px-6 py-3 border-2 border-js-blue-900 rounded-lg hover:bg-js-blue-50 text-js-blue-900 text-xs font-bold uppercase tracking-widest transition-colors">
                                Upload File
                            </button>
                            <button onClick={onQuickPost} className="w-full sm:w-auto px-6 py-3 bg-js-blue-900 rounded-lg hover:bg-js-blue-800 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border-2 border-transparent">
                                <Plus size={14} className="text-js-orange-500" /> New Post
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 3-Column Featured News Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Communications Feature */}
                {latestComms && (
                    <div className="border-2 border-js-blue-900 bg-white rounded-xl hover:bg-js-blue-50 transition-all shadow-[6px_6px_0px_theme(colors.js-orange-500)] group cursor-pointer overflow-hidden">
                        {latestComms.imageUrl && (
                            <div className="h-40 border-b-2 border-js-blue-900 overflow-hidden relative">
                                <img src={latestComms.imageUrl} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" alt="Comms" />
                                <div className="absolute top-0 right-0 p-2">
                                    <Megaphone size={16} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        )}
                        <div className="p-5">
                            <span className="text-[9px] font-bold text-js-blue-400 uppercase tracking-widest mb-2 block">Communications</span>
                            <h3 className="text-lg font-bold text-js-blue-900 leading-tight mb-2 uppercase group-hover:text-js-orange-600 transition-colors line-clamp-2">
                                {latestComms.title}
                            </h3>
                            <p className="text-js-blue-700 line-clamp-2 text-xs font-mono mb-4 italic">
                                {latestComms.summary}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-js-blue-900 uppercase tracking-widest font-bold border-t border-js-blue-50 pt-3">
                                <span>Article</span> <ArrowUpRight size={12} className="text-js-orange-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* HR Feature */}
                {latestHR && (
                    <div className="border-2 border-js-blue-900 bg-white rounded-xl hover:bg-js-blue-50 transition-all shadow-[6px_6px_0px_theme(colors.js-orange-500)] group cursor-pointer overflow-hidden">
                        {latestHR.imageUrl && (
                            <div className="h-40 border-b-2 border-js-blue-900 overflow-hidden relative">
                                <img src={latestHR.imageUrl} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" alt="HR" />
                                <div className="absolute top-0 right-0 p-2">
                                    <Users size={16} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        )}
                        <div className="p-5">
                            <span className="text-[9px] font-bold text-js-blue-400 uppercase tracking-widest mb-2 block">Human Resources</span>
                            <h3 className="text-lg font-bold text-js-blue-900 leading-tight mb-2 uppercase group-hover:text-js-orange-600 transition-colors line-clamp-2">
                                {latestHR.title}
                            </h3>
                            <p className="text-js-blue-700 line-clamp-2 text-xs font-mono mb-4 italic">
                                {latestHR.summary}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-js-blue-900 uppercase tracking-widest font-bold border-t border-js-blue-50 pt-3">
                                <span>Policy</span> <ArrowUpRight size={12} className="text-js-orange-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* IT Feature */}
                {latestIT && (
                    <div className="border-2 border-js-blue-900 bg-white rounded-xl hover:bg-js-blue-50 transition-all shadow-[6px_6px_0px_theme(colors.js-orange-500)] group cursor-pointer overflow-hidden">
                        {latestIT.imageUrl && (
                            <div className="h-40 border-b-2 border-js-blue-900 overflow-hidden relative">
                                <img src={latestIT.imageUrl} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" alt="IT" />
                                <div className="absolute top-0 right-0 p-2">
                                    <ShieldCheck size={16} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        )}
                        <div className="p-5">
                            <span className="text-[9px] font-bold text-js-blue-400 uppercase tracking-widest mb-2 block">IT Infrastructure</span>
                            <h3 className="text-lg font-bold text-js-blue-900 leading-tight mb-2 uppercase group-hover:text-js-orange-600 transition-colors line-clamp-2">
                                {latestIT.title}
                            </h3>
                            <p className="text-js-blue-700 line-clamp-2 text-xs font-mono mb-4 italic">
                                {latestIT.summary}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-js-blue-900 uppercase tracking-widest font-bold border-t border-js-blue-50 pt-3">
                                <span>Update</span> <ArrowUpRight size={12} className="text-js-orange-500" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Secondary Grid: Repo and Stats (hidden for Viewers) */}
            {!isViewer && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Global Repository (Wider) */}
                    <div className="md:col-span-2 p-6 border-2 border-js-blue-900 bg-white rounded-xl shadow-[6px_6px_0px_theme(colors.js-blue-100)]">
                        <div className="flex items-center justify-between mb-4 border-b-2 border-js-blue-900 pb-2">
                            <div className="flex items-center gap-2 text-js-blue-900">
                                <FileText size={18} className="text-js-orange-500" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Global Repository</h3>
                            </div>
                            <span className="text-[10px] text-js-blue-900 hover:text-js-orange-600 cursor-pointer uppercase tracking-wider font-bold">Access All</span>
                        </div>
                        <div className="space-y-0 divide-y divide-js-blue-50">
                            {files.slice(0, 3).map(file => (
                                <div key={file.id} className="flex items-center gap-4 p-3 hover:bg-js-blue-50 transition-colors cursor-pointer group">
                                    <FileText size={16} className="text-js-blue-700 group-hover:text-js-orange-500" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-js-blue-900 truncate uppercase">{file.name}</h4>
                                    </div>
                                    <span className="text-xs text-js-blue-400 font-mono font-bold">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Metrics (Stack) */}
                    <div className="space-y-6">
                        {/* System Status */}
                        <div className="p-5 border-2 border-js-blue-900 bg-white rounded-lg flex flex-col justify-between shadow-[4px_4px_0px_theme(colors.js-blue-100)]">
                            <div className="flex justify-between items-start mb-2">
                                <ShieldCheck size={20} className="text-js-blue-900" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-white bg-green-600 px-2 py-0.5">
                                    Operational
                                </span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-js-blue-900 tracking-tighter">99.9%</div>
                                <div className="text-[9px] text-js-blue-400 font-bold uppercase tracking-widest font-mono">Uptime</div>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="p-5 border-2 border-js-blue-900 bg-white flex flex-col justify-between shadow-[4px_4px_0px_theme(colors.js-blue-100)]">
                            <div className="flex justify-between items-start mb-2">
                                <TrendingUp size={20} className="text-js-orange-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-js-blue-900 tracking-tighter">1,240+</div>
                                <div className="text-[9px] text-js-blue-400 font-bold uppercase tracking-widest font-mono">Sessions</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
