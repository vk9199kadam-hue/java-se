import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  Settings, 
  Database, 
  Moon, 
  Sun,
  Menu,
  X,
  CreditCard,
  WifiOff
} from 'lucide-react';
import { useBudget } from '../hooks/useBudget';
import { useOffline } from '../hooks/useOffline';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { updateSetting, settings } = useBudget();
  const isOffline = useOffline();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N for new expense (can be handled by opening the list and triggering form, 
      // or we can pass a callback. For simplicity, let's just log and maybe the user can handle it in the parent)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setActiveTab('expenses');
        // We might need a global state for the form, but for now we navigate to expenses
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);
  useEffect(() => {
    const savedTheme = settings.find(s => s.key === 'theme')?.value;
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      updateSetting('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      updateSetting('theme', 'light');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
    { id: 'categories', label: 'Categories', icon: Settings },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-r 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg text-white shadow-lg">
                <CreditCard size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">SmartExp Pro</h1>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t dark:border-slate-800">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all font-medium"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 scrollbar-hide relative">
        {isOffline && (
          <div className="fixed top-4 right-4 z-[100] bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <WifiOff size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">You are offline</span>
          </div>
        )}
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 glass-card rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={24} />
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">SmartExp Pro</h1>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
