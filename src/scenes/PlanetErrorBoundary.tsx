import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
};

type State = { failed: boolean };

export class PlanetErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('3D asset unavailable; using the honest fallback.', error, info);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

