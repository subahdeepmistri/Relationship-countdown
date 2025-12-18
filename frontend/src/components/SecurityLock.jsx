import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

const SecurityLock = ({ initialMode = 'verify', onSuccess, onCancel }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState(initialMode); // 'setup', 'verify', 'confirm'
    const [tempPin, setTempPin] = useState('');

    useEffect(() => {
        // If verify mode, ensure we have a pin
        if (initialMode === 'verify') {
            const storedHash = localStorage.getItem('rc_app_pin_hash');
            if (!storedHash) {
                // FALLBACK: If lock is enabled but no PIN is stored, force Setup mode.
                // This prevents being stuck in a locked state with no way out.
                // Alternatively, we could auto-unlock, but that defeats security.
                // Safest bet for user experience: Ask them to set a new PIN.
                setMode('setup');
            }
        }
    }, [initialMode]);

    const handlePadClick = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                handleComplete(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const hashPin = async (p) => {
        const msgBuffer = new TextEncoder().encode(p);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleComplete = async (inputPin) => {
        if (mode === 'setup') {
            setTempPin(inputPin);
            setPin('');
            setMode('confirm');
        } else if (mode === 'confirm') {
            if (inputPin === tempPin) {
                const hash = await hashPin(inputPin);
                localStorage.setItem('rc_app_pin_hash', hash);
                onSuccess();
            } else {
                setError("PINs don't match");
                setPin('');
                setMode('setup'); // Restart setup
                setTempPin('');

                if (navigator.vibrate) navigator.vibrate(200);
            }
        } else if (mode === 'verify') {
            const storedHash = localStorage.getItem('rc_app_pin_hash');
            const inputHash = await hashPin(inputPin);

            if (inputHash === storedHash) {
                onSuccess();
            } else {
                setError('Incorrect PIN');
                setPin('');
                if (navigator.vibrate) navigator.vibrate(200);
            }
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', width: '100%', color: 'white',
            background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)'
        }}>
            {onCancel && (
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute', top: 20, right: 20,
                        background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'
                    }}
                >✕</button>
            )}

            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>

            <h2 style={{ marginBottom: '30px', fontWeight: '600' }}>
                {mode === 'setup' && "Create a PIN"}
                {mode === 'confirm' && "Confirm PIN"}
                {mode === 'verify' && "Enter PIN to Unlock"}
            </h2>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: i < pin.length ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: i < pin.length ? 'scale(1.2)' : 'scale(1)'
                    }} />
                ))}
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
                maxWidth: '320px', width: '100%', padding: '0 20px'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handlePadClick(num)}
                        style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', fontSize: '1.6rem', fontWeight: '500',
                            cursor: 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        {num}
                    </button>
                ))}
                <div />
                <button
                    onClick={() => handlePadClick(0)}
                    style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', fontSize: '1.6rem', fontWeight: '500', cursor: 'pointer'
                    }}
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'transparent', border: 'none',
                        color: 'white', fontSize: '1.4rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    ⌫
                </button>
            </div>

            {error && (
                <p style={{
                    color: '#ef4444', marginTop: '30px', fontWeight: 'bold',
                    background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '12px'
                }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default SecurityLock;
