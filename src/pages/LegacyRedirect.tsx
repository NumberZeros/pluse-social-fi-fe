import { Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface LegacyRedirectProps {
  to: string;
  canonical: string;
}

export function LegacyRedirect({ to, canonical }: LegacyRedirectProps) {
  return (
    <>
      <SEO
        title="Redirecting"
        noindex
        canonical={canonical}
        url={canonical}
      />
      <Navigate to={to} replace />
    </>
  );
}
