import React, { useState } from 'react';

const NotificationSelection = ({ onComplete, onBack, profileImages }) => {
    const [showBadge, setShowBadge] = useState(true);
    const [notifStyle, setNotifStyle] = useState('photo'); // 'text', 'photo', 'hidden'

    const handleSave = async () => {
        // Logic: Request Permissions
        if (showBadge || notifStyle !== 'hidden') {
            if ('Notification' in window) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        new Notification("Setup Complete! 🥳", {
                            body: "You'll see notifications like this.",
                            icon: '/icon-192x192.png'
                        });

                        if (showBadge && 'setAppBadge' in navigator) {
                            navigator.setAppBadge(1);
                        }
                    }
                } catch (e) {
                    console.error("Notification permission error", e);
                }
            }
        }

        // Save Preferences
        localStorage.setItem('rc_notification_badge', showBadge);
        localStorage.setItem('rc_notification_style', notifStyle);

        onComplete();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: '#F5F5F7', // Slightly grey background like settings
            zIndex: 9000,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            color: '#333'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none',
                        fontSize: '1.5rem', cursor: 'pointer', color: '#555'
                    }}
                >
                    &lt;
                </button>
                <h2 style={{ fontSize: '1.2rem', color: '#555', fontWeight: 'normal', margin: 0 }}>
                    Show setting
                </h2>
            </div>

            <div style={{ padding: '20px', paddingBottom: '120px' }}>

                {/* Badge Section */}
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#889', marginBottom: '15px', fontSize: '0.9rem' }}>Show on icon badge.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
                        {/* Show Preview */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'white', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative', margin: '0 auto 10px'
                            }}>
                                <span style={{ fontSize: '2rem', color: '#FF8A80' }}>💖</span>
                                <div style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: '#FF3D00', color: 'white',
                                    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px'
                                }}>419</div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={showBadge}
                                    onChange={() => setShowBadge(true)}
                                    style={{ accentColor: '#FF4081' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: showBadge ? '#333' : '#888' }}>Show</span>
                            </label>
                        </div>

                        {/* Hide Preview */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'white', borderRadius: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative', margin: '0 auto 10px'
                            }}>
                                <span style={{ fontSize: '2rem', color: '#FF8A80' }}>💖</span>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={!showBadge}
                                    onChange={() => setShowBadge(false)}
                                    style={{ accentColor: '#FF4081' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: !showBadge ? '#333' : '#888' }}>Hide</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notification Styles */}
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ color: '#889', marginBottom: '15px', fontSize: '0.9rem' }}>Show in notification</p>

                    {/* Style 1: Text Only */}
                    <div onClick={() => setNotifStyle('text')} style={{
                        background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Been Together</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>Anniversary</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>2024-11-20(Wed)</div>
                        </div>
                        <div style={{ color: '#FF4081', fontWeight: 'bold' }}>D+250</div>
                        <input type="radio" checked={notifStyle === 'text'} readOnly style={{ accentColor: '#FF4081', transform: 'scale(1.2)' }} />
                    </div>

                    {/* Style 2: Photo */}
                    <div onClick={() => setNotifStyle('photo')} style={{
                        background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div>
                                <img
                                    src={profileImages.left || "https://img.icons8.com/doodle/96/boy.png"}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <img
                                    src={profileImages.right || "https://img.icons8.com/doodle/96/girl.png"}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginLeft: '-15px' }}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>Been Together</div>
                                <div style={{ fontSize: '0.9rem', color: '#333' }}>
                                    Been together <span style={{ color: '#FF4081' }}>250Days</span> Today
                                </div>
                            </div>
                        </div>
                        <input type="radio" checked={notifStyle === 'photo'} readOnly style={{ accentColor: '#FF4081', transform: 'scale(1.2)' }} />
                    </div>

                    {/* Style 3: Hidden */}
                    <div onClick={() => setNotifStyle('hidden')} style={{
                        background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer',
                        color: '#999', border: '1px dashed #ddd'
                    }}>
                        <span>🚫</span> Hidden
                        <input type="radio" checked={notifStyle === 'hidden'} readOnly style={{ accentColor: '#FF4081', transform: 'scale(1.2)', marginLeft: 'auto' }} />
                    </div>
                </div>

            </div>

            {/* Sticky Save Button */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, width: '100%',
                background: 'white',
                padding: '20px',
                borderTop: '1px solid #eee'
            }}>
                <button
                    onClick={handleSave}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: '#5C6BC0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default NotificationSelection;
