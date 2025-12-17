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
    const [justSaved, setJustSaved] = useState(false);
    const [historyMsg, setHistoryMsg] = useState('');

    useEffect(() => {
        // Load today's mood
        const today = new Date().toDateString();
        const lastUpdate = localStorage.getItem('rc_mood_date');
        const savedMood = localStorage.getItem('rc_my_mood');

        if (lastUpdate === today && savedMood) {
            setMyStatus(savedMood);
            // Mock History Logic for Engagement
            setHistoryMsg(`You've felt '${MOODS.find(m => m.id === savedMood)?.label}' often this week.`);
        }
    }, []);

    const handleSetMood = (id) => {
        const today = new Date().toDateString();
        setMyStatus(id);
        setJustSaved(true);
        localStorage.setItem('rc_my_mood', id);
        localStorage.setItem('rc_mood_date', today);

        // Simple mock history feedback
        const label = MOODS.find(m => m.id === id)?.label;
        setHistoryMsg(`You selected '${label}' today.`);

        setTimeout(() => setJustSaved(false), 3000);
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
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    {justSaved ? (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', animation: 'fadeIn 0.5s' }}>Vibe check complete 💫</span>
                    ) : (
                        <span>Today's vibe: <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{MOODS.find(m => m.id === myStatus)?.label}</span></span>
                    )}
                    {historyMsg && !justSaved && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>{historyMsg}</div>}
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default MoodPulse;
