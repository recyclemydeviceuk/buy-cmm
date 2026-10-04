import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface State { error: Error | null }

/** Catches render errors so one broken section never blanks the whole site. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page crashed', error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container py-24 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-2 text-3xl">This page hit a <span className="serif-accent text-ink-3">snag</span></h1>
        <p className="mt-2 text-sm text-ink-3">Please reload, or head back to the shop.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>
          <Button to="/shop">Browse phones</Button>
        </div>
      </div>
    );
  }
}
