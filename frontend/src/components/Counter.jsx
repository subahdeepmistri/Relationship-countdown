import React, { useEffect, useState } from 'react';
import { useWasm } from '../hooks/useWasm';

const TimeUnit = ({ value, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {String(value).padStart(2, '0')}
        </span>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>{label}</span>
    </div>
);

const Counter = () => {
    const { isLoaded, getRelationshipStats } = useWasm();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;
        const tick = () => setStats(getRelationshipStats());
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isLoaded, getRelationshipStats]);

    if (!stats) return <div style={{ opacity: 0.5, fontStyle: 'italic' }}>Calculating forever...</div>;

    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>

            <div style={{
                color: 'var(--accent-primary)',
                fontWeight: '700',
                fontSize: '0.9rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '5px'
            }}>
                Together For
            </div>

            {/* Hero Days */}
            <div style={{
                fontSize: 'clamp(5rem, 20vw, 8rem)', // Bold and massive
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                lineHeight: 1,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                letterSpacing: '-2px'
            }}>
                {stats.days}
            </div>

            <div style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                marginBottom: '40px'
            }}>
                Days of Love
            </div>

            {/* Sub Counters - Pills */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '10px',
                flexWrap: 'wrap'
            }}>
                {[
                    { label: 'Hours', val: stats.hours },
                    { label: 'Mins', val: stats.minutes },
                    { label: 'Secs', val: stats.seconds }
                ].map((item, idx) => (
                    <div key={idx} style={{
                        background: '#F1F5F9',
                        padding: '12px 20px',
                        borderRadius: '16px',
                        minWidth: '80px'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.val}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Counter;
