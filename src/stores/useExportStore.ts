import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExportFormat = 'json' | 'csv';

export type ExportDataType =
  | 'profile'
  | 'posts'
  | 'comments'
  | 'followers'
  | 'following'
  | 'groups'
  | 'subscriptions'
  | 'marketplace'
  | 'governance'
  | 'all';

export interface ExportRequest {
  id: string;
  userId: string;
  dataTypes: ExportDataType[];
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: number;
  completedAt?: number;
  downloadUrl?: string;
  expiresAt?: number;
  fileSize?: number;
}

interface ExportStore {
  exports: ExportRequest[];

  // Actions
  requestExport: (
    userId: string,
    dataTypes: ExportDataType[],
    format: ExportFormat,
  ) => string;
  generateExport: (exportId: string) => Promise<void>;
  downloadExport: (exportId: string) => void;
  deleteExport: (exportId: string) => void;

  // Queries
  getUserExports: (userId: string) => ExportRequest[];
  getExportById: (exportId: string) => ExportRequest | undefined;
}

export const useExportStore = create<ExportStore>()(
  persist(
    (set, get) => ({
      exports: [],

      requestExport: (userId, dataTypes, format) => {
        const exportRequest: ExportRequest = {
          id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          dataTypes,
          format,
          status: 'pending',
          requestedAt: Date.now(),
        };

        set((state) => ({
          exports: [...state.exports, exportRequest],
        }));

        // TODO: Implement actual export generation on backend
        // For now, exports remain in pending state

        return exportRequest.id;
      },

      generateExport: async (exportId) => {
        // TODO: Implement actual export generation on backend
        // This should query blockchain data and generate proper export files
        const exportRequest = get().exports.find((e) => e.id === exportId);
        if (!exportRequest) return;

        // Update to processing
        set((state) => ({
          exports: state.exports.map((e) =>
            e.id === exportId ? { ...e, status: 'processing' as const } : e,
          ),
        }));

        // For now, mark as failed since backend is not implemented
        set((state) => ({
          exports: state.exports.map((e) =>
            e.id === exportId ? { ...e, status: 'failed' as const } : e,
          ),
        }));
      },

      downloadExport: (exportId) => {
        const exportRequest = get().exports.find((e) => e.id === exportId);
        if (!exportRequest || !exportRequest.downloadUrl) return;

        // In a real app, this would trigger a file download
        const link = document.createElement('a');
        link.href = exportRequest.downloadUrl;
        link.download = `pulse_export_${exportId}.${exportRequest.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      deleteExport: (exportId) => {
        set((state) => ({
          exports: state.exports.filter((e) => e.id !== exportId),
        }));
      },

      getUserExports: (userId) => {
        return get().exports.filter((e) => e.userId === userId);
      },

      getExportById: (exportId) => {
        return get().exports.find((e) => e.id === exportId);
      },
    }),
    {
      name: 'pulse-export-storage',
    },
  ),
);

// Helper function to generate actual export data
export const generateExportData = (dataTypes: ExportDataType[], format: ExportFormat) => {
  // This would collect real data from all stores
  const data: any = {};

  if (dataTypes.includes('profile') || dataTypes.includes('all')) {
    data.profile = {
      username: 'user',
      bio: 'Sample bio',
      created_at: new Date().toISOString(),
    };
  }

  if (dataTypes.includes('posts') || dataTypes.includes('all')) {
    data.posts = [
      {
        id: '1',
        content: 'Sample post',
        created_at: new Date().toISOString(),
      },
    ];
  }

  if (dataTypes.includes('comments') || dataTypes.includes('all')) {
    data.comments = [
      {
        id: '1',
        content: 'Sample comment',
        created_at: new Date().toISOString(),
      },
    ];
  }

  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else {
    // Convert to CSV format
    let csv = '';
    for (const [key, value] of Object.entries(data)) {
      csv += `${key}\n`;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          csv += Object.keys(value[0]).join(',') + '\n';
          value.forEach((item: any) => {
            csv += Object.values(item).join(',') + '\n';
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        csv += Object.entries(value as Record<string, any>)
          .map(([k, v]) => `${k},${v}`)
          .join('\n');
      }
      csv += '\n';
    }
    return csv;
  }
};
