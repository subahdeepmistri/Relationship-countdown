import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('relationship_app_music');
        if (savedState === 'true') {
            setIsPlaying(true);
        }
    }, []);

    // Handle Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            } else {
                audioRef.current.pause();
            }
            localStorage.setItem('relationship_app_music', isPlaying);
        }
    }, [isPlaying]);

    const toggleMusic = () => setIsPlaying(!isPlaying);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 100
        }}>
            <audio ref={audioRef} loop>
                <source src="/bg-music.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>

            <button
                onClick={toggleMusic}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s ease'
                }}
                title={isPlaying ? "Pause Music" : "Play Music"}
            >
                {isPlaying ? '♪' : '✕'}
            </button>
        </div>
    );
};

export default BackgroundMusic;
