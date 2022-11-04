import { Component, ErrorInfo, ReactElement } from "react";

interface ErrorBoundaryState {
  errorProps?: { error: Error; errorInfo: ErrorInfo };
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorProps: { error, errorInfo } });
  }

  render() {
    if (!this.state.errorProps || !this.props.enabled) {
      return this.props.children;
    }
    if (process.env.NODE_ENV === "production") {
      return <h1>Something went wrong.</h1>;
    }
    return (
      <>
        <h1>Something went wrong.</h1>
        {this.props.showErrorDetails && (
          <pre>
            {this.state.errorProps.error.message}
            {this.state.errorProps.errorInfo.componentStack}
          </pre>
        )}
      </>
    );
  }
}
