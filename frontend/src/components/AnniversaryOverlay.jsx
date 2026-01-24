import React, { useEffect, useState } from 'react';
import { useWasm } from '../hooks/useWasm';

const AnniversaryOverlay = () => {
    const { isLoaded, getAnniversaryCountdown } = useWasm();
    const [status, setStatus] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;

        // Check local storage for dismissal
        const today = new Date().toDateString(); // E.g., "Tue Jan 24 2026"
        const lastDismissal = localStorage.getItem('rc_anniversary_dismissed');
        if (lastDismissal === today) {
            setIsDismissed(true);
            return;
        }

        const check = () => setStatus(getAnniversaryCountdown());
        check();
        const interval = setInterval(check, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isLoaded, getAnniversaryCountdown]);

    const handleDismiss = () => {
        const today = new Date().toDateString();
        localStorage.setItem('rc_anniversary_dismissed', today);
        setIsDismissed(true);
    };

    if (isDismissed || !status || !status.is_today) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            backdropFilter: 'blur(3px)'
        }}>
            <div className="pop-card" style={{
                position: 'relative',
                animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#e74c3c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '50px',
                maxWidth: '90%',
                borderRadius: '24px'
            }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >
                    ✕
                </button>

                <h1 style={{ fontSize: '2.5rem', margin: 0, textAlign: 'center' }}>Happy Anniversary!</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', color: '#64748b' }}>Another beautiful year together.</p>

                {/* Voice Message Section */}
                <VoiceMessagePlayer />

                <div style={{ fontSize: '2rem', marginTop: '30px' }}>💖</div>

                <button
                    onClick={handleDismiss}
                    style={{
                        marginTop: '30px',
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Continue to App
                </button>
            </div>
            <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
      `}</style>
        </div>
    );
};

// Internal Sub-component for Audio
const VoiceMessagePlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log("Play failed", e));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <audio
                ref={audioRef}
                src="/voice-message.mp3"
                onEnded={() => setIsPlaying(false)}
            />
            <button
                onClick={togglePlay}
                style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '15px 30px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                    animation: isPlaying ? 'pulse-ring 2s infinite' : 'none'
                }}
            >
                <span>{isPlaying ? '❚❚' : '▶'}</span>
                <span>{isPlaying ? 'Listening...' : 'Tap for Message'}</span>
            </button>
        </div>
    );
};

export default AnniversaryOverlay;
