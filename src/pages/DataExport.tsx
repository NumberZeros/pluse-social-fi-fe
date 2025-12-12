import { useState } from 'react';
import {
  useExportStore,
  type ExportDataType,
  type ExportFormat,
  type ExportRequest,
} from '../stores/useExportStore';
import { useSocialStore } from '../stores/useSocialStore';
import { formatFileSize, formatDateTime } from '../utils/format';

export const DataExport = () => {
  const [selectedDataTypes, setSelectedDataTypes] = useState<Set<ExportDataType>>(
    new Set(['all']),
  );
  const [format, setFormat] = useState<ExportFormat>('json');

  const user = useSocialStore((state) => state.currentUser);
  const requestExport = useExportStore((state) => state.requestExport);
  const downloadExport = useExportStore((state) => state.downloadExport);
  const deleteExport = useExportStore((state) => state.deleteExport);
  const getUserExports = useExportStore((state) => state.getUserExports);

  const userExports = user ? getUserExports(user.address) : [];

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
    if (!user || selectedDataTypes.size === 0) return;

    const dataTypes = Array.from(selectedDataTypes);
    requestExport(user.address, dataTypes, format);
  };

  const getStatusColor = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your wallet to export your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Data Export</h1>
          <p className="text-gray-400">Download your data for backup or portability</p>
        </div>

        {/* GDPR Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Your Data Rights</h3>
              <p className="text-gray-300 text-sm mb-2">
                Under GDPR and data protection regulations, you have the right to:
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Access your personal data</li>
                <li>Export your data in a portable format</li>
                <li>Transfer your data to another service</li>
                <li>Request deletion of your data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Request Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Request New Export</h2>

          {/* Data Types */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Select Data Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleDataType(option.value)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedDataTypes.has(option.value)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-purple-500/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedDataTypes.has(option.value)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-500'
                        }`}
                      >
                        {selectedDataTypes.has(option.value) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{option.label}</div>
                      <div className="text-gray-400 text-sm">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Export Format</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('json')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  format === 'json'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-white font-semibold mb-1">JSON</div>
                <div className="text-gray-400 text-sm">Structured data format</div>
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  format === 'csv'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-white font-semibold mb-1">CSV</div>
                <div className="text-gray-400 text-sm">Spreadsheet compatible</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleRequestExport}
            disabled={selectedDataTypes.size === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all"
          >
            {selectedDataTypes.size === 0 ? 'Select Data Types' : 'Request Export'}
          </button>
        </div>

        {/* Export History */}
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Export History</h2>

          {userExports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-gray-400 mb-2">No exports yet</div>
              <p className="text-gray-500 text-sm">
                Request your first data export above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userExports.map((exportRequest) => (
                <div
                  key={exportRequest.id}
                  className="bg-white/5 border border-purple-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(exportRequest.status)}`}
                        >
                          {exportRequest.status.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                          {exportRequest.format.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white text-sm mb-1">
                        Data: {exportRequest.dataTypes.join(', ')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Requested {formatDateTime(exportRequest.requestedAt)}
                      </div>
                      {exportRequest.completedAt && (
                        <div className="text-gray-400 text-xs">
                          Completed {formatDateTime(exportRequest.completedAt)}
                        </div>
                      )}
                      {exportRequest.fileSize && (
                        <div className="text-gray-400 text-xs">
                          Size: {formatFileSize(exportRequest.fileSize)}
                        </div>
                      )}
                      {exportRequest.expiresAt && (
                        <div className="text-gray-400 text-xs">
                          Expires {formatDateTime(exportRequest.expiresAt)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {exportRequest.status === 'completed' && (
                        <button
                          onClick={() => downloadExport(exportRequest.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => deleteExport(exportRequest.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {exportRequest.status === 'processing' && (
                    <div className="mt-3">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full animate-pulse"
                          style={{ width: '60%' }}
                        />
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Processing your data...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">📋 Export Information</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Exports are generated in the background and may take a few minutes</p>
            <p>• Download links expire after 7 days for security</p>
            <p>• All timestamps are in your local timezone</p>
            <p>• JSON format preserves all data relationships</p>
            <p>• CSV format is best for importing to spreadsheets</p>
            <p>• Deleted content is not included in exports</p>
          </div>
        </div>
      </div>
    </div>
  );
};
