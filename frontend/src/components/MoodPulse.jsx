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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '5px'
            }}>
                {MOODS.map(mood => {
                    const isActive = myStatus === mood.id;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleSetMood(mood.id)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#FFF7ED' : '#F8FAFC',
                                border: isActive ? `2px solid ${mood.color}` : '2px solid transparent',
                                width: '80px',
                                height: '100px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                position: 'relative'
                            }}
                        >
                            <span style={{
                                fontSize: '2rem',
                                filter: isActive ? 'none' : 'grayscale(1)',
                                opacity: isActive ? 1 : 0.6,
                                marginBottom: '4px',
                                transition: 'all 0.2s ease'
                            }}>
                                {mood.emoji}
                            </span>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: isActive ? mood.color : 'var(--text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {mood.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {myStatus && (
                <div style={{
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)', // Fixed text color for light theme
                    fontWeight: '500'
                }}>
                    Currently feeling: <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{MOODS.find(m => m.id === myStatus)?.label}</span>
                </div>
            )}
        </div>
    );
};

export default MoodPulse;
