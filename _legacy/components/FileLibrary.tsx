
import React, { useRef, useState, useCallback } from 'react';
import { FileItem } from '../types';
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

interface FileLibraryProps {
  files: FileItem[];
  onUpload: (file: FileItem) => void;
  onDelete: (id: string) => void;
}

const FileLibrary: React.FC<FileLibraryProps> = ({ files, onUpload, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const processFile = useCallback(async (file: File) => {
    setIsUploading(true);
    
    // Simulate security scan delay for banking compliance feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      
      const newFile: FileItem = {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, size: number = 24) => {
    if (type.includes('image')) return <FileImage size={size} className="text-emerald-500" />;
    if (type.includes('pdf')) return <FileText size={size} className="text-red-500" />;
    return <File size={size} className="text-blue-500" />;
  };

  const handleDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.previewUrl || '';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Repository</h1>
          <p className="text-sm text-slate-500">Centrally managed assets and internal documentation</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {isUploading ? 'Scanning...' : 'Upload Asset'}
          </button>
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
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/30'
        }`}
      >
        <div className={`p-4 rounded-full mb-3 transition-all ${isDragging ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400'}`}>
          <Upload size={28} />
        </div>
        <p className="text-sm font-bold text-slate-900">Drag & drop files here to upload</p>
        <p className="text-xs text-slate-400 mt-1">Maximum recommended file size: 50MB</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="bg-slate-200 px-2 py-1 rounded-md">{filteredFiles.length} Assets Found</span>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <File size={32} className="opacity-20" />
            </div>
            <p className="font-bold text-slate-900">Repository Empty</p>
            <p className="text-sm mt-1">No files match your current search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-8">
            {filteredFiles.map((file) => (
              <div 
                key={file.id} 
                onClick={() => setSelectedFile(file)}
                className="group relative bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                    {getFileIcon(file.type)}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Eye size={12} />
                      <span className="text-[10px] font-bold">Preview</span>
                   </div>
                   <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      {file.type.split('/')[1] || 'DOC'}
                   </span>
                </div>
                
                {/* Visual indicator of clickable card */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/10 rounded-2xl pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-5xl w-full bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]">
            
            {/* Left: Preview Area */}
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden group">
              <div className="absolute top-6 left-6 z-10">
                 <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm flex items-center gap-2">
                    {getFileIcon(selectedFile.type, 16)}
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{selectedFile.type}</span>
                 </div>
              </div>
              
              {selectedFile.type.includes('image') ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedFile.previewUrl} 
                    className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-lg" 
                    alt={selectedFile.name} 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-slate-200">
                  <div className="w-40 h-40 rounded-[40px] bg-white shadow-xl flex items-center justify-center border border-slate-100">
                     {getFileIcon(selectedFile.type, 80)}
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Preview Unavailable</p>
                </div>
              )}
            </div>

            {/* Right: Inspector Sidebar */}
            <div className="w-full md:w-[360px] p-10 flex flex-col border-l border-slate-100 bg-white">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                   <Info size={24} />
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-8 break-words">
                {selectedFile.name}
              </h2>

              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Size</p>
                    <p className="text-sm font-bold text-slate-900">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modified</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(selectedFile.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Eye size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content Type</p>
                    <p className="text-sm font-bold text-slate-900">{selectedFile.type}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-3">
                <button 
                  onClick={() => handleDownload(selectedFile)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                >
                  <Download size={20} /> Download Asset
                </button>
                <button 
                  onClick={() => {
                    onDelete(selectedFile.id);
                    setSelectedFile(null);
                  }}
                  className="w-full text-red-600 font-bold py-3 hover:bg-red-50 rounded-2xl transition-all text-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileLibrary;
