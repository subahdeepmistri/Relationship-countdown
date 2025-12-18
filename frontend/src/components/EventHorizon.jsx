import React from 'react';
import { useRelationship } from '../context/RelationshipContext';

const EventHorizon = () => {
    const { relationship } = useRelationship();
    const events = relationship.events || [];

    // Filter out the 'main' event if we only want extras, 
    // or keep it if we want all. Usually the main event is the 'Start Date'.
    // Let's show all *other* special events here.
    const displayEvents = events.filter(e => !e.isMain);

    if (displayEvents.length === 0) return null;

    const calculateTime = (dateStr) => {
        const target = new Date(dateStr);
        const now = new Date();
        // Reset hours for pure date comparison
        target.setHours(0, 0, 0, 0);
        const nowZero = new Date();
        nowZero.setHours(0, 0, 0, 0);

        const diff = target - nowZero;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return { label: 'Today!', color: '#10B981' };
        if (days > 0) return { label: `${days} days left`, color: '#3B82F6' };
        return { label: `${Math.abs(days)} days ago`, color: '#64748B' };
    };

    return (
        <div style={{
            marginTop: '20px',
            width: '100%',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '10px',
            // Hide Scrollbar
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }} className="no-scrollbar">
            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

            {displayEvents.map(event => {
                const timeInfo = calculateTime(event.date);

                return (
                    <div key={event.id} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '12px 20px',
                        marginRight: '12px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        minWidth: '200px'
                    }}>
                        <span style={{ fontSize: '1.8rem', marginRight: '15px' }}>{event.emoji}</span>
                        <div>
                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                marginBottom: '2px'
                            }}>
                                {event.title}
                            </div>
                            <div style={{
                                fontSize: '0.8rem',
                                color: timeInfo.color,
                                fontWeight: '600'
                            }}>
                                {timeInfo.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EventHorizon;
