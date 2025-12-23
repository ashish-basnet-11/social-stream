import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications'; // Import your hook
import { 
  LayoutGrid, Users, User, LogOut, PlusCircle, 
  Settings as SettingsIcon, Bell 
} from 'lucide-react';

const Sidebar = ({ onOpenCreate }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); // Get the live count
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

        {/* NOTIFICATIONS LINK */}
        <div className="relative">
          <SidebarLink
            to="/notifications"
            icon={<Bell size={22} />}
            label="Notifications"
            active={location.pathname === '/notifications'}
          />
          {unreadCount > 0 && (
            <span className="absolute top-2 left-8 lg:left-10 h-5 w-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <SidebarLink
          to="/friends"
          icon={<Users size={22} />}
          label="Friends"
          active={location.pathname === '/friends'}
        />

        <div className="h-px bg-slate-100 my-4 mx-2" />

        {/* Create Post Button */}
        <button
          onClick={onOpenCreate}
          className="w-full flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-indigo-600 group transition-all"
        >
          <div className="p-2 rounded-lg group-hover:bg-indigo-50 transition-colors shrink-0">
            <PlusCircle size={22} />
          </div>
          <span className="hidden lg:block font-black text-[11px] uppercase tracking-widest italic">Create Post</span>
        </button>

        <SidebarLink
          to={`/profile/${user?.id}`}
          icon={user?.avatar ?
            <img src={user.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt="" /> :
            <User size={22} />
          }
          label="Profile"
          active={location.pathname === `/profile/${user?.id}`}
        />

        <SidebarLink
          to="/settings"
          icon={<SettingsIcon size={22} />}
          label="Settings"
          active={location.pathname === '/settings'}
        />
      </nav>

      {/* Sign Out Section */}
      <div className="mt-auto border-t border-slate-100 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 text-slate-400 hover:text-rose-500 group transition-all w-full"
        >
          <div className="p-2 rounded-lg group-hover:bg-rose-50 transition-colors shrink-0">
            <LogOut size={22} />
          </div>
          <span className="hidden lg:block font-black text-[11px] uppercase tracking-widest italic">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all group ${active ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-900'
      }`}
  >
    <div className={`p-2 rounded-lg transition-all shrink-0 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'group-hover:bg-slate-100'
      }`}>
      {icon}
    </div>
    <span className={`hidden lg:block font-black text-[11px] uppercase tracking-widest italic ${active ? 'text-slate-900' : ''
      }`}>
      {label}
    </span>
  </Link>
);

export default Sidebar;