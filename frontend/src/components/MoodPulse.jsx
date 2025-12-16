import React, { useState, useEffect } from 'react';

const MOODS = [
    { id: 'love', emoji: '❤️', label: 'Love You', color: '#e74c3c' },
    { id: 'miss', emoji: '🥺', label: 'Miss You', color: '#3498db' },
    { id: 'happy', emoji: '✨', label: 'Happy', color: '#f1c40f' },
    { id: 'busy', emoji: '💻', label: 'Busy', color: '#95a5a6' },
    { id: 'sleepy', emoji: '😴', label: 'Sleepy', color: '#9b59b6' },
    { id: 'hungry', emoji: '🍕', label: 'Hungry', color: '#e67e22' },
];

const MoodPulse = () => {
    const [myStatus, setMyStatus] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('rc_my_mood');
        if (saved) setMyStatus(saved);
    }, []);

    const handleSetMood = (id) => {
        setMyStatus(id);
        localStorage.setItem('rc_my_mood', id);
        // In a real app, this would sync to the partner via backend
    };

    return (
        <div style={{
            width: '100%',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '5px 0 15px 0',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
        }}>
            <div style={{ display: 'inline-flex', gap: '12px' }}>
                {MOODS.map(mood => {
                    const isActive = myStatus === mood.id;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleSetMood(mood.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: isActive ? `1px solid ${mood.color}` : '1px solid rgba(255,255,255,0.1)',
                                minWidth: '80px',
                                height: '100px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isActive ? `0 0 15px ${mood.color}40` : 'none', // Glow instead of solid shadow
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <span style={{
                                fontSize: '2.2rem',
                                filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)',
                                transition: 'all 0.3s ease',
                                textShadow: isActive ? `0 0 10px ${mood.color}` : 'none'
                            }}>
                                {mood.emoji}
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: isActive ? '600' : 'normal',
                                color: isActive ? mood.color : 'var(--text-secondary)', // Colored text matches glow
                                opacity: 1
                            }}>
                                {mood.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            {myStatus && (
                <div style={{
                    marginTop: '15px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-accent)',
                    fontWeight: '500'
                }}>
                    Currently feeling: <span style={{ color: '#fff' }}>{MOODS.find(m => m.id === myStatus)?.label}</span>
                </div>
            )}
        </div>
    );

};

export default MoodPulse;
