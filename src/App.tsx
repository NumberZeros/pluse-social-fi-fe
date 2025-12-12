import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { SolanaProvider } from './providers/SolanaProvider';
import { Toaster } from 'react-hot-toast';

const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })));
const Feed = lazy(() => import('./pages/Feed').then((m) => ({ default: m.Feed })));
const Explore = lazy(() => import('./pages/Explore').then((m) => ({ default: m.Explore })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));

function App() {
  return (
    <QueryProvider>
      <SolanaProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/@:username" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
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
  );
}

export default App;
