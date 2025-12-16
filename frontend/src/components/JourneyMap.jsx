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
            background: 'rgba(15, 23, 42, 0.95)', // Deep overlay matching new theme
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 40px',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed', top: '20px', right: '20px',
                        fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)', width: '45px', height: '45px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 3001,
                        color: 'var(--text-primary)'
                    }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', margin: '0 0 10px 0', color: '#fff' }}>Our Timeline</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Every chapter of our story.</p>
                </div>

                <div style={{ marginTop: '50px', position: 'relative' }}>
                    {/* Center Line */}
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, transparent, var(--accent-color), transparent)', transform: 'translateX(-50%)' }} />

                    {milestones.map((m, i) => (
                        <div key={m.id} style={{
                            display: 'flex',
                            justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
                            marginBottom: '60px',
                            position: 'relative'
                        }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute', left: '50%', top: '25px',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: 'var(--bg-color)',
                                border: '4px solid var(--accent-color)',
                                transform: 'translateX(-50%)',
                                zIndex: 1,
                                boxShadow: `0 0 15px ${m.id % 2 ? 'var(--accent-color)' : 'var(--text-accent)'}`
                            }} />

                            <div className="pop-card" style={{
                                width: '45%',
                                padding: '25px',
                                textAlign: i % 2 === 0 ? 'right' : 'left',
                                position: 'relative'
                            }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: 'var(--accent-color)',
                                    fontWeight: 'bold',
                                    display: 'block',
                                    marginBottom: '5px'
                                }}>
                                    {new Date(m.date).toLocaleDateString()}
                                </span>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{m.title}</h4>
                                {m.desc && <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</p>}
                                <button onClick={() => deleteItem(m.id)} style={{ color: '#ef5350', opacity: 0.6, marginTop: '15px', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pop-card" style={{ marginTop: '60px', padding: '40px', textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>Add a New Chapter ✍️</h4>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <input
                            placeholder="Title (e.g. First Date)"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            style={{
                                width: '100%', padding: '15px',
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', fontSize: '1rem'
                            }}
                        />
                        <input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            style={{
                                width: '100%', padding: '15px',
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', fontSize: '1rem', fontFamily: 'sans-serif'
                            }}
                        />
                        <textarea
                            placeholder="What made this moment special?"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            style={{
                                width: '100%', padding: '15px', height: '100px',
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', fontSize: '1rem', resize: 'none'
                            }}
                        />
                        <button
                            onClick={addMilestone}
                            style={{
                                width: '100%', padding: '18px',
                                background: 'var(--accent-color)', color: 'white',
                                borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem',
                                border: 'none', cursor: 'pointer', marginTop: '10px',
                                boxShadow: '0 5px 20px rgba(244, 114, 182, 0.4)'
                            }}
                        >
                            Add to Timeline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
