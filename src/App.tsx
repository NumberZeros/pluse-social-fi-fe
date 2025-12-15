import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryProvider } from './providers/QueryProvider';
import { SolanaProvider } from './providers/SolanaProvider';
import { Toaster } from 'react-hot-toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = lazy(() =>
  import('./pages/Landing').then((m) => ({ default: m.Landing })),
);
const Feed = lazy(() => import('./pages/Feed').then((m) => ({ default: m.Feed })));
const Explore = lazy(() =>
  import('./pages/Explore').then((m) => ({ default: m.Explore })),
);
const Profile = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.Profile })),
);
const AirdropDashboard = lazy(() =>
  import('./pages/AirdropDashboard').then((m) => ({ default: m.AirdropDashboard })),
);
const Subscriptions = lazy(() =>
  import('./pages/Subscriptions').then((m) => ({ default: m.Subscriptions })),
);
const CreatorDashboard = lazy(() =>
  import('./pages/CreatorDashboard').then((m) => ({ default: m.CreatorDashboard })),
);
const GroupsDiscovery = lazy(() => import('./pages/GroupsDiscovery'));
const GroupDetail = lazy(() =>
  import('./pages/GroupDetail').then((m) => ({ default: m.GroupDetail })),
);
const UsernameMarketplace = lazy(() =>
  import('./pages/UsernameMarketplace').then((m) => ({ default: m.UsernameMarketplace })),
);
const Governance = lazy(() =>
  import('./pages/Governance').then((m) => ({ default: m.Governance })),
);
const CreatorShares = lazy(() =>
  import('./pages/CreatorShares').then((m) => ({ default: m.CreatorShares })),
);
const ModerationDashboard = lazy(() =>
  import('./pages/ModerationDashboard').then((m) => ({ default: m.ModerationDashboard })),
);
const DataExport = lazy(() =>
  import('./pages/DataExport').then((m) => ({ default: m.DataExport })),
);
const What = lazy(() => import('./pages/What'));
const Why = lazy(() => import('./pages/Why'));
const UserGuide = lazy(() => import('./pages/UserGuide'));

// Inner component that uses router hooks
function RouterContent() {
  // Enable keyboard shortcuts (must be inside Router)
  useKeyboardShortcuts();

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/airdrop" element={<AirdropDashboard />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/groups" element={<GroupsDiscovery />} />
        <Route path="/groups/:groupId" element={<GroupDetail />} />
        <Route path="/marketplace" element={<UsernameMarketplace />} />
        <Route path="/governance" element={<Governance />} />
        <Route path="/shares" element={<CreatorShares />} />
        <Route path="/moderation" element={<ModerationDashboard />} />
        <Route path="/export" element={<DataExport />} />
        <Route path="/what" element={<What />} />
        <Route path="/why" element={<Why />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/:username" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryProvider>
          <SolanaProvider>
            <BrowserRouter>
              <RouterContent />
            </BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            />
          </SolanaProvider>
        </QueryProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
