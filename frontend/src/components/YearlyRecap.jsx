import React, { useMemo } from 'react';

const YearlyRecap = ({ onClose }) => {
    const stats = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        // Dynamic Date using rc_start_date from setup
        const startDateStr = localStorage.getItem('rc_start_date') || '2023-01-24';
        const startDate = new Date(startDateStr);

        // Calculate days together roughly
        const diff = today - startDate;
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        // Count data
        const capsules = JSON.parse(localStorage.getItem('rc_capsules') || '[]');
        const goals = JSON.parse(localStorage.getItem('rc_goals') || '[]');
        const completedGoals = goals.filter(g => g.status === 'achieved').length;

        return {
            year: currentYear,
            totalDays,
            capsulesCount: capsules.length,
            goalsCount: goals.length,
            completedGoals
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: '#1a1a1a',
            color: 'white',
            zIndex: 1700,
            overflowY: 'auto',
            padding: '40px 20px',
            textAlign: 'center'
        }}>
            <button onClick={onClose} style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 2000,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                cursor: 'pointer'
            }}>✕</button>

            <div style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '50px' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '3rem', marginBottom: '10px', background: 'linear-gradient(to right, #d4fc79, #96e6a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stats.year} Wrap Up
                </h1>
                <p style={{ opacity: 0.7, marginBottom: '50px', fontSize: '1.2rem' }}>Another year of us.</p>

                <StatCard value={stats.totalDays} label="Days Loved" delay="0.2s" />
                <StatCard value={stats.capsulesCount} label="Time Capsules Sealed" delay="0.4s" />
                <StatCard value={`${stats.completedGoals} / ${stats.goalsCount}`} label="Dreams Achieved" delay="0.6s" />

                <div className="pop-card" style={{
                    marginTop: '50px',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.1)',
                    animation: 'fadeInUp 1s ease 0.8s backwards'
                }}>
                    <h3 style={{ fontFamily: 'serif', marginBottom: '20px' }}>To My Favorite Person</h3>
                    <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
                        "In every year, every month, and every second, choosing you is my favorite decision. Here's to everything we built in {stats.year}."
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    style={{ marginTop: '50px', padding: '15px 30px', border: '1px solid white', borderRadius: '30px', color: 'white' }}
                >
                    Save as Image
                </button>
            </div>

            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

const StatCard = ({ value, label, delay }) => (
    <div style={{
        marginBottom: '20px',
        padding: '30px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        animation: `fadeInUp 0.8s ease ${delay} backwards`
    }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{value}</div>
        <div style={{ opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>{label}</div>
    </div>
);

export default YearlyRecap;
