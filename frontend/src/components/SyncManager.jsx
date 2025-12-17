import React, { useState } from 'react';

// --- Crypto Helpers (Unchanged Logic, better organization) ---
async function encryptData(data, password) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data))
    );
    const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    return JSON.stringify({
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
        data: bufferToBase64(encrypted)
    });
}

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
        return null; // Decryption failed
    }
}

// --- Icons (Lucide Style) ---
const Icons = {
    Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Unlock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Copy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
};

const SyncManager = ({ onClose }) => {
    const [mode, setMode] = useState('export'); // 'export' | 'import'
    const [password, setPassword] = useState('');
    const [exportData, setExportData] = useState('');
    const [importString, setImportString] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isCopied, setIsCopied] = useState(false);
    const [confirmedPrivacy, setConfirmedPrivacy] = useState(false);

    // --- Actions ---
    const handleExport = async () => {
        if (!password) { setStatus({ type: 'error', msg: 'Please set a pairing code first' }); return; }
        if (password.length < 6) { setStatus({ type: 'error', msg: 'Code too short (min 6 chars)' }); return; }
        if (!confirmedPrivacy) { setStatus({ type: 'error', msg: 'Please accept the privacy warning' }); return; }

        const data = {
            capsules: JSON.parse(localStorage.getItem('rc_capsules') || '[]'),
            goals: JSON.parse(localStorage.getItem('rc_goals') || '[]'),
            journey: JSON.parse(localStorage.getItem('rc_journey') || '[]'),
            voice: JSON.parse(localStorage.getItem('rc_voice_entries') || '[]'),
            settings: {
                music: localStorage.getItem('rc_bg_music_enabled'),
                notifications: localStorage.getItem('rc_notifications')
            }
        };

        try {
            setStatus({ type: 'loading', msg: 'Encrypting data...' });
            const encrypted = await encryptData(data, password);
            setExportData(encrypted);
            setStatus({ type: 'success', msg: 'Ready to share!' });
        } catch (e) {
            setStatus({ type: 'error', msg: 'Encryption failed' });
        }
    };

    const handleImport = async () => {
        if (!password || !importString) { setStatus({ type: 'error', msg: 'Missing code or data block' }); return; }

        try {
            setStatus({ type: 'loading', msg: 'Decrypting & verifying...' });
            const data = await decryptData(importString, password);

            if (data) {
                if (!window.confirm("⚠️ OVERWRITE WARNING:\nThis will replace your current app data with the imported backup.\n\nAre you sure?")) {
                    setStatus({ type: '', msg: '' });
                    return;
                }

                // Restore
                if (data.capsules) localStorage.setItem('rc_capsules', JSON.stringify(data.capsules));
                if (data.goals) localStorage.setItem('rc_goals', JSON.stringify(data.goals));
                if (data.journey) localStorage.setItem('rc_journey', JSON.stringify(data.journey));
                if (data.voice) localStorage.setItem('rc_voice_entries', JSON.stringify(data.voice));

                setStatus({ type: 'success', msg: 'Sync Complete! Restarting app...' });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setStatus({ type: 'error', msg: 'Wrong password or corrupt data' });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Import failed' });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(exportData);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Deep Night
            zIndex: 3000, overflowY: 'auto', padding: '20px',
            color: 'white', fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Atmosphere */}
            <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Close Button */}
            <button onClick={onClose} style={{
                position: 'fixed', top: '20px', right: '20px',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 3001, backdropFilter: 'blur(10px)'
            }}>✕</button>

            <div style={{ maxWidth: '500px', margin: '40px auto 0', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '60px', height: '60px', margin: '0 auto 20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
                    }}>
                        <Icons.Lock />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: 'white' }}>Secure Sync</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Transfer your timeline between devices.</p>
                </div>

                {/* Main Glass Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '30px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '30px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    {/* Toggle Switch */}
                    <div style={{
                        display: 'flex', background: 'rgba(0,0,0,0.3)',
                        padding: '4px', borderRadius: '16px', marginBottom: '30px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <button
                            onClick={() => setMode('export')}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: mode === 'export' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: mode === 'export' ? 'white' : '#94a3b8',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Icons.Upload /> Send Data
                        </button>
                        <button
                            onClick={() => setMode('import')}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                background: mode === 'import' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: mode === 'import' ? 'white' : '#94a3b8',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Icons.Download /> Receive Data
                        </button>
                    </div>

                    {/* Common: Pairing Code */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Authentication Key (Required)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Create a secret key..."
                                style={{
                                    width: '100%', padding: '16px', paddingLeft: '45px',
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px', color: 'white', fontSize: '1rem', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Icons.Lock />
                            </div>
                        </div>
                    </div>

                    {/* Mode Content */}
                    {mode === 'export' ? (
                        <div className="fade-in">
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                borderRadius: '16px', padding: '15px', marginBottom: '25px'
                            }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#fbbf24', marginTop: '3px' }}><Icons.Alert /></span>
                                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', lineHeight: 1.5 }}>
                                        <strong>Privacy Check:</strong> This creates an encrypted file of your relationship data. Only share this with your partner.
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', marginTop: '15px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={confirmedPrivacy}
                                        onChange={e => setConfirmedPrivacy(e.target.checked)}
                                        style={{ accentColor: '#fbbf24', width: '16px', height: '16px', marginRight: '10px' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>I understand, generate the key.</span>
                                </label>
                            </div>

                            {!exportData ? (
                                <button
                                    onClick={handleExport}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '20px',
                                        background: confirmedPrivacy ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.05)',
                                        color: confirmedPrivacy ? 'white' : '#64748b',
                                        border: 'none', fontWeight: 'bold', fontSize: '1rem',
                                        cursor: confirmedPrivacy ? 'pointer' : 'not-allowed',
                                        opacity: confirmedPrivacy ? 1 : 0.7,
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Generate Secure Data
                                </button>
                            ) : (
                                <div className="fade-in">
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px',
                                        marginBottom: '15px', wordBreak: 'break-all', fontFamily: 'monospace',
                                        fontSize: '0.8rem', color: '#94a3b8', maxHeight: '100px', overflowY: 'auto',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {exportData}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        style={{
                                            width: '100%', padding: '16px', borderRadius: '20px',
                                            background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                            color: isCopied ? '#34d399' : 'white',
                                            border: isCopied ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isCopied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy Encrypted Data</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="fade-in">
                            <textarea
                                placeholder="Paste the encrypted code here..."
                                value={importString}
                                onChange={e => setImportString(e.target.value)}
                                style={{
                                    width: '100%', height: '140px', padding: '16px',
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px', color: 'white', fontSize: '0.9rem', outline: 'none',
                                    fontFamily: 'monospace', resize: 'none', marginBottom: '20px'
                                }}
                            />
                            <button
                                onClick={handleImport}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem',
                                    cursor: 'pointer', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Icons.Unlock /> Decrypt & Restore
                            </button>
                        </div>
                    )}

                    {/* Status Message */}
                    {status.msg && (
                        <div style={{
                            marginTop: '20px', textAlign: 'center', padding: '10px',
                            background: status.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            border: `1px solid ${status.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                            borderRadius: '12px', fontSize: '0.9rem',
                            color: status.type === 'error' ? '#f87171' : '#34d399'
                        }}>
                            {status.msg}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SyncManager;
