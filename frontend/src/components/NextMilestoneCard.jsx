import React, { useState, useEffect } from 'react';

const NextMilestoneCard = () => {
    const [milestone, setMilestone] = useState(null);

    useEffect(() => {
        const events = JSON.parse(localStorage.getItem('rc_events') || '[]');
        const mainEvent = events.find(e => e.isMain) || events[0];

        if (!mainEvent) return;

        const start = new Date(mainEvent.date);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Logic: Find next multiple of 100 OR next year
        const nextHundred = (Math.floor(daysElapsed / 100) + 1) * 100;

        // Next Anniversary
        let nextAnniversary = new Date(start);
        nextAnniversary.setFullYear(now.getFullYear());
        if (nextAnniversary < now) {
            nextAnniversary.setFullYear(now.getFullYear() + 1);
        }
        const daysToAnniversary = Math.ceil((nextAnniversary - now) / (1000 * 60 * 60 * 24));
        const years = nextAnniversary.getFullYear() - start.getFullYear();

        const daysToHundred = nextHundred - daysElapsed;

        // Choose the closer one
        if (daysToHundred < daysToAnniversary) {
            setMilestone({
                title: `${nextHundred} Days Together`,
                daysLeft: daysToHundred,
                date: 'Coming Soon',
                icon: '💯'
            });
        } else {
            setMilestone({
                title: `${years === 1 ? '1st' : years === 2 ? '2nd' : years + 'th'} Anniversary`,
                daysLeft: daysToAnniversary,
                date: nextAnniversary.toLocaleDateString(),
                icon: '🎉'
            });
        }

    }, []);

    if (!milestone) return null;

    return (
        <div className="pop-card" style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', // Orange tinted
            border: '2px solid #FED7AA',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    fontSize: '2rem',
                    background: 'white',
                    width: '50px', height: '50px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    {milestone.icon}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#9A3412', textTransform: 'uppercase', letterSpacing: '1px' }}>Next Milestone</h3>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#431407' }}>
                        {milestone.title}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#EA580C', lineHeight: 1 }}>
                    {milestone.daysLeft}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9A3412' }}>days</div>
            </div>
        </div>
    );
};

export default NextMilestoneCard;
