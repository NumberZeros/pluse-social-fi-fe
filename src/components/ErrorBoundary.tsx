import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button, Card } from '../design-system';
import { captureException } from '../lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center p-4 bg-background"
        >
          <Card variant="glass" className="max-w-md w-full rounded-2xl p-8 border border-border text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-danger/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-h3 mb-3 text-foreground">Something went wrong</h2>

            <p className="text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Try Again
              </Button>

              <Button
                variant="secondary"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-muted cursor-pointer hover:text-muted">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-danger overflow-auto p-3 bg-background/30 rounded-lg">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
