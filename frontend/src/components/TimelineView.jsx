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
        const stored = localStorage.getItem('rc_events');
        if (stored) {
            let parsed = JSON.parse(stored);
            // Sort by date desc (recent first) or asc? Usually timeline is oldest at bottom or top.
            // Let's sort by date descending (newest first) or maybe chronological? 
            // "Love Story" usually implies chronological. Let's do chronological (Oldest first).
            parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(parsed);
        } else {
            // Fallback
            const legacyDate = localStorage.getItem('rc_start_date');
            if (legacyDate) {
                setEvents([{ id: 'legacy', title: 'The Beginning', date: legacyDate, emoji: '❤️', isMain: true }]);
            }
        }
    }, []);

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
                <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'transparent', border: 'none' }}>✕</button>
            </div>

            {/* Next Milestone Card */}
            {nextMilestone && (
                <div style={{
                    background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                    borderRadius: '24px',
                    padding: '30px',
                    color: 'white',
                    marginBottom: '40px',
                    boxShadow: '0 10px 30px -5px rgba(236, 72, 153, 0.4)'
                }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Using Magic to Predict...</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{nextMilestone.daysLeft} Days</div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Value: Until {nextMilestone.label} 🎉</div>
                </div>
            )}

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                {/* Line */}
                <div style={{ position: 'absolute', left: '0', top: '10px', bottom: '0', width: '2px', background: '#CBD5E1' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {events.map((ev, index) => (
                        <div key={ev.id} style={{ position: 'relative', paddingLeft: '20px' }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute',
                                left: '-29px',
                                top: '0',
                                width: '20px',
                                height: '20px',
                                background: index === 0 ? '#EC4899' : '#FFFFFF',
                                border: '4px solid #CBD5E1',
                                borderRadius: '50%'
                            }}></div>

                            <div className="pop-card" style={{ padding: '20px', background: 'white' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{ev.emoji}</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#334155' }}>{ev.title}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '5px' }}>{ev.date}</div>
                                <div style={{
                                    marginTop: '15px',
                                    paddingTop: '15px',
                                    borderTop: '1px solid #F1F5F9',
                                    fontSize: '0.9rem',
                                    color: '#A855F7',
                                    fontWeight: '600'
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
