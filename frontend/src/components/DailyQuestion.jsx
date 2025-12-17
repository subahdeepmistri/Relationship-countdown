import React, { useState, useEffect } from 'react';

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

const DailyQuestion = () => {
    const [question, setQuestion] = useState("");
    const [showAnswerInput, setShowAnswerInput] = useState(false);
    const [answer, setAnswer] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        // Simple hash to pick a question based on the date
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % QUESTIONS.length;
        setQuestion(QUESTIONS[index]);

        // Check if already answered today (mock check)
        const saved = localStorage.getItem(`rc_daily_answer_${new Date().toDateString()}`);
        if (saved) {
            setAnswer(saved);
            setIsAnswered(true);
        }
    }, []);

    const saveAnswer = () => {
        localStorage.setItem(`rc_daily_answer_${new Date().toDateString()}`, answer);
        setIsAnswered(true);
        // showconfetti
    };

    return (
        <div className="pop-card" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', // Dark gradient bg
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            textAlign: 'center',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            maxWidth: '100%',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '40px'
        }}>
            {/* Decorative Glow */}
            <div style={{
                position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
                width: '150px', height: '150px', background: 'rgba(99, 102, 241, 0.3)',
                borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
            }} />

            <div style={{
                fontSize: '0.8rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: '15px',
                color: '#94a3b8'
            }}>
                Daily Reflection
            </div>

            <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                marginBottom: '25px',
                lineHeight: '1.4',
                color: '#e2e8f0',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                "{question}"
            </h3>

            {!isAnswered ? (
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: '0 auto' }}>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Write your thought here..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '15px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none',
                            marginBottom: '15px',
                            transition: 'border-color 0.2s',
                            backdropFilter: 'blur(5px)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                    />
                    <button
                        onClick={saveAnswer}
                        disabled={!answer.trim()}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '30px',
                            border: 'none',
                            background: !answer.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: !answer.trim() ? 'rgba(255,255,255,0.3)' : 'white',
                            fontWeight: 'bold',
                            cursor: !answer.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.3s',
                            boxShadow: !answer.trim() ? 'none' : '0 5px 20px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        Save for Today
                    </button>
                </div>
            ) : (
                <div style={{
                    padding: '20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    marginTop: '10px'
                }}>
                    <p style={{ fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '10px', color: '#e2e8f0' }}>"{answer}"</p>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, color: '#6ee7b7', fontWeight: 'bold' }}>
                        ✨ Saved for today
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyQuestion;
