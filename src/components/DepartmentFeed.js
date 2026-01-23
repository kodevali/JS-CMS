"use client";

import React, { useState } from 'react';
import { Megaphone, Calendar, User, Plus, X, ChevronRight, Image as ImageIcon, Edit, Trash2, Heart, MessageCircle, Share2 } from 'lucide-react';

const themes = {
    brand: {
        accent: 'text-black',
        button: 'bg-black hover:bg-zinc-800 text-white',
        border: 'focus:border-black',
        hoverBorder: 'hover:border-zinc-400',
        icon: 'text-black',
        subtleBg: 'bg-zinc-100',
        badge: 'bg-black text-white border-transparent'
    },
    pink: {
        accent: 'text-black',
        button: 'bg-black hover:bg-zinc-800 text-white',
        border: 'focus:border-black',
        hoverBorder: 'hover:border-zinc-400',
        icon: 'text-black',
        subtleBg: 'bg-zinc-100',
        badge: 'bg-black text-white border-transparent'
    },
    blue: {
        accent: 'text-black',
        button: 'bg-black hover:bg-zinc-800 text-white',
        border: 'focus:border-black',
        hoverBorder: 'hover:border-zinc-400',
        icon: 'text-black',
        subtleBg: 'bg-zinc-100',
        badge: 'bg-black text-white border-transparent'
    }
};

const DepartmentFeed = ({ news, onCreateNews, onUpdateNews, onDeleteNews, currentUser, departmentId, title, subtitle, theme = 'brand', icon: Icon = Megaphone, sidebar = null }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const t = themes[theme] || themes.brand;

    const isEditor = currentUser?.role === 'Admin' ||
        (departmentId === 'Communications' && currentUser?.role === 'Comms Editor') ||
        (currentUser?.role === `${departmentId} Editor`);

    // Filter news for this department
    const deptNews = news.filter(item =>
        (item.department === departmentId) &&
        (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.summary?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const result = await onCreateNews({
            title: formData.get('title'),
            summary: formData.get('summary'),
            content: formData.get('content'),
            department: departmentId,
            author: currentUser.name,
            isFeatured: formData.get('isFeatured') === 'on',
            imageUrl: imagePreview // Send Base64 string
        });

        if (result?.success) {
            setIsCreating(false);
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData(e.target);

        const result = await onUpdateNews({
            id: editingItem.id,
            title: formData.get('title'),
            summary: formData.get('summary'),
            content: formData.get('content'),
            isFeatured: formData.get('isFeatured') === 'on',
            imageUrl: imagePreview || editingItem.imageUrl
        });

        if (result?.success) {
            setEditingItem(null);
            setImagePreview(null);
        }
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-js-blue-900 pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-js-blue-900 tracking-tighter uppercase flex items-center gap-4">
                        <div className={`p-3 bg-js-blue-900 text-js-orange-500 border-2 border-js-blue-800 rounded-lg shadow-[4px_4px_0px_theme(colors.js-orange-500)]`}>
                            <Icon size={24} />
                        </div>
                        {title}
                    </h1>
                    <p className="text-sm text-js-blue-400 mt-2 font-mono uppercase tracking-widest font-bold border-l-2 border-js-orange-500 pl-4">{subtitle}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    {(currentUser?.role === 'Admin' ||
                        (departmentId === 'Communications' && currentUser?.role === 'Comms Editor') ||
                        (currentUser?.role === `${departmentId} Editor`)) && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className={`bg-js-blue-900 hover:bg-js-blue-800 text-white px-6 py-3 font-bold transition-all shadow-[4px_4px_0px_theme(colors.js-orange-500)] border-2 border-transparent flex items-center gap-2 text-xs uppercase tracking-widest rounded-lg`}
                            >
                                <Plus size={16} className="text-js-orange-500" /> New BroadCast
                            </button>
                        )}
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-none">
                    <div className="bg-white border-2 border-js-blue-900 w-full max-w-2xl rounded-md overflow-hidden relative shadow-[20px_20px_0px_rgba(0,51,102,0.1)]">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-js-blue-900 tracking-tighter uppercase">Broadcast New Update</h2>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-js-blue-50 text-js-blue-900 border-2 border-transparent hover:border-js-blue-900 rounded-md transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Title</label>
                                            <input name="title" required className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md font-bold uppercase" placeholder="DEPT UPDATE TITLE" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Summary</label>
                                            <textarea name="summary" required className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md h-24" placeholder="BRIEF SUMMARY..." />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border-2 border-js-blue-900 border-dashed rounded-md h-full flex flex-col items-center justify-center p-4 bg-js-blue-50 relative group cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-md" />
                                                    <div className="absolute inset-0 bg-js-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                                        className="absolute top-2 right-2 p-1 bg-white text-js-blue-900 rounded-full hover:bg-js-blue-100 transition-colors"
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
                                    <textarea name="content" required rows={5} className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md" placeholder="DETAILED MESSAGE..." />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name="isFeatured" id="feat" className="w-4 h-4 rounded-sm border-js-blue-900 text-js-blue-900 focus:ring-0" />
                                    <label htmlFor="feat" className="text-xs font-bold uppercase tracking-wider text-js-blue-900">Mark as Featured</label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t-2 border-js-blue-50 mt-6">
                                    <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-js-blue-400 hover:text-js-blue-900 font-bold uppercase text-xs tracking-widest transition-colors rounded-md">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-js-blue-900 text-white hover:bg-js-blue-800 font-bold uppercase text-xs tracking-widest transition-all rounded-md">Publish</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Layout */}
            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-none transition-all">
                    <div className="bg-white border-2 border-js-blue-900 w-full max-w-2xl rounded-md overflow-hidden relative shadow-[20px_20px_0px_rgba(0,51,102,0.1)]">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-js-blue-900 tracking-tighter uppercase">Edit Broadcast</h2>
                                <button onClick={() => { setEditingItem(null); setImagePreview(null); }} className="p-2 hover:bg-js-blue-50 text-js-blue-900 border-2 border-transparent hover:border-js-blue-900 rounded-md transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Title</label>
                                            <input name="title" defaultValue={editingItem.title} required className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md font-bold uppercase" placeholder="DEPT UPDATE TITLE" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-js-blue-400 uppercase tracking-widest mb-1 font-mono">Summary</label>
                                            <textarea name="summary" defaultValue={editingItem.summary} required className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md h-24" placeholder="BRIEF SUMMARY..." />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border-2 border-js-blue-900 border-dashed rounded-md h-full flex flex-col items-center justify-center p-4 bg-js-blue-50 relative group cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-md" />
                                                    <div className="absolute inset-0 bg-js-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                                                        className="absolute top-2 right-2 p-1 bg-white text-js-blue-900 rounded-full hover:bg-js-blue-100 transition-colors"
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
                                    <textarea name="content" defaultValue={editingItem.content} required rows={5} className="w-full bg-white border-2 border-js-blue-900 p-3 text-js-blue-900 outline-none focus:bg-js-blue-50 rounded-md" placeholder="DETAILED MESSAGE..." />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name="isFeatured" id="feat-edit" defaultChecked={editingItem.isFeatured} className="w-4 h-4 rounded-sm border-js-blue-900 text-js-blue-900 focus:ring-0" />
                                    <label htmlFor="feat-edit" className="text-xs font-bold uppercase tracking-wider text-js-blue-900">Mark as Featured</label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t-2 border-js-blue-50 mt-6">
                                    <button type="button" onClick={() => { setEditingItem(null); setImagePreview(null); }} className="px-6 py-3 text-js-blue-400 hover:text-js-blue-900 font-bold uppercase text-xs tracking-widest transition-colors rounded-md">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-js-blue-900 text-white hover:bg-js-blue-800 font-bold uppercase text-xs tracking-widest transition-all rounded-md">Update Broadcast</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-none transition-all">
                    <div className="bg-white border-2 border-js-blue-900 w-full max-w-3xl max-h-[90vh] rounded-md overflow-hidden relative shadow-[20px_20px_0px_rgba(0,51,102,0.1)] flex flex-col">
                        {/* Immersive Header Image */}
                        {selectedItem.imageUrl ? (
                            <div className="w-full h-64 shrink-0 relative">
                                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 p-2 bg-js-blue-900 text-white rounded-md hover:bg-js-blue-800 transition-all z-10"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="p-8 pb-0 shrink-0 flex justify-end">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-js-blue-50 text-js-blue-900 border-2 border-transparent hover:border-js-blue-900 rounded-md transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        )}

                        <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 text-[10px] text-js-blue-400 font-mono uppercase tracking-[0.2em] font-bold border-r-2 border-js-blue-100 pr-4">
                                    <Calendar size={12} className="text-js-blue-900" /> {new Date(selectedItem.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-js-blue-900 font-mono uppercase tracking-[0.2em] font-bold">
                                    <User size={12} className="text-js-orange-500" /> {selectedItem.author}
                                </div>
                            </div>

                            <h2 className="text-4xl font-black text-js-blue-900 uppercase tracking-tighter mb-6 leading-[0.9] border-b-4 border-js-orange-500 pb-4 inline-block">
                                {selectedItem.title}
                            </h2>

                            <div className="space-y-6">
                                <p className="text-lg font-bold text-js-blue-800 leading-relaxed bg-js-blue-50/50 p-6 rounded-lg border-l-4 border-js-blue-900 italic">
                                    "{selectedItem.summary}"
                                </p>

                                <div className="text-js-blue-900 leading-[1.6] space-y-4 whitespace-pre-wrap font-medium">
                                    {selectedItem.content}
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t-2 border-js-blue-50 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-js-blue-400 hover:text-js-orange-500 transition-colors">
                                        <Heart size={18} /> Like Post
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-js-blue-400 hover:text-js-blue-900 transition-colors">
                                        <MessageCircle size={18} /> Leave Comment
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-8 py-3 bg-js-blue-900 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-md hover:bg-js-blue-800 transition-all shadow-[4px_4px_0px_theme(colors.js-orange-500)]"
                                >
                                    Close Reading Mode
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-col lg:flex-row gap-8 items-start`}>
                {/* News Feed Section (75% if sidebar exists) */}
                <div className={`${sidebar ? 'lg:w-[75%]' : 'w-full'} space-y-12`}>
                    {/* Top Tier (3 cards if sidebar) */}
                    <div className={`grid grid-cols-1 ${sidebar ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                        {deptNews.length === 0 ? (
                            <div className="lg:col-span-3 text-center py-20 bg-white border-2 border-js-blue-900 border-dashed shadow-[4px_4px_0px_theme(colors.js-blue-50)] rounded-lg">
                                <Icon className="mx-auto text-js-blue-100 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-js-blue-900 uppercase tracking-widest">No Updates Yet</h3>
                                <p className="text-js-blue-400 mt-2 font-mono text-xs">Check back later for {departmentId} news.</p>
                            </div>
                        ) : (
                            deptNews.slice(0, 3).map((item) => (
                                <article
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`bg-white border-2 border-js-blue-900 p-0 transition-all group hover:bg-js-blue-50 shadow-[4px_4px_0px_theme(colors.js-blue-100)] hover:shadow-[6px_6px_0px_theme(colors.js-orange-500)] flex flex-col rounded-lg h-full cursor-pointer`}
                                >
                                    {/* Image Header if available */}
                                    {item.imageUrl && (
                                        <div className="w-full aspect-video border-b-2 border-js-blue-900 overflow-hidden relative rounded-t-lg">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            {item.isFeatured && (
                                                <div className="absolute top-0 left-0 bg-js-orange-500 text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest border-r-2 border-b-2 border-js-blue-900 rounded-tl-lg">Featured</div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-5 flex flex-col flex-1 gap-3">
                                        <div className="flex items-center justify-between border-b border-js-blue-50 pb-3">
                                            <div className="flex items-center gap-2 text-[9px] text-js-blue-400 font-mono">
                                                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 text-js-blue-900 font-bold uppercase"><User size={10} /> {item.author?.split(' ')[0]}</span>
                                            </div>
                                            {isEditor && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingItem(item);
                                                            setImagePreview(item.imageUrl);
                                                        }}
                                                        className="p-1 hover:bg-js-blue-50 text-js-blue-900 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteNews(item.id);
                                                        }}
                                                        className="p-1 hover:bg-red-50 text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h2 className={`text-sm font-bold text-js-blue-900 mb-2 uppercase tracking-tight group-hover:text-js-orange-600 transition-colors line-clamp-2`}>{item.title}</h2>
                                            <p className="text-js-blue-700 leading-relaxed text-[10px] line-clamp-3 font-medium italic">"{item.summary || item.content}"</p>
                                        </div>

                                        <div className="flex items-center gap-4 pt-3 mt-auto border-t border-js-blue-50">
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className={`flex items-center gap-1.5 text-js-blue-300 hover:text-js-orange-500 transition-colors text-[9px] font-bold uppercase tracking-wider`}
                                            >
                                                <Heart size={14} /> Like
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1.5 text-js-blue-300 hover:text-js-blue-900 transition-colors text-[9px] font-bold uppercase tracking-wider"
                                            >
                                                <MessageCircle size={14} /> Msg
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1.5 text-js-blue-300 hover:text-js-blue-900 transition-colors text-[9px] font-bold uppercase tracking-wider ml-auto"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    {/* Secondary Tier (Compact Cards) */}
                    {deptNews.length > 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deptNews.slice(3).map((item) => (
                                <article
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="bg-zinc-50 border-2 border-js-blue-900 rounded-lg p-5 group hover:bg-white transition-all shadow-[4px_4px_0px_theme(colors.js-blue-900)] hover:shadow-[6px_6px_0px_theme(colors.js-orange-500)] flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[8px] font-mono text-js-blue-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <div className="w-1.5 h-1.5 bg-js-orange-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <h4 className="text-xs font-bold text-js-blue-900 uppercase tracking-tight group-hover:text-js-orange-600 transition-colors mb-2 line-clamp-2">
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] text-js-blue-700 line-clamp-2 font-medium">
                                            {item.summary || item.content}
                                        </p>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-js-blue-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-bold text-js-blue-900 uppercase tracking-widest">{item.author?.split(' ')[0]}</span>
                                            {isEditor && (
                                                <div className="flex gap-2 border-l border-js-blue-100 pl-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingItem(item);
                                                            setImagePreview(item.imageUrl);
                                                        }}
                                                        className="text-js-blue-900 hover:text-js-orange-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteNews(item.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight size={12} className="text-js-blue-300 group-hover:text-js-orange-500 transition-colors" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar (25%) */}
                {sidebar && (
                    <div className="lg:w-[25%] w-full space-y-6 shrink-0 lg:sticky lg:top-8 mt-12 lg:mt-0">
                        <div className="bg-js-blue-50/50 border-2 border-js-blue-900 rounded-lg p-6 shadow-[6px_6px_0px_theme(colors.js-blue-100)]">
                            <h3 className="text-xs font-bold text-js-blue-900 uppercase tracking-widest mb-6 border-b-2 border-js-blue-900 pb-2 flex items-center gap-2">
                                <Icon size={14} className="text-js-orange-500" /> Segment Toolkit
                            </h3>
                            <div className="flex flex-col gap-3">
                                {sidebar.map((btn, idx) => (
                                    <button
                                        key={idx}
                                        onClick={btn.onClick}
                                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-js-blue-900 rounded-lg hover:bg-js-blue-900 hover:text-white transition-all group shadow-[4px_4px_0px_theme(colors.js-blue-900)] hover:shadow-none translate-y-[-2px] hover:translate-y-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-js-orange-500 group-hover:text-white">
                                                <btn.icon size={18} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{btn.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-40 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentFeed;
