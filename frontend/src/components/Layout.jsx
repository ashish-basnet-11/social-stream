import { useState } from 'react';
import Sidebar from './Sidebar';
import CreatePost from './CreatePost';

const Layout = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePostCreated = () => {
    // Refreshing the data or page
    window.location.reload(); 
    setIsCreateModalOpen(false);
  };

  return (
    // Changed bg-black to bg-[#F8FAFC] and text-white to text-slate-900
    <div className="flex bg-[#F8FAFC] min-h-screen text-slate-900">
      
      {/* Shared Sidebar */}
      <Sidebar onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* Page Content */}
      {/* Added transition-all and updated responsive margins to match your Sidebar width */}
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