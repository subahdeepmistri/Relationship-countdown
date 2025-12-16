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
        <div style={{ textAlign: 'center', padding: '2rem 0', position: 'relative' }}>
            {/* Organic Shape Background for Hero */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '300px', height: '300px',
                background: 'rgba(255, 112, 67, 0.1)', /* Soft Coral Tint */
                borderRadius: 'var(--shape-radius)',
                zIndex: -1,
                filter: 'blur(40px)'
            }} />

            {/* Hero Days */}
            <div style={{
                fontSize: '10rem',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1,
                color: 'var(--text-primary)',
                letterSpacing: '-5px'
            }}>
                {stats.days}
            </div>
            <div style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                marginTop: '-1rem',
                marginBottom: '2rem',
                color: 'var(--accent-color)'
            }}>
                days of us
            </div>

            {/* Sub Counters */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                opacity: 0.8
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.hours}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Hrs</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.minutes}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Min</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.seconds}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Sec</span>
                </div>
            </div>
        </div>
    );
};

export default Counter;
