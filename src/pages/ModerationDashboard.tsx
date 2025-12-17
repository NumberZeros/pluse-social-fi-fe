import { useState, useMemo } from 'react';
import { useWallet } from '../lib/wallet-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import {
  useModerationStore,
  type ReportStatus,
  type ModAction,
} from '../stores/useModerationStore';
import {
  ShieldAlert,
  Archive,
  UserX,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Users,
  AlertCircle
} from 'lucide-react';

export const ModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'content' | 'stats'>(
    'queue',
  );
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('pending');

  const [actionNotes, setActionNotes] = useState('');

  const { publicKey } = useWallet();
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
  const isUserModerator = publicKey ? isModerator(publicKey.toBase58()) : false;

  const filteredReports = useMemo(() => {
    if (filterStatus === 'all') return reports;
    return reports.filter((r) => r.status === filterStatus);
  }, [reports, filterStatus]);

  const handleReview = (reportId: string) => {
    if (!publicKey) return;
    reviewReport(reportId, publicKey.toBase58());
  };

  const handleResolve = (reportId: string, action: ModAction) => {
    if (!publicKey) return;
    resolveReport(reportId, publicKey.toBase58(), action, actionNotes);
    setActionNotes('');
  };

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
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewing':
        return 'bg-[var(--color-solana-green)]/20 text-[var(--color-solana-green)] border-[var(--color-solana-green)]/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!isUserModerator) {
     return (
        <AppLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card rounded-[2.5rem] p-12 text-center max-w-lg border border-red-500/20 bg-red-500/5"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                 <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Access Denied</h2>
              <p className="text-gray-400 text-lg">
                This area is restricted to moderators only. If you believe this is an error, please contact support.
              </p>
            </motion.div>
          </div>
        </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-solana-green)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-solana-green)]">Admin Console</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Moderation Dashboard</h1>
          <p className="text-xl text-gray-400">Manage community reports, users, and content safety.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
           {[
               { label: 'Total Reports', value: stats.totalReports, color: 'text-white', icon: FileText },
               { label: 'Pending', value: stats.pendingReports, color: 'text-yellow-400', icon: Clock },
               { label: 'Resolved Today', value: stats.resolvedToday, color: 'text-green-400', icon: CheckCircle2 },
               { label: 'Warnings', value: stats.activeWarnings, color: 'text-orange-400', icon: AlertTriangle },
               { label: 'Active Bans', value: stats.activeBans, color: 'text-red-400', icon: UserX },
               { label: 'Hidden Content', value: stats.hiddenContent, color: 'text-[var(--color-solana-green)]', icon: EyeOff },
           ].map((stat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="glass-card rounded-[2rem] p-6 border border-white/10"
             >
                <stat.icon className={`w-6 h-6 mb-4 ${stat.color} opacity-80`} />
                <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
             </motion.div>
           ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 rounded-full border border-white/10 flex items-center gap-2">
            {[
              { id: 'queue', label: 'Report Queue', icon: Archive },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'content', label: 'Content Actions', icon: EyeOff },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
        {/* Report Queue Tab */}
        {activeTab === 'queue' && (
          <motion.div
             key="queue"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
          >
            {/* Filter */}
            <div className="mb-8 flex justify-end">
              <div className="relative">
                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="pl-12 pr-10 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-solana-green)] transition-all appearance-none cursor-pointer font-bold"
                  >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {filteredReports.length === 0 ? (
                <div className="glass-card rounded-[2.5rem] p-20 text-center border border-white/10 dashed-border">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                     <CheckCircle2 className="w-10 h-10 text-[var(--color-solana-green)]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
                  <p className="text-gray-400">No reports matching your filter criteria.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-[2rem] p-8 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border uppercase tracking-wider ${getStatusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-gray-300 border border-white/10 uppercase tracking-wider">
                            {report.contentType}
                          </span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                            {getReasonLabel(report.reason)}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                           <div>
                              <div className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wide">Report Details</div>
                              <div className="mb-4">
                                <span className="text-gray-500">Reporter:</span> <span className="font-bold text-white">@{report.reporterUsername}</span>
                              </div>
                              <div className="mb-4">
                                <span className="text-gray-500">Description:</span>
                                <p className="text-white mt-1">{report.description}</p>
                              </div>
                               <div className="text-xs font-mono text-gray-500">
                                ID: {report.id.slice(0,12)} • {formatDate(report.createdAt)}
                              </div>
                           </div>
                           
                           <div>
                              <div className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wide">Content Preview</div>
                              <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/10 text-gray-300 italic">
                                "{report.contentPreview}"
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                        <button
                          onClick={() => handleReview(report.id)}
                          className="bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                        >
                          Start Review
                        </button>
                      </div>
                    )}

                    {report.status === 'reviewing' && (
                      <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                        <textarea
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Add notes about your decision (required for resolution)..."
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-solana-green)] transition-all min-h-[100px]"
                        />
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleResolve(report.id, 'dismiss')}
                            className="bg-gray-700/50 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/5 hover:border-white/20"
                          >
                            Dismiss Report
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'warn')}
                            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold py-3 px-6 rounded-xl transition-all border border-orange-500/20"
                          >
                            Warn User
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'hide')}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold py-3 px-6 rounded-xl transition-all border border-yellow-500/20"
                          >
                            Hide Content
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'remove')}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 px-6 rounded-xl transition-all border border-red-500/20"
                          >
                            Remove Content
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'ban_user')}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-600/20"
                          >
                            Ban User
                          </button>
                        </div>
                      </div>
                    )}

                    {report.status === 'resolved' && report.moderatorNotes && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="text-green-400 font-bold uppercase tracking-wider text-sm">Resolved: {report.action?.toUpperCase().replace('_', ' ')}</span>
                            </div>
                          <div className="text-gray-300 pl-7">
                            {report.moderatorNotes}
                          </div>
                          <div className="text-gray-500 text-xs mt-4 font-mono pl-7">
                            By {report.resolvedBy?.slice(0, 8)} on{' '}
                            {report.resolvedAt && formatDate(report.resolvedAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <motion.div
             key="users"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Warnings */}
              <div className="glass-card rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                   <AlertTriangle className="w-6 h-6 text-orange-400" />
                   Active Warnings
                </h3>
                <div className="space-y-4">
                  {warnings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                      No active warnings
                    </div>
                  ) : (
                    warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className="bg-white/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-bold text-lg mb-1">
                              @{warning.username}
                            </div>
                            <div className="text-orange-400 text-sm font-medium mb-3">{warning.reason}</div>
                            <div className="text-gray-500 text-xs font-mono">
                              Issued: {formatDate(warning.issuedAt)}
                            </div>
                             {warning.expiresAt && ( 
                                <div className="text-gray-500 text-xs font-mono mt-1">
                                    Expires: {formatDate(warning.expiresAt)}
                                </div>
                             )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bans */}
              <div className="glass-card rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                   <UserX className="w-6 h-6 text-red-500" />
                   Active Bans
                </h3>
                <div className="space-y-4">
                  {bans.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                      No active bans
                    </div>
                  ) : (
                    bans.map((ban) => (
                      <div
                        key={ban.id}
                        className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-white font-bold text-lg">
                                @{ban.username}
                              </div>
                              {ban.isPermanent && (
                                <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-red-500 text-black uppercase">
                                  PERMANENT
                                </span>
                              )}
                            </div>
                            <div className="text-red-400/80 text-sm font-medium mb-3">{ban.reason}</div>
                            <div className="text-gray-500 text-xs font-mono">
                               Banned: {formatDate(ban.bannedAt)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnban(ban.userId)}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold py-2 px-4 rounded-xl transition-all border border-green-500/20 text-sm whitespace-nowrap"
                          >
                            Revoke Ban
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Actions Tab */}
        {activeTab === 'content' && (
          <motion.div
             key="content"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="space-y-4"
          >
            {contentActions.length === 0 ? (
              <div className="glass-card rounded-[2.5rem] p-20 text-center border border-white/10 dashed-border">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <EyeOff className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Actions Logged</h3>
                <p className="text-gray-400">No content has been hidden or removed yet.</p>
              </div>
            ) : (
              contentActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            action.action === 'hidden'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {action.action}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-[var(--color-solana-green)] border border-white/10 uppercase tracking-wider">
                          {action.contentType}
                        </span>
                         <span className="text-gray-500 text-xs font-mono ml-2">
                            ID: {action.contentId.slice(0,8)}...
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                         <AlertCircle className="w-4 h-4" />
                         Reason: <span className="text-white">{action.reason}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Moderator</div>
                       <div className="font-mono text-sm text-[var(--color-solana-green)]">@{action.moderator.slice(0, 8)}</div>
                       <div className="text-xs text-gray-600 mt-2">{formatDate(action.timestamp)}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

