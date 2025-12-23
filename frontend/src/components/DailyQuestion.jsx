import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storageAdapter';

const QUESTIONS = [
    "What is your favorite memory of us so far?",
    "What is one thing you admire most about me?",
    "If we could go anywhere right now, where would it be?",
    "What song reminds you of me?",
    "What is your dream date night?",
    "What is one goal you want us to achieve next year?",
    "What was your first impression of me?",
    "What makes you feel most loved?",
    "What is the funniest thing we've ever done together?",
    "What is a small thing I do that makes you smile?",
    // Add more... (In a real app, this list would be huge)
];

const MAX_STORED_DAYS = 30; // Limit stored answers to prevent unbounded growth

const DailyQuestion = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);
    const [timeIcon, setTimeIcon] = useState("☀️");

    useEffect(() => {
        const h = new Date().getHours();
        setTimeIcon(h >= 6 && h < 18 ? "☀️" : "🌙");

        // Simple hash to pick a question based on the date
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % QUESTIONS.length;
        setQuestion(QUESTIONS[index]);

        // Check if already answered today using consolidated storage
        const todayKey = today.toDateString();
        const answers = storage.get(storage.KEYS.DAILY_ANSWERS, {});

        if (answers[todayKey]) {
            setAnswer(answers[todayKey].text || answers[todayKey]);
            setIsAnswered(true);
        }
    }, []);

    const saveAnswer = () => {
        const todayKey = new Date().toDateString();
        const answers = storage.get(storage.KEYS.DAILY_ANSWERS, {});

        // Add today's answer
        answers[todayKey] = {
            text: answer,
            mood: selectedMood,
            savedAt: new Date().toISOString()
        };

        // Clean up old entries (keep only last MAX_STORED_DAYS)
        const allDates = Object.keys(answers).sort((a, b) => new Date(b) - new Date(a));
        if (allDates.length > MAX_STORED_DAYS) {
            allDates.slice(MAX_STORED_DAYS).forEach(oldKey => {
                delete answers[oldKey];
            });
        }

        storage.set(storage.KEYS.DAILY_ANSWERS, answers);
        setIsAnswered(true);
    };

    return (
        <div className="pop-card" style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Dark theme for contrast
            color: 'white',
            textAlign: 'center',
            padding: '32px 24px',
            borderRadius: '32px',
            boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.4)',
            maxWidth: '100%',
            position: 'relative',
            marginTop: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
        }}>
            {/* Ambient Glow */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600',
                letterSpacing: '1px', textTransform: 'uppercase'
            }}>
                <span style={{ fontSize: '1.2rem' }}>{timeIcon}</span>
                Daily Reflection
            </div>

            <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                marginBottom: '30px',
                lineHeight: '1.5',
                color: '#f1f5f9',
            }}>
                "{question}"
            </h3>

            {!isAnswered ? (
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Mood Selector (Micro) */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        {['😔', '😐', '🙂', '🥰', '🔥'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => setSelectedMood(emoji)}
                                style={{
                                    background: selectedMood === emoji ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50%',
                                    width: '40px', height: '40px',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    transform: selectedMood === emoji ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Write your thought here..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '16px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none',
                            marginBottom: '20px',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />

                    <button
                        onClick={saveAnswer}
                        disabled={!answer.trim()}
                        className="modern-btn"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '24px',
                            border: 'none',
                            background: !answer.trim() ? 'rgba(255,255,255,0.1)' : 'var(--accent-lux-gradient)',
                            color: !answer.trim() ? 'rgba(255,255,255,0.3)' : 'white',
                            fontWeight: '700',
                            cursor: !answer.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            boxShadow: !answer.trim() ? 'none' : '0 10px 25px -5px rgba(251, 113, 133, 0.5)'
                        }}
                    >
                        Save Memory
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                        Your words become tomorrow's memories.
                    </p>
                </div>
            ) : (
                <div style={{
                    padding: '24px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    animation: 'scaleIn 0.3s'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✨</div>
                    <p style={{ fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '15px', color: '#e2e8f0', lineHeight: 1.6 }}>
                        "{answer}"
                    </p>
                    <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Saved for today
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DailyQuestion;
