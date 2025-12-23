import React, { useMemo, useState } from 'react';
import html2canvas from 'html2canvas';

const YearlyRecap = ({ onClose }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
            totalDays: totalDays > 0 ? totalDays : 0,
            capsulesCount: capsules.length,
            goalsCount: goals.length,
            completedGoals
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save process
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            // In a real browser context, this print/save logic might differ
            // For now, we simulate the emotional feedback of "saving"
        }, 1200);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: '#1a1a1a',
            color: 'white',
            zIndex: 1700,
            overflowY: 'auto',
            padding: '40px 20px 140px 20px',
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
                cursor: 'pointer',
                transition: 'transform 0.2s'
            }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >✕</button>

            <div id="recap-content" style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '50px' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '3rem', marginBottom: '10px', background: 'linear-gradient(to right, #d4fc79, #96e6a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stats.year} Wrap Up
                </h1>
                <p style={{ opacity: 0.7, marginBottom: '50px', fontSize: '1.2rem' }}>
                    A look back at our journey this year.
                </p>

                <StatCard
                    value={stats.totalDays}
                    label="Days Loved"
                    delay="0.2s"
                    zeroState="Just Started"
                />
                <StatCard
                    value={stats.capsulesCount}
                    label="Time Capsules Sealed"
                    delay="0.4s"
                    zeroState="0 Locked"
                />
                <StatCard
                    value={
                        stats.goalsCount > 0
                            ? (stats.completedGoals > 0 ? `${stats.completedGoals} / ${stats.goalsCount}` : "Time to make memories! 🚀")
                            : "No Goals Yet"
                    }
                    label={stats.completedGoals === 0 && stats.goalsCount > 0 ? (<span>No dreams marked complete yet</span>) : "Dreams Achieved"}
                    delay="0.6s"
                    zeroState="Start Dreaming"
                    isRatio={false} // Disable ratio logic to show full text
                />

                <div className="pop-card" style={{
                    marginTop: '50px',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    animation: 'fadeInUp 1s ease 0.8s backwards',
                    textAlign: 'left'
                }}>
                    <h3 style={{ fontFamily: 'serif', marginBottom: '20px', fontSize: '1.5rem' }}>To My Favorite Person</h3>
                    <p style={{ lineHeight: '1.8', opacity: 0.9, fontSize: '1.1rem' }}>
                        "In every year, every month, and every second, choosing you is my favorite decision. Here's to everything we built in {stats.year}, and everything still to come."
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        marginTop: '50px',
                        padding: '16px 40px',
                        background: saved ? '#10B981' : 'transparent',
                        border: saved ? 'none' : '2px solid rgba(255,255,255,0.5)',
                        borderRadius: '50px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        margin: '50px auto 20px auto'
                    }}
                >
                    {isSaving ? 'Saving...' : saved ? 'Saved to Gallery 📸' : 'Save as Image'}
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

const StatCard = ({ value, label, delay, zeroState, isRatio }) => {
    // Determine display logic
    let displayValue = value;
    let isZero = value === 0 || value === "0";

    if (isRatio) {
        // Check if "0 / 0" effectively
        if (value === "0" || value === "0 / 0") {
            displayValue = zeroState;
            isZero = true;
        }
    } else if (value === 0) {
        displayValue = zeroState;
    }

    return (
        <div style={{
            marginBottom: '20px',
            padding: '30px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            animation: `fadeInUp 0.8s ease ${delay} backwards`,
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{
                fontSize: isZero ? '2rem' : '3rem',
                fontWeight: 'bold',
                color: isZero ? 'rgba(255,255,255,0.6)' : 'white'
            }}>
                {displayValue}
            </div>
            <div style={{ opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '5px' }}>
                {label}
            </div>
        </div>
    );
};

export default YearlyRecap;
