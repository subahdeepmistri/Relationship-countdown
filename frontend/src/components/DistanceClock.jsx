import React, { useState, useEffect } from 'react';

const DistanceClock = ({ partnerOffset, meetingDate, myLoc, partnerLoc }) => {
    const [myTime, setMyTime] = useState('');
    const [theirTime, setTheirTime] = useState('');
    const [meetingDiff, setMeetingDiff] = useState(null);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setMyTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            // Calculate partner time
            // partnerOffset is +/- hours from current local time (simplified logic for prototype)
            // A better way is usually timezone string, but offset is easier for user to input manually
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const partnerDate = new Date(utc + (3600000 * partnerOffset));
            setTheirTime(partnerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            // Meeting countdown
            if (meetingDate) {
                const meet = new Date(meetingDate);
                const diff = meet - now;
                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    setMeetingDiff(days);
                } else {
                    setMeetingDiff(0);
                }
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [partnerOffset, meetingDate]);

    return (
        <div className="pop-card" style={{ marginTop: '20px', padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{myLoc || "Me"}</div>
                    <div className="animate-pulse-slow" style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{myTime}</div>
                </div>

                <div style={{
                    fontSize: '1.5rem', opacity: 0.8,
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    ✈️
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{partnerLoc || "Them"}</div>
                    <div className="animate-pulse-slow" style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', animationDelay: '1s' }}>{theirTime}</div>
                </div>
            </div>

            <div style={{
                textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)',
                marginBottom: '15px', fontStyle: 'italic'
            }}>
                Across time zones, same heartbeat ❤️
            </div>

            {meetingDiff !== null && (
                <div style={{
                    marginTop: '10px',
                    background: 'var(--bg-color)',
                    padding: '12px',
                    borderRadius: '16px',
                    color: 'var(--accent-primary)',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}>
                    {meetingDiff === 0 ? (
                        <strong>Together at last! ❤️</strong>
                    ) : (
                        <span>Only <strong>{meetingDiff}</strong> days until we meet</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default DistanceClock;
