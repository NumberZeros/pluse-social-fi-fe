import { useState, useMemo } from 'react';
import {
  useModerationStore,
  type ReportStatus,
  type ModAction,
} from '../stores/useModerationStore';
import { useSocialStore } from '../stores/useSocialStore';

export const ModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'content' | 'stats'>(
    'queue',
  );
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('pending');

  const [actionNotes, setActionNotes] = useState('');

  const user = useSocialStore((state) => state.currentUser);
  const reports = useModerationStore((state) => state.reports);
  const warnings = useModerationStore((state) => state.warnings);
  const bans = useModerationStore((state) => state.bans);
  const contentActions = useModerationStore((state) => state.contentActions);
  const reviewReport = useModerationStore((state) => state.reviewReport);
  const resolveReport = useModerationStore((state) => state.resolveReport);
  const unbanUser = useModerationStore((state) => state.unbanUser);
  const getStats = useModerationStore((state) => state.getStats);
  const isModerator = useModerationStore((state) => state.isModerator);

  const stats = getStats();

  // Check if user is moderator
  const isUserModerator = user ? isModerator(user.address) : false;

  const filteredReports = useMemo(() => {
    if (filterStatus === 'all') return reports;
    return reports.filter((r) => r.status === filterStatus);
  }, [reports, filterStatus]);

  const handleReview = (reportId: string) => {
    if (!user) return;
    reviewReport(reportId, user.address);
    // setSelectedReport(reports.find(r => r.id === reportId) || null);
  };

  const handleResolve = (reportId: string, action: ModAction) => {
    if (!user) return;
    resolveReport(reportId, user.address, action, actionNotes);
    // setSelectedReport(null);
    setActionNotes('');
  };

  // Future feature: Direct user ban from dashboard
  // Keeping this commented out for when we add quick ban UI
  /*
  const handleBanUser = (userId: string, username: string, duration?: number) => {
    if (!user) return;
    banUser(
      userId,
      username,
      'Violation of community guidelines',
      user.address,
      duration,
    );
  };
  */

  const handleUnban = (userId: string) => {
    unbanUser(userId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getReasonLabel = (reason: string) => {
    return reason
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'reviewing':
        return 'bg-blue-500/20 text-blue-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!isUserModerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You don't have permission to access the moderation dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Moderation Dashboard</h1>
          <p className="text-gray-400">Manage reports, users, and content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Total Reports</div>
            <div className="text-2xl font-bold text-white">{stats.totalReports}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.pendingReports}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Resolved Today</div>
            <div className="text-2xl font-bold text-green-400">{stats.resolvedToday}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Warnings</div>
            <div className="text-2xl font-bold text-orange-400">
              {stats.activeWarnings}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Bans</div>
            <div className="text-2xl font-bold text-red-400">{stats.activeBans}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Hidden Content</div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.hiddenContent}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Report Queue
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Content Actions
          </button>
        </div>

        {/* Report Queue Tab */}
        {activeTab === 'queue' && (
          <div>
            {/* Filter */}
            <div className="mb-6">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                  <div className="text-gray-400 mb-2">No reports found</div>
                  <p className="text-gray-500 text-sm">All reports have been processed</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}
                          >
                            {report.status.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                            {report.contentType.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                            {getReasonLabel(report.reason)}
                          </span>
                        </div>
                        <div className="text-white mb-2">
                          <span className="text-gray-400">Reported by:</span> @
                          {report.reporterUsername}
                        </div>
                        <div className="text-gray-300 mb-2 bg-black/20 p-3 rounded-lg">
                          {report.contentPreview}
                        </div>
                        <div className="text-gray-400 text-sm mb-2">
                          <span className="font-semibold">Description:</span>{' '}
                          {report.description}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(report.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          Review
                        </button>
                      </div>
                    )}

                    {report.status === 'reviewing' && (
                      <div className="space-y-3">
                        <textarea
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Add notes about your decision..."
                          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <button
                            onClick={() => handleResolve(report.id, 'dismiss')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'warn')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Warn User
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'hide')}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Hide Content
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'remove')}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Remove Content
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'ban_user')}
                            className="bg-red-800 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Ban User
                          </button>
                        </div>
                      </div>
                    )}

                    {report.status === 'resolved' && report.moderatorNotes && (
                      <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="text-green-400 text-sm font-semibold mb-1">
                          Action: {report.action?.toUpperCase().replace('_', ' ')}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {report.moderatorNotes}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Resolved by {report.resolvedBy?.slice(0, 8)} on{' '}
                          {report.resolvedAt && formatDate(report.resolvedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="space-y-6">
              {/* Warnings */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Active Warnings</h3>
                <div className="space-y-3">
                  {warnings.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center text-gray-400">
                      No active warnings
                    </div>
                  ) : (
                    warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold mb-1">
                              @{warning.username}
                            </div>
                            <div className="text-gray-400 text-sm">{warning.reason}</div>
                            <div className="text-gray-500 text-xs mt-1">
                              Issued {formatDate(warning.issuedAt)}
                              {warning.expiresAt &&
                                ` • Expires ${formatDate(warning.expiresAt)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bans */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Active Bans</h3>
                <div className="space-y-3">
                  {bans.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 text-center text-gray-400">
                      No active bans
                    </div>
                  ) : (
                    bans.map((ban) => (
                      <div
                        key={ban.id}
                        className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-white font-semibold">
                                @{ban.username}
                              </div>
                              {ban.isPermanent && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                  PERMANENT
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">{ban.reason}</div>
                            <div className="text-gray-500 text-xs mt-1">
                              Banned {formatDate(ban.bannedAt)}
                              {ban.expiresAt && ` • Expires ${formatDate(ban.expiresAt)}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnban(ban.userId)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                          >
                            Unban
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Actions Tab */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            {contentActions.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-12 text-center">
                <div className="text-gray-400 mb-2">No content actions</div>
                <p className="text-gray-500 text-sm">
                  No content has been hidden or removed
                </p>
              </div>
            ) : (
              contentActions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            action.action === 'hidden'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {action.action.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                          {action.contentType.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white text-sm mb-1">
                        Content ID: {action.contentId}
                      </div>
                      <div className="text-gray-400 text-sm">{action.reason}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {formatDate(action.timestamp)} by {action.moderator.slice(0, 8)}
                        ...
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
