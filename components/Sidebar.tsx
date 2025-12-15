import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, FileText, Radio, LogOut, CalendarCheck } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navItems = [
    { to: '/warden/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/warden/monitoring', icon: Radio, label: 'Live Monitoring' },
    { to: '/warden/students', icon: Users, label: 'Students' },
    { to: '/warden/late', icon: Clock, label: 'Late Entries' },
    { to: '/warden/requests', icon: FileText, label: 'Requests' },
    { to: '/warden/events', icon: CalendarCheck, label: 'Events & Roll Call' },
  ];

  return (
    <div className="h-screen w-64 bg-slate-800 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-tight text-white">HostelGuard</h1>
        <p className="text-xs text-slate-400 mt-1">Warden Control Center</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;