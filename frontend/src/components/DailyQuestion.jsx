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

    useEffect(() => {
        // Simple hash to pick a question based on the date
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const index = dayOfYear % QUESTIONS.length;
        setQuestion(QUESTIONS[index]);
    }, []);

    return (
        <div style={{
            marginTop: '40px',
            padding: '40px 20px',
            textAlign: 'center',
            background: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Top Border Organic Decoration */}
            <div style={{
                position: 'absolute', top: -20, left: 0, right: 0, height: '40px',
                background: '#FFFFFF',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                transform: 'scaleX(1.1)'
            }} />

            <h3 style={{
                margin: '0 0 10px 0',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'var(--text-secondary)'
            }}>
                Daily Reflection
            </h3>

            <p style={{
                fontSize: '1.8rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 'bold',
                lineHeight: '1.3',
                marginBottom: '30px',
                color: 'var(--text-primary)',
                maxWidth: '600px',
                margin: '0 auto 30px auto'
            }}>
                "{question}"
            </p>

            {!showAnswerInput ? (
                <button
                    onClick={() => setShowAnswerInput(true)}
                    style={{
                        padding: '15px 40px',
                        background: 'var(--accent-color)',
                        border: 'none',
                        borderRadius: '50px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}
                >
                    Answer
                </button>
            ) : (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <textarea
                        placeholder="Write something heartfelt..."
                        style={{
                            width: '100%',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid #eee',
                            background: '#FAFAFA',
                            color: 'var(--text-primary)',
                            marginBottom: '20px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.1rem'
                        }}
                        rows="4"
                    />
                    <button
                        onClick={() => {
                            alert("Answer saved! (Mock)");
                            setShowAnswerInput(false);
                        }}
                        style={{
                            padding: '12px 30px',
                            background: 'var(--text-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Share with Partner
                    </button>
                </div>
            )}

            {/* Bottom Curve for Flow */}
            <div style={{
                position: 'absolute', bottom: -20, left: 0, right: 0, height: '40px',
                background: '#FFFFFF',
                borderRadius: '0 0 50% 50% / 0 0 100% 100%',
                transform: 'scaleX(1.1)'
            }} />
        </div>
    );
};

export default DailyQuestion;
