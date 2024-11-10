// components/ErrorBoundary.jsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and log them for debugging.
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Optionally log the error to an error reporting service.
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    // Reset the error state and navigate to auth page to attempt recovery.
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/auth';
  };

  render() {
    if (this.state.hasError) {
      // Render an error message with a reset button.
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                We apologize for the inconvenience. Please try refreshing the page or sign in again.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center mt-4">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <pre className="text-xs overflow-auto">
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Normally, render children components.
    return this.props.children;
  }
}

export default ErrorBoundary;
