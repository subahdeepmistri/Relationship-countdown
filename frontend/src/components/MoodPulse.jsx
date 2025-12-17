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

    // Drag to Scroll Logic
    const scrollRef = React.useRef(null);
    const isDown = React.useRef(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);
    const hasMoved = React.useRef(false); // Track if actual dragging occurred

    const handleMouseDown = (e) => {
        isDown.current = true;
        hasMoved.current = false; // Reset movement flag
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollRef.current.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
        isDown.current = false;
        scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
        isDown.current = false;
        scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
        if (!isDown.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll-fast factor

        // Only mark as moved if notable distance to prevent accidental micro-jitter blocking clicks
        if (Math.abs(x - startX.current) > 5) {
            hasMoved.current = true;
        }

        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleItemClick = (e, moodId) => {
        // If we dragged (moved more than 5px), block the click
        if (hasMoved.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        // Otherwise, it's a valid click
        handleSetMood(moodId);
    };

    return (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
            {/* Scroll Container with Fading Edges Mask */}
            <div style={{
                position: 'relative',
                width: '100%',
                // Mask easing for smooth fade out on sides
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}>
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{
                        display: 'flex',
                        gap: '15px',
                        overflowX: 'auto',
                        padding: '10px 10% 20px 10%', // More padding for clear edges
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        cursor: 'grab',
                        userSelect: 'none' // Prevent text selection while dragging
                    }}
                    className="no-scrollbar"
                >
                    {MOODS.map(mood => {
                        const isActive = myStatus === mood.id;
                        return (
                            <button
                                key={mood.id}
                                onClick={(e) => handleItemClick(e, mood.id)}
                                style={{
                                    flex: '0 0 auto', // Prevent shrinking
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive ? '#fff' : 'rgba(241, 245, 249, 0.8)',
                                    border: isActive ? `2px solid ${mood.color}` : '1px solid transparent',
                                    minWidth: '85px',
                                    height: '110px',
                                    borderRadius: '50px',
                                    // Removed pointer-events: none logic as we handle it via onClick check now
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy spring
                                    transform: isActive ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
                                    position: 'relative',
                                    scrollSnapAlign: 'center',
                                    boxShadow: isActive
                                        ? `0 15px 30px -10px ${mood.color}66` // Colored glow
                                        : '0 4px 6px -1px rgba(0,0,0,0.05)'
                                }}
                            >
                                <span style={{
                                    fontSize: '2.5rem',
                                    filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                }}>
                                    {mood.emoji}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    color: isActive ? mood.color : '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {mood.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Inline style to hide scrollbar but keep functionality */}
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

            {/* Desktop hint (optional, but good for UX) */}
            <div style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.4, marginTop: '-15px' }}>
                Swipe or drag to explore
            </div>

            {myStatus && (
                <div style={{
                    textAlign: 'center',
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500',
                    animation: 'fadeIn 0.5s ease',
                    marginTop: '-5px'
                }}>
                    {justSaved ? (
                        <span style={{
                            display: 'inline-block',
                            color: 'white',
                            background: '#10b981',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            Response Saved ✨
                        </span>
                    ) : (
                        <span>
                            Today's vibe: <span style={{
                                color: MOODS.find(m => m.id === myStatus)?.color,
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{MOODS.find(m => m.id === myStatus)?.label}</span>
                        </span>
                    )}
                    {historyMsg && !justSaved && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px', fontStyle: 'italic' }}>{historyMsg}</div>}
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default MoodPulse;
