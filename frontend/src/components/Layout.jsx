import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CreatePost from './CreatePost';
import { CheckCircle2 } from 'lucide-react';

const Layout = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handlePostCreated = () => {
    setShowToast(true);
    setIsCreateModalOpen(false);
    setTimeout(() => {
        setShowToast(false);
        window.location.reload(); 
    }, 2000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      
      {/* 1. Global Navbar */}
      <Navbar onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* 2. Global Sidebar */}
      <Sidebar />

      {/* 3. Main Content Area */}
      <div className="pl-20 lg:pl-64 pt-20 transition-all duration-300">
        <main className="max-w-[1200px] mx-auto p-6 lg:p-10">
          {children}
        </main>
      </div>

      {/* Overlays (Toast/Modals) */}
      {showToast && (
        <div className="fixed bottom-10 inset-x-0 z-[100] flex justify-center px-8 pointer-events-none animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Post Published</span>
          </div>
        </div>
      )}

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