import React, { useState, useRef } from 'react';
import { storage } from '../utils/storageAdapter';

/**
 * OnboardingChoice - First screen for new users
 * Offers choice between starting fresh or importing partner's data
 */

// Crypto helpers for decryption
async function decryptData(packedStr, password) {
    try {
        const packed = JSON.parse(packedStr);
        const base64ToBuffer = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0));
        const salt = base64ToBuffer(packed.salt);
        const iv = base64ToBuffer(packed.iv);
        const data = base64ToBuffer(packed.data);
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
        );
        const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
        );
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv }, key, data
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
        console.error(e);
        return null;
    }
}

const OnboardingChoice = ({ onStartFresh, onImportComplete }) => {
    const [showImport, setShowImport] = useState(false);
    const [importString, setImportString] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setImportString(event.target.result);
            setStatus({ type: 'success', msg: `File loaded: ${file.name}` });
        };
        reader.onerror = () => {
            setStatus({ type: 'error', msg: 'Failed to read file' });
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!password || !importString) {
            setStatus({ type: 'error', msg: 'Please enter both the sync code and password' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: 'loading', msg: 'Decrypting data...' });

        try {
            const data = await decryptData(importString, password);

            if (data) {
                // Use storage adapter for complete import
                const result = storage.importAll(data, false);

                if (result.success) {
                    // Mark last sync time
                    storage.set(storage.KEYS.LAST_SYNC, new Date().toISOString());

                    setStatus({ type: 'success', msg: '✨ Data imported successfully! Loading your dashboard...' });
                    setTimeout(() => {
                        onImportComplete();
                    }, 1500);
                } else {
                    setStatus({ type: 'error', msg: 'Import failed. Please try again.' });
                    setIsLoading(false);
                }
            } else {
                setStatus({ type: 'error', msg: 'Wrong password or invalid sync code' });
                setIsLoading(false);
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Import failed - invalid data format' });
            setIsLoading(false);
        }
    };

    // Import flow view
    if (showImport) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px', zIndex: 10000
            }}>
                <div style={{
                    width: '100%', maxWidth: '420px',
                    animation: 'fadeIn 0.4s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '70px', height: '70px', margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
                        }}>
                            <span style={{ fontSize: '2rem' }}>📥</span>
                        </div>
                        <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
                            Join Partner's Dashboard
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            Enter the sync code and password your partner shared with you
                        </p>
                    </div>

                    {/* Import Form */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px', padding: '24px',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        {/* File Upload */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".rcbackup,.json"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '2px dashed rgba(139, 92, 246, 0.3)',
                                borderRadius: '16px', padding: '20px',
                                textAlign: 'center', cursor: 'pointer',
                                marginBottom: '16px', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📁</div>
                            <div style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: '600' }}>
                                Upload <span style={{ color: '#c4b5fd' }}>.rcbackup</span> file
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                                or paste code below
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            margin: '16px 0', color: '#475569', fontSize: '0.75rem'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <span>OR PASTE CODE</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        {/* Code Input */}
                        <textarea
                            placeholder="Paste sync code here..."
                            value={importString}
                            onChange={e => setImportString(e.target.value)}
                            style={{
                                width: '100%', height: '100px', padding: '14px',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', color: 'white', fontSize: '0.85rem',
                                fontFamily: 'monospace', resize: 'none', outline: 'none',
                                marginBottom: '16px'
                            }}
                        />

                        {/* Password Input */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter shared password..."
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 50px 14px 14px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '14px', color: 'white', fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                                    padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Status Message */}
                        {status.msg && (
                            <div style={{
                                padding: '12px', borderRadius: '12px', marginBottom: '16px',
                                background: status.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                    status.type === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                        'rgba(59, 130, 246, 0.15)',
                                border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                                    status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                                        'rgba(59, 130, 246, 0.3)'}`,
                                color: status.type === 'error' ? '#fca5a5' :
                                    status.type === 'success' ? '#6ee7b7' : '#93c5fd',
                                fontSize: '0.9rem', textAlign: 'center'
                            }}>
                                {status.msg}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowImport(false)}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer'
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importString || !password || isLoading}
                                style={{
                                    flex: 2, padding: '14px', borderRadius: '14px',
                                    background: importString && password && !isLoading
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: importString && password && !isLoading ? 'white' : '#64748b',
                                    border: 'none', fontWeight: '700', fontSize: '0.95rem',
                                    cursor: importString && password && !isLoading ? 'pointer' : 'not-allowed',
                                    boxShadow: importString && password && !isLoading
                                        ? '0 10px 25px rgba(16, 185, 129, 0.3)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isLoading ? '⏳ Importing...' : '✨ Import & Sync'}
                            </button>
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <div style={{
                        textAlign: 'center', marginTop: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <span style={{ fontSize: '1rem' }}>🔒</span>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                            AES-256-GCM Encrypted
                        </span>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    // Main choice view
    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(135deg, #fff5f5 0%, #fce7f3 50%, #f0f9ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', zIndex: 10000
        }}>
            <div style={{
                width: '100%', maxWidth: '400px',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                {/* Logo/Icon */}
                <div style={{
                    width: '100px', height: '100px', margin: '0 auto 24px',
                    background: 'linear-gradient(135deg, #fb7185, #f472b6)',
                    borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(251, 113, 133, 0.3)',
                    transform: 'rotate(-5deg)'
                }}>
                    <span style={{ fontSize: '3rem' }}>💕</span>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '2.2rem', fontWeight: '800',
                    background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '12px'
                }}>
                    Welcome!
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '40px', lineHeight: '1.6' }}>
                    Your shared love story starts here ✨
                </p>

                {/* Option Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Start Fresh Card */}
                    <button
                        onClick={onStartFresh}
                        style={{
                            width: '100%', padding: '24px',
                            background: 'white', borderRadius: '24px',
                            border: '2px solid transparent',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 113, 133, 0.2)';
                            e.currentTarget.style.borderColor = '#fb7185';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{
                            width: '56px', height: '56px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.8rem' }}>🆕</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                                Start Fresh
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Create your new love story together
                            </div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: '#fb7185', fontSize: '1.2rem' }}>→</span>
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                        <span>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    </div>

                    {/* Import Partner Card */}
                    <button
                        onClick={() => setShowImport(true)}
                        style={{
                            width: '100%', padding: '24px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '24px', border: 'none',
                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        <div style={{
                            width: '56px', height: '56px', flexShrink: 0,
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.8rem' }}>📥</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                Join Partner's Dashboard
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                                Already have a sync code? Import it here
                            </div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: 'white', fontSize: '1.2rem' }}>→</span>
                    </button>
                </div>

                {/* Footer */}
                <p style={{ marginTop: '32px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    🔐 Your data is encrypted and stored locally
                </p>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OnboardingChoice;
