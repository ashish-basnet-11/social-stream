import { useState, useEffect } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { usersAPI } from '../services/api';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
    const [name, setName] = useState(profile.name);
    const [bio, setBio] = useState(profile.bio || '');
    
    // NEW: States for file handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(profile.avatar);
    
    const [loading, setLoading] = useState(false);

    // Logic: Form is dirty if text changed OR a new file was selected
    const isDirty = name !== profile.name || bio !== (profile.bio || '') || selectedFile !== null;
    const isValid = name.trim().length > 0;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large. Under 2MB please.");
            return;
        }

        // Create a local preview URL
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Clean up the memory for the blob URL if the component unmounts
    useEffect(() => {
        return () => {
            if (selectedFile) URL.revokeObjectURL(previewUrl);
        };
    }, [selectedFile, previewUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        setLoading(true);
        try {
            // 1. If a new file was selected, upload it first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('avatar', selectedFile);
                await usersAPI.uploadAvatar(formData);
            }

            // 2. Update the text profile details
            await usersAPI.updateMyProfile({
                name: name.trim(),
                bio: bio.trim()
            });

            // 3. One single refresh call
            onUpdate(); 
            onClose();  
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-200">
                
                <div className="flex justify-between items-center p-6 border-b border-slate-50">
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                    <h2 className="font-black text-slate-800 uppercase tracking-tighter italic text-lg">
                        Edit Profile<span className="text-indigo-600">.</span>
                    </h2>
                    <div className="w-9" />
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                                <img
                                    src={previewUrl || `https://ui-avatars.com/api/?name=${profile.name}`}
                                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    alt="Preview"
                                />
                            </div>
                            
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/80 rounded-[32px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white">
                                <Camera size={24} className="mb-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                            </label>
                        </div>
                        {selectedFile && (
                            <p className="mt-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-full">
                                New Image Selected
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-1.5 outline-none focus:border-indigo-500/50 transition-all font-bold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="3"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-1.5 outline-none focus:border-indigo-500/50 transition-all font-medium text-slate-600 resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isDirty || !isValid}
                                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Saving Profile...</span>
                                    </div>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;