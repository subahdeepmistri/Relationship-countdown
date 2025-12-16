import React, { useState, useEffect } from 'react';

const DistanceClock = ({ partnerOffset, meetingDate }) => {
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
        <div className="pop-card" style={{ marginTop: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>My Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{myTime}</div>
                </div>
                <div style={{ fontSize: '1.5rem', opacity: 0.4 }}>✈️</div>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Their Time</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{theirTime}</div>
                </div>
            </div>

            {meetingDiff !== null && (
                <div style={{
                    marginTop: '15px',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    paddingTop: '15px',
                    color: 'var(--accent-color)'
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
