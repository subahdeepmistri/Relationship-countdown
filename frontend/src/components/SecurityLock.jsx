import React, { useState, useEffect } from 'react';

const SecurityLock = ({ initialMode = 'auto', onSuccess, onCancel }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [mode, setMode] = useState('loading'); // 'loading', 'setup', 'confirm', 'verify'
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialMode !== 'auto') {
            setMode(initialMode);
        } else {
            const storedHash = localStorage.getItem('rc_app_pin');
            const isEnabled = localStorage.getItem('rc_lock_enabled') === 'true';

            // Auto Mode: Only verify if lock is explicitly enabled AND pin exists
            if (isEnabled && storedHash) {
                setMode('verify');
            } else {
                // If not enabled, we shouldn't be here via App Gatekeeper usually, 
                // but if we are, treat as setup.
                setMode('setup');
            }
        }
    }, [initialMode]);

    const handleInput = async (num) => {
        // Vibrate on tap for tactile feel
        if (navigator.vibrate) navigator.vibrate(10);

        const currentPin = mode === 'confirm' ? confirmPin : pin;
        const setFunction = mode === 'confirm' ? setConfirmPin : setPin;

        if (currentPin.length < 4) {
            const newPin = currentPin + num;
            setFunction(newPin);

            if (newPin.length === 4) {
                // Pin Complete Logic
                if (mode === 'setup') {
                    // Move to Confirmation
                    setTimeout(() => {
                        setMode('confirm');
                        // No vibration here, let them see the dots fill
                    }, 300);
                } else if (mode === 'confirm') {
                    // Check Match
                    if (newPin === pin) {
                        await savePin(newPin);
                    } else {
                        setError("PINs didn't match. Try again.");
                        setConfirmPin('');
                        setPin('');
                        setMode('setup');
                        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    }
                } else if (mode === 'verify') {
                    await verifyPin(newPin);
                }
            }
        }
    };

    const savePin = async (finalPin) => {
        const msgBuffer = new TextEncoder().encode(finalPin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        localStorage.setItem('rc_app_pin', hashHex);
        localStorage.setItem('rc_lock_enabled', 'true'); // Explicitly enable
        if (onSuccess) onSuccess();
    };

    const verifyPin = async (inputPin) => {
        const msgBuffer = new TextEncoder().encode(inputPin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const storedHash = localStorage.getItem('rc_app_pin');

        if (hashHex === storedHash) {
            if (onSuccess) onSuccess();
        } else {
            setError('Wrong PIN');
            setPin('');
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleDelete = () => {
        if (mode === 'confirm') {
            setConfirmPin(prev => prev.slice(0, -1));
        } else {
            setPin(prev => prev.slice(0, -1));
        }
        setError('');
    };

    if (mode === 'loading') return null;

    // Derived UI State
    let title = '';
    let subtitle = '';
    let displayPin = mode === 'confirm' ? confirmPin : pin;

    if (mode === 'setup') {
        title = 'Protect Your App';
        subtitle = 'Create a 4-digit PIN to secure your memories.';
    } else if (mode === 'confirm') {
        title = 'Confirm PIN';
        subtitle = 'Enter the same PIN again to confirm.';
    } else {
        title = 'Welcome Back';
        subtitle = 'Enter your PIN to unlock.';
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'var(--bg-gradient)',
            zIndex: 9999, // Absolute top
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Cancel Button (If needed) */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute', top: 40, right: 30,
                        background: 'none', border: 'none', fontSize: '1.5rem',
                        cursor: 'pointer', opacity: 0.6
                    }}
                >
                    ✕
                </button>
            )}

            {/* Visual Icon */}
            <div style={{
                fontSize: '4rem', marginBottom: '20px',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                animation: mode === 'verify' ? 'none' : 'float 3s ease-in-out infinite'
            }}>
                {mode === 'verify' ? '🔐' : '🛡️'}
            </div>

            <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '10px',
                textAlign: 'center', color: '#fff'
            }}>
                {title}
            </h2>
            <p style={{
                opacity: 0.8, marginBottom: '40px', maxWidth: '80%', textAlign: 'center',
                lineHeight: 1.5, color: '#e2e8f0'
            }}>
                {subtitle}
            </p>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: '15px', height: '15px', borderRadius: '50%',
                        background: i < displayPin.length ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        transform: i < displayPin.length ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: i < displayPin.length ? '0 0 10px var(--accent-color)' : 'none'
                    }} />
                ))}
            </div>

            {error && <div style={{ color: '#e74c3c', marginBottom: '20px', fontWeight: 'bold', animation: 'shake 0.5s' }}>{error}</div>}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button
                        key={n}
                        onClick={() => handleInput(n)}
                        style={{
                            width: '75px', height: '75px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.4)',
                            border: '1px solid rgba(255,255,255,0.6)',
                            fontSize: '1.8rem', color: 'var(--text-primary)',
                            cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                            transition: 'active 0.1s'
                        }}
                        onMouseDown={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
                        onMouseUp={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
                        onTouchStart={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
                        onTouchEnd={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
                    >
                        {n}
                    </button>
                ))}
                <div />
                <button
                    onClick={() => handleInput(0)}
                    style={{
                        width: '75px', height: '75px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        fontSize: '1.8rem', color: 'var(--text-primary)',
                        cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    0
                </button>
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}>⌫</button>
            </div>

            <p style={{ marginTop: '50px', fontSize: '0.8rem', opacity: 0.5, letterSpacing: '1px' }}>
                RELATIONSHIP COUNTDOWN
            </p>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};

export default SecurityLock;
