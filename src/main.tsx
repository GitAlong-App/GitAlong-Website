import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-5 text-ink">
          <div className="max-w-sm text-center">
            <img src="/illustrations/thinking_face.png" alt="" width={120} height={120} className="mx-auto" />
            <h1 className="mt-4 text-h1">Oops, something broke</h1>
            <p className="mt-2 text-body text-ink-muted">That’s on us. Refresh the page and try again.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-13 items-center justify-center rounded-md bg-green px-6 type-button text-white shadow-edge-green active:translate-y-1 active:shadow-none"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
