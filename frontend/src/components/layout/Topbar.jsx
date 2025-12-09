import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Topbar = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  
  const getGreeting = () => {
    const hours = new Date().getHours();
    // 5 AM to 11:59 AM
    if (hours >= 5 && hours < 12) return 'Good morning';
    // 12 PM to 4:59 PM
    if (hours >= 12 && hours < 17) return 'Good afternoon';
    // 5 PM to 4:59 AM (Everything else)
    return 'Good evening';
  };

  return (
    <header className="px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors">
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {getGreeting()}, {currentUser?.username}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
            Ready to seize the day?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 hover:text-indigo-600 hover:bg-white transition-all">
          <Bell size={20} />
        </button>
        <button
          onClick={logout}
          className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 hover:text-red-500 hover:bg-white transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;