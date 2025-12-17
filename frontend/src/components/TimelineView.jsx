import React, { useEffect, useState } from 'react';

const TimelineView = ({ onClose }) => {
    const [events, setEvents] = useState([]);

    // Calculate time since for a given date
    const getTimeSince = (dateStr) => {
        const start = new Date(dateStr);
        const now = new Date();
        const diff = Math.abs(now - start);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days < 30) return `${days} days ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    };

    // Calculate next big milestone (100 days, 200 days, 1 year etc) for main event
    const getNextMilestone = (dateStr) => {
        const start = new Date(dateStr);
        const now = new Date();
        const diff = Math.abs(now - start);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        // Milestones: Every 100 days, Every 365 days
        const nextHundo = (Math.floor(days / 100) + 1) * 100;
        const daysToHundo = nextHundo - days;

        const nextYear = (Math.floor(days / 365) + 1) * 365;
        const daysToYear = nextYear - days;

        // Return the closest one
        if (daysToHundo < daysToYear) {
            return { label: `${nextHundo} Days`, daysLeft: daysToHundo };
        } else {
            return { label: `${Math.floor(days / 365) + 1} Years`, daysLeft: daysToYear };
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = () => {
        const stored = localStorage.getItem('rc_events');
        let parsed = [];

        // Add main start date as an event if not present in custom events
        const legacyDate = localStorage.getItem('rc_start_date');
        if (legacyDate) {
            parsed.push({ id: 'legacy', title: 'The Beginning', date: legacyDate, emoji: '❤️', isMain: true });
        }

        if (stored) {
            const customEvents = JSON.parse(stored);
            parsed = [...parsed, ...customEvents];
        }

        // Sort by date desc (newest at top) or asc (oldest at top).
        // Let's do descending (Newest first) for timeline feed feel, or Ascending for history?
        // User requested "Show saved chapters immediately".
        // Let's stick to Ascending (History flow).
        parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(parsed);
    };

    const handleDelete = (id) => {
        if (window.confirm("Remove this memory from your timeline?")) {
            // Get current custom events (excluding main legacy one)
            const stored = JSON.parse(localStorage.getItem('rc_events') || '[]');
            const updated = stored.filter(e => e.id !== id);
            localStorage.setItem('rc_events', JSON.stringify(updated));
            loadEvents(); // Reload/Refetch
        }
    };

    const mainEvent = events.find(e => e.isMain) || events[0];
    const nextMilestone = mainEvent ? getNextMilestone(mainEvent.date) : null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: '#F1F5F9',
            zIndex: 5000,
            overflowY: 'auto',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#1e293b' }}>Our Story</h2>
                <button onClick={onClose} style={{
                    fontSize: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
            </div>

            {/* Next Milestone Card */}
            {nextMilestone && (
                <div className="pop-card" style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    borderRadius: '24px',
                    padding: '30px',
                    color: 'white',
                    marginBottom: '40px',
                    boxShadow: '0 10px 30px -5px rgba(236, 72, 153, 0.4)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px' }}>Next Big Moment</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', lineHeight: '1' }}>{nextMilestone.daysLeft}</div>
                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>days until {nextMilestone.label}</div>
                </div>
            )}

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: '20px', maxWidth: '600px', margin: '0 auto' }}>
                {/* Line */}
                <div style={{ position: 'absolute', left: '0', top: '10px', bottom: '0', width: '2px', background: '#e2e8f0' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {events.map((ev, index) => (
                        <div key={ev.id} style={{ position: 'relative', paddingLeft: '30px' }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '0',
                                width: '20px',
                                height: '20px',
                                background: index === 0 ? '#EC4899' : '#FFFFFF',
                                border: index === 0 ? '4px solid white' : '4px solid #CBD5E1',
                                borderRadius: '50%',
                                boxShadow: index === 0 ? '0 0 0 2px #EC4899' : 'none',
                                zIndex: 2
                            }}></div>

                            <div className="pop-card" style={{ padding: '25px', background: 'white', borderRadius: '20px', position: 'relative' }}>
                                {!ev.isMain && (
                                    <button
                                        onClick={() => handleDelete(ev.id)}
                                        style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.3, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                    >
                                        ✕
                                    </button>
                                )}

                                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{ev.emoji}</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>{ev.title}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{new Date(ev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>

                                <div style={{
                                    marginTop: '15px',
                                    paddingTop: '15px',
                                    borderTop: '1px solid #f1f5f9',
                                    fontSize: '0.85rem',
                                    color: '#8B5CF6',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {getTimeSince(ev.date)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '100px' }}></div>
        </div>
    );
};

export default TimelineView;
