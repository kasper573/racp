import { Component, ErrorInfo, ReactElement } from "react";

interface ErrorBoundaryState {
  errorProps?: { error: unknown; errorInfo: ErrorInfo };
}

interface ErrorBoundaryProps {
  children: ReactElement;
  showErrorDetails?: boolean;
  enabled?: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    this.setState({ errorProps: { error, errorInfo } });
  }

  render() {
    if (!this.state.errorProps || !this.props.enabled) {
      return this.props.children;
    }
    const { error, errorInfo } = this.state.errorProps;
    return (
      <>
        <h1>Something went wrong.</h1>
        {this.props.showErrorDetails && (
          <pre>
            Error: {`${error}`}
            ComponentStack: {errorInfo.componentStack}
          </pre>
        )}
      </>
    );
  }
}
