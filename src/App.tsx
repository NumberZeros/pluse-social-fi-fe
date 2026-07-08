import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryProvider } from './providers/QueryProvider';
import { SolanaProvider } from './providers/SolanaProvider';
import { Toaster } from 'react-hot-toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingStates';
import { WalletConnectionManager } from './components/WalletConnectionManager';
import { LegacyRedirect } from './pages/LegacyRedirect';

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
const Post = lazy(() => import('./pages/Post'));
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })),
);
const What = lazy(() => import('./pages/What'));
const Why = lazy(() => import('./pages/Why'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function RouterContent() {
  useKeyboardShortcuts();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/what" element={<What />} />
        <Route path="/why" element={<Why />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/post/:postId" element={<Post />} />

        {/* Legacy routes → MVP redirects */}
        <Route
          path="/shares"
          element={<LegacyRedirect to="/dashboard" canonical="/dashboard" />}
        />
        <Route
          path="/creator"
          element={<LegacyRedirect to="/dashboard" canonical="/dashboard" />}
        />
        <Route
          path="/marketplace"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/groups"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/groups/:groupId"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/governance"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/subscriptions"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/airdrop"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/moderation"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />
        <Route
          path="/export"
          element={<LegacyRedirect to="/guide#coming-soon" canonical="/guide" />}
        />

        <Route path="/:username" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
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
              <WalletConnectionManager />
              <RouterContent />
            </BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--color-border)',
                },
              }}
            />
            <Analytics />
            <SpeedInsights />
          </SolanaProvider>
        </QueryProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
