import { useState } from 'react';
import Sidebar from './Sidebar';
import CreatePost from './CreatePost';
import { CheckCircle2 } from 'lucide-react'; // Import icon

const Layout = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handlePostCreated = () => {
    // 1. Show the success toast
    setShowToast(true);
    
    // 2. Hide the modal
    setIsCreateModalOpen(false);

    // 3. Optional: Delay the reload so they see the success message
    // If you use a state-based refresh instead of reload, the toast is smoother
    setTimeout(() => {
        setShowToast(false);
        window.location.reload(); 
    }, 2000);
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen text-slate-900 relative">
      
      {/* GLOBAL TOAST - Visible throughout the app */}
      {showToast && (
        <div className="fixed bottom-10 inset-x-0 z-[200] flex justify-center px-8 pointer-events-none">
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

      {/* Shared Sidebar */}
      <Sidebar onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* Page Content */}
      <div className="flex-1 ml-20 lg:ml-64 transition-all duration-300 min-h-screen">
        {children}
      </div>

      {/* Shared Create Modal */}
      {isCreateModalOpen && (
        <CreatePost 
          onClose={() => setIsCreateModalOpen(false)} 
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Layout;