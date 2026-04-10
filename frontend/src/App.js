import React from 'react';
import TrustButVerify from './TrustButVerify';

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
// Catches any unhandled React render error and shows a fallback UI
// instead of a blank white screen.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to PostHog if available
    if (window.posthog) {
      window.posthog.capture('app_error_boundary', {
        error_message: error?.message,
        component_stack: info?.componentStack?.slice(0, 500)
      });
    }
    console.error('[WTR App] ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
          textAlign: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#51B0E6" strokeWidth="1.5"><path d="M12 2C12 2 6 10 6 14a6 6 0 0012 0c0-4-6-12-6-12z"/></svg></div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0A1A2E', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: '#A6A8AB', marginBottom: 20, maxWidth: 300, lineHeight: 1.6 }}>
            The WTR App encountered an issue. Please refresh to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #51B0E6, #2A8FCA)',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            REFRESH APP
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <TrustButVerify />
    </ErrorBoundary>
  );
}

export default App;
