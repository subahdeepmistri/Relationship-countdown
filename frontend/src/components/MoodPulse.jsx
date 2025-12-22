import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Defined mood options with new additions
const MOODS = [
    { id: 'love', emoji: '❤️', label: 'Love You', color: '#ff6b6b', message: "Sending all my love to you! ❤️" },
    { id: 'miss', emoji: '🥺', label: 'Miss You', color: '#54a0ff', message: "Missing you more than words can say." },
    { id: 'calm', emoji: '😌', label: 'Calm', color: '#1dd1a1', message: "Peaceful vibes sent your way. 🍃" },
    { id: 'tired', emoji: '😴', label: 'Tired', color: '#a29bfe', message: "Rest well, my love. 🌙" },
    { id: 'happy', emoji: '✨', label: 'Happy', color: '#feca57', message: "So happy to see you shine! ✨" },
    { id: 'excited', emoji: '🎉', label: 'Excited', color: '#ff9ff3', message: "Yay! Can't wait for what's next! 🎉" },
];

const MoodPulse = () => {
    const [myStatus, setMyStatus] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasDropped, setHasDropped] = useState(false);

    useEffect(() => {
        // Load today's mood
        const today = new Date().toDateString();
        const lastUpdate = localStorage.getItem('rc_mood_date');
        const savedMood = localStorage.getItem('rc_my_mood');

        if (lastUpdate === today && savedMood) {
            setMyStatus(savedMood);
            setHasDropped(true);
        }
    }, []);

    const handleMoodSelect = (moodId) => {
        const today = new Date().toDateString();

        // 1. Play haptic
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        // 2. Set state implies "dropping"
        localStorage.setItem('rc_my_mood', moodId);
        localStorage.setItem('rc_mood_date', today);
        setMyStatus(moodId);
        setHasDropped(true);
        setIsExpanded(false);
    };

    const currentMoodData = MOODS.find(m => m.id === myStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mood-drop-container"
            style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(24px)',
                borderRadius: '32px',
                padding: '32px 20px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)',
                width: '100%',
                position: 'relative',
                overflow: 'visible', // Allow animations to pop out if needed
                textAlign: 'center'
            }}
        >
            {/* Header */}
            <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '24px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
                Today's Mood Drop
            </h3>

            {/* Interaction Area */}
            <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence>
                    {!hasDropped ? (
                        /* ORB INTERACTION */
                        isExpanded ? (
                            /* EXPANDED STATE - MOOD GRID */
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', bounce: 0.3 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    width: '100%',
                                    maxWidth: '300px'
                                }}
                            >
                                {MOODS.map((mood) => (
                                    <motion.button
                                        key={mood.id}
                                        onClick={() => handleMoodSelect(mood.id)}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            background: '#fff',
                                            border: `2px solid ${mood.color}20`,
                                            borderRadius: '20px',
                                            padding: '12px 0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{mood.emoji}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: mood.color }}>{mood.label}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        ) : (
                            /* IDLE ORB */
                            <motion.button
                                key="orb"
                                onClick={() => setIsExpanded(true)}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: 1,
                                    y: [0, -5, 0]
                                }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "easeInOut"
                                }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)', // Default mysterious gradient
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 20px 40px -10px rgba(63, 43, 150, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>💧</span>
                            </motion.button>
                        )
                    ) : (
                        /* DROPPED STATE - ANIMATED EMOJI */
                        <motion.div
                            key="dropped"
                            initial={{ y: -100, opacity: 0, scale: 1.5 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                                style={{
                                    fontSize: '4rem',
                                    filter: `drop-shadow(0 20px 30px ${currentMoodData?.color}60)`
                                }}
                            >
                                {currentMoodData?.emoji}
                            </motion.div>
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '60px', opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                style={{
                                    height: '10px',
                                    background: currentMoodData?.color,
                                    borderRadius: '50%',
                                    marginTop: '20px',
                                    filter: 'blur(8px)'
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback Footer */}
            <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
                <AnimatePresence mode="wait">
                    {!hasDropped ? (
                        <motion.p
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            style={{ fontSize: '0.9rem', color: '#64748b' }}
                        >
                            Tap drop to share feelings
                        </motion.p>
                    ) : (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{ textAlign: 'center' }}
                        >
                            <p style={{ margin: 0, fontWeight: '500', color: currentMoodData?.color }}>
                                You felt "{currentMoodData?.label}"
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                {currentMoodData?.message}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default MoodPulse;
