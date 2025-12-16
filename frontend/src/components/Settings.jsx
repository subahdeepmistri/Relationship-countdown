import React, { useState, useEffect } from 'react';
import '../styles/theme.css';
import SecurityLock from './SecurityLock';

const Settings = ({ isOpen, onClose, onSave, onEditPhotos }) => {
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockModalMode, setLockModalMode] = useState('setup');

    // Restore missing states
    const [enableNotifications, setEnableNotifications] = useState(false);
    const [enableAI, setEnableAI] = useState(false);
    const [apiKey, setApiKey] = useState('');

    // Load settings on mount
    useEffect(() => {
        setEnableNotifications(localStorage.getItem('rc_notifications') === 'true');
        setEnableAI(localStorage.getItem('rc_ai_enabled') === 'true');
        setApiKey(localStorage.getItem('rc_ai_key') || '');
        setAppLockEnabled(localStorage.getItem('rc_lock_enabled') === 'true');
    }, [isOpen]);

    const handleLockToggle = () => {
        if (!appLockEnabled) {
            // Enable -> Setup
            setLockModalMode('setup');
            setShowLockModal(true);
        } else {
            // Disable -> Verify first
            setLockModalMode('verify');
            setShowLockModal(true);
        }
    };

    const handleLockSuccess = () => {
        if (lockModalMode === 'setup') {
            // Setup complete -> Enabled
            setAppLockEnabled(true);
            // localStorage set by SecurityLock component internally for PIN
            // But we ensure the flag is set
            localStorage.setItem('rc_lock_enabled', 'true');
        } else {
            // Verify complete -> Disable
            setAppLockEnabled(false);
            localStorage.setItem('rc_lock_enabled', 'false');
        }
        setShowLockModal(false);
    };

    const handleSave = () => {
        localStorage.setItem('rc_notifications', enableNotifications);
        localStorage.setItem('rc_ai_enabled', enableAI);
        localStorage.setItem('rc_ai_key', apiKey);
        // Lock enabled state is saved immediately upon success of the modal flow

        // Trigger notification permission if enabled
        if (enableNotifications && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        onSave && onSave();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'var(--bg-gradient)', /* Theme Gradient */
            display: 'flex',
            flexDirection: 'column',
            zIndex: 4000,
            overflowY: 'auto',
            padding: '20px',
            color: 'var(--text-primary)'
        }}>
            {showLockModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000 }}>
                    <SecurityLock
                        initialMode={lockModalMode}
                        onSuccess={handleLockSuccess}
                        onCancel={() => setShowLockModal(false)}
                    />
                </div>
            )}

            <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%', paddingTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Settings</h2>
                    <button onClick={onClose} style={{
                        fontSize: '1.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}>✕</button>
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--shape-radius)', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>Customization</h3>

                    {/* Edit Profile Button */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={onEditPhotos}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                color: '#333',
                                fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            📷 Edit Profile Photos
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', cursor: 'pointer', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>🔒 App Lock</span>
                        <div
                            onClick={handleLockToggle}
                            style={{
                                position: 'relative', width: '50px', height: '28px',
                                background: appLockEnabled ? 'var(--accent-color)' : '#ccc',
                                borderRadius: '15px', transition: 'background 0.3s', cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: '2px', left: appLockEnabled ? '24px' : '2px',
                                width: '24px', height: '24px', background: 'white', borderRadius: '50%',
                                transition: 'all 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', cursor: 'pointer', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>🔔 Anniversary Reminders</span>
                        <input
                            type="checkbox"
                            checked={enableNotifications}
                            onChange={(e) => setEnableNotifications(e.target.checked)}
                            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent-color)' }}
                        />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>✨ AI Love Messages</span>
                        <input
                            type="checkbox"
                            checked={enableAI}
                            onChange={(e) => setEnableAI(e.target.checked)}
                            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent-color)' }}
                        />
                    </label>

                    {enableAI && (
                        <div style={{ marginTop: '15px', background: '#FAFAFA', padding: '15px', borderRadius: '10px' }}>
                            <input
                                type="password"
                                placeholder="Enter OpenAI API Key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    marginBottom: '5px',
                                    fontSize: '1rem'
                                }}
                            />
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>
                                Key is stored locally on your device.
                            </p>
                        </div>
                    )}
                </div>

                <LongDistanceSettings
                    onSave={(data) => {
                        localStorage.setItem('rc_ld_enabled', data.enabled);
                        localStorage.setItem('rc_ld_offset', data.offset);
                        localStorage.setItem('rc_ld_meet', data.meet);
                    }}
                />

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '15px 50px',
                            background: 'var(--accent-color)',
                            color: 'white',
                            borderRadius: '30px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 5px 15px rgba(255, 112, 67, 0.3)'
                        }}
                    >
                        Save Changes
                    </button>
                    <button onClick={onClose} style={{ display: 'block', width: '100%', padding: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', marginTop: '10px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;

const LongDistanceSettings = ({ onSave }) => {
    const [enabled, setEnabled] = useState(false);
    const [offset, setOffset] = useState('');
    const [meet, setMeet] = useState('');

    useEffect(() => {
        setEnabled(localStorage.getItem('rc_ld_enabled') === 'true');
        setOffset(localStorage.getItem('rc_ld_offset') || '');
        setMeet(localStorage.getItem('rc_ld_meet') || '');
    }, []);

    // Pass changes up on render/change - simplified for this modal structure
    useEffect(() => {
        onSave({ enabled, offset, meet });
    }, [enabled, offset, meet, onSave]);

    return (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--shape-radius)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>✈️ Long Distance</span>
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    style={{ transform: 'scale(1.5)', accentColor: 'var(--accent-color)' }}
                />
            </label>

            {enabled && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', color: 'var(--text-primary)' }}>
                        Partner Timezone Offset (Hrs):
                        <input
                            type="number"
                            placeholder="-5"
                            value={offset}
                            onChange={(e) => setOffset(e.target.value)}
                            style={{ width: '80px', flex: '1', minWidth: '60px', marginLeft: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </label>
                    <label style={{ display: 'block', color: 'var(--text-primary)' }}>
                        Next Meeting Date:
                        <input
                            type="date"
                            value={meet}
                            onChange={(e) => setMeet(e.target.value)}
                            style={{ display: 'block', width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'sans-serif' }}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};
