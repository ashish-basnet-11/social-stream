import { useState } from 'react';
import { postsAPI } from '../services/api';
import { X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
      onPostCreated(); 
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={18} fill="currentColor" className="opacity-80" />
            <h3 className="font-black uppercase tracking-tighter italic text-slate-900">
              New Post<span className="text-indigo-600">.</span>
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 text-center">
              {error}
            </div>
          )}

          {/* Media Upload Area */}
          {!imagePreview ? (
            <label className="group flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-100 rounded-[24px] cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm transition-all">
                <ImageIcon size={32} />
              </div>
              <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600">
                Drop media or click to browse
              </span>
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
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

          {/* Caption Area */}
          <div className="space-y-2">
            <label className="ml-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
              Caption
            </label>
            <textarea
              placeholder="What's on the stream?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all resize-none"
            />
          </div>

          {/* Footer Action */}
          <button
            type="submit"
            disabled={loading || (!caption && !imageFile)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-slate-200 hover:shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              'Publish Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;