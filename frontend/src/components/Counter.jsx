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
                color: 'var(--accent-lux)',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
                <span className="pulse-dot" style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%', background: 'var(--accent-lux)',
                    display: 'inline-block',
                    boxShadow: '0 0 10px rgba(251, 113, 133, 0.6)'
                }}></span>
                Live Counter
            </div>

            {/* Hero Days - Flux Animation */}
            <div key={stats.days} className="animate-float" style={{
                fontSize: 'clamp(3.5rem, 15vw, 6rem)',
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                lineHeight: 1,
                marginBottom: '5px',
                letterSpacing: '-2px',
                textShadow: '0 10px 40px rgba(251, 113, 133, 0.15)',
                background: 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
            }}>
                {stats.days}
            </div>

            <div style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                fontWeight: '400',
                marginBottom: '5px',
                fontFamily: 'var(--font-serif)'
            }}>
                {stats.isFuture ? 'Days Until...' : 'Days of Love'}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--accent-lux)', fontWeight: '600', marginBottom: '30px', opacity: 0.9 }}>
                And still choosing each other.
            </div>

            {/* Sub Counters - Pills v2 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '10px',
                flexWrap: 'wrap'
            }}>
                {[
                    { label: 'Hours', val: stats.hours },
                    { label: 'Mins', val: stats.minutes },
                    { label: 'Secs', val: stats.seconds }
                ].map((item, idx) => (
                    <div key={item.label} style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        padding: '12px 16px',
                        borderRadius: '20px',
                        minWidth: '80px',
                        boxShadow: '0 8px 20px -5px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(8px)',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div key={item.val} style={{
                            fontSize: '1.6rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            fontVariantNumeric: 'tabular-nums',
                            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            {String(item.val).padStart(2, '0')}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            marginTop: '2px'
                        }}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(5px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .pulse-dot { animation: pulse 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default Counter;
