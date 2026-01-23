"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, ArrowUpRight } from 'lucide-react';

const FeaturedCarousel = ({ items = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const featuredItems = items.filter(item => item.isFeatured);

    useEffect(() => {
        if (!isAutoPlaying || featuredItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, featuredItems.length]);

    if (featuredItems.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);

    const currentItem = featuredItems[currentIndex];

    // Helper for department colors
    const getDeptColor = (dept) => {
        switch (dept) {
            case 'Communications': return 'bg-js-blue-900 text-js-orange-500';
            case 'HR': return 'bg-pink-600 text-white';
            case 'IT': return 'bg-js-blue-900 text-js-orange-500';
            default: return 'bg-js-blue-900 text-white';
        }
    };

    return (
        <div
            className="relative w-full h-[400px] overflow-hidden rounded-xl border-2 border-js-blue-900 shadow-[8px_8px_0px_theme(colors.js-blue-900)] group"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Image Layer */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out">
                {currentItem.imageUrl ? (
                    <img
                        src={currentItem.imageUrl}
                        alt={currentItem.title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-js-blue-900 flex items-center justify-center">
                        <span className="text-js-blue-800 font-bold text-6xl uppercase tracking-[0.2em] opacity-20">JS BANK</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-js-blue-900 via-js-blue-900/60 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${getDeptColor(currentItem.department)}`}>
                        {currentItem.department}
                    </span>
                    <span className="text-[10px] font-bold text-js-orange-500 uppercase tracking-widest bg-js-blue-900/40 px-3 py-1 rounded-md border border-js-orange-500/20">
                        Top Featured
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tighter leading-none drop-shadow-lg">
                    {currentItem.title}
                </h2>

                <p className="text-white text-base mb-4 line-clamp-2 max-w-xl font-medium leading-relaxed opacity-90">
                    {currentItem.summary || currentItem.content}
                </p>

                <div className="flex items-center gap-6 text-xs text-js-blue-200 font-mono uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-js-orange-500" /> {new Date(currentItem.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2 font-bold text-white"><User size={14} className="text-js-orange-500" /> {currentItem.author}</span>
                </div>

                <button className="self-start flex items-center gap-3 px-8 py-4 bg-js-orange-500 text-js-blue-900 font-bold uppercase tracking-widest text-xs hover:bg-js-orange-400 transition-all shadow-[4px_4px_0px_theme(colors.js-blue-900)] active:shadow-none active:translate-x-1 active:translate-y-1 rounded-md border-2 border-js-blue-900">
                    Read Report <ArrowUpRight size={16} />
                </button>
            </div>

            {/* Navigation Controls */}
            {featuredItems.length > 1 && (
                <>
                    <div className="absolute bottom-12 right-12 flex gap-4">
                        <button
                            onClick={prev}
                            className="p-3 border-2 border-white/20 text-white hover:bg-white hover:text-js-blue-900 transition-all rounded-lg backdrop-blur-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={next}
                            className="p-3 border-2 border-white/20 text-white hover:bg-white hover:text-js-blue-900 transition-all rounded-lg backdrop-blur-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="absolute bottom-6 left-12 flex gap-2">
                        {featuredItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 transition-all rounded-full ${currentIndex === idx ? 'w-12 bg-js-orange-500' : 'w-3 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FeaturedCarousel;
