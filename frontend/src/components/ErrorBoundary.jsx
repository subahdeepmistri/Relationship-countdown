import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    color: 'white',
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💔</div>
                    <h1 style={{ marginBottom: '10px' }}>Something went wrong</h1>
                    <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '30px' }}>
                        Don't worry, your relationship is safe! The app just tripped over its own shoelaces.
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                        }}
                    >
                        Restart App
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', maxWidth: '80%' }}>
                            <summary style={{ cursor: 'pointer', color: '#ef4444' }}>Error Details</summary>
                            <pre style={{ fontSize: '0.8rem', overflowX: 'auto', marginTop: '10px' }}>
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
