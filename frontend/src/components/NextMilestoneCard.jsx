import React, { useState, useEffect } from 'react';
import { getNextMilestone } from '../utils/relationshipLogic';

const NextMilestoneCard = () => {
    const [milestone, setMilestone] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const next = getNextMilestone();
        setMilestone(next);
    }, []);

    if (!milestone) return null;

    return (
        <>
            <div
                className="pop-card interactive"
                onClick={() => setShowDetails(true)}
                style={{
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', // Orange tinted
                    border: '2px solid #FED7AA',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
                    position: 'relative'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {/* Subtle Helper Text */}
                <div style={{
                    position: 'absolute', top: '10px', right: '15px',
                    fontSize: '0.7rem', color: '#9A3412', opacity: 0.6
                }}>
                    Tap for details 👆
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        fontSize: '2rem',
                        background: 'white',
                        width: '50px', height: '50px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        {milestone.icon}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#9A3412', textTransform: 'uppercase', letterSpacing: '1px' }}>Next Milestone</h3>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#431407' }}>
                            {milestone.title}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#EA580C', lineHeight: 1 }}>
                        {milestone.daysLeft}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9A3412' }}>days</div>
                </div>
            </div>

            {/* Simple Modal for Details */}
            {showDetails && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setShowDetails(false)}>
                    <div className="pop-card" style={{ width: '90%', maxWidth: '350px', background: 'white' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Milestone Tracker 🚀</h3>
                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '15px', marginBottom: '20px' }}>
                            <p><strong>Next Up:</strong> {milestone.title}</p>
                            <p><strong>When:</strong> {milestone.date}</p>
                            <p><strong>Countdown:</strong> {milestone.daysLeft} days to go!</p>
                        </div>
                        <button
                            onClick={() => setShowDetails(false)}
                            style={{
                                width: '100%', padding: '15px',
                                background: 'var(--text-primary)', color: 'white',
                                border: 'none', borderRadius: '15px', fontSize: '1rem'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NextMilestoneCard;
