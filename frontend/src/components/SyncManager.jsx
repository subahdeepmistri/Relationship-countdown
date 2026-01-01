import React, { useState, useMemo } from 'react';

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

// --- Password Strength Helper ---
const getPasswordStrength = (pwd) => {
    if (!pwd || pwd.length < 6) return { level: 0, label: 'Too short', color: '#ef4444', width: '15%' };
    if (pwd.length < 8) return { level: 1, label: 'Weak', color: '#f97316', width: '35%' };
    if (pwd.length < 12) return { level: 2, label: 'Medium', color: '#eab308', width: '65%' };
    return { level: 3, label: 'Strong', color: '#10b981', width: '100%' };
};

// --- Icons (Lucide Style) ---
const Icons = {
    Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Unlock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Copy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    EyeOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
    Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    FileDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>,
    HelpCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    Chevron: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
};

const SyncManager = ({ onClose }) => {
    const [mode, setMode] = useState('export'); // 'export' | 'import'
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [exportData, setExportData] = useState('');
    const [importString, setImportString] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isCopied, setIsCopied] = useState(false);
    const [confirmedPrivacy, setConfirmedPrivacy] = useState(false);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const [pendingImportData, setPendingImportData] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    // Password strength (memoized)
    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

    // Data summary for preview
    const dataSummary = useMemo(() => ({
        capsules: JSON.parse(localStorage.getItem('rc_capsules') || '[]').length,
        goals: JSON.parse(localStorage.getItem('rc_goals') || '[]').length,
        memories: JSON.parse(localStorage.getItem('rc_journey') || '[]').length,
        voice: JSON.parse(localStorage.getItem('rc_voice_entries') || '[]').length
    }), []);

    // --- Actions ---
    const handleExport = async () => {
        if (!password) { setStatus({ type: 'error', msg: 'Please set a sync password first' }); return; }
        if (password.length < 6) { setStatus({ type: 'error', msg: 'Password too short (min 6 characters)' }); return; }
        if (!confirmedPrivacy) { setStatus({ type: 'error', msg: 'Please accept the privacy warning' }); return; }

        const data = {
            capsules: JSON.parse(localStorage.getItem('rc_capsules') || '[]'),
            goals: JSON.parse(localStorage.getItem('rc_goals') || '[]'),
            journey: JSON.parse(localStorage.getItem('rc_journey') || '[]'),
            voice: JSON.parse(localStorage.getItem('rc_voice_entries') || '[]'),
            settings: {
                music: localStorage.getItem('rc_bg_music_enabled'),
                notifications: localStorage.getItem('rc_notifications')
            },
            exportedAt: new Date().toISOString()
        };

        try {
            setStatus({ type: 'loading', msg: 'Encrypting with AES-256...' });
            const encrypted = await encryptData(data, password);
            setExportData(encrypted);
            setStatus({ type: 'success', msg: 'Encrypted successfully! Copy or download below.' });
        } catch (e) {
            setStatus({ type: 'error', msg: 'Encryption failed' });
        }
    };

    const handleImport = async () => {
        if (!password || !importString) { setStatus({ type: 'error', msg: 'Missing password or data block' }); return; }

        try {
            setStatus({ type: 'loading', msg: 'Decrypting & verifying...' });
            const data = await decryptData(importString, password);

            if (data) {
                // Store pending data and show confirmation modal
                setPendingImportData(data);
                setShowOverwriteModal(true);
                setStatus({ type: '', msg: '' });
            } else {
                setStatus({ type: 'error', msg: 'Wrong password or corrupt data' });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Import failed - invalid data format' });
        }
    };

    const confirmImport = () => {
        if (pendingImportData) {
            // Restore data
            if (pendingImportData.capsules) localStorage.setItem('rc_capsules', JSON.stringify(pendingImportData.capsules));
            if (pendingImportData.goals) localStorage.setItem('rc_goals', JSON.stringify(pendingImportData.goals));
            if (pendingImportData.journey) localStorage.setItem('rc_journey', JSON.stringify(pendingImportData.journey));
            if (pendingImportData.voice) localStorage.setItem('rc_voice_entries', JSON.stringify(pendingImportData.voice));

            setShowOverwriteModal(false);
            setStatus({ type: 'success', msg: 'Sync Complete! Restarting app...' });
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const cancelImport = () => {
        setShowOverwriteModal(false);
        setPendingImportData(null);
        setStatus({ type: '', msg: '' });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(exportData);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleDownload = () => {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relationship-backup-${new Date().toISOString().split('T')[0]}.rcbackup`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus({ type: 'success', msg: 'File downloaded!' });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            zIndex: 3000, overflowY: 'auto', padding: '20px 20px 140px 20px',
            color: 'white', fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Atmosphere */}
            <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Overwrite Confirmation Modal */}
            {showOverwriteModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    zIndex: 3010, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)', padding: '30px', borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '380px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', margin: '0 auto 20px',
                            background: 'rgba(239, 68, 68, 0.15)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '2rem' }}>⚡</span>
                        </div>
                        <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: '700' }}>
                            Replace All Data?
                        </h3>
                        <p style={{ color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            This will <strong style={{ color: '#fca5a5' }}>permanently overwrite</strong> all your current app data with the imported backup.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                            <button onClick={confirmImport} style={{
                                padding: '14px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}>Yes, Replace Everything</button>
                            <button onClick={cancelImport} style={{
                                padding: '14px', background: 'rgba(255,255,255,0.05)', color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Button */}
            <button
                onClick={onClose}
                aria-label="Close Secure Sync"
                style={{
                    position: 'fixed', top: '20px', right: '20px',
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 3001, backdropFilter: 'blur(10px)',
                    fontSize: '1.2rem', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >✕</button>

            <div style={{ maxWidth: '500px', margin: '40px auto 0', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '64px', height: '64px', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
                    }}>
                        <Icons.Lock />
                    </div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>Secure Sync</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '14px' }}>Transfer your relationship data between devices.</p>

                    {/* Security Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px',
                        background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                        <Icons.Shield />
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>AES-256-GCM Encrypted</span>
                    </div>
                </div>

                {/* Data Preview Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                    padding: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', fontWeight: '500' }}>
                        Your Data Summary
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                            <span>💊</span> {dataSummary.capsules} Capsules
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                            <span>🎯</span> {dataSummary.goals} Goals
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                            <span>💭</span> {dataSummary.memories} Memories
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                            <span>🎧</span> {dataSummary.voice} Voice Notes
                        </div>
                    </div>
                </div>

                {/* Collapsible Help Section */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', overflow: 'hidden'
                }}>
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        style={{
                            width: '100%', padding: '14px 16px', background: 'transparent',
                            border: 'none', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between', color: 'white'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icons.HelpCircle />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>How does Secure Sync work?</span>
                        </div>
                        <div style={{
                            transform: showHelp ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s ease'
                        }}>
                            <Icons.Chevron />
                        </div>
                    </button>
                    {showHelp && (
                        <div style={{ padding: '0 16px 16px 16px', animation: 'slideDown 0.3s ease' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#e2e8f0' }}>📤 To Export:</strong>
                                    <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                                        <li>Create a password (both devices need same password)</li>
                                        <li>Accept the privacy warning</li>
                                        <li>Click "Encrypt & Export", then copy or save</li>
                                    </ol>
                                </div>
                                <div>
                                    <strong style={{ color: '#e2e8f0' }}>📥 To Import:</strong>
                                    <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                                        <li>Paste the encrypted data</li>
                                        <li>Enter the same password</li>
                                        <li>Click "Decrypt & Restore"</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
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

                    {/* Sync Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Sync Password <span style={{ color: '#64748b', fontWeight: '400' }}>(min 6 characters)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Create a secure password..."
                                style={{
                                    width: '100%', padding: '14px', paddingLeft: '45px', paddingRight: '50px',
                                    background: 'rgba(0,0,0,0.2)', border: `1px solid ${password.length > 0 ? passwordStrength.color + '40' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '14px', color: 'white', fontSize: '1rem', outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Icons.Lock />
                            </div>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                style={{
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b',
                                    padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{
                                    height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%', width: passwordStrength.width,
                                        background: passwordStrength.color,
                                        transition: 'all 0.3s ease', borderRadius: '2px'
                                    }} />
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginTop: '6px', fontSize: '0.75rem'
                                }}>
                                    <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                    <span style={{ color: '#64748b' }}>{password.length} characters</span>
                                </div>
                            </div>
                        )}
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
                                    disabled={!confirmedPrivacy || password.length < 6}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '16px',
                                        background: confirmedPrivacy && password.length >= 6 ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.05)',
                                        color: confirmedPrivacy && password.length >= 6 ? 'white' : '#64748b',
                                        border: 'none', fontWeight: 'bold', fontSize: '1rem',
                                        cursor: confirmedPrivacy && password.length >= 6 ? 'pointer' : 'not-allowed',
                                        opacity: confirmedPrivacy && password.length >= 6 ? 1 : 0.6,
                                        transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Icons.Lock /> Encrypt & Export
                                </button>
                            ) : (
                                <div className="fade-in">
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px',
                                        marginBottom: '12px', wordBreak: 'break-all', fontFamily: 'monospace',
                                        fontSize: '0.75rem', color: '#94a3b8', maxHeight: '80px', overflowY: 'auto',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                        {exportData}
                                    </div>

                                    {/* Copy and Download buttons */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={handleCopy}
                                            style={{
                                                flex: 1, padding: '14px', borderRadius: '12px',
                                                background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                                                color: isCopied ? '#34d399' : 'white',
                                                border: isCopied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                                fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {isCopied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy</>}
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            style={{
                                                flex: 1, padding: '14px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                                                color: 'white',
                                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                                fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Icons.FileDown /> Save File
                                        </button>
                                    </div>
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
