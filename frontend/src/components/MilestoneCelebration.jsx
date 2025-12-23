import React, { useEffect, useState, useCallback } from 'react';

const MilestoneCelebration = () => {
    const [milestone, setMilestone] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const checkMilestone = () => {
            const startDate = localStorage.getItem('rc_start_date');
            if (!startDate) return;

            const start = new Date(startDate);
            const now = new Date();
            const diffTime = Math.abs(now - start);
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let currentMilestone = null;

            // Logic: Check for big numbers
            if (days > 0) {
                if (days % 365 === 0) {
                    currentMilestone = `${days / 365} Year${days / 365 > 1 ? 's' : ''} Anniversary!`;
                } else if (days % 100 === 0) {
                    currentMilestone = `${days} Days Together!`;
                } else if (days === 1 || days === 10 || days === 50) { // Small wins
                    currentMilestone = `${days} Days In Love!`;
                }
            }

            if (currentMilestone) {
                // Check if already dismissed today
                const dismissKey = `rc_milestone_dismissed_${days}`;
                const wasDismissed = localStorage.getItem(dismissKey);

                if (!wasDismissed) {
                    setMilestone(currentMilestone);
                }
            }
        };

        checkMilestone();
    }, []);

    const handleDismiss = useCallback(() => {
        const startDate = localStorage.getItem('rc_start_date');
        if (startDate) {
            const start = new Date(startDate);
            const now = new Date();
            const days = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
            localStorage.setItem(`rc_milestone_dismissed_${days}`, 'true');
        }
        setDismissed(true);
    }, []);

    // Auto-dismiss after 10 seconds
    useEffect(() => {
        if (milestone && !dismissed) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [milestone, dismissed, handleDismiss]);

    if (!milestone || dismissed) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
            onClick={handleDismiss}
            role="dialog"
            aria-label="Milestone celebration"
        >
            <div className="animate-bounce-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px 60px',
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                textAlign: 'center',
                border: '1px solid #E0E7FF',
                maxWidth: '90%'
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
                <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Tap anywhere to dismiss
                </p>
            </div>
        </div>
    );
};

export default MilestoneCelebration;

