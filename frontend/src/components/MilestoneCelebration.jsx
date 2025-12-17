import React, { useEffect, useState } from 'react';

const MilestoneCelebration = () => {
    const [milestone, setMilestone] = useState(null);

    useEffect(() => {
        const checkMilestone = () => {
            const startDate = localStorage.getItem('rc_start_date');
            if (!startDate) return;

            const start = new Date(startDate);
            const now = new Date();
            const diffTime = Math.abs(now - start);
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Logic: Check for big numbers
            if (days > 0) {
                if (days % 365 === 0) {
                    setMilestone(`${days / 365} Year${days / 365 > 1 ? 's' : ''} Anniversary!`);
                } else if (days % 100 === 0) {
                    setMilestone(`${days} Days Together!`);
                } else if (days === 1 || days === 10 || days === 50) { // Small wins
                    setMilestone(`${days} Days In Love!`);
                }
            }
        };

        checkMilestone();
    }, []);

    if (!milestone) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none', // Allow clicks through if just visual, but usually overlay blocks
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="animate-bounce-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px 60px',
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                textAlign: 'center',
                border: '1px solid #E0E7FF'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎉</div>
                <h2 style={{
                    fontSize: '2rem',
                    color: '#4338ca',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-heading)'
                }}>
                    Congratulations!
                </h2>
                <p style={{
                    fontSize: '1.5rem',
                    color: '#1e293b',
                    fontWeight: 'bold'
                }}>
                    {milestone}
                </p>
                <p style={{ marginTop: '20px', color: '#64748b' }}>
                    Another milestone in your beautiful journey.
                </p>
            </div>
        </div>
    );
};

export default MilestoneCelebration;
