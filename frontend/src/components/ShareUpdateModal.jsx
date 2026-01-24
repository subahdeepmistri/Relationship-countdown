import React, { useState } from 'react';
import LZString from 'lz-string';
import { useRelationship } from '../context/RelationshipContext';

const ShareUpdateModal = ({ onClose }) => {
    const { relationship, settings } = useRelationship();
    const [generatedLink, setGeneratedLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // Filter out heavy or local-only data if needed
    // For now, we sync the core relationship and settings
    const generateLink = () => {
        const payload = {
            r: relationship,
            s: settings,
            t: Date.now()
        };

        try {
            const json = JSON.stringify(payload);
            const compressed = LZString.compressToEncodedURIComponent(json);
            const url = `${window.location.origin}${window.location.pathname}?sync=${compressed}`;
            setGeneratedLink(url);
        } catch (err) {
            console.error("Failed to generate link:", err);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 5000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '30px',
                width: '100%', maxWidth: '450px',
                color: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔗</div>
                    <h2 style={{ margin: 0, marginBottom: '8px' }}>Sync with Partner</h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Since we don't use a server, you can create a <strong>Magic Link</strong> containing your latest updates.
                    </p>
                </div>

                {!generatedLink ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                            Send this link to your partner. When they open it, their app will update to match yours!
                        </p>
                        <button
                            onClick={generateLink}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                                transition: 'transform 0.2s',
                                width: '100%'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            ✨ Create Magic Link
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '15px',
                            wordBreak: 'break-all',
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            maxHeight: '100px',
                            overflowY: 'auto',
                            fontFamily: 'monospace'
                        }}>
                            {generatedLink}
                        </div>

                        <button
                            onClick={copyToClipboard}
                            style={{
                                background: isCopied ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '14px',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'background 0.3s'
                            }}
                        >
                            {isCopied ? '✓ Copied!' : '📋 Copy Link'}
                        </button>

                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>
                            ⚠️ Note: Photos are not synced via link due to size limits.
                        </p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        width: '100%',
                        padding: '10px'
                    }}
                >
                    Close
                </button>
            </div>
            <style>{`
                .fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ShareUpdateModal;
