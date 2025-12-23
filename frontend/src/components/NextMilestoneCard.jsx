import React, { useState, useEffect } from 'react';
import { getNextMilestone } from '../utils/relationshipLogic';

const NextMilestoneCard = () => {
    const [milestone, setMilestone] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [secondsTick, setSecondsTick] = useState(0);

    useEffect(() => {
        const next = getNextMilestone();
        setMilestone(next);

        // Ticking effect for countdown
        const interval = setInterval(() => {
            setSecondsTick(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Confetti logic if clear < 7 days
    useEffect(() => {
        if (showDetails && milestone && milestone.daysLeft <= 7) {
            // Trigger confetti (using simple CSS classes or just icon animation for now as per "no heavy JS libraries")
            // We'll use the existing 'event-horizon' style simple particle system if available or just consistent UI
        }
    }, [showDetails, milestone]);

    if (!milestone) return null;

    return (
        <>
            <div
                className="pop-card interactive"
                onClick={() => setShowDetails(true)}
                style={{
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', // Orange tinted
                    border: '1px solid rgba(251, 113, 133, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '24px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {/* Background Shimmer & Dust */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: 'skewX(-20deg) translateX(-150%)',
                    animation: 'shimmer 4s infinite linear'
                }}></div>

                {/* Atmospheric Particles (Dust) - CSS only */}
                <div className="dust-particle" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
                <div className="dust-particle" style={{ left: '40%', top: '50%', animationDelay: '1.5s' }} />
                <div className="dust-particle" style={{ left: '80%', top: '30%', animationDelay: '3s' }} />

                <style>{`
                    @keyframes shimmer {
                        0% { transform: skewX(-20deg) translateX(-150%); }
                        20% { transform: skewX(-20deg) translateX(150%); }
                        100% { transform: skewX(-20deg) translateX(150%); }
                    }
                    .dust-particle {
                        position: absolute; width: 4px; height: 4px; background: rgba(255,255,255,0.6);
                        border-radius: 50%; pointer-events: none;
                        animation: floatDust 4s infinite linear;
                        opacity: 0;
                    }
                    @keyframes floatDust {
                        0% { transform: translateY(10px); opacity: 0; }
                        50% { opacity: 0.8; }
                        100% { transform: translateY(-20px); opacity: 0; }
                    }
                    @keyframes tickPulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                `}</style>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', zIndex: 1 }}>
                    <div style={{
                        fontSize: '2rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        width: '56px', height: '56px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
                        position: 'relative'
                    }}>
                        {/* Soft Spotlight Glow */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
                            animation: 'pulse-slow 3s infinite ease-in-out'
                        }} />
                        {milestone.icon}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', fontFamily: 'var(--font-sans, sans-serif)' }}>Next Chapter</h3>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>
                            {milestone.title}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '60px', zIndex: 1, background: 'rgba(255,255,255,0.5)', padding: '8px 14px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                    <div key={secondsTick} style={{
                        fontSize: '1.5rem', fontWeight: '800', color: '#EA580C', lineHeight: 1,
                        animation: 'tickPulse 0.3s ease-out'
                    }}>
                        {milestone.daysLeft}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: '600', textTransform: 'uppercase' }}>Days</div>
                </div>
            </div>

            {/* V2 Premium Modal */}
            {showDetails && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(20, 20, 20, 0.6)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s'
                }} onClick={() => setShowDetails(false)}>
                    <div className="pop-card" style={{
                        width: '90%', maxWidth: '380px', background: 'white',
                        padding: '30px 24px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.5)',
                        animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{milestone.daysLeft <= 7 ? '🎉' : '⏳'}</div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '0 0 5px', color: 'var(--text-primary)' }}>
                                {milestone.daysLeft <= 0 ? "It's Today!" : "Chapter Loading..."}
                            </h3>
                            <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Your story continues on <strong>{milestone.date}</strong>
                            </p>
                            <p style={{
                                margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic',
                                fontFamily: 'var(--font-serif)', letterSpacing: '0.5px'
                            }}>
                                "Some stories are meant to be opened slowly."
                            </p>
                        </div>

                        {/* Feature Sections */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>🔒</span>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Time Capsule</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Write a note for this day</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#FFF7ED', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>📸</span>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#9A3412', fontSize: '0.9rem' }}>Flashback</div>
                                    <div style={{ fontSize: '0.8rem', color: '#C2410C' }}>See past celebration photos</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDetails(false)}
                            style={{
                                width: '100%', padding: '16px',
                                background: 'var(--text-primary)', color: 'white',
                                border: 'none', borderRadius: '20px', fontSize: '1rem',
                                fontWeight: '600', cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            className="modern-btn"
                        >
                            Can't Wait!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NextMilestoneCard;
