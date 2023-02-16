import { Component } from "react";
import Page from "../Page";
import { ChildProps } from "../../types";
import withLocation from "../../hoc/withLocation";

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  path: string | null;
}

interface ErrorBoundaryProps {
  children?: ChildProps;
  location?: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>{

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      path: props.location.pathname
    };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    const path: any = null;
    return { hasError: true, error, path };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary error:", error);
    console.error("ErrorBoundary errorInfo.componentStack:", errorInfo.componentStack);
  }

  componentDidUpdate(prevProps: any) {
    if (
      prevProps?.location &&
      prevProps.location?.pathname !== this.props.location?.pathname
    ) {
      // location changed - reset ErrorBoundary
      this.setState({
        hasError: false,
        error: null,
        path: this.props.location?.pathname
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page>
          <h1>{this.state.error?.name ? this.state.error.name : "Error"}</h1>
          <p>
            {this.state.error?.message
              ? this.state.error.message
              : "Something went wrong."}
          </p>
          <p>{this.state.path}</p>
        </Page>
      );
    }

    return this.props.children;
  }
}

export default withLocation(ErrorBoundary);
