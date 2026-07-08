import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { getButtonClassName } from '../design-system';

export function NotFound() {
  return (
    <AppLayout>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist on Pulse Social."
        noindex
        url="/404"
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-display mb-4 text-primary">404</h1>
        <h2 className="text-h3 mb-2">Page not found</h2>
        <p className="text-body text-muted mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className={getButtonClassName('primary', 'md')}>
          Go Home
        </Link>
      </div>
    </AppLayout>
  );
}

export default NotFound;
