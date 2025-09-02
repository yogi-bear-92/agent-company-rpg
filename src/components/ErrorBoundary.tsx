import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error reporting callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component with accessibility features
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div 
      className="error-boundary-fallback bg-red-950/20 border border-red-500/50 rounded-lg p-6 m-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl text-red-400" role="img" aria-label="Error icon">⚠️</span>
        <h2 className="text-xl font-bold text-red-300">Something went wrong</h2>
      </div>
      
      <div className="mb-4">
        <p className="text-red-200 mb-2">
          We're sorry, but something unexpected happened. This error has been logged and we'll work to fix it.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="bg-red-900/30 border border-red-500/30 rounded p-3 mt-3">
            <summary className="cursor-pointer text-red-300 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-950">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-200 mt-2 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-950"
          aria-label="Try again to recover from error"
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-red-950"
          aria-label="Reload the entire page"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

// Specialized error boundary for component-specific errors
export const ComponentErrorBoundary: React.FC<{
  componentName: string;
  children: React.ReactNode;
}> = ({ componentName, children }) => (
  <ErrorBoundary
    fallback={({ resetError }) => (
      <div 
        className="bg-yellow-950/20 border border-yellow-500/50 rounded-lg p-4 m-2"
        role="alert"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400" role="img" aria-label="Warning">⚠️</span>
          <h3 className="text-sm font-semibold text-yellow-300">
            {componentName} Error
          </h3>
        </div>
        <p className="text-xs text-yellow-200 mb-3">
          This component couldn't load properly. You can continue using other parts of the app.
        </p>
        <button
          onClick={resetError}
          className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label={`Retry loading ${componentName}`}
        >
          Retry
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;