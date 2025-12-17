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
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.98) 100%)',
            backdropFilter: 'blur(15px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* Background Orbs */}
            <div className="blob" style={{
                position: 'fixed', top: '10%', right: '10%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)', zIndex: 0
            }}></div>

            {/* Feedback Toast */}
            {toastMsg && (
                <div style={{
                    position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white', padding: '12px 30px', borderRadius: '30px',
                    fontWeight: 'bold', zIndex: 10001,
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                    animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
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

            <div style={{
                maxWidth: '500px',
                width: '95%',
                height: '90%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '0 10px'
                }}>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '2.2rem',
                        margin: 0,
                        fontWeight: '700',
                        color: 'white',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Settings</h2>
                    <button onClick={onClose} style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(5px)'
                    }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        <Icons.X />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="custom-scrollbar" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    borderRadius: '24px',
                }}>

                    {/* Section: Profile */}
                    <div className="settings-section">
                        <SectionHeader title="Profile & Display" icon={<Icons.User />} />
                        <button
                            onClick={onEditPhotos}
                            className="glass-btn-hover"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                color: 'white',
                                fontWeight: '600',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                marginBottom: '15px'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', display: 'flex' }}><Icons.Camera /></span> Edit Profile Photos
                        </button>
                    </div>

                    {/* Section: Privacy */}
                    <div className="settings-section">
                        <SectionHeader title="Privacy & Security" icon={<Icons.Lock />} />
                        <GlassToggle
                            label="App Lock"
                            desc="Protect with a PIN"
                            active={appLockEnabled}
                            onToggle={handleLockToggle}
                            icon={<Icons.Shield />}
                        />
                    </div>

                    {/* Section: Experience */}
                    <div className="settings-section">
                        <SectionHeader title="Experience" icon={<Icons.Sparkles />} />
                        <GlassToggle
                            label="Anniversary Reminders"
                            desc="In-app celebrations"
                            active={enableNotifications}
                            onToggle={() => setEnableNotifications(!enableNotifications)}
                            icon={<Icons.Bell />}
                        />
                        <GlassToggle
                            label="AI Love Messages"
                            desc="Daily romantic generation"
                            active={enableAI}
                            onToggle={() => setEnableAI(!enableAI)}
                            icon={<Icons.Bot />}
                        />

                        {enableAI && (
                            <div className="nested-settings">
                                <input
                                    type="password"
                                    placeholder="Enter your OpenAI API Key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="glass-input"
                                />
                                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '8px', color: '#94a3b8' }}>
                                    Key is stored securely on your device.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Section: Import Dates */}
                    <div className="settings-section">
                        <SectionHeader title="Timeline Events" icon={<Icons.Calendar />} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events.map(event => (
                                <div key={event.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{event.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{event.title}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{event.date}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '5px' }}
                                        onMouseEnter={e => e.target.style.opacity = 1}
                                        onMouseLeave={e => e.target.style.opacity = 0.5}
                                    >
                                        <div style={{ color: '#ef4444' }}><Icons.Trash /></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Event */}
                        <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Event Title"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="glass-input"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="text"
                                    value={newEventEmoji}
                                    onChange={(e) => setNewEventEmoji(e.target.value)}
                                    className="glass-input"
                                    style={{ width: '50px', textAlign: 'center' }}
                                    maxLength="2"
                                />
                            </div>
                            <input
                                type="date"
                                value={newEventDate}
                                onChange={(e) => setNewEventDate(e.target.value)}
                                className="glass-input"
                                style={{ marginBottom: '10px' }}
                            />
                            <button
                                onClick={handleAddEvent}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.target.style.transform = 'scale(1)'}
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

                    {/* Bottom Spacing */}
                    <div style={{ height: '80px' }}></div>
                </div>

                {/* Floating Save Bar */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '400px',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <button onClick={onClose} style={{
                        flex: 1,
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>Cancel</button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 2,
                            padding: '16px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            color: 'white',
                            borderRadius: '20px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(236, 72, 153, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            <style>{`
                .glass-input {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                }
                .glass-input:focus {
                    background: rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .settings-section {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .nested-settings {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    animation: slideDown 0.3s ease;
                }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                /* Custom Scrollbar for Settings */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

// --- SVG ICON COMPONENTS ---
const Icons = {
    User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Shield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    Sparkles: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>,
    Bell: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>,
    Bot: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
    Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    Plane: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L2 9l9 3 11-10Z" /><path d="M11 12l3 9 8-19" /></svg>,
    Globe: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>,
    Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

// UI Helper Components
const SectionHeader = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', opacity: 0.9 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '600', letterSpacing: '0.5px' }}>{title}</h3>
    </div>
);

const GlassToggle = ({ label, desc, active, onToggle, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
                width: '40px', height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e2e8f0'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ color: 'white', fontWeight: '500', fontSize: '1rem' }}>{label}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{desc}</div>
            </div>
        </div>

        {/* iOS Style Switch */}
        <div style={{
            width: '50px', height: '28px',
            background: active ? '#10B981' : 'rgba(255,255,255,0.1)',
            borderRadius: '100px',
            position: 'relative',
            transition: 'background 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                position: 'absolute',
                top: '2px', left: '2px',
                width: '24px', height: '24px',
                background: 'white',
                borderRadius: '50%',
                transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transform: active ? 'translateX(22px)' : 'translateX(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
        </div>
    </div>
);

const LongDistanceSettings = ({ enabled, setEnabled, offset, setOffset, meet, setMeet }) => {
    return (
        <div className="settings-section">
            <SectionHeader title="Distance Tools" icon={<Icons.Plane />} />
            <GlassToggle
                label="Long Distance Mode"
                desc="Timezones & countdowns"
                active={enabled}
                onToggle={() => setEnabled(!enabled)}
                icon={<Icons.Globe />}
            />

            {enabled && (
                <div className="nested-settings">
                    <label style={{ display: 'block', marginBottom: '15px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                        Partner Timezone (Hours +/-):
                        <input
                            type="number"
                            placeholder="-5"
                            value={offset}
                            onChange={(e) => setOffset(e.target.value)}
                            className="glass-input"
                            style={{ marginTop: '5px' }}
                        />
                    </label>
                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem' }}>
                        Next Meeting Date:
                        <input
                            type="date"
                            value={meet}
                            onChange={(e) => setMeet(e.target.value)}
                            className="glass-input"
                            style={{ marginTop: '5px', fontFamily: 'sans-serif' }}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default Settings;
