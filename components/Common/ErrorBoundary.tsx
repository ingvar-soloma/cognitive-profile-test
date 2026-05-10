import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../services/LoggingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Standard React Error Boundary to catch rendering errors and report them.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] React Rendering Error:', error, errorInfo);
    
    // Log the error via our service
    logger.logError(error, `ErrorBoundary[${errorInfo.componentStack?.split('\n')[1].trim() || 'unknown'}]`);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-brand-bgMain dark:bg-brand-graphite">
          <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl max-w-md shadow-lg transition-colors">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
            <p className="text-brand-textPrimary dark:text-gray-300 mb-6 font-medium">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
