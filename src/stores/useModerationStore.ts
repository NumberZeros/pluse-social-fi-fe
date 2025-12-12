import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'nudity'
  | 'misinformation'
  | 'copyright'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type ModAction = 'warn' | 'hide' | 'remove' | 'ban_user' | 'dismiss';

export interface Report {
  id: string;
  contentType: 'post' | 'comment' | 'profile';
  contentId: string;
  contentPreview: string;
  reporter: string;
  reporterUsername: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
  action?: ModAction;
  moderatorNotes?: string;
}

export interface UserWarning {
  id: string;
  userId: string;
  username: string;
  reason: string;
  issuedBy: string;
  issuedAt: number;
  expiresAt?: number;
}

export interface UserBan {
  id: string;
  userId: string;
  username: string;
  reason: string;
  bannedBy: string;
  bannedAt: number;
  expiresAt?: number; // undefined = permanent
  isPermanent: boolean;
}

export interface ContentAction {
  id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  action: 'hidden' | 'removed';
  reason: string;
  moderator: string;
  timestamp: number;
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  activeWarnings: number;
  activeBans: number;
  hiddenContent: number;
}

interface ModerationStore {
  reports: Report[];
  warnings: UserWarning[];
  bans: UserBan[];
  contentActions: ContentAction[];
  moderators: Set<string>;

  // Reporting
  submitReport: (
    reporter: string,
    reporterUsername: string,
    contentType: 'post' | 'comment' | 'profile',
    contentId: string,
    contentPreview: string,
    reason: ReportReason,
    description: string,
  ) => void;

  // Moderation Actions
  reviewReport: (reportId: string, moderator: string) => void;
  resolveReport: (
    reportId: string,
    moderator: string,
    action: ModAction,
    notes: string,
  ) => void;

  // User Actions
  warnUser: (
    userId: string,
    username: string,
    reason: string,
    moderator: string,
    duration?: number,
  ) => void;
  banUser: (
    userId: string,
    username: string,
    reason: string,
    moderator: string,
    duration?: number,
  ) => void;
  unbanUser: (userId: string) => void;

  // Content Actions
  hideContent: (
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string,
    moderator: string,
  ) => void;
  removeContent: (
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string,
    moderator: string,
  ) => void;

  // Queries
  getPendingReports: () => Report[];
  getReportsByStatus: (status: ReportStatus) => Report[];
  getUserWarnings: (userId: string) => UserWarning[];
  isUserBanned: (userId: string) => boolean;
  isContentHidden: (contentId: string) => boolean;
  getStats: () => ModerationStats;
  isModerator: (userId: string) => boolean;
  addModerator: (userId: string) => void;
}

export const useModerationStore = create<ModerationStore>()(
  persist(
    (set, get) => ({
      reports: [],
      warnings: [],
      bans: [],
      contentActions: [],
      moderators: new Set(),

      submitReport: (
        reporter,
        reporterUsername,
        contentType,
        contentId,
        contentPreview,
        reason,
        description,
      ) => {
        const report: Report = {
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contentType,
          contentId,
          contentPreview,
          reporter,
          reporterUsername,
          reason,
          description,
          status: 'pending',
          createdAt: Date.now(),
        };

        set((state) => ({
          reports: [...state.reports, report],
        }));
      },

      reviewReport: (reportId, _moderator) => {
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? { ...report, status: 'reviewing' as ReportStatus }
              : report,
          ),
        }));
      },

      resolveReport: (reportId, moderator, action, notes) => {
        const report = get().reports.find((r) => r.id === reportId);
        if (!report) return;

        // Execute the action
        if (action === 'hide') {
          get().hideContent(
            report.contentType as 'post' | 'comment',
            report.contentId,
            report.reason,
            moderator,
          );
        } else if (action === 'remove') {
          get().removeContent(
            report.contentType as 'post' | 'comment',
            report.contentId,
            report.reason,
            moderator,
          );
        } else if (action === 'warn') {
          // Extract user from report (would need to be passed in real implementation)
          const userId = report.reporter; // Placeholder
          get().warnUser(userId, 'user', report.reason, moderator);
        } else if (action === 'ban_user') {
          const userId = report.reporter; // Placeholder
          get().banUser(userId, 'user', report.reason, moderator);
        }

        // Update report status
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: 'resolved' as ReportStatus,
                  resolvedAt: Date.now(),
                  resolvedBy: moderator,
                  action,
                  moderatorNotes: notes,
                }
              : r,
          ),
        }));
      },

      warnUser: (userId, username, reason, moderator, duration = 7) => {
        const warning: UserWarning = {
          id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          username,
          reason,
          issuedBy: moderator,
          issuedAt: Date.now(),
          expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
        };

        set((state) => ({
          warnings: [...state.warnings, warning],
        }));
      },

      banUser: (userId, username, reason, moderator, duration) => {
        const ban: UserBan = {
          id: `ban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          username,
          reason,
          bannedBy: moderator,
          bannedAt: Date.now(),
          expiresAt: duration ? Date.now() + duration * 24 * 60 * 60 * 1000 : undefined,
          isPermanent: !duration,
        };

        set((state) => ({
          bans: [...state.bans, ban],
        }));
      },

      unbanUser: (userId) => {
        set((state) => ({
          bans: state.bans.filter((ban) => ban.userId !== userId),
        }));
      },

      hideContent: (contentType, contentId, reason, moderator) => {
        const action: ContentAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contentType,
          contentId,
          action: 'hidden',
          reason,
          moderator,
          timestamp: Date.now(),
        };

        set((state) => ({
          contentActions: [...state.contentActions, action],
        }));
      },

      removeContent: (contentType, contentId, reason, moderator) => {
        const action: ContentAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contentType,
          contentId,
          action: 'removed',
          reason,
          moderator,
          timestamp: Date.now(),
        };

        set((state) => ({
          contentActions: [...state.contentActions, action],
        }));
      },

      getPendingReports: () => {
        return get().reports.filter((r) => r.status === 'pending');
      },

      getReportsByStatus: (status) => {
        return get().reports.filter((r) => r.status === status);
      },

      getUserWarnings: (userId) => {
        const now = Date.now();
        return get().warnings.filter(
          (w) => w.userId === userId && (!w.expiresAt || w.expiresAt > now),
        );
      },

      isUserBanned: (userId) => {
        const now = Date.now();
        return get().bans.some(
          (ban) =>
            ban.userId === userId &&
            (ban.isPermanent || !ban.expiresAt || ban.expiresAt > now),
        );
      },

      isContentHidden: (contentId) => {
        return get().contentActions.some(
          (action) =>
            action.contentId === contentId &&
            (action.action === 'hidden' || action.action === 'removed'),
        );
      },

      getStats: () => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        const reports = get().reports;
        const warnings = get().warnings;
        const bans = get().bans;
        const contentActions = get().contentActions;

        return {
          totalReports: reports.length,
          pendingReports: reports.filter((r) => r.status === 'pending').length,
          resolvedToday: reports.filter(
            (r) => r.status === 'resolved' && r.resolvedAt && r.resolvedAt > oneDayAgo,
          ).length,
          activeWarnings: warnings.filter((w) => !w.expiresAt || w.expiresAt > now)
            .length,
          activeBans: bans.filter(
            (b) => b.isPermanent || !b.expiresAt || b.expiresAt > now,
          ).length,
          hiddenContent: contentActions.filter((a) => a.action === 'hidden').length,
        };
      },

      isModerator: (userId) => {
        return get().moderators.has(userId);
      },

      addModerator: (userId) => {
        set((state) => ({
          moderators: new Set([...state.moderators, userId]),
        }));
      },
    }),
    {
      name: 'pulse-moderation-storage',
      partialize: (state) => ({
        reports: state.reports,
        warnings: state.warnings,
        bans: state.bans,
        contentActions: state.contentActions,
        moderators: Array.from(state.moderators),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        moderators: new Set(persistedState.moderators || []),
      }),
    },
  ),
);
