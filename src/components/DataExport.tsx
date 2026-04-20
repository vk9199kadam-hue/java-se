import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle2,
  Database,
  History,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { exportToJSON, exportToCSV, importFromJSON } from '../utils/exportImport';
import { toast } from 'react-hot-toast';

const DataExport: React.FC = () => {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);

  const handleJSONExport = async () => {
    try {
      await exportToJSON();
      toast.success('Backup exported successfully');
    } catch (err) {
      toast.error('Failed to export backup');
    }
  };

  const handleCSVExport = async () => {
    try {
      await exportToCSV();
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm(`Are you sure you want to ${importMode}? This action cannot be undone.`)) {
      setIsImporting(true);
      try {
        await importFromJSON(file, importMode);
        toast.success(`Data ${importMode === 'replace' ? 'replaced' : 'merged'} successfully!`);
        // Refresh page to reload Dexie state properly if needed, although Dexie hooks should handle it
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
        toast.error(err.message || 'Import failed');
      } finally {
        setIsImporting(false);
      }
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold">Data Management</h2>
        <p className="text-slate-500">Backup, export, and manage your financial data locally</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Tiles */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-1">
            <Download size={20} className="text-primary-500" /> Export Data
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleJSONExport}
              className="glass-card p-6 rounded-2xl flex items-center gap-6 group hover:border-primary-500/50 transition-all text-left"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <FileJson size={32} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Full JSON Backup</p>
                <p className="text-sm text-slate-500 text-balance">Complete application state including categories, budgets, and settings.</p>
              </div>
            </button>

            <button 
              onClick={handleCSVExport}
              className="glass-card p-6 rounded-2xl flex items-center gap-6 group hover:border-emerald-500/50 transition-all text-left"
            >
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={32} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Export to CSV</p>
                <p className="text-sm text-slate-500">Transactions only. Perfect for Excel, Google Sheets, or other spreadsheet tools.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-1">
            <Upload size={20} className="text-primary-500" /> Import Data
          </h3>

          <div className="glass-card p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Import Strategy</p>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button 
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${importMode === 'merge' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
                >
                  <History size={16} /> Merge Data
                </button>
                <button 
                  onClick={() => setImportMode('replace')}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${importMode === 'replace' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-500' : 'text-slate-400'}`}
                >
                  <AlertCircle size={16} /> Replace All
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-3">
              {importMode === 'merge' ? (
                <>
                  <p className="text-xs font-semibold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <ShieldCheck size={14} /> RECOMMENDED
                  </p>
                  <p className="text-xs text-slate-500">Imported expenses will be added to your current ones. Categories will be created if they don't exist.</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold flex items-center gap-2 text-rose-500">
                    <ShieldAlert size={14} /> CAUTION: DESTRUCTIVE
                  </p>
                  <p className="text-xs text-slate-500">This will completely wipe your current database and replace it with the backup content.</p>
                </>
              )}
            </div>

            <label className="block">
              <div className="flex flex-col items-center justify-center p-8 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-500/20 rounded-2xl cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all border-dashed">
                <Upload className="text-primary-600 mb-3" size={40} />
                <span className="font-bold text-primary-600">Click to Select Backup File</span>
                <span className="text-xs text-primary-500 mt-1 uppercase tracking-widest font-medium">Format: JSON ONLY</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport}
                  disabled={isImporting}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="glass-card p-6 rounded-2xl flex items-start gap-4 border-l-4 border-primary-500">
        <CheckCircle2 className="text-primary-500 mt-1" size={20} />
        <div>
          <p className="font-bold">100% Privacy Guaranteed</p>
          <p className="text-sm text-slate-500">Everything stays on your device. We never see your data, we don't have servers, and we don't track your activity. Your financial privacy is absolute.</p>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
