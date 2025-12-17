import React, { useState, useEffect } from 'react';

const JourneyMap = ({ onClose }) => {
    const [milestones, setMilestones] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_journey') || '[]');
        setMilestones(saved.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, []);

    const addMilestone = () => {
        if (!newTitle || !newDate) return;
        const item = { id: Date.now(), title: newTitle, date: newDate, desc: newDesc };
        const updated = [...milestones, item].sort((a, b) => new Date(a.date) - new Date(b.date));
        setMilestones(updated);
        localStorage.setItem('rc_journey', JSON.stringify(updated));
        setNewTitle(''); setNewDate(''); setNewDesc('');
    };

    const deleteItem = (id) => {
        const updated = milestones.filter(m => m.id !== id);
        setMilestones(updated);
        localStorage.setItem('rc_journey', JSON.stringify(updated));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', // Deep Night Blue
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 40px',
            color: 'white',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Background Atmosphere Blobs */}
            <div style={{ position: 'fixed', top: '-10%', left: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

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
                        fontFamily: 'var(--font-serif)',
                        fontSize: '3.5rem',
                        margin: '0 0 10px 0',
                        background: 'linear-gradient(to right, #e2e8f0, #93c5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(147, 197, 253, 0.3)'
                    }}>Our Timeline</h2>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', letterSpacing: '0.5px' }}>Every chapter of our story.</p>
                </div>

                <div className="journey-container" style={{ marginTop: '50px' }}>
                    {/* Center Line */}
                    <div className="journey-line" />

                    {milestones.map((m, i) => (
                        <div key={m.id} className={`journey-item ${i % 2 === 0 ? 'right' : 'left'}`}>
                            {/* Dot */}
                            <div className="journey-dot" />

                            <div className="glass-card journey-card" style={{
                                padding: '25px',
                                textAlign: i % 2 === 0 ? 'right' : 'left',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: '#93c5fd',
                                    fontWeight: 'bold',
                                    display: 'block',
                                    marginBottom: '5px'
                                }}>
                                    {new Date(m.date).toLocaleDateString()}
                                </span>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{m.title}</h4>
                                {m.desc && <p style={{ fontSize: '0.95rem', margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>{m.desc}</p>}
                                <button onClick={() => deleteItem(m.id)} style={{ color: '#f87171', opacity: 0.7, marginTop: '15px', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{
                    marginTop: '80px',
                    padding: '40px',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '30px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                }}>
                    <h4 style={{ marginBottom: '30px', fontSize: '1.5rem', color: 'white' }}>Add a New Chapter ✍️</h4>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <input
                            placeholder="Title (e.g. First Date)"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="glass-input"
                            style={{
                                width: '100%', padding: '16px',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px', color: 'white', fontSize: '1rem', outline: 'none',
                                backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={e => {
                                e.target.style.background = 'rgba(0,0,0,0.5)';
                                e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                                e.target.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.2)';
                            }}
                            onBlur={e => {
                                e.target.style.background = 'rgba(0,0,0,0.3)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="glass-input"
                            style={{
                                width: '100%', padding: '16px',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px', color: 'white', fontSize: '1rem', fontFamily: 'sans-serif',
                                outline: 'none', backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={e => {
                                e.target.style.background = 'rgba(0,0,0,0.5)';
                                e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                                e.target.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.2)';
                            }}
                            onBlur={e => {
                                e.target.style.background = 'rgba(0,0,0,0.3)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <textarea
                            placeholder="What made this moment special?"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            className="glass-input"
                            style={{
                                width: '100%', padding: '16px', minHeight: '120px',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px', color: 'white', fontSize: '1rem', resize: 'vertical',
                                outline: 'none', backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s ease',
                                fontFamily: "'Inter', sans-serif"
                            }}
                            onFocus={e => {
                                e.target.style.background = 'rgba(0,0,0,0.5)';
                                e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                                e.target.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.2)';
                            }}
                            onBlur={e => {
                                e.target.style.background = 'rgba(0,0,0,0.3)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            onClick={addMilestone}
                            style={{
                                width: '100%', padding: '14px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)', color: 'white',
                                borderRadius: '30px', fontWeight: '700', fontSize: '1rem',
                                border: 'none', cursor: 'pointer', marginTop: '10px',
                                boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                transition: 'all 0.2s',
                                position: 'relative', overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(236, 72, 153, 0.6)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.4)';
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        >
                            <span style={{ position: 'relative', zIndex: 1 }}>Add to Timeline 🚀</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
