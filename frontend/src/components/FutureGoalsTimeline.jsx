import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoals } from '../hooks/useDataHooks';

const FutureGoalsTimeline = ({ onClose }) => {
    // Use centralized hook instead of direct localStorage
    const {
        goals,
        loading,
        error,
        addGoal: addGoalToHook,
        toggleStatus: toggleStatusInHook,
        deleteGoal,
        clearError
    } = useGoals();

    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const addGoal = () => {
        if (!newTitle) return;

        const result = addGoalToHook(newTitle, newDate);

        if (result.success) {
            setNewTitle('');
            setNewDate('');
            setShowSuccessToast(true);
            triggerConfetti();
            setTimeout(() => setShowSuccessToast(false), 3000);
        }
    };

    const toggleStatus = (id) => {
        const goal = goals.find(g => g.id === id);
        const isCompleting = goal?.status === 'planned';

        toggleStatusInHook(id);

        if (isCompleting) {
            triggerConfetti();
        }
    };

    const confirmDelete = () => {
        if (goalToDelete) {
            deleteGoal(goalToDelete);
            setGoalToDelete(null);
        }
    };

    const triggerConfetti = () => {
        const count = 300;
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6']
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)', // Deep Night w/ slight glow top
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 110px',
            color: 'white',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Grain/Vignette Overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                pointerEvents: 'none', zIndex: 0, opacity: 0.4
            }} />
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Background Atmosphere Blobs - Matching Time Capsule */}
            <div className="animate-pulse-slow" style={{ position: 'fixed', top: '-10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
            <div className="animate-float" style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

            {/* Delete Confirmation Modal - Premium Dark Theme */}
            {goalToDelete && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={() => setGoalToDelete(null)}
                >
                    <div
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '28px',
                            padding: '32px 28px',
                            maxWidth: '340px',
                            width: '90%',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Warning Icon */}
                        <div style={{
                            width: '72px', height: '72px',
                            margin: '0 auto 20px',
                            background: 'rgba(251, 191, 36, 0.15)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(251, 191, 36, 0.3)'
                        }}>
                            <span style={{ fontSize: '2rem' }}>🌙</span>
                        </div>

                        <h3 style={{
                            color: 'white',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            Let This Dream Go?
                        </h3>

                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            margin: '0 0 28px 0',
                            lineHeight: '1.5'
                        }}>
                            This dream will fade from your timeline. Are you ready to release it?
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setGoalToDelete(null)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Keep It
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Release
                            </button>
                        </div>

                        <p style={{
                            marginTop: '18px',
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.3)',
                            fontStyle: 'italic'
                        }}>
                            Some dreams are meant to be revisited later
                        </p>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Success Toast */}
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            style={{
                                position: 'fixed', bottom: '100px', left: '50%', x: '-50%',
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: '#064e3b',
                                padding: '12px 24px', borderRadius: '50px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)',
                                zIndex: 5000,
                                fontWeight: '600',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <span>❤️</span> Another memory added
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed', top: '24px', right: '24px',
                        fontSize: '1.2rem', // Slightly smaller icon relative to button
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        width: '44px', height: '44px', // Standardized Size
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.15)', // Subtle border
                        cursor: 'pointer', zIndex: 3001,
                        color: 'white',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '30px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.6)', marginBottom: '15px', backdropFilter: 'blur(5px)'
                    }}>
                        Shared Horizon
                    </div>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        letterSpacing: '-1px'
                    }}>Our Future</h2>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-serif)', maxWidth: '400px', margin: '0 auto' }}>Dreams we are building together.</p>
                </div>

                <div style={{ position: 'relative', paddingLeft: '30px' }}>

                    {/* Timeline Line Removed as per user request */}

                    {goals.length === 0 && (
                        <div style={{
                            padding: '40px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '30px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            marginBottom: '40px'
                        }}>
                            <span className="animate-pulse-slow" style={{ fontSize: '3rem', display: 'block', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>✨</span>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: 'white', fontFamily: 'var(--font-heading)' }}>A Blank Canvas</h3>
                            <p style={{ opacity: 0.7, margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                                The future is yours to write.<br />Add a dream to start your journey.
                            </p>
                        </div>
                    )}

                    {goals.map((goal, index) => (
                        <div key={goal.id} style={{ marginBottom: '50px', position: 'relative' }}>
                            {/* Timeline Dot */}
                            <div style={{
                                position: 'absolute', left: '-39px', top: '25px',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: goal.status === 'achieved' ? '#10B981' : '#1e293b',
                                border: goal.status === 'achieved' ? '4px solid #10B981' : '3px solid #38bdf8',
                                boxShadow: `0 0 25px ${goal.status === 'achieved' ? '#10B981' : '#38bdf8'}`,
                                zIndex: 2,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                animation: goal.status !== 'achieved' ? 'pulse-slow 3s infinite ease-in-out' : 'none'
                            }} />

                            <div style={{
                                padding: '24px',
                                background: goal.status === 'achieved'
                                    ? 'linear-gradient(135deg, rgba(236, 252, 241, 0.95), rgba(209, 250, 229, 0.9))'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: goal.status === 'achieved' ? '#064e3b' : 'white',
                                backdropFilter: 'blur(12px)',
                                border: goal.status === 'achieved'
                                    ? 'none'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '30px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: goal.status === 'achieved'
                                    ? '0 20px 50px -10px rgba(16, 185, 129, 0.3)'
                                    : '0 10px 30px rgba(0,0,0,0.2)',
                                transform: goal.status === 'achieved' ? 'scale(1.02)' : 'scale(1)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        {goal.status === 'achieved' && (
                                            <div style={{
                                                fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
                                                color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <span>✨</span> Dream Come True
                                            </div>
                                        )}
                                        {goal.status !== 'achieved' && (
                                            <div style={{
                                                fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                                                color: 'rgba(255,255,255,0.5)', marginBottom: '8px'
                                            }}>
                                                On our Horizon
                                            </div>
                                        )}

                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '1.5rem',
                                            color: goal.status === 'achieved' ? '#064e3b' : 'white',
                                            fontWeight: '700',
                                            fontFamily: 'var(--font-heading)',
                                            lineHeight: '1.3'
                                        }}>
                                            {goal.title}
                                        </h3>
                                        {goal.date && (
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: goal.status === 'achieved' ? '#10b981' : '#cbd5e1', // Neutral for future, Green for done
                                                margin: 0,
                                                fontWeight: '500',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontFamily: 'var(--font-sans, sans-serif)'
                                            }}>
                                                📅 Target: {new Date(goal.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setGoalToDelete(goal.id)}
                                        style={{
                                            opacity: 0.3, fontSize: '1.1rem',
                                            border: 'none', background: 'transparent',
                                            cursor: 'pointer', color: goal.status === 'achieved' ? '#059669' : '#fda4af',
                                            padding: '8px',
                                            transition: 'all 0.3s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Let this dream go"
                                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.2)' }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.transform = 'scale(1)' }}
                                    >🗑️</button>
                                </div>

                                <button
                                    onClick={() => toggleStatus(goal.id)}
                                    style={{
                                        marginTop: '25px',
                                        width: '100%',
                                        fontSize: '1rem',
                                        padding: '16px 24px',
                                        borderRadius: '20px',
                                        background: goal.status === 'achieved' ? 'linear-gradient(135deg, #10B981, #34D399)' : 'rgba(255,255,255,0.08)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                        letterSpacing: '0.5px',
                                        boxShadow: goal.status === 'achieved'
                                            ? '0 10px 40px rgba(16, 185, 129, 0.5)'
                                            : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        opacity: goal.status === 'achieved' ? 1 : 0.8
                                    }}
                                    onMouseEnter={e => {
                                        if (goal.status !== 'achieved') {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                            e.currentTarget.style.opacity = '1';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (goal.status !== 'achieved') {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.opacity = '0.8';
                                        }
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {goal.status === 'achieved' ? (
                                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                            We did it ❤️
                                        </motion.div>
                                    ) : (
                                        <>We did it ❤️</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Goal Form - Redesigned */}
                    <div style={{ marginTop: '80px', position: 'relative', marginBottom: '80px' }}>{/* Increased spacing */}
                        {/* Connecting Line Continuation Removed */}

                        <div className="glass-card" style={{
                            padding: '30px',
                            background: 'rgba(30, 41, 59, 0.6)', // Deep slate glass
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '32px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(15px)'
                        }}>
                            <h4 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontFamily: 'var(--font-heading)' }}>
                                <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>+</span>
                                Add New Dream
                            </h4>

                            <input
                                type="text"
                                placeholder="What's our next big adventure?"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{
                                    width: '100%', padding: '18px 20px', marginBottom: '15px',
                                    borderRadius: '20px',
                                    border: '2px solid transparent',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-serif)'
                                }}
                                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(129, 140, 248, 0.5)'; }}
                                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'transparent'; }}
                            />
                            <input
                                type="date"
                                value={newDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setNewDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '18px 20px', marginBottom: '25px',
                                    borderRadius: '20px',
                                    border: '2px solid transparent',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    outline: 'none',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(129, 140, 248, 0.5)'; }}
                                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'transparent'; }}
                            />

                            <button
                                onClick={addGoal}
                                disabled={!newTitle.trim()}
                                style={{
                                    background: !newTitle.trim()
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'var(--accent-lux-gradient)',
                                    color: !newTitle.trim() ? 'rgba(255,255,255,0.2)' : 'white',
                                    padding: '18px 20px', borderRadius: '50px', width: '100%', border: 'none',
                                    fontWeight: '800',
                                    cursor: !newTitle.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: !newTitle.trim() ? 'none' : '0 10px 30px rgba(251, 113, 133, 0.4)',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseDown={e => { if (newTitle.trim()) e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={e => { if (newTitle.trim()) e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                Add to Timeline 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureGoalsTimeline;
