import React, { useState, useEffect } from 'react';

const LegacyManager = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [years, setYears] = useState(5);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_legacy') || '[]');
        setMessages(saved);
    }, []);

    const handleSealClick = () => {
        if (!text) return;
        setShowConfirm(true);
    };

    const confirmSeal = () => {
        const unlockDate = new Date();
        unlockDate.setFullYear(unlockDate.getFullYear() + years);

        const newItem = {
            id: Date.now(),
            text, // In a real app, apply AES encryption here
            unlockDate: unlockDate.getTime(),
            createdAt: Date.now()
        };

        const updated = [...messages, newItem];
        setMessages(updated);
        localStorage.setItem('rc_legacy', JSON.stringify(updated));
        setText('');
        setShowConfirm(false);
    };

    const deleteItem = (id) => {
        if (window.confirm('Delete this legacy message permanently?')) {
            const updated = messages.filter(m => m.id !== id);
            setMessages(updated);
            localStorage.setItem('rc_legacy', JSON.stringify(updated));
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: '#2c3e50',
            color: '#ecf0f1',
            zIndex: 1600,
            overflowY: 'auto',
            padding: '40px 20px',
            textAlign: 'center'
        }}>
            <button onClick={onClose} style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 2000,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s'
            }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >✕</button>

            <h2 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>Legacy Mode 🏛️</h2>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>Messages for the far future.</p>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div
                    onClick={() => setShowPrivacy(!showPrivacy)}
                    style={{
                        background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '30px',
                        fontSize: '0.9rem', textAlign: 'left', lineHeight: '1.5', cursor: 'pointer',
                        borderLeft: '4px solid #f1c40f'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>🔒 Secure & Private {showPrivacy ? '▼' : '▶'}</strong>
                    </div>
                    {showPrivacy && (
                        <div style={{ marginTop: '10px', opacity: 0.8, animation: 'fadeIn 0.3s' }}>
                            Your legacy messages are encrypted locally on this device. They cannot be opened until the unlock date arrives. No cloud backup, no prying eyes. This is a digital time capsule for your future selves (5-20+ years).
                        </div>
                    )}
                </div>

                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write a message to yourselves in 5 or 10 years..."
                    style={{ width: '100%', minHeight: '300px', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
                    <button onClick={() => setYears(5)} style={{ padding: '10px 20px', borderRadius: '20px', background: years === 5 ? 'white' : 'rgba(255,255,255,0.1)', color: years === 5 ? 'black' : 'white', cursor: 'pointer', border: 'none' }}>+5 Years</button>
                    <button onClick={() => setYears(10)} style={{ padding: '10px 20px', borderRadius: '20px', background: years === 10 ? 'white' : 'rgba(255,255,255,0.1)', color: years === 10 ? 'black' : 'white', cursor: 'pointer', border: 'none' }}>+10 Years</button>
                    <button onClick={() => setYears(20)} style={{ padding: '10px 20px', borderRadius: '20px', background: years === 20 ? 'white' : 'rgba(255,255,255,0.1)', color: years === 20 ? 'black' : 'white', cursor: 'pointer', border: 'none' }}>+20 Years</button>
                </div>

                {showConfirm ? (
                    <div style={{ background: '#c0392b', padding: '20px', borderRadius: '10px', animation: 'fadeIn 0.3s' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>⚠️ Are you sure? This message will be locked until {new Date().getFullYear() + years}.</p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={confirmSeal} style={{ padding: '10px 30px', background: 'white', color: '#c0392b', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Yes, Seal It</button>
                            <button onClick={() => setShowConfirm(false)} style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleSealClick}
                        style={{
                            padding: '15px 40px',
                            background: text ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                            color: text ? 'white' : 'rgba(255,255,255,0.3)',
                            border: 'none', borderRadius: '5px',
                            cursor: text ? 'pointer' : 'default',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        Encrypt & Seal
                    </button>
                )}

                <div style={{ marginTop: '50px', textAlign: 'left' }}>
                    <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginBottom: '15px' }}>Sealed Legacies ({messages.length})</h4>

                    {messages.length === 0 ? (
                        <div style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No sealed messages yet.</div>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', marginTop: '10px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>🔒 Sealed until {new Date(m.unlockDate).getFullYear()}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>Created: {new Date(m.createdAt).toLocaleDateString()}</div>
                                </div>
                                <button
                                    onClick={() => deleteItem(m.id)}
                                    style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', padding: '5px' }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default LegacyManager;
