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
    const [expandedIds, setExpandedIds] = useState(new Set()); // For accordion collapse
    const [showAddForm, setShowAddForm] = useState(false); // Collapsible form

    const addGoal = () => {
        if (!newTitle) return;

        const result = addGoalToHook(newTitle, newDate);

        if (result.success) {
            setNewTitle('');
            setNewDate('');
            setShowSuccessToast(true);
            triggerConfetti();
            setTimeout(() => setShowSuccessToast(false), 3000);

            // Auto close form after adding
            setTimeout(() => setShowAddForm(false), 1500);
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

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
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
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)',
            zIndex: 3000,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            padding: '80px 16px 110px',
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

            {/* Background Atmosphere Blobs */}
            <div className="animate-pulse-slow" style={{ position: 'fixed', top: '-10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
            <div className="animate-float" style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

            {/* Delete Confirmation Modal */}
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
                            <span style={{ fontSize: '2rem' }}>🌛</span>
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
                            <span>💖</span> Another memory added
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onClose}
                    aria-label="Close Dreams view"
                    style={{
                        position: 'fixed', top: '24px', right: '24px',
                        fontSize: '1.2rem',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        width: '48px', height: '48px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer', zIndex: 3001,
                        color: 'white',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>


                    {/* Premium Badge */}
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(192, 132, 252, 0.15) 100%)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        fontSize: '0.7rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: '#818cf8',
                        marginBottom: '16px',
                        backdropFilter: 'blur(10px)',
                        fontWeight: '600'
                    }}>
                        <span>🚀 Shared Horizon</span>
                    </div>

                    <h2 style={{
                        fontSize: '2.4rem',
                        fontFamily: 'var(--font-heading)',
                        margin: '0 0 10px 0',
                        background: 'linear-gradient(135deg, #fff 0%, #818cf8 50%, #c084fc 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 4s ease infinite',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700'
                    }}>Our Future</h2>

                    <p style={{
                        fontSize: '0.95rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'var(--font-serif)',
                        maxWidth: '400px',
                        margin: '0 auto',
                        fontStyle: 'italic'
                    }}>Dreams we're building together</p>
                </div>

                <div style={{ position: 'relative', paddingBottom: '40px' }}>

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            padding: '40px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '30px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            marginBottom: '40px',
                            textAlign: 'center'
                        }}>
                            <div className="animate-pulse-slow" style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px'
                            }} />
                            <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', margin: '0 auto 10px' }} />
                        </div>
                    )}

                    {!loading && goals.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 24px',
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            marginBottom: '40px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto 16px',
                                background: 'rgba(129, 140, 248, 0.1)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(129, 140, 248, 0.2)',
                            }}>
                                <span style={{ fontSize: '1.8rem' }}>🚀</span>
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>A Blank Canvas</h3>
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                The future is yours to write. <br /> Add a dream to start.
                            </p>
                        </div>
                    )}

                    {/* Accordion List of Goals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                        {goals.map((goal) => {
                            const isExpanded = expandedIds.has(goal.id);
                            return (
                                <div key={goal.id} className="glass-card" style={{
                                    padding: '0',
                                    background: goal.status === 'achieved'
                                        ? 'linear-gradient(135deg, rgba(236, 252, 241, 0.9), rgba(209, 250, 229, 0.8))'
                                        : 'rgba(255, 255, 255, 0.06)',
                                    backdropFilter: 'blur(10px)',
                                    border: goal.status === 'achieved' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Compact Header */}
                                    <button
                                        onClick={() => toggleExpand(goal.id)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Status Dot */}
                                            <div style={{
                                                width: '12px', height: '12px', borderRadius: '50%',
                                                background: goal.status === 'achieved' ? '#10B981' : '#38bdf8',
                                                boxShadow: `0 0 10px ${goal.status === 'achieved' ? '#10B981' : '#38bdf8'}`,
                                                flexShrink: 0
                                            }} />

                                            <div style={{ overflow: 'hidden' }}>
                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: '1rem',
                                                    color: goal.status === 'achieved' ? '#064e3b' : 'white',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>{goal.title}</h3>

                                                {goal.date && (
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        color: goal.status === 'achieved' ? '#10b981' : 'rgba(255,255,255,0.5)',
                                                        margin: '2px 0 0 0',
                                                        fontWeight: '500'
                                                    }}>
                                                        Target: {new Date(goal.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chevron Arrow */}
                                        <div style={{
                                            width: '28px', height: '28px',
                                            borderRadius: '50%',
                                            background: isExpanded
                                                ? (goal.status === 'achieved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(96, 165, 250, 0.2)')
                                                : (goal.status === 'achieved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.08)'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.3s ease',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                stroke={isExpanded
                                                    ? (goal.status === 'achieved' ? '#059669' : '#60a5fa')
                                                    : (goal.status === 'achieved' ? '#059669' : 'rgba(255,255,255,0.5)')}
                                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{
                                                    padding: '0 16px 16px 16px',
                                                    borderTop: goal.status === 'achieved'
                                                        ? '1px solid rgba(16, 185, 129, 0.1)'
                                                        : '1px solid rgba(255,255,255,0.06)'
                                                }}>
                                                    <button
                                                        onClick={() => toggleStatus(goal.id)}
                                                        style={{
                                                            marginTop: '12px',
                                                            width: '100%',
                                                            padding: '12px',
                                                            borderRadius: '12px',
                                                            background: goal.status === 'achieved' ? '#10B981' : 'rgba(255,255,255,0.1)',
                                                            color: 'white',
                                                            border: 'none',
                                                            fontWeight: '600',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {goal.status === 'achieved' ? 'Completed! 🥳' : 'Mark as Completed'}
                                                    </button>

                                                    <button
                                                        onClick={() => setGoalToDelete(goal.id)}
                                                        style={{
                                                            marginTop: '8px',
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: 'transparent',
                                                            color: goal.status === 'achieved' ? '#047857' : '#f87171',
                                                            border: 'none',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            opacity: 0.7,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                        }}
                                                    >
                                                        <span>🗑️</span> Release Dream
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add New Dream Form - Collapsible */}
                    <div className="glass-card" style={{
                        marginTop: '20px',
                        padding: '0',
                        background: 'rgba(30, 41, 59, 0.7)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Toggle Header */}
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                background: showAddForm ? 'rgba(255,255,255,0.03)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    borderRadius: '50%',
                                    width: '28px', height: '28px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                                    color: 'white'
                                }}>+</span>
                                <span style={{
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    fontFamily: 'var(--font-heading)'
                                }}>Add New Dream</span>
                            </div>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: showAddForm ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                transform: showAddForm ? 'rotate(45deg)' : 'rotate(0deg)'
                            }}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={showAddForm ? '#818cf8' : 'rgba(255,255,255,0.6)'}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                        </button>

                        {/* Expandable Form Content */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{
                                        padding: '0 20px 20px 20px',
                                        borderTop: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>

                                            <div className="journey-input-group">
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>Dream Title</label>
                                                <input
                                                    placeholder="What's our next big adventure?"
                                                    value={newTitle}
                                                    onChange={e => setNewTitle(e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '12px',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px', color: 'white', fontSize: '0.95rem', fontWeight: '500', outline: 'none',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={e => {
                                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        e.target.style.borderColor = '#818cf8';
                                                        e.target.style.boxShadow = '0 0 10px rgba(129, 140, 248, 0.2)';
                                                    }}
                                                    onBlur={e => {
                                                        e.target.style.background = 'rgba(0,0,0,0.2)';
                                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>

                                            <div className="journey-input-group">
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>Target Date (Optional)</label>
                                                <input
                                                    type="date"
                                                    value={newDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={e => setNewDate(e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '12px',
                                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px', color: 'white', fontSize: '0.9rem', fontFamily: 'sans-serif',
                                                        outline: 'none', transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={e => {
                                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        e.target.style.borderColor = '#818cf8';
                                                    }}
                                                    onBlur={e => {
                                                        e.target.style.background = 'rgba(0,0,0,0.2)';
                                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    }}
                                                />
                                            </div>

                                            <button
                                                onClick={addGoal}
                                                disabled={!newTitle.trim()}
                                                style={{
                                                    width: '100%', padding: '14px',
                                                    background: !newTitle.trim() ? 'rgba(255,255,255,0.08)' : 'var(--accent-lux-gradient)',
                                                    color: !newTitle.trim() ? 'rgba(255,255,255,0.4)' : 'white',
                                                    borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem',
                                                    border: 'none', cursor: !newTitle.trim() ? 'not-allowed' : 'pointer', marginTop: '4px',
                                                    boxShadow: !newTitle.trim() ? 'none' : '0 6px 24px rgba(99, 102, 241, 0.3)',
                                                    letterSpacing: '0.3px', textTransform: 'uppercase',
                                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                                }}
                                                onMouseEnter={e => {
                                                    if (newTitle.trim()) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.45)';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (newTitle.trim()) {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.3)';
                                                    }
                                                }}
                                            >
                                                Add to Timeline 🚀
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureGoalsTimeline;
