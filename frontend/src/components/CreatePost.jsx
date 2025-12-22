import { useState } from 'react';
import { postsAPI } from '../services/api';
import { X, Image as ImageIcon, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  // Helper to handle file selection logic
  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(''); // Clear errors if file is valid
    } else {
      setError('Please upload a valid image file');
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption && !imageFile) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (caption) formData.append('caption', caption);
      if (imageFile) formData.append('image', imageFile);

      await postsAPI.create(formData);
      setShowSuccess(true);
      onPostCreated(); 
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && !showSuccess && onClose()}
    >
      <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Toast Notification */}
        {showSuccess && (
          <div className="absolute inset-x-0 bottom-8 z-[110] flex justify-center px-8 pointer-events-none">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-toast">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none mb-1">Success</span>
                <span className="text-xs font-bold tracking-tight">Post published to your feed</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={18} fill="currentColor" className="opacity-80" />
            <h3 className="font-black uppercase tracking-tighter italic text-slate-900">
              New Post<span className="text-indigo-600">.</span>
            </h3>
          </div>
          {!showSuccess && (
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className={`p-8 space-y-6 transition-opacity duration-300 ${showSuccess ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 text-center">
              {error}
            </div>
          )}

          {/* Media Upload Area with Drag and Drop */}
          {!imagePreview ? (
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[24px] cursor-pointer transition-all duration-300 ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/50 scale-[0.98]' 
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className={`p-4 rounded-2xl transition-all ${
                isDragging ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
              }`}>
                <ImageIcon size={32} />
              </div>
              <span className={`mt-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                {isDragging ? 'Drop it now!' : 'Drop media or click to browse'}
              </span>
              <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
            </label>
          ) : (
            <div className="relative group h-80 w-full bg-slate-50 rounded-[24px] overflow-hidden border border-slate-100">
              <img src={imagePreview} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <button 
                type="button" 
                onClick={() => {setImageFile(null); setImagePreview(null);}}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-slate-900 hover:bg-white shadow-xl transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="ml-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Caption</label>
            <textarea
              placeholder="What's on the stream?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!caption && !imageFile)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-slate-200 hover:shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;