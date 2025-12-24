import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { LayoutGrid, Users, User, Bell } from 'lucide-react';

const Sidebar = () => {
  const { unreadCount } = useNotifications();
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col p-6 z-40 pt-24">
      <nav className="flex-1 space-y-2">
        <SidebarLink
          to="/"
          icon={<LayoutGrid size={20} />}
          label="Feed"
          active={location.pathname === '/'}
        />

        <div className="relative">
          <SidebarLink
            to="/notifications"
            icon={<Bell size={20} />}
            label="Activity"
            active={location.pathname === '/notifications'}
          />
          {unreadCount > 0 && (
            <span className="absolute top-3 left-8 lg:left-10 h-2 w-2 bg-rose-500 rounded-full ring-4 ring-white" />
          )}
        </div>

        <SidebarLink
          to="/friends"
          icon={<Users size={20} />}
          label="Network"
          active={location.pathname === '/friends'}
        />
      </nav>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-3 py-4 rounded-2xl transition-all group ${
      active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <div className={`transition-all ${active ? 'scale-110' : 'group-hover:text-slate-900'}`}>
      {icon}
    </div>
    <span className={`hidden lg:block text-[13px] font-bold tracking-tight ${active ? 'text-indigo-700' : ''}`}>
      {label}
    </span>
  </Link>
);

export default Sidebar;