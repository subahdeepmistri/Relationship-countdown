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
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)', // Reference Radial
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
                            <span style={{ fontSize: '2rem' }}>📜</span>
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
                            <span>❤️</span> Another memory added
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

                <div style={{ textAlign: 'center', marginBottom: '60px' }}>

                    <div style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '30px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.6)', marginBottom: '15px', backdropFilter: 'blur(5px)'
                    }}>
                        Your Story
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.5rem',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        letterSpacing: '-1px'
                    }}>Our Timeline</h2>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-serif)', maxWidth: '400px', margin: '0 auto' }}>Every chapter of our story.</p>
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
                            textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)',
                            borderRadius: '40px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '40px'
                        }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>📖</span>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#cbd5e1' }}>Your story begins here.<br />Add your first chapter.</p>
                        </div>
                    )}

                    {milestones.map((m, i) => (
                        <div key={m.id} className={`journey-item ${i % 2 === 0 ? 'right' : 'left'}`}>
                            {/* Dot */}
                            <div className="journey-dot" />

                            <div className="glass-card journey-card" style={{
                                padding: '25px',
                                textAlign: 'left', // Keep text left for better readability even on right side usually, or stick to side
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    color: '#94a3b8', // Neutral slate instead of blue
                                    fontWeight: '700',
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontFamily: 'var(--font-sans, sans-serif)'
                                }}>
                                    {new Date(m.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontFamily: 'var(--font-heading)' }}>{m.title}</h4>
                                {m.desc && <p style={{ fontSize: '0.95rem', margin: 0, color: '#cbd5e1', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>{m.desc}</p>}
                                <button onClick={() => requestDelete(m.id)} style={{
                                    color: '#f87171', opacity: 0.6, marginTop: '15px', fontSize: '0.8rem',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px'
                                }}>
                                    <span>🗑️</span> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add New Chapter */}
                <div className="glass-card" style={{
                    marginTop: '100px', // More vertical spacing
                    padding: '40px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    borderRadius: '40px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <h4 style={{ marginBottom: '30px', fontSize: '1.6rem', color: 'white', fontFamily: 'var(--font-heading)' }}>Add a New Chapter ✍️</h4>
                    <div style={{ display: 'grid', gap: '20px' }} className={isLaunching ? 'launch-anim' : ''}>

                        <div className="journey-input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8', transition: 'color 0.3s' }}>Moment Title</label>
                            <input
                                placeholder="e.g. The First Date"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '2px solid rgba(255,255,255,0.1)', // Stronger default border
                                    borderRadius: '16px', color: 'white', fontSize: '1.1rem', fontWeight: '600', outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={e => {
                                    e.target.style.background = 'rgba(255,255,255,0.05)';
                                    e.target.style.borderColor = '#fb7185'; // Rose Gold Focus
                                    e.target.style.boxShadow = '0 0 15px rgba(251, 113, 133, 0.3)';
                                }}
                                onBlur={e => {
                                    e.target.style.background = 'rgba(0,0,0,0.2)';
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div className="journey-input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8', transition: 'color 0.3s' }}>When did it happen?</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', pointerEvents: 'none', opacity: 0.8 }}>📅</span>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    style={{
                                        width: '100%', padding: '16px 16px 16px 50px', // Left padding for icon
                                        background: 'rgba(0,0,0,0.2)', border: '2px solid transparent',
                                        borderRadius: '16px', color: 'white', fontSize: '1rem', fontFamily: 'sans-serif',
                                        outline: 'none', transition: 'all 0.3s ease'
                                    }}
                                    onFocus={e => {
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                        e.target.style.borderColor = '#60a5fa'; // Blue Focus for date
                                    }}
                                    onBlur={e => {
                                        e.target.style.background = 'rgba(0,0,0,0.2)';
                                        e.target.style.borderColor = 'transparent';
                                    }}
                                />
                            </div>
                        </div>

                        <div className="journey-input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8', transition: 'color 0.3s' }}>Memory Details</label>
                            <textarea
                                placeholder="A moment you'll never forget..."
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                style={{
                                    width: '100%', padding: '20px', minHeight: '140px', // Larger area
                                    background: 'rgba(0,0,0,0.2)', border: '2px solid transparent',
                                    borderRadius: '20px', color: 'white', fontSize: '1.05rem', resize: 'vertical',
                                    outline: 'none', transition: 'all 0.3s ease',
                                    fontFamily: "'Inter', sans-serif",
                                    lineHeight: '1.6'
                                }}
                                onFocus={e => {
                                    e.target.style.background = 'rgba(255,255,255,0.08)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                }}
                                onBlur={e => {
                                    e.target.style.background = 'rgba(0,0,0,0.2)';
                                    e.target.style.borderColor = 'transparent';
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
                            onClick={addMilestone}
                            disabled={!newTitle || !newDate}
                            style={{
                                width: '100%', padding: '20px',
                                background: (!newTitle || !newDate) ? 'rgba(255,255,255,0.08)' : 'var(--accent-lux-gradient)',
                                color: (!newTitle || !newDate) ? 'rgba(255,255,255,0.4)' : 'white', // More visible disabled text
                                borderRadius: '50px', fontWeight: '800', fontSize: '1.15rem',
                                border: 'none', cursor: (!newTitle || !newDate) ? 'not-allowed' : 'pointer', marginTop: '15px',
                                boxShadow: (!newTitle || !newDate) ? 'none' : '0 10px 40px rgba(236, 72, 153, 0.4)',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Smooth transition including glow
                                position: 'relative', overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                if (newTitle && newDate) {
                                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(236, 72, 153, 0.7)'; // Intense glow
                                }
                            }}
                            onMouseLeave={e => {
                                if (newTitle && newDate) {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(236, 72, 153, 0.4)';
                                }
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Add to Timeline 🚀
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
