import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

import { useRelationship } from '../context/RelationshipContext';

const Settings = ({ isOpen, onClose, onEditPhotos }) => {
    const { settings, relationship, updateSettings, updateRelationship } = useRelationship();

    // Local Buffer State (Editing)
    const [enableNotifications, setEnableNotifications] = useState(false);
    const [enableAI, setEnableAI] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

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
    const [ldMyLoc, setLdMyLoc] = useState('');
    const [ldPartnerLoc, setLdPartnerLoc] = useState('');

    const [toastMsg, setToastMsg] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Initialize Buffer from Context when Opened
    useEffect(() => {
        if (isOpen) {
            setToastMsg(''); // Clear any stale toast messages
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
            setLdMyLoc(settings.longDistance.myLoc);
            setLdPartnerLoc(settings.longDistance.partnerLoc);
        }
    }, [isOpen, settings, relationship]);

    // Auto-dismiss toast safety
    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    // Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getPartnerTime = () => {
        const offsetVal = parseFloat(ldOffset);
        if (isNaN(offsetVal)) return '--:--';
        const date = new Date(currentTime);
        // This is a simple offset simulation. 
        // Real timezone math is complex, but this suffices for "offset hours"
        date.setHours(date.getHours() + offsetVal);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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



    // Safe Deletion Flow
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const checkDeleteEvent = (id) => {
        setEventToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteEvent = () => {
        if (eventToDelete) {
            setLocalEvents(localEvents.filter(e => e.id !== eventToDelete));
            setEventToDelete(null);
            setShowDeleteModal(false);
        }
    };

    // Unsaved Changes Detection
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    const hasUnsavedChanges = () => {
        // Compare essential fields. Deep comparison might be expensive, this checks key values.
        if (enableNotifications !== settings.notifications) return true;
        if (enableAI !== settings.aiEnabled) return true;
        if (apiKey !== settings.aiKey) return true;
        if (partner1 !== relationship.partner1) return true;
        if (partner2 !== relationship.partner2) return true;
        if (nickname !== relationship.nickname) return true;

        // Simple length check for events or stringify for deeper check
        if (JSON.stringify(localEvents) !== JSON.stringify(relationship.events || [])) return true;

        if (ldEnabled !== settings.longDistance.enabled) return true;
        if (ldOffset !== settings.longDistance.offset) return true;
        if (ldMeet !== settings.longDistance.meet) return true;
        if (ldMyLoc !== settings.longDistance.myLoc) return true;
        if (ldPartnerLoc !== settings.longDistance.partnerLoc) return true;

        return false;
    };

    const handleCloseRequest = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedModal(true);
        } else {
            onClose();
        }
    };

    const handleDiscard = () => {
        setShowUnsavedModal(false);
        onClose();
    };





    const handleSave = () => {
        setIsSaved(true);
        // commit all buffers to context
        updateSettings({
            notifications: enableNotifications,
            aiEnabled: enableAI,
            aiKey: apiKey.replace(/^Bearer\s+/i, '').trim(),

            longDistance: {
                enabled: ldEnabled,
                offset: ldOffset,
                meet: ldMeet,
                myLoc: ldMyLoc,
                partnerLoc: ldPartnerLoc
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

        setToastMsg('Settings saved. Love updated ❤️');
        setTimeout(() => {
            onClose();
            setIsSaved(false); // Reset for next time
        }, 1200); // Slightly longer to see the checkmark
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

            {/* Safe Deletion Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '320px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🗑️</div>
                        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '1.2rem' }}>Remove this moment?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.5' }}>This moment will be removed from your story.</p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button onClick={confirmDeleteEvent} style={{
                                padding: '14px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Remove</button>
                            <button onClick={() => setShowDeleteModal(false)} style={{
                                padding: '14px', background: 'rgba(255,255,255,0.05)', color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '320px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '1.2rem' }}>You have unsaved changes</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.5' }}>Do you want to keep editing or discard them?</p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button onClick={() => setShowUnsavedModal(false)} style={{
                                padding: '14px', background: 'var(--accent-lux-gradient)', color: 'white',
                                border: 'none', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Keep Editing</button>
                            <button onClick={handleDiscard} style={{
                                padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Discard Changes</button>
                        </div>
                    </div>
                </div>
            )}

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





            <div style={{
                maxWidth: '500px', width: '95%', height: '90%', display: 'flex', flexDirection: 'column',
                position: 'relative', zIndex: 1
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', padding: '0 10px' }}>
                    <div>
                        <h2 style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '2.2rem', margin: '0 0 5px 0', fontWeight: '700',
                            color: 'white', background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Settings</h2>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500' }}>Shape how your love is remembered.</p>
                    </div>

                    <button
                        onClick={handleCloseRequest}
                        style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ✕
                    </button>
                </div>

                <div className="settings-content" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px', scrollBehavior: 'smooth' }}>

                    {/* --- 1. PROFILE & DISPLAY --- */}
                    <div className="settings-section" style={{
                        marginBottom: '30px', background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <SectionHeader title="Profile & Display" icon={<Icons.User />} />
                        <p style={{ margin: '-15px 0 15px 0', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-serif)', lineHeight: '1.5' }}>How you appear in shared moments.</p>

                        <button
                            onClick={onEditPhotos}
                            className="edit-photos-btn"
                            style={{
                                width: '100%', padding: '16px', background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: 'white',
                                fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '15px', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <span className="camera-icon" style={{ fontSize: '1.2rem', display: 'flex', transition: 'transform 0.2s ease' }}>
                                <Icons.Camera />
                            </span>
                            Edit Profile Photos
                        </button>
                        <style>{`
                            .edit-photos-btn:hover {
                                background: rgba(255, 255, 255, 0.08) !important;
                                box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                                border-color: rgba(255, 255, 255, 0.2) !important;
                            }
                            .edit-photos-btn:active {
                                transform: scale(0.98);
                            }
                            .edit-photos-btn:active .camera-icon {
                                transform: rotate(-5deg) scale(1.1);
                            }
                        `}</style>
                    </div>


                    {/* --- 2. EXPERIENCE --- */}
                    <div className="settings-section" style={{
                        marginBottom: '30px', background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <SectionHeader title="Experience" icon={<Icons.Sparkles />} />

                        <GlassToggle
                            label="Anniversary Reminders"
                            desc="Get notified on special dates"
                            active={enableNotifications}
                            onToggle={() => setEnableNotifications(!enableNotifications)}
                            icon={<Icons.Bell />}
                        />

                        {/* The original file had AI section, keeping it but hidden if the user didn't ask to remove it explicitly in this turn. */}
                        <GlassToggle
                            label="AI Love Messages"
                            desc={<span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>Daily little reminders of love.</span>}
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
                                    Key is stored securely on your device. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', textDecoration: 'underline' }}>Get Key</a>
                                </p>
                            </div>
                        )}
                    </div>


                    {/* --- 3. TIMELINE EVENTS --- */}
                    <div className="settings-section" style={{
                        marginBottom: '30px', background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <SectionHeader title="Timeline Events" icon={<Icons.Calendar />} />
                        <p style={{ margin: '-15px 0 15px 0', fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'var(--font-serif)', lineHeight: '1.5' }}>These dates shape your shared journey.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {localEvents.map(event => (
                                <div key={event.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px', background: 'rgba(255, 255, 255, 0.08)', // Stronger background
                                    borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'white' }}>
                                        <span style={{ fontSize: '1.4rem' }}>{event.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', letterSpacing: '0.3px' }}>{event.title}</div>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '2px' }}>{event.date}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => checkDeleteEvent(event.id)} style={{
                                        background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer',
                                        width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                        className="trash-btn">
                                        <div style={{ color: '#ef4444' }}><Icons.Trash /></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Event Title"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="glass-input secondary-input"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="text"
                                    value={newEventEmoji}
                                    onChange={(e) => setNewEventEmoji(e.target.value)}
                                    className="glass-input secondary-input"
                                    style={{ width: '60px', textAlign: 'center' }}
                                    maxLength="2"
                                />
                            </div>
                            <input
                                type="date"
                                value={newEventDate}
                                onChange={(e) => setNewEventDate(e.target.value)}
                                className="glass-input secondary-input"
                                style={{ marginBottom: '15px' }}
                            />
                            <button onClick={handleAddEvent} style={{
                                width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', color: 'white',
                                borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '600',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                                className="add-btn">
                                <span>+</span> Add Event
                            </button>
                        </div>
                        <style>{`
                            .secondary-input { opacity: 0.7; transition: all 0.2s ease; }
                            .secondary-input:focus { opacity: 1; background: rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.3); }
                            .trash-btn:hover { background: rgba(239, 68, 68, 0.2) !important; transform: scale(1.05); }
                            .add-btn:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.3) !important; }
                        `}</style>
                    </div>

                    {/* --- 4. LONG DISTANCE --- */}
                    <div className="settings-section" style={{
                        marginBottom: '30px', background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '18px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <SectionHeader title="Long Distance Mode" icon={<Icons.Globe />} />
                        <GlassToggle
                            label="Enable Mode"
                            desc="Show dual clocks & distance"
                            active={ldEnabled}
                            onToggle={() => setLdEnabled(!ldEnabled)}
                            icon={<Icons.Map />}
                        />
                        {ldEnabled && (
                            <div className="nested-settings">
                                <p style={{ textAlign: 'center', color: '#fda4af', fontSize: '1rem', marginBottom: '15px', marginTop: '-5px', fontFamily: 'var(--font-serif)' }}>
                                    “Miles apart. Still close.”
                                </p>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', marginBottom: '15px',
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                                        <input
                                            type="text"
                                            placeholder="My City/Country"
                                            value={ldMyLoc}
                                            onChange={(e) => setLdMyLoc(e.target.value)}
                                            className="glass-input"
                                            style={{
                                                width: '45%', padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                                border: 'none', color: '#94a3b8', textAlign: 'left', textTransform: 'capitalize'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Partner's City/Country"
                                            value={ldPartnerLoc}
                                            onChange={(e) => setLdPartnerLoc(e.target.value)}
                                            className="glass-input"
                                            style={{
                                                width: '45%', padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                                border: 'none', color: '#94a3b8', textAlign: 'right', textTransform: 'capitalize'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
                                        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span style={{ color: '#38BDF8' }}>{getPartnerTime()}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={() => setLdOffset(String((parseFloat(ldOffset || 0) - 1)))} style={{
                                            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>−</button>

                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Time Difference</label>
                                            <input
                                                type="number"
                                                value={ldOffset}
                                                onChange={(e) => setLdOffset(e.target.value)}
                                                className="glass-input"
                                                style={{ textAlign: 'center', padding: '8px' }}
                                                placeholder="e.g. -5"
                                            />
                                        </div>

                                        <button onClick={() => setLdOffset(String((parseFloat(ldOffset || 0) + 1)))} style={{
                                            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>+</button>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: '5px 0 0 0', lineHeight: '1.4' }}>
                                        Adjust until both clocks feel right.
                                    </p>
                                </div>


                                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                    <div style={{ marginBottom: '5px' }}>Next Meeting Date</div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>Something to look forward to.</div>
                                    <input type="date" value={ldMeet} onChange={(e) => setLdMeet(e.target.value)} className="glass-input" style={{ fontFamily: 'sans-serif' }} />
                                </label>
                            </div>
                        )
                        }
                    </div >



                </div>

                <div style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    display: 'flex', gap: '15px',
                    marginTop: 'auto' // Pushes to bottom if flex container
                }}>
                    <button onClick={handleCloseRequest} style={{
                        flex: 1, padding: '16px', background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px',
                        color: 'rgba(255,255,255,0.7)', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 0.2s', backdropFilter: 'blur(5px)'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                    >Cancel</button>

                    <button onClick={handleSave} style={{
                        flex: 2, padding: '16px',
                        background: isSaved ? '#10B981' : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: isSaved ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 10px 30px rgba(236, 72, 153, 0.4)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: isSaved ? 'scale(0.98)' : 'scale(1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        {isSaved ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s' }}>
                                <span style={{ fontSize: '1.2rem' }}>✔</span> Saved
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
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
    Plane: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L2 9l9 3 11-10" /><path d="M11 12l3 9 8-19" /></svg>,
    Globe: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>,
    Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Info: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    Map: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
};

const SectionHeader = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', opacity: 0.9 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '600', letterSpacing: '0.5px' }}>{title}</h3>
    </div>
);

const GlassToggle = ({ label, desc, active, onToggle, icon }) => (
    <div
        role="switch"
        aria-checked={active}
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
            }
        }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', cursor: 'pointer', outline: 'none' }}
        onClick={onToggle}
    >
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
            borderRadius: '100px', position: 'relative', transition: 'background 0.4s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div className="toggle-knob" style={{
                position: 'absolute', top: '2px', left: '2px', width: '24px', height: '24px', background: 'white',
                borderRadius: '50%', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: active ? 'translateX(22px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: active ? 'togglePulse 0.6s cubic-bezier(0.4, 0, 0.6, 1)' : 'none'
            }}></div>
        </div>
        <style>{`
            @keyframes togglePulse {
                0% { transform: translateX(22px) scale(1); }
                50% { transform: translateX(22px) scale(1.2); box-shadow: 0 0 15px rgba(251, 113, 133, 0.6); }
                100% { transform: translateX(22px) scale(1); }
            }
            @media (prefers-reduced-motion: reduce) {
                .toggle-knob { animation: none !important; transition: transform 0.2s ease !important; }
            }
        `}</style>
    </div>
);

const LongDistanceSettings = ({ enabled, setEnabled, offset, setOffset, meet, setMeet, myLoc, setMyLoc, partnerLoc, setPartnerLoc }) => {
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
                    <p style={{ textAlign: 'center', color: '#fda4af', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '15px', marginTop: '-5px' }}>
                        “Miles apart. Still close.”
                    </p>
                    <div style={{
                        background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', marginBottom: '15px',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                            <input
                                type="text"
                                placeholder="My City/Country"
                                value={myLoc}
                                onChange={(e) => setMyLoc(e.target.value)}
                                className="glass-input"
                                style={{
                                    width: '45%', padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                    border: 'none', color: '#94a3b8', textAlign: 'left', textTransform: 'capitalize'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Partner's City/Country"
                                value={partnerLoc}
                                onChange={(e) => setPartnerLoc(e.target.value)}
                                className="glass-input"
                                style={{
                                    width: '45%', padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)',
                                    border: 'none', color: '#94a3b8', textAlign: 'right', textTransform: 'capitalize'
                                }}
                            />
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
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Time Difference</label>
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
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: '5px 0 0 0', lineHeight: '1.4' }}>
                            Adjust until both clocks feel right.
                        </p>
                    </div>


                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem' }}>
                        <div style={{ marginBottom: '5px' }}>Next Meeting Date</div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>Something to look forward to.</div>
                        <input type="date" value={meet} onChange={(e) => setMeet(e.target.value)} className="glass-input" style={{ fontFamily: 'sans-serif' }} />
                    </label>
                </div>
            )
            }
        </div >
    );
};

export default Settings;

