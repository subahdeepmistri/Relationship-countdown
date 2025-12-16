import React, { useState, useEffect, useRef } from 'react';
import { savePrivateItem, getPrivateItems, deletePrivateItem } from '../utils/db'; // Ensure this matches existing exports

// --- Security Core (AES-GCM) ---
// We derive a key from the PIN so that the PIN *is* the key.
// No PIN = No Key = No Data.
async function deriveKey(pin, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", enc.encode(pin), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
}

// Encrypts text or base64 data
async function encryptContent(content, pin) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);

    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, enc.encode(content)
    );

    // Pack everything: salt + iv + data
    return JSON.stringify({
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
    });
}

// Decrypts content
async function decryptContent(packedStr, pin) {
    try {
        const packed = JSON.parse(packedStr);
        const salt = new Uint8Array(packed.salt);
        const iv = new Uint8Array(packed.iv);
        const data = new Uint8Array(packed.data);

        const key = await deriveKey(pin, salt);
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv }, key, data
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // Decryption failed (Wrong PIN usually)
        return null;
    }
}


const PrivateSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSetup, setIsSetup] = useState(false);

    // Validating PIN against a known hash (for login check)
    // We store a separate hash just to verify "is this the right PIN?" quickly
    // without having to try decrypting a file.
    useEffect(() => {
        const storedHash = localStorage.getItem('rc_private_pin_hash');
        if (storedHash) setIsSetup(true);
    }, [isOpen]);

    const handleUnlock = async () => {
        if (!isSetup) {
            // First time setup
            if (pin.length !== 4) return;

            // 1. Save Hash for future Login checks
            const msgBuffer = new TextEncoder().encode(pin);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            localStorage.setItem('rc_private_pin_hash', hashHex);

            setIsSetup(true);
            setIsUnlocked(true);
        } else {
            // Login
            const storedHash = localStorage.getItem('rc_private_pin_hash');
            const msgBuffer = new TextEncoder().encode(pin);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hashHex === storedHash) {
                setIsUnlocked(true);
                setError('');
            } else {
                setError('Incorrect PIN');
                setPin('');
                // Vibrate for feedback
                if (navigator.vibrate) navigator.vibrate(200);
            }
        }
    };

    const handlePadClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => setPin(prev => prev.slice(0, -1));

    // Reset Logic (Nuclear option)
    const handleReset = () => {
        if (confirm("⚠️ RESET WARNING ⚠️\n\nIf you reset your PIN, all encrypted photos/notes will be lost FOREVER. They cannot be recovered without the old PIN.\n\nAre you sure completely?")) {
            localStorage.removeItem('rc_private_pin_hash');
            setPin('');
            setError('');
            setIsSetup(false);
            alert("Vault Reset. Previous data is now unreadable garbage.");
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: '120px', right: '30px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%',
                    width: '50px', height: '50px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)', cursor: 'pointer',
                    fontSize: '1.2rem', zIndex: 900
                }}
                title="Open Vault"
            >
                🔒
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(30, 30, 30, 0.95)', // Dark mode for vault
            backdropFilter: 'blur(20px)', zIndex: 5000,
            color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <button
                onClick={() => { setIsOpen(false); setPin(''); setIsUnlocked(false); }}
                style={{ position: 'absolute', top: 30, right: 30, fontSize: '1.5rem', color: 'white', opacity: 0.7 }}
            >
                ✕
            </button>

            {!isUnlocked ? (
                <div style={{ textAlign: 'center', width: '100%', maxWidth: '300px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</div>
                    <h3 style={{ marginBottom: '30px', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
                        {isSetup ? 'Enter Vault PIN' : 'Set Vault PIN'}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '15px', height: '15px', borderRadius: '50%',
                                background: i < pin.length ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.2s'
                            }} />
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button
                                key={n}
                                onClick={() => handlePadClick(n)}
                                style={{
                                    width: '70px', height: '70px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)', border: 'none',
                                    color: 'white', fontSize: '1.5rem', cursor: 'pointer',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                {n}
                            </button>
                        ))}
                        <div />
                        <button
                            onClick={() => handlePadClick(0)}
                            style={{
                                width: '70px', height: '70px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: 'white', fontSize: '1.5rem', cursor: 'pointer'
                            }}
                        >
                            0
                        </button>
                        <button onClick={handleDelete} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'white' }}>⌫</button>
                    </div>

                    <button
                        onClick={handleUnlock}
                        disabled={pin.length !== 4}
                        style={{
                            width: '100%', padding: '15px', borderRadius: '30px',
                            background: pin.length === 4 ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            color: pin.length === 4 ? 'white' : 'rgba(255,255,255,0.3)',
                            fontSize: '1.1rem', fontWeight: 'bold', border: 'none'
                        }}
                    >
                        {isSetup ? 'Unlock Vault' : 'Secure Vault'}
                    </button>

                    {error && <p style={{ color: '#ff6b6b', marginTop: '15px' }}>{error}</p>}

                    {isSetup && (
                        <button onClick={handleReset} style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.4, color: 'white', textDecoration: 'underline' }}>
                            Forgot PIN? Reset (Data Loss)
                        </button>
                    )}
                </div>
            ) : (
                <VaultContent pin={pin} onClose={() => { setIsUnlocked(false); setPin(''); setIsOpen(false); }} />
            )}
        </div>
    );
};

const VaultContent = ({ pin, onClose }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadVault();
    }, []);

    const loadVault = async () => {
        setLoading(true);
        try {
            const rawItems = await getPrivateItems(); // Returns { id, blob: encryptedJSOn }

            // Decrypt all items
            const decryptedItems = await Promise.all(rawItems.map(async (item) => {
                const json = await decryptContent(item.blob, pin); // item.blob is actually the stringified encrypted data
                return json ? { id: item.id, ...JSON.parse(json) } : null; // Expecting { type: 'image', src: 'base64...' }
            }));

            setItems(decryptedItems.filter(Boolean));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to Base64
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;
            const content = JSON.stringify({ type: 'image', src: base64, date: Date.now() });

            // Encrypt with PIN
            const encrypted = await encryptContent(content, pin);

            // Save to IDB
            await savePrivateItem(Date.now(), encrypted);
            loadVault(); // Reload
        };
        reader.readAsDataURL(file);
    };

    const deleteItem = async (id) => {
        if (confirm("Delete this permanently?")) {
            await deletePrivateItem(id);
            loadVault();
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', padding: '20px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>My Secret Vault 🗝️</h2>
                    <button onClick={onClose} style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 15px', borderRadius: '20px' }}>Lock</button>
                </div>

                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', marginBottom: '30px' }}>
                    <p style={{ opacity: 0.8, fontStyle: 'italic' }}>
                        "This space is encrypted with your PIN. Only you have the key."
                    </p>
                </div>

                {loading ? <p>Decrypting Vault...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {/* Add Button */}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                height: '200px', borderRadius: '15px', border: '2px dashed rgba(255,255,255,0.3)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', background: 'rgba(255,255,255,0.05)'
                            }}
                        >
                            <span style={{ fontSize: '2rem', marginBottom: '10px' }}>+</span>
                            <span>Add Photo</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAddPhoto} accept="image/*" style={{ display: 'none' }} />

                        {items.map(item => (
                            <div key={item.id} style={{ position: 'relative', height: '200px', borderRadius: '15px', overflow: 'hidden' }}>
                                <img src={item.src} alt="secret" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    style={{
                                        position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)',
                                        color: 'white', borderRadius: '50%', width: '30px', height: '30px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivateSection;
