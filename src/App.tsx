import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import CategoryManager from './components/CategoryManager';
import DataExport from './components/DataExport';
import { Toaster } from 'react-hot-toast';
import { initDB } from './db';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initDB().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-500 animate-pulse">Initializing your vault...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList />;
      case 'categories':
        return <CategoryManager />;
      case 'data':
        return <DataExport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </>
  );
}

export default App;
