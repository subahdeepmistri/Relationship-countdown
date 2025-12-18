import React, { useState, useEffect } from 'react';
import '../styles/theme.css';
import SecurityLock from './SecurityLock';
import { useRelationship } from '../context/RelationshipContext';

const Settings = ({ isOpen, onClose, onEditPhotos, onOpenAbout }) => {
    const { settings, relationship, updateSettings, updateRelationship } = useRelationship();

    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockModalMode, setLockModalMode] = useState('setup');

    // Local Buffer State (Editing)
    const [enableNotifications, setEnableNotifications] = useState(false);
    const [enableAI, setEnableAI] = useState(false);
    const [apiKey, setApiKey] = useState('');

    // Personalization
    const [partner1, setPartner1] = useState('');
    const [partner2, setPartner2] = useState('');
    const [nickname, setNickname] = useState('');

    // Events buffering
    const [localEvents, setLocalEvents] = useState([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventEmoji, setNewEventEmoji] = useState('📅');

    // Long Distance
    const [ldEnabled, setLdEnabled] = useState(false);
    const [ldOffset, setLdOffset] = useState('');
    const [ldMeet, setLdMeet] = useState('');

    const [toastMsg, setToastMsg] = useState('');

    // Initialize Buffer from Context when Opened
    useEffect(() => {
        if (isOpen) {

            setEnableNotifications(settings.notifications);
            setEnableAI(settings.aiEnabled);
            setApiKey(settings.aiKey);

            setPartner1(relationship.partner1);
            setPartner2(relationship.partner2);
            setNickname(relationship.nickname);

            setLocalEvents(relationship.events || []);

            setLdEnabled(settings.longDistance.enabled);
            setLdOffset(settings.longDistance.offset);
            setLdMeet(settings.longDistance.meet);
        }
    }, [isOpen, settings, relationship]);

    const handleAddEvent = () => {
        if (!newEventTitle || !newEventDate) return;

        if (localEvents.some(e => e.title === newEventTitle && e.date === newEventDate)) {
            alert("This event already exists!");
            return;
        }

        const updatedEvents = [...localEvents, {
            id: Date.now().toString(),
            title: newEventTitle,
            date: newEventDate,
            emoji: newEventEmoji,
            isMain: false
        }];
        setLocalEvents(updatedEvents);

        setNewEventTitle('');
        setNewEventDate('');
        setNewEventEmoji('📅');
    };

    const handleDeleteEvent = (id) => {
        if (window.confirm("Are you sure you want to remove this date?")) {
            setLocalEvents(localEvents.filter(e => e.id !== id));
        }
    };



    const handleLockToggle = () => {
        if (!appLockEnabled) {
            setLockModalMode('setup');
            setShowLockModal(true);
        } else {
            setLockModalMode('verify');
            setShowLockModal(true);
        }
    };

    const handleLockSuccess = () => {
        if (lockModalMode === 'setup') {
            setAppLockEnabled(true);
            // We update context immediately for lock status to ensure consistency
            updateSettings({ appLockEnabled: true });
        } else {
            setAppLockEnabled(false);
            updateSettings({ appLockEnabled: false });
        }
        setShowLockModal(false);
    };

    const handleSave = () => {
        // commit all buffers to context
        updateSettings({
            notifications: enableNotifications,
            aiEnabled: enableAI,
            aiKey: apiKey.trim(),
            appLockEnabled: appLockEnabled, // Ensure sync

            longDistance: {
                enabled: ldEnabled,
                offset: ldOffset,
                meet: ldMeet
            }
        });

        updateRelationship({
            partner1,
            partner2,
            nickname,
            events: localEvents
        });

        if (enableNotifications && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        setToastMsg('Settings saved 💾');
        setTimeout(() => {
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10005,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.98) 100%)',
            backdropFilter: 'blur(15px)', animation: 'fadeIn 0.3s ease-out'
        }}>
            <div className="blob" style={{
                position: 'fixed', top: '10%', right: '10%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)', zIndex: 0
            }}></div>

            {toastMsg && (
                <div style={{
                    position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white', padding: '12px 30px', borderRadius: '30px',
                    fontWeight: 'bold', zIndex: 10001, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
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
                maxWidth: '500px', width: '95%', height: '90%', display: 'flex', flexDirection: 'column',
                position: 'relative', zIndex: 1
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif", fontSize: '2.2rem', margin: 0, fontWeight: '700',
                        color: 'white', background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Settings</h2>
                    <button onClick={onClose} style={{
                        width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(5px)'
                    }}>
                        <Icons.X />
                    </button>
                </div>

                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px', borderRadius: '24px' }}>

                    <div className="settings-section">
                        <SectionHeader title="Profile & Display" icon={<Icons.User />} />
                        <button onClick={onEditPhotos} className="glass-btn-hover" style={{
                            width: '100%', padding: '16px', background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: 'white',
                            fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '15px'
                        }}>
                            <span style={{ fontSize: '1.2rem', display: 'flex' }}><Icons.Camera /></span> Edit Profile Photos
                        </button>
                    </div>



                    <div className="settings-section">
                        <SectionHeader title="Experience" icon={<Icons.Sparkles />} />
                        <GlassToggle
                            label="Anniversary Reminders"
                            desc="In-app celebrations"
                            active={enableNotifications}
                            onToggle={() => setEnableNotifications(!enableNotifications)}
                            icon={<Icons.Bell />}
                        />
                        {/* AI Removed for cleanliness or keep if needed? keeping as requested in context */}
                        {/* The original file had AI section, keeping it but hidden if the user didn't ask to remove it explicitly in this turn. */}
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

                    <div className="settings-section">
                        <SectionHeader title="Timeline Events" icon={<Icons.Calendar />} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {localEvents.map(event => (
                                <div key={event.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{event.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{event.title}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{event.date}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(event.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '5px' }}>
                                        <div style={{ color: '#ef4444' }}><Icons.Trash /></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input type="text" placeholder="Event Title" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="glass-input" style={{ flex: 1 }} />
                                <input type="text" value={newEventEmoji} onChange={(e) => setNewEventEmoji(e.target.value)} className="glass-input" style={{ width: '50px', textAlign: 'center' }} maxLength="2" />
                            </div>
                            <input type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="glass-input" style={{ marginBottom: '10px' }} />
                            <button onClick={handleAddEvent} style={{
                                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white',
                                borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s'
                            }}>+ Add Event</button>
                        </div>
                    </div>

                    <LongDistanceSettings
                        enabled={ldEnabled} setEnabled={setLdEnabled}
                        offset={ldOffset} setOffset={setLdOffset}
                        meet={ldMeet} setMeet={setLdMeet}
                    />
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <button onClick={() => { onClose(); onOpenAbout(); }} style={{
                            width: '100%', padding: '16px', background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: '#94a3b8',
                            fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        >
                            <span style={{ display: 'flex' }}><Icons.Info /></span> About & Credits
                        </button>
                    </div>


                </div>

                <div style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    display: 'flex', gap: '10px',
                    marginTop: 'auto' // Pushes to bottom if flex container
                }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '16px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', color: 'white', fontWeight: '600', cursor: 'pointer'
                    }}>Cancel</button>
                    <button onClick={handleSave} style={{
                        flex: 2, padding: '16px', background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', fontSize: '1rem',
                        cursor: 'pointer', boxShadow: '0 10px 30px rgba(236, 72, 153, 0.4)', transition: 'all 0.3s ease'
                    }}>Save Changes</button>
                </div>
            </div>
            {/* Keeping styles inline as before */}
            <style>{`
                .glass-input { width: 100%; padding: 14px; border-radius: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); color: white; font-size: 1rem; outline: none; transition: all 0.3s; }
                .glass-input:focus { background: rgba(0, 0, 0, 0.5); border-color: rgba(255, 255, 255, 0.3); }
                .settings-section { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .nested-settings { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1); animation: slideDown 0.3s ease; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Info: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
};

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
                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ color: 'white', fontWeight: '500', fontSize: '1rem' }}>{label}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{desc}</div>
            </div>
        </div>
        <div style={{
            width: '50px', height: '28px', background: active ? '#10B981' : 'rgba(255,255,255,0.1)',
            borderRadius: '100px', position: 'relative', transition: 'background 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                position: 'absolute', top: '2px', left: '2px', width: '24px', height: '24px', background: 'white',
                borderRadius: '50%', transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transform: active ? 'translateX(22px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
        </div>
    </div>
);

const LongDistanceSettings = ({ enabled, setEnabled, offset, setOffset, meet, setMeet }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!enabled) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [enabled]);

    const getPartnerTime = () => {
        if (!offset) return "---";
        const now = currentTime;
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const partnerDate = new Date(utc + (3600000 * parseFloat(offset)));
        return partnerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                    <div style={{
                        background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', marginBottom: '15px',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                            <span>My Time</span>
                            <span>Partner's Time</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
                            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ color: '#38BDF8' }}>{getPartnerTime()}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setOffset(String((parseFloat(offset || 0) - 1)))} style={{
                                width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>−</button>

                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>UTC Offset</label>
                                <input
                                    type="number"
                                    value={offset}
                                    onChange={(e) => setOffset(e.target.value)}
                                    className="glass-input"
                                    style={{ textAlign: 'center', padding: '8px' }}
                                    placeholder="e.g. -5"
                                />
                            </div>

                            <button onClick={() => setOffset(String((parseFloat(offset || 0) + 1)))} style={{
                                width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>+</button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: '5px 0 0 0' }}>
                            Adjust until the time on the right matches your partner's current time.
                        </p>
                    </div>

                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem' }}>
                        Next Meeting Date:
                        <input type="date" value={meet} onChange={(e) => setMeet(e.target.value)} className="glass-input" style={{ marginTop: '5px', fontFamily: 'sans-serif' }} />
                    </label>
                </div>
            )}
        </div>
    );
};

export default Settings;

