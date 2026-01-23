"use client";

import React, { useRef, useState, useCallback } from 'react';
import {
    Upload,
    File,
    FileText,
    FileImage,
    Download,
    Search,
    Trash2,
    Loader2,
    Eye,
    X,
    Info,
    Calendar,
    HardDrive
} from 'lucide-react';

const FileLibrary = ({ files, onUpload, onDelete, currentUser }) => {
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const processFile = useCallback(async (file) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
            'video/mp4',
            'video/quicktime' // mov
        ];
        if (!allowedTypes.includes(file.type)) {
            alert(`Security Block: File type ${file.type} is not permitted.`);
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target?.result;

            const newFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                department: 'Communications',
                previewUrl: base64Data
            };

            onUpload(newFile);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    }, [onUpload]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type, size = 24) => {
        if (type.includes('image')) return <FileImage size={size} className="text-black" />;
        if (type.includes('pdf')) return <FileText size={size} className="text-black" />;
        return <File size={size} className="text-black" />;
    };

    const handleDownload = (file) => {
        const link = document.createElement('a');
        link.href = file.previewUrl || '';
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black tracking-tight uppercase">Document Repository</h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">Centrally managed assets and internal documentation</p>
                </div>
                <div className="flex gap-3">
                    {(currentUser?.role === 'Admin' || currentUser?.role?.includes('Editor')) && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-black text-white px-6 py-3 font-bold hover:bg-zinc-800 transition-all shadow-none flex items-center gap-2 group text-xs uppercase tracking-widest border border-black rounded-xl"
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            {isUploading ? 'Scanning...' : 'Upload Asset'}
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border border-dashed border-black p-10 flex flex-col items-center justify-center transition-all duration-150 rounded-3xl ${(currentUser?.role === 'Admin' || currentUser?.role?.includes('Editor')) ? (isDragging ? 'bg-zinc-100' : 'bg-white hover:bg-zinc-50') : 'bg-zinc-50 opacity-50 cursor-not-allowed'}`}
            >
                <div className={`p-4 border border-black mb-4 transition-all rounded-xl ${isDragging ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    <Upload size={32} />
                </div>
                <p className="text-sm font-bold text-black uppercase tracking-tight">
                    {(currentUser?.role === 'Admin' || currentUser?.role?.includes('Editor')) ? 'Drag & drop files here to upload' : 'Upload restricted'}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2 font-mono">Max recommended file size: 50MB</p>
            </div>

            <div className="bg-white border-2 border-black rounded-xl overflow-hidden min-h-[500px] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                <div className="p-6 border-b border-black flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH BY FILENAME..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-black rounded-md text-xs text-black placeholder-zinc-400 outline-none focus:bg-zinc-100 transition-all font-mono uppercase"
                        />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                        <span className="bg-white px-2 py-1 border border-black rounded-lg">{filteredFiles.length} Assets Found</span>
                    </div>
                </div>

                {filteredFiles.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-12">
                        <div className="w-20 h-20 border border-black border-dashed flex items-center justify-center mb-6">
                            <File size={40} className="opacity-20" />
                        </div>
                        <p className="font-bold text-black uppercase tracking-widest">Repository Empty</p>
                        <p className="text-[10px] mt-1 uppercase font-mono tracking-widest">No files match your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                onClick={() => setSelectedFile(file)}
                                className="group relative bg-white border-2 border-black p-6 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer flex flex-col h-full shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 border border-black rounded-md bg-white group-hover:bg-black group-hover:text-white transition-colors">
                                        {getFileIcon(file.type, 20)}
                                    </div>
                                    {(currentUser?.role === 'Admin' || (currentUser?.role?.includes('Editor') && file.uploaderEmail === currentUser.email)) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(file.id);
                                            }}
                                            className="p-2 text-zinc-400 hover:text-red-600 border border-transparent hover:border-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-black text-sm leading-tight mb-2 uppercase tracking-tight line-clamp-2" title={file.name}>
                                        {file.name}
                                    </h4>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between pt-4 border-t border-black/10">
                                    <div className="flex items-center gap-1.5 text-black">
                                        <Eye size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                                    </div>
                                    <span className="text-[9px] font-black text-white bg-black px-2 py-0.5 uppercase tracking-widest rounded-md">
                                        {file.type.split('/')[1] || 'DOC'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modern Preview Modal */}
            {selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 bg-white/95 backdrop-blur-none">
                    <div className="w-full h-full flex flex-col md:flex-row bg-white">

                        {/* Left: Preview Area */}
                        <div className="flex-1 bg-zinc-50 flex items-center justify-center p-8 relative overflow-hidden group border-r border-black">
                            <div className="absolute top-6 left-6 z-10">
                                <div className="bg-white px-3 py-1.5 border border-black flex items-center gap-2">
                                    {getFileIcon(selectedFile.type, 14)}
                                    <span className="text-[10px] font-bold text-black uppercase tracking-widest font-mono">{selectedFile.type}</span>
                                </div>
                            </div>

                            {selectedFile.type.includes('image') ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={selectedFile.previewUrl}
                                        className="max-h-full max-w-full object-contain border border-black grayscale contrast-125"
                                        alt={selectedFile.name}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-black">
                                    <div className="w-32 h-32 bg-white flex items-center justify-center border border-black border-dashed">
                                        {getFileIcon(selectedFile.type, 64)}
                                    </div>
                                    <p className="text-black font-bold uppercase tracking-widest text-xs font-mono">Preview Unavailable</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Inspector Sidebar */}
                        <div className="w-full md:w-[400px] p-12 flex flex-col bg-white">
                            <div className="flex items-start justify-between mb-12">
                                <div className="bg-black text-white p-3 border border-black">
                                    <Info size={24} />
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-2 text-black hover:bg-zinc-100 border border-transparent hover:border-black transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-bold text-black leading-tight mb-12 uppercase tracking-tighter break-words">
                                {selectedFile.name}
                            </h2>

                            <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                                <div className="flex items-center gap-4 border-b border-black pb-4">
                                    <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center text-black border border-black">
                                        <HardDrive size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">File Size</p>
                                        <p className="text-sm font-bold text-black uppercase">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-b border-black pb-4">
                                    <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center text-black border border-black">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Modified</p>
                                        <p className="text-sm font-bold text-black uppercase">{new Date(selectedFile.uploadedAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 border-b border-black pb-4">
                                    <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center text-black border border-black">
                                        <Eye size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Content Type</p>
                                        <p className="text-sm font-bold text-black uppercase">{selectedFile.type}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-black flex flex-col gap-4">
                                <button
                                    onClick={() => handleDownload(selectedFile)}
                                    className="w-full bg-black text-white font-bold py-4 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-black"
                                >
                                    <Download size={20} /> Download Asset
                                </button>
                                {(currentUser?.role === 'Admin' || (currentUser?.role?.includes('Editor') && selectedFile.uploaderEmail === currentUser.email)) && (
                                    <button
                                        onClick={() => {
                                            onDelete(selectedFile.id);
                                            setSelectedFile(null);
                                        }}
                                        className="w-full text-zinc-500 hover:text-red-600 font-bold py-3 hover:bg-zinc-50 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Delete Permanently
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileLibrary;
