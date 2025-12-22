import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Users, User, LogOut, PlusCircle } from 'lucide-react';

const Sidebar = ({ onOpenCreate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col p-6 z-50">
      {/* Branding Section */}
      <Link to="/" className="mb-12 px-2 flex items-center gap-2">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
          <span className="text-white font-black text-xl -rotate-3">S</span>
        </div>
        <h1 className="hidden lg:block text-xl font-black text-slate-800 tracking-tighter uppercase italic">
          Stream<span className="text-indigo-600">.</span>
        </h1>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-4">
        <SidebarLink
          to="/"
          icon={<LayoutGrid size={22} />}
          label="Home"
          active={location.pathname === '/'}
        />

        <SidebarLink
          to="/friends"
          icon={<Users size={22} />}
          label="Network"
          active={location.pathname === '/friends'}
        />

        {/* Create Post Button */}
        <button
          onClick={onOpenCreate}
          className="w-full flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-indigo-600 group transition-all"
        >
          <div className="p-2 rounded-lg group-hover:bg-indigo-50 transition-colors shrink-0">
            <PlusCircle size={22} />
          </div>
          <span className="hidden lg:block font-bold text-[13px] uppercase tracking-tight">Create Post</span>
        </button>

        <SidebarLink
          to={`/profile/${user?.id}`}
          icon={user?.avatar ?
            <img src={user.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt="" /> :
            <User size={22} />
          }
          label="Profile"
          // FIX: Only active if we are on the current user's specific profile page
          active={location.pathname === `/profile/${user?.id}`}
        />
      </nav>

      {/* Sign Out Section - Pinned to bottom */}
      <div className="mt-auto border-t border-slate-100 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 text-slate-400 hover:text-rose-500 group transition-all w-full"
        >
          <div className="p-2 rounded-lg group-hover:bg-rose-50 transition-colors shrink-0">
            <LogOut size={22} />
          </div>
          <span className="hidden lg:block font-bold text-[13px] uppercase tracking-tight">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// Internal Helper for Navigation Links
const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all group ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
      }`}
  >
    <div className={`p-2 rounded-lg transition-all shrink-0 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'group-hover:bg-slate-100'
      }`}>
      {icon}
    </div>
    <span className={`hidden lg:block font-bold text-[13px] uppercase tracking-tight ${active ? 'text-slate-900' : ''
      }`}>
      {label}
    </span>
  </Link>
);

export default Sidebar;