import React, { useState } from 'react';
import '../styles/LegacyMode.css';
import { useLegacyMessages } from '../hooks/useDataHooks';

const LegacyCapsule = ({ onClose }) => {
    // Use centralized hook instead of direct localStorage
    const {
        messages,
        loading,
        error,
        sealMessage,
        deleteMessage,
        clearAll,
        clearError
    } = useLegacyMessages();

    const [text, setText] = useState('');
    const [years, setYears] = useState(5);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const handleSealClick = () => {
        if (!text.trim()) return;
        setShowConfirm(true);
    };

    const confirmSeal = () => {
        const result = sealMessage(text, years);

        if (result.success) {
            setText('');
            setShowConfirm(false);
        } else {
            alert(error || "Could not save message. Storage might be full.");
            clearError();
        }
    };

    const deleteItem = (id) => {
        if (window.confirm('Delete this legacy message permanently?')) {
            deleteMessage(id);
        }
    };

    // Emergency Reset Feature
    const handleHardReset = () => {
        if (window.confirm("⚠️ SYSTEM RESET: This will delete ALL legacy messages and fix any glitches. Are you sure?")) {
            clearAll();
            alert("System reset complete. Data cleared.");
        }
    };

    return (
        <div className="legacy-overlay">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="legacy-close-btn"
                title="Close"
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                ✕
            </button>

            {/* Header */}
            <h2 className="legacy-title">Legacy Capsule ✨</h2>
            <p className="legacy-subtitle">A message for your future selves.</p>

            <div className="legacy-container">
                {/* Trust & Privacy Section */}
                <div
                    className="legacy-privacy-box"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                    role="button"
                    aria-expanded={showPrivacy}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setShowPrivacy(!showPrivacy);
                        }
                    }}
                >
                    <div className="privacy-header">
                        <span>🔐 Secure & Private</span>
                        <span style={{
                            transition: 'transform 0.2s',
                            transform: showPrivacy ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 0.5
                        }}>▼</span>
                    </div>
                    {showPrivacy && (
                        <div className="privacy-content">
                            Your heartfelt messages are stored securely on this device alone.
                            They remain encrypted until the date you choose —
                            a digital time capsule for your future journey together.
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <textarea
                    className="legacy-textarea"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write something meaningful for the future..."
                    aria-label="Legacy message input"
                />

                {/* Time Selection */}
                <div className="legacy-years-group">
                    {[1, 5, 10, 20].map((option) => (
                        <button
                            key={option}
                            onClick={() => setYears(option)}
                            className={`legacy-year-btn ${years === option ? 'active' : ''}`}
                            aria-pressed={years === option}
                        >
                            +{option} Years
                        </button>
                    ))}
                </div>

                {/* Confirm / Action Buttons */}
                <div style={{
                    minHeight: '100px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {showConfirm ? (
                        <div className="confirm-box">
                            <p style={{
                                fontWeight: '600',
                                marginBottom: '8px',
                                color: 'white',
                                fontSize: '1.1rem'
                            }}>
                                🔒 Seal this message?
                            </p>
                            <p style={{
                                color: '#94a3b8',
                                marginBottom: '20px',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                It will be locked until <strong style={{ color: '#fda4af' }}>{new Date().getFullYear() + years}</strong>
                            </p>
                            <div className="confirm-actions">
                                <button onClick={confirmSeal} className="btn-confirm-yes">
                                    Yes, Seal It
                                </button>
                                <button onClick={() => setShowConfirm(false)} className="btn-confirm-cancel">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleSealClick}
                            className={`legacy-seal-btn ${!text.trim() ? 'disabled' : ''}`}
                            disabled={!text.trim()}
                        >
                            <span>🔐</span> Encrypt & Seal
                        </button>
                    )}
                </div>

                {/* List of Sealed Messages */}
                <div className="sealed-section">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h4 className="sealed-heading" style={{ margin: 0 }}>
                            Sealed Messages ({messages.length})
                        </h4>
                        {messages.length > 0 && (
                            <button
                                onClick={handleHardReset}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(239, 68, 68, 0.7)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    padding: '6px 10px',
                                    borderRadius: '8px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = '#ef4444';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)';
                                    e.currentTarget.style.background = 'none';
                                }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {messages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '20px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px', opacity: 0.6 }}>💌</div>
                            <p style={{
                                color: '#64748b',
                                fontStyle: 'italic',
                                margin: 0,
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}>
                                Your time capsule is waiting.<br />
                                Write your first message to the future.
                            </p>
                        </div>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} className="sealed-item">
                                <div className="sealed-info">
                                    <div className="lock-date">
                                        🔒 Opens in {new Date(m.unlockDate).getFullYear()}
                                    </div>
                                    <div className="created-date">
                                        Sealed on {new Date(m.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteItem(m.id)}
                                    className="delete-btn"
                                    title="Delete Message"
                                    aria-label="Delete this sealed message"
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
