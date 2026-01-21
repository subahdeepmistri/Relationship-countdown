import React, { useState } from 'react';

/**
 * WelcomeScreen - Onboarding flow for new users
 * 
 * @param {function} updateRelationship - Context setter for relationship data
 * @param {function} updateSettings - Context setter for app settings
 */
const WelcomeScreen = ({ updateRelationship, updateSettings, onBack }) => {
    const [step, setStep] = useState(1);
    const [names, setNames] = useState({ p1: '', p2: '' });
    const [date, setDate] = useState('');
    const [type, setType] = useState('couple');

    const handleNext = () => {
        if (step === 1 && names.p1 && names.p2) {
            setStep(2);
        } else if (step === 2 && date) {
            // Create initial event
            const newEvent = {
                id: 'init-start',
                title: 'The Beginning',
                date: date,
                emoji: '💖',
                isMain: true
            };

            // Update Context state (which also persists to localStorage)
            updateRelationship({
                partner1: names.p1.trim(),
                partner2: names.p2.trim(),
                startDate: date,
                events: [newEvent]
            });

            updateSettings({
                anniversaryType: type,
                photosSet: true,    // Simplified - can add photos later
                setupComplete: true
            });

            // No reload needed - React will re-render with the new state!
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #FFF1EB 0%, #ACE0F9 100%)', // Soft "Cotton Candy"
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Montserrat', sans-serif"
        }}>
            <div className="pop-card" style={{
                width: '90%', maxWidth: '400px',
                padding: '40px 30px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '40px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '3rem', color: '#FF5252', marginBottom: '10px' }}>
                    Hello!
                </h1>

                {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <p style={{ color: '#64748B', marginBottom: '30px', fontSize: '1.1rem' }}>
                            Let's maximize your relationship aesthetic. Who are the stars?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginBottom: '30px' }}>
                            <input
                                placeholder="Your Name"
                                value={names.p1}
                                onChange={(e) => setNames({ ...names, p1: e.target.value })}
                                style={inputStyle}
                            />
                            <span style={{ fontSize: '1.5rem', color: '#FF5252' }}>&</span>
                            <input
                                placeholder="Partner's Name"
                                value={names.p2}
                                onChange={(e) => setNames({ ...names, p2: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    style={{
                                        padding: '15px 25px', borderRadius: '30px',
                                        background: 'transparent', border: '2px solid #e2e8f0',
                                        color: '#64748b', fontSize: '1rem', fontWeight: '600',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    ← Back
                                </button>
                            )}
                            <button onClick={handleNext} disabled={!names.p1 || !names.p2} style={buttonStyle}>
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <p style={{ color: '#64748B', marginBottom: '30px', fontSize: '1.1rem' }}>
                            When did your story begin?
                        </p>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem' }}
                        />
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {['couple', 'wedding', 'friendship'].map(t => (
                                <span
                                    key={t}
                                    onClick={() => setType(t)}
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        background: type === t ? '#FF5252' : '#F1F5F9',
                                        color: type === t ? 'white' : '#64748B',
                                        cursor: 'pointer', fontSize: '0.8rem'
                                    }}
                                >
                                    {t === 'couple' ? 'Couple' : t === 'wedding' ? 'Wedding' : 'Friends'}
                                </span>
                            ))}
                        </div>
                        <br />
                        <button onClick={handleNext} disabled={!date} style={{ ...buttonStyle, marginTop: '20px' }}>
                            Start Countdown ✨
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '15px',
    borderRadius: '15px',
    border: '2px solid #F1F5F9',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};

const buttonStyle = {
    background: '#FF5252',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    borderRadius: '30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 20px -5px rgba(255, 82, 82, 0.4)'
};

export default WelcomeScreen;
