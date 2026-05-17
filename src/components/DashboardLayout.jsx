import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout({ title, navItems, children }) {
  const { dark, toggle } = useTheme();
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            EDU
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">EduReports NG</p>
            <p className="text-slate-400 text-xs">{session?.username}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-900/40 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 flex-shrink-0 sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-slate-800 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`flex items-center justify-between px-4 md:px-6 py-3 border-b no-print ${
          dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-block text-xs px-2 py-1 rounded-full ${
              dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {session?.role?.charAt(0).toUpperCase() + session?.role?.slice(1)}
            </span>
            <button
              onClick={toggle}
              className={`p-2 rounded-lg transition-all ${
                dark ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${
          dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
