import React, { useEffect, useState } from 'react';
import { getRelationshipStats } from '../utils/relationshipLogic';

const Counter = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let animationFrameId;

        const tick = () => {
            const currentStats = getRelationshipStats();
            if (currentStats) setStats(currentStats);
            animationFrameId = requestAnimationFrame(tick);
        };

        tick(); // Start loop

        // Handle tab visibility to force immediate update when waking up
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const currentStats = getRelationshipStats();
                if (currentStats) setStats(currentStats);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    if (!stats) return <div style={{ opacity: 0.5, fontStyle: 'italic', padding: '20px' }}>Initializing timeline...</div>;

    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>

            <div style={{
                color: 'var(--accent-primary)',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
                <span className="pulse-dot" style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%', background: '#EF4444',
                    display: 'inline-block',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                }}></span>
                Live Counter
            </div>

            {/* Hero Days */}
            <div style={{
                fontSize: 'clamp(3.5rem, 15vw, 6rem)', // Adjusted for better overflow handling
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                lineHeight: 1,
                color: 'var(--text-primary)',
                marginBottom: '5px',
                letterSpacing: '-2px',
                transition: 'transform 0.2s',
                textShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
                {stats.days}
            </div>

            <div style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                marginBottom: '30px'
            }}>
                {stats.isFuture ? 'Days Until...' : 'Days of Love'}
            </div>

            {/* Sub Counters - Pills */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px',
                flexWrap: 'wrap' // Ensures wrap on mobile <600px as per CSS
            }}>
                {[
                    { label: 'Hours', val: stats.hours },
                    { label: 'Mins', val: stats.minutes },
                    { label: 'Secs', val: stats.seconds }
                ].map((item, idx) => (
                    <div key={idx} style={{
                        background: '#F8FAFC', // Lighter slate
                        border: '1px solid #E2E8F0',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        minWidth: '80px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)', // High contrast 
                            fontVariantNumeric: 'tabular-nums' // Monospaced numbers prevents jitter
                        }}>
                            {String(item.val).padStart(2, '0')}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            marginTop: '2px'
                        }}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pulse-dot { animation: pulse 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default Counter;
