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
            marginBottom: '20px',
            width: '100%',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '10px 0',
            scrollbarWidth: 'none'
        }}>
            <div style={{ display: 'inline-flex', gap: '15px', padding: '0 10px' }}>
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
                                gap: '5px',
                                opacity: isActive ? 1 : 0.7,
                                transform: isActive ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                background: isActive ? mood.color : 'rgba(255,255,255,0.4)',
                                width: '70px',
                                height: '90px',
                                borderRadius: 'var(--shape-radius)', /* Organic Shape */
                                border: 'none',
                                boxShadow: isActive ? `0 10px 20px -5px ${mood.color}` : 'none',
                                color: isActive ? 'white' : 'var(--text-primary)'
                            }}
                        >
                            <span style={{
                                fontSize: '1.8rem',
                                filter: isActive ? 'none' : 'grayscale(0.5)'
                            }}>
                                {mood.emoji}
                            </span>
                            {isActive && (
                                <span style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold',
                                    marginTop: '2px'
                                }}>
                                    {mood.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {myStatus && (
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '0.8rem', opacity: 0.8 }}>
                    Current Vibe: <strong>{MOODS.find(m => m.id === myStatus)?.label}</strong>
                </div>
            )}
        </div>
    );
};

export default MoodPulse;
