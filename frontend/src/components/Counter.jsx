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

            {/* Hero Days */}
            <div style={{
                fontSize: 'clamp(3rem, 12vw, 6rem)', // Reduced max size for cleaner look
                fontFamily: 'var(--font-serif)',
                fontWeight: '800',
                lineHeight: 1,
                marginBottom: '10px',
                background: 'linear-gradient(to bottom, #fff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.3))' // Premium glow
            }}>
                {stats.days}
            </div>

            <div style={{
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                color: 'var(--accent-color)',
                fontWeight: 'bold',
                marginBottom: '40px'
            }}>
                Days Together
            </div>

            {/* Sub Counters */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(20px, 5vw, 40px)', // Responsive gap
                marginTop: '20px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.hours}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Hours</span>
                </div>
                {/* Divider */}
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.minutes}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Mins</span>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.seconds}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Secs</span>
                </div>
            </div>
        </div>
    );
};

export default Counter;
