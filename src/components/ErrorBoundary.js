import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            color: "#2d3748",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", fontWeight: 600, fontFamily: "Georgia, serif" }}>
            Something went softly awry
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#718096",
              maxWidth: "420px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            A letter could not be displayed properly. You can return to the letters feed safely.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: "10px 24px",
              backgroundColor: "#2d3748",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            Return to Letters
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

