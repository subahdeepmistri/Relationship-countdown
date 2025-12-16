import React, { useState, useEffect } from 'react';

const LegacyManager = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [years, setYears] = useState(5);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_legacy') || '[]');
        setMessages(saved);
    }, []);

    const saveMessage = () => {
        if (!text) return;
        const unlockDate = new Date();
        unlockDate.setFullYear(unlockDate.getFullYear() + years);

        const newItem = {
            id: Date.now(),
            text,
            unlockDate: unlockDate.getTime(),
            createdAt: Date.now()
        };

        const updated = [...messages, newItem];
        setMessages(updated);
        localStorage.setItem('rc_legacy', JSON.stringify(updated));
        setText('');
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
                cursor: 'pointer'
            }}>✕</button>

            <h2 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '10px' }}>Legacy Mode 🏛️</h2>
            <p style={{ opacity: 0.7, marginBottom: '50px' }}>Messages for the far future.</p>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write a message to yourselves in 5 or 10 years..."
                    style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
                    <button onClick={() => setYears(5)} style={{ padding: '10px 20px', borderRadius: '20px', background: years === 5 ? 'white' : 'rgba(255,255,255,0.1)', color: years === 5 ? 'black' : 'white' }}>+5 Years</button>
                    <button onClick={() => setYears(10)} style={{ padding: '10px 20px', borderRadius: '20px', background: years === 10 ? 'white' : 'rgba(255,255,255,0.1)', color: years === 10 ? 'black' : 'white' }}>+10 Years</button>
                </div>

                <button onClick={saveMessage} style={{ padding: '15px 40px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px' }}>Encrypt & Seal</button>

                <div style={{ marginTop: '50px', textAlign: 'left' }}>
                    <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Sealed Legacies</h4>
                    {messages.map(m => (
                        <div key={m.id} style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', marginTop: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div>🔒 Sealed until {new Date(m.unlockDate).getFullYear()}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Created: {new Date(m.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LegacyManager;
