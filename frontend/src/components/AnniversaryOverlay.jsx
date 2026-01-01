import React, { useEffect, useState } from 'react';
import { useWasm } from '../hooks/useWasm';

const AnniversaryOverlay = () => {
    const { isLoaded, getAnniversaryCountdown } = useWasm();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;
        const check = () => setStatus(getAnniversaryCountdown());
        check();
        const interval = setInterval(check, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isLoaded, getAnniversaryCountdown]);

    if (!status || !status.is_today) return null;

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
                animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#e74c3c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '50px'
            }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>Happy Anniversary!</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Another beautiful year together.</p>

                {/* Voice Message Section */}
                <VoiceMessagePlayer />

                <div style={{ fontSize: '2rem', marginTop: '30px' }}>💖</div>
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
