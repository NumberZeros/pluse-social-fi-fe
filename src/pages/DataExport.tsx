import { useState } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'framer-motion';
import {
  useExportStore,
  type ExportDataType,
  type ExportFormat,
  type ExportRequest,
} from '../stores/useExportStore';
import { formatFileSize, formatDateTime } from '../utils/format';
import { Download, FileJson, FileSpreadsheet, Lock, ShieldCheck, Database, Trash2, CheckCircle2 } from 'lucide-react';

export const DataExport = () => {
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<ExportDataType>>(
    new Set(['all']),
  );
  const [format, setFormat] = useState<ExportFormat>('json');

  const { publicKey } = useWallet();
  const requestExport = useExportStore((state) => state.requestExport);
  const downloadExport = useExportStore((state) => state.downloadExport);
  const deleteExport = useExportStore((state) => state.deleteExport);
  const getUserExports = useExportStore((state) => state.getUserExports);

  const userExports = publicKey ? getUserExports(publicKey.toBase58()) : [];

  const dataTypeOptions: { value: ExportDataType; label: string; description: string }[] =
    [
      { value: 'all', label: 'All Data', description: 'Export everything' },
      { value: 'profile', label: 'Profile', description: 'Username, bio, avatar' },
      { value: 'posts', label: 'Posts', description: 'All your posts and content' },
      { value: 'comments', label: 'Comments', description: 'All your comments' },
      { value: 'followers', label: 'Followers', description: 'List of followers' },
      { value: 'following', label: 'Following', description: 'Accounts you follow' },
      { value: 'groups', label: 'Groups', description: 'Your group memberships' },
      {
        value: 'subscriptions',
        label: 'Subscriptions',
        description: 'Creator subscriptions',
      },
      {
        value: 'marketplace',
        label: 'Marketplace',
        description: 'Username listings & purchases',
      },
      {
        value: 'governance',
        label: 'Governance',
        description: 'Stakes, votes, proposals',
      },
    ];

  const toggleDataType = (dataType: ExportDataType) => {
    const newSet = new Set(selectedDataTypes);

    if (dataType === 'all') {
      if (newSet.has('all')) {
        newSet.clear();
      } else {
        newSet.clear();
        newSet.add('all');
      }
    } else {
      newSet.delete('all');
      if (newSet.has(dataType)) {
        newSet.delete(dataType);
      } else {
        newSet.add(dataType);
      }
    }

    setSelectedDataTypes(newSet);
  };

  const handleRequestExport = () => {
    if (!publicKey || selectedDataTypes.size === 0) return;

    const dataTypes = Array.from(selectedDataTypes);
    requestExport(publicKey.toBase58(), dataTypes, format);
  };

  const getStatusColor = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing':
        return 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] border-[var(--color-solana-green)]/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  if (!publicKey) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card rounded-[2.5rem] p-12 text-center max-w-lg border border-white/10"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                 <Lock className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 text-lg">
                Please connect your wallet to access your personal data and export tools.
              </p>
            </motion.div>
          </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <Database className="w-4 h-4 text-[var(--color-solana-green)]" />
            <span className="text-sm font-medium text-gray-300">Privacy & Data</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Data Export</h1>
          <p className="text-xl text-gray-400">Download a copy of your data for backup or portability.</p>
        </motion.div>

        {/* GDPR Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[2rem] p-8 mb-12 border border-[var(--color-solana-blue)]/30 bg-[var(--color-solana-blue)]/5 relative overflow-hidden"
        >
          <div className="flex gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-solana-blue)]/20 flex items-center justify-center shrink-0">
               <ShieldCheck className="w-8 h-8 text-[var(--color-solana-blue)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Your Data Rights</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                You have full ownership of your data on Pulse Social. Under GDPR and our commitment to Web3 principles, you can:
              </p>
              <ul className="grid md:grid-cols-2 gap-3">
                 {[
                   "Access all your personal data",
                   "Export data in portable JSON/CSV",
                   "Transfer to other platforms",
                   "Request permanent deletion"
                 ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-solana-blue)] font-medium">
                       <CheckCircle2 className="w-4 h-4" /> {item}
                    </li>
                 ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Export Request Form */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="glass-card rounded-[2.5rem] p-10 mb-12 border border-white/10"
        >
          <h2 className="text-3xl font-black text-white mb-8">Request New Export</h2>

          {/* Data Types */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Select Data Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleDataType(option.value)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedDataTypes.has(option.value)
                      ? 'border-[var(--color-solana-green)] bg-[var(--color-solana-green)]/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          selectedDataTypes.has(option.value)
                            ? 'bg-[var(--color-solana-green)]'
                            : 'border-2 border-gray-600'
                        }`}
                      >
                        {selectedDataTypes.has(option.value) && (
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={`font-bold transition-colors ${selectedDataTypes.has(option.value) ? 'text-white' : 'text-gray-400'}`}>
                          {option.label}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Export Format</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('json')}
                className={`flex-1 p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 ${
                  format === 'json'
                    ? 'border-[var(--color-solana-green)] bg-[var(--color-solana-green)]/10 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <div className={`p-3 rounded-xl ${format === 'json' ? 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)]' : 'bg-white/10'}`}>
                    <FileJson className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <div className="font-bold">JSON</div>
                    <div className="text-xs opacity-70">Best for developers</div>
                </div>
              </button>
              
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 p-6 rounded-2xl border transition-all flex items-center justify-center gap-4 ${
                  format === 'csv'
                    ? 'border-[var(--color-solana-green)] bg-[var(--color-solana-green)]/10 text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                <div className={`p-3 rounded-xl ${format === 'csv' ? 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)]' : 'bg-white/10'}`}>
                    <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <div className="font-bold">CSV</div>
                    <div className="text-xs opacity-70">Best for spreadsheets</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRequestExport}
            disabled={selectedDataTypes.size === 0}
            className="w-full bg-[var(--color-solana-green)] hover:bg-[#9FE51C] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black py-5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-[var(--color-solana-green)]/20 text-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {selectedDataTypes.size === 0 ? 'Select Data Types to Export' : 'Request Export'}
          </button>
        </motion.div>

        {/* Export History */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="glass-card rounded-[2.5rem] p-10 border border-white/10"
        >
          <h2 className="text-2xl font-black text-white mb-8">Export History</h2>

          {userExports.length === 0 ? (
            <div className="text-center py-16 dashed-border rounded-3xl border border-white/10 bg-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-gray-400 mb-2 font-bold">No exports yet</div>
              <p className="text-gray-500 text-sm">
                Request your first data export above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userExports.map((exportRequest) => (
                <div
                  key={exportRequest.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(exportRequest.status)}`}
                        >
                          {exportRequest.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/10 text-white border border-white/10 uppercase tracking-wider">
                          {exportRequest.format}
                        </span>
                         {exportRequest.fileSize && (
                            <span className="text-xs text-gray-500 font-mono">
                               {formatFileSize(exportRequest.fileSize)}
                            </span>
                          )}
                      </div>
                      <div className="text-white font-bold mb-1">
                         {exportRequest.dataTypes.length === 1 && exportRequest.dataTypes[0] === 'all' 
                            ? 'Full Account Export' 
                            : `Export: ${exportRequest.dataTypes.slice(0, 3).join(', ')}${exportRequest.dataTypes.length > 3 ? ` +${exportRequest.dataTypes.length - 3}` : ''}`
                         }
                      </div>
                      <div className="text-gray-500 text-xs font-mono">
                         Requested {formatDateTime(exportRequest.requestedAt)}
                         {exportRequest.expiresAt && ` • Expires ${formatDateTime(exportRequest.expiresAt)}`}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {exportRequest.status === 'completed' && (
                        <button
                          onClick={() => downloadExport(exportRequest.id)}
                          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold py-2 px-5 rounded-xl transition-all border border-green-500/20"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      )}
                      <button
                        onClick={() => deleteExport(exportRequest.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {exportRequest.status === 'processing' && (
                    <div className="mt-4">
                      <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[var(--color-solana-green)] to-[#14C58E] h-full animate-pulse"
                          style={{ width: '60%' }}
                        />
                      </div>
                      <div className="text-gray-500 text-xs mt-2 text-right font-medium">
                        Processing...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};
