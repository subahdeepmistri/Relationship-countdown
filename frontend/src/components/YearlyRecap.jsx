import React, { useState } from 'react';
import { useAppStats } from '../hooks/useDataHooks';

const YearlyRecap = ({ onClose }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Use centralized hook instead of direct localStorage
    const { stats: appStats, loading } = useAppStats();

    // Map hook data to expected format
    const stats = {
        year: appStats?.year || new Date().getFullYear(),
        totalDays: appStats?.totalDays || 0,
        capsulesCount: appStats?.capsules?.total || 0,
        goalsCount: appStats?.goals?.total || 0,
        completedGoals: appStats?.goals?.achieved || 0
    };

    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 1200);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            color: 'white',
            zIndex: 1700,
            overflowY: 'auto',
            padding: '80px 20px 140px 20px',
            textAlign: 'center'
        }}>
            {/* Atmospheric Gradients */}
            <div style={{
                position: 'fixed', top: '-10%', right: '-15%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', left: '-15%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(251, 113, 133, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', top: '30%', left: '50%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
                filter: 'blur(50px)',
                transform: 'translateX(-50%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 2000,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
            >✕</button>

            <div id="recap-content" style={{
                maxWidth: '480px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '50px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.8rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '20px'
                }}>
                    ✨ Year in Review
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '3.5rem',
                    marginBottom: '12px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #a5f3fc 0%, #c4b5fd 50%, #fda4af 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px',
                    textShadow: '0 0 60px rgba(196, 181, 253, 0.3)'
                }}>
                    {stats.year}
                </h1>
                <p style={{
                    opacity: 0.7,
                    marginBottom: '50px',
                    fontSize: '1.15rem',
                    fontFamily: "var(--font-serif, 'Dancing Script', cursive)",
                    color: '#cbd5e1'
                }}>
                    A look back at our beautiful journey.
                </p>

                {/* Stats Cards */}
                <StatCard
                    value={stats.totalDays.toLocaleString()}
                    label="Days of Love"
                    icon="💗"
                    gradient="linear-gradient(135deg, rgba(251, 113, 133, 0.15) 0%, rgba(251, 113, 133, 0.05) 100%)"
                    accentColor="#fda4af"
                    delay="0.1s"
                    zeroState="Just Started"
                />
                <StatCard
                    value={stats.capsulesCount}
                    label="Time Capsules Sealed"
                    icon="🔐"
                    gradient="linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)"
                    accentColor="#c4b5fd"
                    delay="0.2s"
                    zeroState="None Yet"
                />
                <StatCard
                    value={
                        stats.goalsCount > 0
                            ? (stats.completedGoals > 0 ? `${stats.completedGoals} / ${stats.goalsCount}` : "In Progress")
                            : "No Goals Yet"
                    }
                    label="Dreams Achieved"
                    icon="🌟"
                    gradient="linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%)"
                    accentColor="#7dd3fc"
                    delay="0.3s"
                    zeroState="Start Dreaming"
                />

                {/* Love Letter Card */}
                <div style={{
                    marginTop: '50px',
                    padding: '32px',
                    background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    borderRadius: '28px',
                    animation: 'fadeInUp 0.8s ease 0.4s backwards',
                    textAlign: 'left',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative sparkle */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '20px',
                        fontSize: '1.5rem',
                        opacity: 0.3
                    }}>💌</div>

                    <h3 style={{
                        fontFamily: "var(--font-serif, 'Dancing Script', cursive)",
                        marginBottom: '18px',
                        fontSize: '1.8rem',
                        background: 'linear-gradient(90deg, #fda4af, #c4b5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '600'
                    }}>To My Favorite Person</h3>
                    <p style={{
                        lineHeight: '1.9',
                        fontSize: '1.05rem',
                        color: '#e2e8f0',
                        fontFamily: "var(--font-serif, 'Dancing Script', cursive)"
                    }}>
                        "In every year, every month, and every second, choosing you is my favorite decision.
                        Here's to everything we built in {stats.year}, and everything still to come."
                    </p>
                    <div style={{
                        marginTop: '20px',
                        textAlign: 'right',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                    }}>— With all my love 💖</div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        marginTop: '50px',
                        padding: '18px 50px',
                        background: saved
                            ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                            : isSaving
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: isSaving ? 'wait' : 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        margin: '50px auto 20px auto',
                        boxShadow: saved
                            ? '0 15px 35px rgba(16, 185, 129, 0.4)'
                            : '0 15px 35px rgba(139, 92, 246, 0.3)',
                        transform: saved ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={e => {
                        if (!isSaving && !saved) {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isSaving && !saved) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.3)';
                        }
                    }}
                >
                    {isSaving ? (
                        <>
                            <span style={{
                                animation: 'spin 1s linear infinite',
                                display: 'inline-block'
                            }}>⏳</span>
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <span>✓</span> Saved to Gallery
                        </>
                    ) : (
                        <>
                            <span>📸</span> Save as Image
                        </>
                    )}
                </button>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ value, label, icon, gradient, accentColor, delay, zeroState }) => {
    const isZero = value === 0 || value === "0" || value === "None Yet" || value === "No Goals Yet";
    const displayValue = isZero ? zeroState : value;

    return (
        <div style={{
            marginBottom: '20px',
            padding: '28px 24px',
            background: gradient,
            borderRadius: '24px',
            animation: `fadeInUp 0.6s ease ${delay} backwards`,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            textAlign: 'left',
            transition: 'all 0.3s ease'
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Icon */}
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                flexShrink: 0
            }}>
                {icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: isZero ? '1.4rem' : '2.2rem',
                    fontWeight: '800',
                    color: isZero ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: '-1px',
                    lineHeight: 1.1,
                    marginBottom: '6px'
                }}>
                    {displayValue}
                </div>
                <div style={{
                    color: accentColor,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

export default YearlyRecap;
