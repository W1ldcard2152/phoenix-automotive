// Create src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">We're sorry, but there was an error loading this section.</p>
          <button
            className="px-4 py-2 bg-red-700 text-white rounded-md"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Use in App.jsx for key components
<ErrorBoundary>
  <DismantledVehiclesPage />
</ErrorBoundary>