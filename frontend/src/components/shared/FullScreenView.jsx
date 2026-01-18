import React from 'react';

/**
 * FullScreenView - Reusable full-screen overlay container with premium dark theme
 * 
 * @param {React.ReactNode} children - Content to render inside the view
 * @param {function} onClose - Close button handler
 * @param {boolean} showCloseButton - Whether to show close button (default: true)
 * @param {boolean} showGrain - Whether to show grain/noise overlay (default: true)
 * @param {boolean} showBlobs - Whether to show atmospheric blobs (default: true)
 */
const FullScreenView = ({
    children,
    onClose,
    showCloseButton = true,
    showGrain = true,
    showBlobs = true
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)',
                zIndex: 3000,
                overflowY: 'auto',
                overflowX: 'hidden',
                boxSizing: 'border-box',
                padding: '80px 16px 110px',
                color: 'white',
                backdropFilter: 'blur(20px)'
            }}
        >
            {/* Grain/Noise Overlay */}
            {showGrain && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                            pointerEvents: 'none',
                            zIndex: 0,
                            opacity: 0.4
                        }}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                </>
            )}

            {/* Atmospheric Blobs */}
            {showBlobs && (
                <>
                    <div
                        className="animate-pulse-slow"
                        style={{
                            position: 'fixed',
                            top: '-10%',
                            right: '-20%',
                            width: '600px',
                            height: '600px',
                            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, rgba(0,0,0,0) 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                    <div
                        className="animate-float"
                        style={{
                            position: 'fixed',
                            bottom: '-10%',
                            left: '-10%',
                            width: '500px',
                            height: '500px',
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                </>
            )}

            {/* Close Button */}
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="no-print"
                    aria-label="Close"
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
                        fontSize: '1.2rem',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        zIndex: 3001,
                        color: 'white',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                    ✕
                </button>
            )}

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

export default FullScreenView;
