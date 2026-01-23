"use client";

import React from 'react';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

const FeaturedSection = ({ news }) => {
    // Filter for featured items
    const featuredNews = news.filter(item => item.isFeatured) || [];

    if (featuredNews.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-js-orange-500/10 border-2 border-js-orange-500 shadow-[4px_4px_0px_theme(colors.js-blue-900)]">
                    <Sparkles className="text-js-orange-500" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-js-blue-900 uppercase tracking-tighter">Spotlight Announcements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredNews.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-[320px] border-2 border-js-blue-900 overflow-hidden shadow-[6px_6px_0px_theme(colors.js-orange-500)] hover:shadow-[10px_10px_0px_theme(colors.js-blue-900)] transition-all duration-300"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={item.imageUrl || item.thumbnailUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80'}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-js-blue-900 via-js-blue-900/40 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <div className="mb-auto">
                                <span className={`
                                    inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-2
                                    ${item.department === 'HR' ? 'bg-rose-600 text-white border-rose-400' :
                                        item.department === 'IT' ? 'bg-js-blue-700 text-white border-js-blue-400' :
                                            'bg-js-orange-500 text-white border-js-orange-300'}
                                `}>
                                    {item.department}
                                </span>
                            </div>

                            <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                                <h3 className="text-xl font-bold text-white leading-tight mb-3 uppercase drop-shadow-md line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-js-blue-50 font-mono line-clamp-2 mb-4 drop-shadow-sm italic">
                                    {item.summary}
                                </p>

                                <div className="flex items-center gap-2 text-js-orange-500 font-bold text-[10px] uppercase tracking-widest transition-all">
                                    View Article <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection;
