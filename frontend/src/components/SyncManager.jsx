import React, { useState } from 'react';

// Simple encryption/decryption helper using web crypto for manual syncing
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

    // Pack as JSON
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
        return null;
    }
}

const SyncManager = ({ onClose }) => {
    const [mode, setMode] = useState('export'); // 'export' or 'import'
    const [password, setPassword] = useState('');
    const [exportData, setExportData] = useState('');
    const [importString, setImportString] = useState('');
    const [status, setStatus] = useState('');
    const [copyBtnText, setCopyBtnText] = useState('📋 Copy to Clipboard');
    const [confirmedPrivacy, setConfirmedPrivacy] = useState(false);

    const handleImport = async () => {
        if (!password || !importString) { setStatus('Missing code or data.'); return; }

        try {
            setStatus('Decrypting...');
            const data = await decryptData(importString, password);

            if (data) {
                // Confirm Overwrite
                if (!window.confirm("⚠️ WARNING: This will overwrite your current relationship data (memories, timeline, voice notes) with the imported data. Are you sure?")) {
                    setStatus('Import cancelled.');
                    return;
                }

                // Merge/Overwrite Logic
                if (data.capsules) localStorage.setItem('rc_capsules', JSON.stringify(data.capsules));
                if (data.goals) localStorage.setItem('rc_goals', JSON.stringify(data.goals));
                if (data.journey) localStorage.setItem('rc_journey', JSON.stringify(data.journey));
                if (data.voice) localStorage.setItem('rc_voice_entries', JSON.stringify(data.voice));

                // Settings optional merge?
                if (data.settings) {
                    // Maybe ask user? For now, we auto-merge essential settings
                }

                setStatus('Sync Complete! Reloading...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setStatus('Invalid Password or Data Integrity Check Failed.');
            }
        } catch (e) {
            setStatus('Import failed. Check your password.');
        }
    };

    const handleExport = async () => {
        if (!password) { setStatus('Enter a pairing code first.'); return; }
        if (password.length < 6) { setStatus('Code too short. Use at least 6 characters.'); return; }
        if (!confirmedPrivacy) { setStatus('Please confirm you understand the privacy warning.'); return; }

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
            setStatus('Encrypting your relationship data...');
            const encrypted = await encryptData(data, password);
            setExportData(encrypted);
            setStatus('Ready to share. Copy the code below.');
        } catch (e) {
            setStatus('Encryption failed.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(exportData);
        setCopyBtnText('✅ Copied!');
        setTimeout(() => setCopyBtnText('📋 Copy to Clipboard'), 2000);
        setStatus('Copied to clipboard! Send this to your partner securely.');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'var(--bg-gradient)',
            zIndex: 3000,
            overflowY: 'auto',
            padding: '40px 20px',
            color: 'var(--text-primary)'
        }}>
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    fontSize: '1.5rem',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.5)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    zIndex: 3001
                }}
            >✕</button>

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '10px' }}>
                    Secure Sync 🔄
                </h2>
                <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '40px' }}>
                    Sync your love story securely between devices.
                </p>

                {/* Glass Card Container */}
                <div className="pop-card" style={{ padding: '0', overflow: 'hidden', background: '#FFFFFF' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <button
                            onClick={() => setMode('export')}
                            style={{
                                flex: 1,
                                padding: '20px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                background: mode === 'export' ? 'var(--accent-color)' : 'transparent',
                                color: mode === 'export' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            📤 Send Data
                        </button>
                        <button
                            onClick={() => setMode('import')}
                            style={{
                                flex: 1,
                                padding: '20px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                background: mode === 'import' ? 'var(--accent-color)' : 'transparent',
                                color: mode === 'import' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            📥 Receive Data
                        </button>
                    </div>

                    <div style={{ padding: '30px' }}>

                        {/* Common Password Field */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                                🔑 Pairing Code (Must match on both devices)
                            </label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a secret code (e.g., love123)"
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    background: '#F5F5F5',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {mode === 'export' ? (
                            <div className="fade-in">
                                <div style={{ background: '#FFF3CD', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                                        <strong>⚠️ Privacy Warning:</strong> This will export a snapshot of your timeline, messages, and voice notes.
                                        The file is encrypted, but you should only share the output code with your partner securely (e.g. Signal, in-person).
                                    </p>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={confirmedPrivacy}
                                        onChange={e => setConfirmedPrivacy(e.target.checked)}
                                        style={{ marginRight: '10px', width: '20px', height: '20px' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: '#333' }}>I understand and want to generate the sync code.</span>
                                </label>

                                <button
                                    onClick={handleExport}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: confirmedPrivacy ? 'black' : '#ccc',
                                        color: 'white',
                                        borderRadius: '30px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        marginBottom: '20px',
                                        border: 'none',
                                        cursor: confirmedPrivacy ? 'pointer' : 'not-allowed',
                                        transition: 'background 0.3s'
                                    }}
                                    disabled={!confirmedPrivacy}
                                >
                                    Generate Encrypted Data
                                </button>

                                {exportData && (
                                    <div style={{ background: '#F5F5F5', padding: '15px', borderRadius: '10px', wordBreak: 'break-all' }}>
                                        <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.7rem', color: '#888', marginBottom: '10px', fontFamily: 'monospace', padding: '10px', background: '#e0e0e0', borderRadius: '5px' }}>
                                            {exportData}
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            style={{
                                                width: '100%', padding: '10px',
                                                border: '2px solid var(--accent-color)',
                                                color: 'var(--accent-color)',
                                                background: 'transparent',
                                                borderRadius: '20px', fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {copyBtnText}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="fade-in">
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                                    Paste the encrypted text block from your partner's device here.
                                </p>
                                <textarea
                                    placeholder="Paste the encrypted code here..."
                                    value={importString}
                                    onChange={(e) => setImportString(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: '0.9rem',
                                        background: '#F5F5F5',
                                        marginBottom: '20px',
                                        fontFamily: 'monospace',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    onClick={handleImport}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'black',
                                        color: 'white',
                                        borderRadius: '30px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Decrypt & Restore Data
                                </button>

                            </div>
                        )}

                        {status && (
                            <div style={{
                                marginTop: '20px',
                                padding: '10px',
                                borderRadius: '8px',
                                background: status.includes('Invalid') || status.includes('failed') || status.includes('Missing') || status.includes('warning') ? '#FFEBEE' : '#E8F5E9',
                                color: status.includes('Invalid') || status.includes('failed') || status.includes('Missing') || status.includes('warning') ? '#D32F2F' : '#388E3C',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {status}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncManager;
