import React, { useState, useEffect } from 'react';
import '../styles/LegacyMode.css';

const LegacyCapsule = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [years, setYears] = useState(5);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [error, setError] = useState(null);

    // Robust Data Loading
    useEffect(() => {
        try {
            const raw = localStorage.getItem('rc_legacy');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                } else {
                    console.warn("LegacyCapsule: Corrupt data found. Resetting.");
                    setMessages([]);
                }
            }
        } catch (e) {
            console.error("LegacyCapsule: Load failed", e);
            setError("Failed to load existing messages.");
            setMessages([]);
        }
    }, []);

    const handleSealClick = () => {
        if (!text.trim()) return;
        setShowConfirm(true);
    };

    const confirmSeal = () => {
        try {
            const unlockDate = new Date();
            unlockDate.setFullYear(unlockDate.getFullYear() + years);

            const newItem = {
                id: Date.now(),
                text: text.trim(),
                unlockDate: unlockDate.getTime(),
                createdAt: Date.now()
            };

            const updated = [...messages, newItem];
            setMessages(updated);
            localStorage.setItem('rc_legacy', JSON.stringify(updated));
            setText('');
            setShowConfirm(false);
        } catch (e) {
            console.error("LegacyCapsule: Save failed", e);
            alert("Could not save message. Storage might be full.");
        }
    };

    const deleteItem = (id) => {
        if (window.confirm('Delete this legacy message permanently?')) {
            const updated = messages.filter(m => m.id !== id);
            setMessages(updated);
            localStorage.setItem('rc_legacy', JSON.stringify(updated));
        }
    };

    // Emergency Reset Feature
    const handleHardReset = () => {
        if (window.confirm("⚠️ SYSTEM RESET: This will delete ALL legacy messages and fix any glitches. Are you sure?")) {
            localStorage.removeItem('rc_legacy');
            setMessages([]);
            alert("System reset complete. Data cleared.");
        }
    };

    return (
        <div className="legacy-overlay">
            <button onClick={onClose} className="legacy-close-btn" title="Close">
                ✕
            </button>

            <h2 className="legacy-title">Legacy Capsule 🏛️</h2>
            <p className="legacy-subtitle">Send a message to the future.</p>

            <div className="legacy-container">
                {/* Privacy Toggle */}
                <div
                    className="legacy-privacy-box"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                >
                    <div className="privacy-header">
                        <span>🔒 Secure & Private</span>
                        <span>{showPrivacy ? '▼' : '▶'}</span>
                    </div>
                    {showPrivacy && (
                        <div className="privacy-content">
                            Your messages are stored locally on this device. They are locked until the date you choose. A digital time capsule for your future self.
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <textarea
                    className="legacy-textarea"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write something for the future..."
                    style={{ minHeight: '200px', resize: 'vertical' }}
                />

                {/* Time Selection */}
                <div className="legacy-years-group">
                    {[1, 5, 10, 20].map((option) => (
                        <button
                            key={option}
                            onClick={() => setYears(option)}
                            className={`legacy-year-btn ${years === option ? 'active' : ''}`}
                        >
                            +{option} Years
                        </button>
                    ))}
                </div>

                {/* Confirm / Action Buttons */}
                <div style={{ minHeight: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {showConfirm ? (
                        <div className="confirm-box">
                            <p style={{ fontWeight: 'bold', marginBottom: '15px', color: '#B91C1C' }}>
                                Lock this message until {new Date().getFullYear() + years}?
                            </p>
                            <div className="confirm-actions">
                                <button onClick={confirmSeal} className="btn-confirm-yes">Yes, Seal It</button>
                                <button onClick={() => setShowConfirm(false)} className="btn-confirm-cancel">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleSealClick}
                            className={`legacy-seal-btn ${!text.trim() ? 'disabled' : ''}`}
                            disabled={!text.trim()}
                        >
                            Encrypt & Seal
                        </button>
                    )}
                </div>

                {/* List of Sealed Messages */}
                <div className="sealed-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 className="sealed-heading" style={{ margin: 0 }}>Sealed Messages ({messages.length})</h4>
                        {messages.length > 0 && (
                            <button
                                onClick={handleHardReset}
                                style={{
                                    fontSize: '0.7rem', color: '#EF4444', background: 'none', border: 'none',
                                    textDecoration: 'underline', cursor: 'pointer', opacity: 0.7
                                }}
                            >
                                Reset Data
                            </button>
                        )}
                    </div>

                    {messages.length === 0 ? (
                        <div style={{ opacity: 0.6, fontStyle: 'italic', textAlign: 'center', padding: '30px', color: '#64748B' }}>
                            Your time capsule is empty.
                        </div>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} className="sealed-item">
                                <div className="sealed-info">
                                    <div className="lock-date">
                                        🔒 Opens {new Date(m.unlockDate).getFullYear()}
                                    </div>
                                    <div className="created-date">
                                        Sealed: {new Date(m.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteItem(m.id)}
                                    className="delete-btn"
                                    title="Delete Message"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegacyCapsule;
