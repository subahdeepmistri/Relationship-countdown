import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
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
        <div
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                zIndex: 99
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <audio ref={audioRef} loop>
                <source src="/bg-music.mp3" type="audio/mp3" />
            </audio>

            <button
                onClick={toggleMusic}
                style={{
                    background: isPlaying ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '30px',
                    padding: isHovered || !isPlaying ? '8px 16px' : '10px',
                    minWidth: isHovered || !isPlaying ? '100px' : '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: isPlaying ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}
            >
                <span>{isPlaying ? '🔊' : '🔇'}</span>
                {(isHovered || !isPlaying) && (
                    <span style={{ whiteSpace: 'nowrap' }}>
                        {isPlaying ? 'Music On' : 'Play Music'}
                    </span>
                )}
            </button>
        </div>
    );
};

export default BackgroundMusic;
