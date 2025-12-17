import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const FutureGoalsTimeline = ({ onClose }) => {
    const [goals, setGoals] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_goals') || '[]');
        setGoals(saved.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, []);

    const addGoal = () => {
        if (!newTitle) return;
        const newGoal = {
            id: Date.now(),
            title: newTitle,
            date: newDate,
            status: 'planned' // planned, achieved
        };
        const updated = [...goals, newGoal].sort((a, b) => new Date(a.date) - new Date(b.date));
        setGoals(updated);
        localStorage.setItem('rc_goals', JSON.stringify(updated));
        setNewTitle('');
        setNewDate('');
    };

    const toggleStatus = (id) => {
        const goal = goals.find(g => g.id === id);
        const isCompleting = goal.status === 'planned';

        const updated = goals.map(g =>
            g.id === id ? { ...g, status: isCompleting ? 'achieved' : 'planned' } : g
        );
        setGoals(updated);
        localStorage.setItem('rc_goals', JSON.stringify(updated));

        if (isCompleting) {
            triggerConfetti();
        }
    };

    const deleteGoal = (id) => {
        if (window.confirm("Remove this dream?")) {
            const updated = goals.filter(g => g.id !== id);
            setGoals(updated);
            localStorage.setItem('rc_goals', JSON.stringify(updated));
        }
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
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
            background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', // Hardcoded Deep Night Blue
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 40px',
            color: 'white',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Background Atmosphere Blobs */}
            <div style={{ position: 'fixed', top: '-20%', left: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-20%', right: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed', top: '20px', right: '20px',
                        fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)', width: '45px', height: '45px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 3001,
                        color: 'white',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{
                        fontSize: '3.5rem',
                        fontFamily: 'var(--font-serif)',
                        marginBottom: '10px',
                        background: 'linear-gradient(to right, #e2e8f0, #93c5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(147, 197, 253, 0.3)'
                    }}>Our Future</h2>
                    <p style={{ opacity: 0.8, fontSize: '1.1rem', color: '#cbd5e1', letterSpacing: '0.5px' }}>Dreams we are building together.</p>
                </div>

                <div style={{ position: 'relative', paddingLeft: '30px' }}>

                    {/* Glowing Timeline Line */}
                    <div style={{
                        position: 'absolute',
                        left: '0', top: '0', bottom: '0',
                        width: '2px',
                        background: 'linear-gradient(to bottom, transparent, #60a5fa, transparent)',
                        boxShadow: '0 0 15px #60a5fa',
                        opacity: 0.8
                    }} />

                    {goals.length === 0 && (
                        <div style={{
                            padding: '40px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '1px dashed rgba(255,255,255,0.15)',
                            marginBottom: '40px'
                        }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>✨</span>
                            <p style={{ opacity: 0.7, margin: 0, fontSize: '1.1rem', lineHeight: '1.6' }}>The future is a blank canvas.<br />Start painting your shared dreams.</p>
                        </div>
                    )}

                    {goals.map(goal => (
                        <div key={goal.id} style={{ marginBottom: '50px', position: 'relative' }}>
                            {/* Timeline Dot */}
                            <div style={{
                                position: 'absolute', left: '-37px', top: '0',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: goal.status === 'achieved' ? '#10B981' : '#1e293b',
                                border: goal.status === 'achieved' ? '3px solid #10B981' : '3px solid #60a5fa',
                                boxShadow: `0 0 20px ${goal.status === 'achieved' ? '#10B981' : '#60a5fa'}`,
                                zIndex: 1
                            }} />

                            <div className="glass-card" style={{
                                padding: '25px',
                                background: goal.status === 'achieved'
                                    ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(4, 120, 87, 0.1))'
                                    : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(12px)',
                                border: goal.status === 'achieved'
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                transition: 'transform 0.2s',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            textDecoration: goal.status === 'achieved' ? 'line-through' : 'none',
                                            fontSize: '1.4rem',
                                            color: goal.status === 'achieved' ? '#6ee7b7' : 'white',
                                            fontWeight: '600',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                        }}>
                                            {goal.title} {goal.status === 'achieved' && '✨'}
                                        </h3>
                                        {goal.date && (
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#93c5fd',
                                                margin: 0,
                                                fontWeight: '500',
                                                display: 'flex', alignItems: 'center', gap: '5px'
                                            }}>
                                                📅 Target: {new Date(goal.date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        style={{
                                            opacity: 0.6, fontSize: '1.2rem',
                                            border: 'none', background: 'none',
                                            cursor: 'pointer', color: '#f87171',
                                            padding: '8px',
                                            transition: 'opacity 0.2s'
                                        }}
                                        title="Remove Goal"
                                    >✕</button>
                                </div>

                                <button
                                    onClick={() => toggleStatus(goal.id)}
                                    style={{
                                        marginTop: '20px',
                                        fontSize: '0.85rem',
                                        padding: '12px 24px',
                                        borderRadius: '30px',
                                        background: goal.status === 'achieved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                                        color: goal.status === 'achieved' ? '#6ee7b7' : 'white',
                                        border: goal.status === 'achieved' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.2)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        backdropFilter: 'blur(5px)'
                                    }}
                                >
                                    {goal.status === 'achieved' ? '🎉 Achieved' : 'Mark as Done'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Goal Form - Redesigned */}
                    <div style={{ marginTop: '80px', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: '-35px', top: '30px',
                            width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8',
                            boxShadow: '0 0 10px rgba(148, 163, 184, 0.5)'
                        }} />

                        <div className="glass-card" style={{
                            padding: '30px',
                            background: 'rgba(30, 41, 59, 0.8)', // Deep slate glass
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(15px)'
                        }}>
                            <h4 style={{ margin: '0 0 25px 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                                <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' }}>+</span>
                                Add New Dream
                            </h4>

                            <input
                                type="text"
                                placeholder="e.g. Move to Paris 🇫🇷"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', marginBottom: '15px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.4)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    backdropFilter: 'blur(5px)'
                                }}
                            />
                            <input
                                type="date"
                                value={newDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setNewDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', marginBottom: '25px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.4)',
                                    color: 'white',
                                    outline: 'none',
                                    fontFamily: 'sans-serif',
                                    fontSize: '1rem'
                                }}
                            />

                            <button
                                onClick={addGoal}
                                disabled={!newTitle.trim()}
                                style={{
                                    background: !newTitle.trim()
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)', // Vibrant Indigo-Fuchsia
                                    color: !newTitle.trim() ? 'rgba(255,255,255,0.3)' : 'white',
                                    padding: '18px 20px', borderRadius: '30px', width: '100%', border: 'none',
                                    fontWeight: '800',
                                    cursor: !newTitle.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.3s',
                                    boxShadow: !newTitle.trim() ? 'none' : '0 10px 30px rgba(217, 70, 239, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px'
                                }}
                            >
                                Add to Timeline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FutureGoalsTimeline;
