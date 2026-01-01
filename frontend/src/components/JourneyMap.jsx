import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const JourneyMap = ({ onClose }) => {
    const [milestones, setMilestones] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isLaunching, setIsLaunching] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // For delete confirmation modal
    const [expandedIds, setExpandedIds] = useState(new Set()); // For accordion collapse

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

    const [showAddForm, setShowAddForm] = useState(false); // Collapsible form

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_journey') || '[]');
        setMilestones(saved.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, []);

    const addMilestone = () => {
        if (!newTitle || !newDate) return;

        setIsLaunching(true);

        const item = { id: Date.now(), title: newTitle, date: newDate, desc: newDesc };
        const updated = [...milestones, item].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Slight delay for animation to play
        setTimeout(() => {
            setMilestones(updated);
            localStorage.setItem('rc_journey', JSON.stringify(updated));
            setNewTitle(''); setNewDate(''); setNewDesc('');
            setIsLaunching(false);

            // Success Feedback
            // triggerConfetti(); // Confetti is already triggered below in original code, but we'll ensure it flows
            triggerConfetti();
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }, 800);
    };

    // Show delete confirmation modal
    const requestDelete = (id) => {
        setDeleteConfirmId(id);
    };

    // Perform the actual delete
    const confirmDelete = () => {
        if (!deleteConfirmId) return;
        const updated = milestones.filter(m => m.id !== deleteConfirmId);
        setMilestones(updated);
        localStorage.setItem('rc_journey', JSON.stringify(updated));
        setDeleteConfirmId(null);
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = { origin: { y: 0.9 }, spread: 90, startVelocity: 45 };

        function fire(particleRatio, opts) {
            confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
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

            {/* Delete Confirmation Modal - Premium Dark Theme */}
            {deleteConfirmId && (
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
                    onClick={cancelDelete}
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
                        {/* Icon */}
                        <div style={{
                            width: '72px', height: '72px',
                            margin: '0 auto 20px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <span style={{ fontSize: '2rem' }}>📃</span>
                        </div>

                        <h3 style={{
                            color: 'white',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            Erase This Chapter?
                        </h3>

                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            margin: '0 0 28px 0',
                            lineHeight: '1.5'
                        }}>
                            This moment will be removed from your story. Are you sure you want to let it go?
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={cancelDelete}
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
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Remove
                            </button>
                        </div>

                        <p style={{
                            marginTop: '18px',
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.3)',
                            fontStyle: 'italic'
                        }}>
                            Every chapter matters, even the quiet ones
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
                            <span>💖</span> Another memory added
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed', top: '24px', right: '24px',
                        fontSize: '1.2rem', // Standardized
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)', width: '44px', height: '44px', // Standardized Size 44px
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', zIndex: 3001,
                        color: 'white',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>


                    {/* Premium Badge with Shimmer */}
                    <div style={{
                        display: 'inline-block',
                        padding: '8px 20px',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        fontSize: '0.75rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        color: '#60a5fa',
                        marginBottom: '20px',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        overflow: 'hidden',
                        fontWeight: '600'
                    }}>
                        {/* Shimmer overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer-badge 3s ease-in-out infinite',
                            pointerEvents: 'none'
                        }} />
                        <span style={{ position: 'relative', zIndex: 1 }}>📔 Your Story 📔</span>
                    </div>

                    {/* Premium Title */}
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.8rem',
                        margin: '0 0 12px 0',
                        background: 'linear-gradient(135deg, #fff 0%, #60a5fa 50%, #a78bfa 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 4s ease infinite',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 20px rgba(96, 165, 250, 0.3))',
                        letterSpacing: '-1px',
                        fontWeight: '700'
                    }}>Our Timeline</h2>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-serif)',
                        maxWidth: '400px',
                        margin: '0 auto',
                        fontStyle: 'italic'
                    }}>Every chapter of our story, written in love</p>
                </div>

                <style>{`
                    .launch-anim { animation: launchRocket 0.8s cubic-bezier(0.11, 0, 0.5, 0) forwards; }
                    @keyframes launchRocket {
                        0% { transform: translateY(0) scale(1); }
                        40% { transform: translateY(20px) scale(0.9); }
                        100% { transform: translateY(-500px) scale(0.5); opacity: 0; }
                    }
                    .journey-input-group:focus-within label { color: #f472b6; }
                `}</style>

                <div className="journey-container" style={{ marginTop: '50px' }}>
                    {/* Center Line - Only show if there are milestones */}
                    {milestones.length > 0 && <div className="journey-line" />}

                    {milestones.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '50px 30px',
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            marginBottom: '40px',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative gradient orb */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '100px',
                                height: '100px',
                                background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }} />

                            {/* Animated Book Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(96, 165, 250, 0.2)',
                                animation: 'float-gentle 4s ease-in-out infinite'
                            }}>
                                <span style={{ fontSize: '2.5rem' }}>📔</span>
                            </div>

                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '1.3rem',
                                color: 'white',
                                fontWeight: '600'
                            }}>Your story begins here</h3>

                            <p style={{
                                margin: '0 0 20px 0',
                                fontSize: '0.95rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.6
                            }}>
                                Every great love story has its chapters.<br />
                                Add your first memorable moment below.
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.3)'
                            }}>
                                <span>⬇️</span>
                                <span>Scroll down to add a chapter</span>
                            </div>
                        </div>
                    )}

                    {milestones.map((m, i) => {
                        const isExpanded = expandedIds.has(m.id);
                        return (
                            <div key={m.id} className={`journey-item ${i % 2 === 0 ? 'right' : 'left'}`}>
                                {/* Dot */}
                                <div className="journey-dot" />

                                <div className="glass-card journey-card" style={{
                                    padding: '0',
                                    textAlign: 'left',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Compact Header - Always Visible */}
                                    <button
                                        onClick={() => toggleExpand(m.id)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
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
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#60a5fa',
                                                fontWeight: '600',
                                                display: 'block',
                                                marginBottom: '2px'
                                            }}>
                                                {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: '1rem',
                                                color: 'white',
                                                fontFamily: 'var(--font-heading)',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>{m.title}</h4>
                                        </div>

                                        {/* Chevron Arrow */}
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: isExpanded ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.3s ease',
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}>
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={isExpanded ? '#60a5fa' : 'rgba(255,255,255,0.5)'}
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Expandable Content */}
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
                                                    padding: '0 16px 14px 16px',
                                                    borderTop: '1px solid rgba(255,255,255,0.06)'
                                                }}>
                                                    {m.desc && (
                                                        <p style={{
                                                            fontSize: '0.85rem',
                                                            margin: '12px 0 0 0',
                                                            color: 'rgba(255,255,255,0.7)',
                                                            lineHeight: 1.5
                                                        }}>{m.desc}</p>
                                                    )}
                                                    <button onClick={() => requestDelete(m.id)} style={{
                                                        color: '#f87171',
                                                        opacity: 0.6,
                                                        marginTop: m.desc ? '10px' : '12px',
                                                        fontSize: '0.7rem',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: 0
                                                    }}>
                                                        <span>🗑️</span> Remove
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add New Chapter - Collapsible */}
                <div className="glass-card" style={{
                    marginTop: '40px',
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
                            <span style={{ fontSize: '1.3rem' }}>✍️</span>
                            <span style={{
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                fontFamily: 'var(--font-heading)'
                            }}>Add a New Chapter</span>
                        </div>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: showAddForm ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.1)',
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
                                stroke={showAddForm ? '#ec4899' : 'rgba(255,255,255,0.6)'}
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
                                    <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }} className={isLaunching ? 'launch-anim' : ''}>

                                        <div className="journey-input-group">
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#94a3b8', transition: 'color 0.3s' }}>Moment Title</label>
                                            <input
                                                placeholder="e.g. The First Date"
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
                                                    e.target.style.borderColor = '#fb7185';
                                                    e.target.style.boxShadow = '0 0 10px rgba(251, 113, 133, 0.2)';
                                                }}
                                                onBlur={e => {
                                                    e.target.style.background = 'rgba(0,0,0,0.2)';
                                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>

                                        <div className="journey-input-group">
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#94a3b8', transition: 'color 0.3s' }}>When did it happen?</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none', opacity: 0.7 }}>📅</span>
                                                <input
                                                    type="date"
                                                    value={newDate}
                                                    onChange={e => setNewDate(e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '12px 12px 12px 38px',
                                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px', color: 'white', fontSize: '0.9rem', fontFamily: 'sans-serif',
                                                        outline: 'none', transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={e => {
                                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                                        e.target.style.borderColor = '#60a5fa';
                                                    }}
                                                    onBlur={e => {
                                                        e.target.style.background = 'rgba(0,0,0,0.2)';
                                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="journey-input-group">
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#94a3b8', transition: 'color 0.3s' }}>Memory Details (optional)</label>
                                            <textarea
                                                placeholder="A moment you'll never forget..."
                                                value={newDesc}
                                                onChange={e => setNewDesc(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '12px', minHeight: '70px',
                                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px', color: 'white', fontSize: '0.9rem', resize: 'vertical',
                                                    outline: 'none', transition: 'all 0.3s ease',
                                                    fontFamily: "'Inter', sans-serif",
                                                    lineHeight: '1.5'
                                                }}
                                                onFocus={e => {
                                                    e.target.style.background = 'rgba(255,255,255,0.05)';
                                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                                }}
                                                onBlur={e => {
                                                    e.target.style.background = 'rgba(0,0,0,0.2)';
                                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                                }}
                                            />
                                        </div>

                                        <style>{`
                                            @keyframes rocketWiggle {
                                                0% { transform: scale(1) rotate(0deg); }
                                                25% { transform: scale(0.95) rotate(-3deg); }
                                                50% { transform: scale(0.95) rotate(3deg); }
                                                75% { transform: scale(0.98) rotate(-2deg); }
                                                100% { transform: scale(1) rotate(0deg); }
                                            }
                                            .rocket-btn:active {
                                                animation: rocketWiggle 0.4s ease-in-out;
                                            }
                                        `}</style>

                                        <button
                                            className="rocket-btn"
                                            onClick={() => {
                                                addMilestone();
                                                // Collapse form after adding
                                                setTimeout(() => setShowAddForm(false), 1000);
                                            }}
                                            disabled={!newTitle || !newDate}
                                            style={{
                                                width: '100%', padding: '14px',
                                                background: (!newTitle || !newDate) ? 'rgba(255,255,255,0.08)' : 'var(--accent-lux-gradient)',
                                                color: (!newTitle || !newDate) ? 'rgba(255,255,255,0.4)' : 'white',
                                                borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem',
                                                border: 'none', cursor: (!newTitle || !newDate) ? 'not-allowed' : 'pointer', marginTop: '4px',
                                                boxShadow: (!newTitle || !newDate) ? 'none' : '0 6px 24px rgba(236, 72, 153, 0.3)',
                                                letterSpacing: '0.3px', textTransform: 'uppercase',
                                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                position: 'relative', overflow: 'hidden'
                                            }}
                                            onMouseEnter={e => {
                                                if (newTitle && newDate) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.45)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (newTitle && newDate) {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(236, 72, 153, 0.3)';
                                                }
                                            }}
                                        >
                                            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                Add to Timeline 🚀
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
