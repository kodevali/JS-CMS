"use client";

import React, { useState } from 'react';
import { Megaphone, X, ChevronRight } from 'lucide-react';

const AnnouncementBar = ({ message, onUpdate, isAdmin }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!message || !isVisible) return null;

    return (
        <div className="bg-js-orange-500 border-b-2 border-js-blue-900 py-2.5 px-6 relative z-[60] overflow-hidden group">
            <div className="flex items-center justify-between max-w-[1440px] mx-auto gap-8">
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-js-blue-900 border border-js-blue-800 p-1.5 rounded-md shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                        <Megaphone size={14} className="text-white" />
                    </div>
                    <p className="text-[11px] font-bold text-js-blue-900 uppercase tracking-widest leading-relaxed">
                        <span className="opacity-60 mr-2 font-mono">[ALERT]</span>
                        {message}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <span className="text-[9px] font-bold text-js-blue-900/40 uppercase tracking-[0.2em] font-mono border border-js-blue-900/20 px-2 py-0.5 rounded-full">
                            Admin Mode
                        </span>
                    )}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="hover:bg-js-blue-900 hover:text-white p-1 transition-all border border-transparent hover:border-js-blue-800 rounded-md"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Animated Highlight Line */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-js-blue-900/20 w-full overflow-hidden">
                <div className="h-full bg-js-blue-900/40 w-1/4 animate-[shimmer_2s_infinite]" />
            </div>
        </div>
    );
};

export default AnnouncementBar;
