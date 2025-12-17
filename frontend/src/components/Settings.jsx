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

    // Phase 2: Personalization
    const [partner1, setPartner1] = useState('');
    const [partner2, setPartner2] = useState('');
    const [nickname, setNickname] = useState('');

    // Phase 3: Events
    const [events, setEvents] = useState([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventEmoji, setNewEventEmoji] = useState('📅');

    // Long Distance State (Lifted)
    const [ldEnabled, setLdEnabled] = useState(false);
    const [ldOffset, setLdOffset] = useState('');
    const [ldMeet, setLdMeet] = useState('');

    // Feedback State
    const [toastMsg, setToastMsg] = useState('');

    // Load settings on mount
    useEffect(() => {
        setEnableNotifications(localStorage.getItem('rc_notifications') === 'true');
        setEnableAI(localStorage.getItem('rc_ai_enabled') === 'true');
        setApiKey(localStorage.getItem('rc_ai_key') || '');
        setAppLockEnabled(localStorage.getItem('rc_lock_enabled') === 'true');

        // Load Names
        setPartner1(localStorage.getItem('rc_partner1') || '');
        setPartner2(localStorage.getItem('rc_partner2') || '');
        setNickname(localStorage.getItem('rc_nickname') || '');

        // Load Events
        const storedEvents = localStorage.getItem('rc_events');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        } else {
            const legacyDate = localStorage.getItem('rc_start_date');
            if (legacyDate) {
                setEvents([{ id: 'legacy', title: 'The Beginning', date: legacyDate, emoji: '❤️', isMain: true }]);
            }
        }

        // Load Long Distance
        setLdEnabled(localStorage.getItem('rc_ld_enabled') === 'true');
        setLdOffset(localStorage.getItem('rc_ld_offset') || '');
        setLdMeet(localStorage.getItem('rc_ld_meet') || '');
    }, [isOpen]);

    const handleAddEvent = () => {
        if (!newEventTitle || !newEventDate) return;

        // Prevent duplicates
        if (events.some(e => e.title === newEventTitle && e.date === newEventDate)) {
            alert("This event already exists!");
            return;
        }

        const newEvents = [...events, {
            id: Date.now().toString(),
            title: newEventTitle,
            date: newEventDate,
            emoji: newEventEmoji,
            isMain: false
        }];
        setEvents(newEvents);
        localStorage.setItem('rc_events', JSON.stringify(newEvents));
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventEmoji('📅');
    };

    const handleDeleteEvent = (id) => {
        if (window.confirm("Are you sure you want to remove this date?")) {
            const newEvents = events.filter(e => e.id !== id);
            setEvents(newEvents);
            localStorage.setItem('rc_events', JSON.stringify(newEvents));
        }
    };

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

        // Save Names
        localStorage.setItem('rc_partner1', partner1);
        localStorage.setItem('rc_partner2', partner2);
        localStorage.setItem('rc_nickname', nickname);

        // Save Long Distance
        localStorage.setItem('rc_ld_enabled', ldEnabled);
        localStorage.setItem('rc_ld_offset', ldOffset);
        localStorage.setItem('rc_ld_meet', ldMeet);

        // Trigger notification permission if enabled
        if (enableNotifications && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        setToastMsg('Settings saved 💾');
        setTimeout(() => {
            onSave && onSave();
            onClose();
            // Force reload to update header immediately if needed, or rely on state in App
            window.location.reload();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999, // High z-index to stay on top
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            padding: '20px'
        }}>
            {/* Feedback Toast */}
            {toastMsg && (
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '20px',
                    fontWeight: 'bold', zIndex: 10001, boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                    {toastMsg}
                </div>
            )}

            {showLockModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000 }}>
                    <SecurityLock
                        initialMode={lockModalMode}
                        onSuccess={handleLockSuccess}
                        onCancel={() => setShowLockModal(false)}
                    />
                </div>
            )}

            <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%', paddingTop: '0px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
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

                    <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <div>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'block' }}>🔒 App Lock</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Protect this space with a private PIN</span>
                            </div>
                            <div
                                onClick={handleLockToggle}
                                style={{
                                    position: 'relative', width: '50px', height: '28px',
                                    background: appLockEnabled ? 'var(--accent-color)' : '#ccc',
                                    borderRadius: '15px', transition: 'background 0.3s', cursor: 'pointer', flexShrink: 0
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: '2px', left: appLockEnabled ? '24px' : '2px',
                                    width: '24px', height: '24px', background: 'white', borderRadius: '50%',
                                    transition: 'all 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <div>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'block' }}>🔔 Anniversary Reminders</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Reminder messages shown inside the app</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={enableNotifications}
                                onChange={(e) => setEnableNotifications(e.target.checked)}
                                style={{ transform: 'scale(1.5)', accentColor: 'var(--accent-color)' }}
                            />
                        </label>
                        {/* Helper text if needed */}
                        {enableNotifications && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>No notifications are sent outside this app.</div>}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <div>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'block' }}>✨ AI Love Messages</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Occasional romantic messages generated for you</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={enableAI}
                                onChange={(e) => setEnableAI(e.target.checked)}
                                style={{ transform: 'scale(1.5)', accentColor: 'var(--accent-color)' }}
                            />
                        </label>
                    </div>

                    {enableAI && (
                        <div style={{ marginTop: '15px', background: '#FAFAFA', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '0.85rem', fontStyle: 'italic', color: '#555', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px dashed #ccc' }}>
                                "Preview: Every day with you is my favorite adventure..."
                            </div>
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

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--shape-radius)', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '5px', marginBottom: '5px' }}>Important Dates</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>These dates are used to calculate your relationship timeline.</p>

                    {events.map(event => (
                        <div key={event.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{event.emoji} {event.title} ({event.date})</span>
                            <button
                                onClick={() => handleDeleteEvent(event.id)}
                                style={{ background: 'none', border: 'none', color: '#ff7675', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                    <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}
                        />
                        <input
                            type="date"
                            placeholder="DD / MM / YYYY"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ marginRight: '10px' }}>Emoji:</span>
                            <input
                                type="text"
                                value={newEventEmoji}
                                onChange={(e) => setNewEventEmoji(e.target.value)}
                                style={{ width: '50px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}
                                maxLength="2"
                            />
                        </div>
                        <button
                            onClick={handleAddEvent}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginTop: '10px',
                                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', // Blue gradient
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            + Add Event
                        </button>
                    </div>
                </div>

                <LongDistanceSettings
                    enabled={ldEnabled}
                    setEnabled={setLdEnabled}
                    offset={ldOffset}
                    setOffset={setLdOffset}
                    meet={ldMeet}
                    setMeet={setLdMeet}
                />

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '16px 50px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', // Vivid Purple to Pink
                            color: 'white',
                            borderRadius: '30px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.5)', // Glowing shadow
                            transition: 'transform 0.2s',
                            width: '100%',
                            maxWidth: '300px'
                        }}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
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

const LongDistanceSettings = ({ enabled, setEnabled, offset, setOffset, meet, setMeet }) => {
    return (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--shape-radius)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' }}>
                <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'block' }}>✈️ Long Distance</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Unlocks long-distance reflections and messages</span>
                </div>
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
