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
            background: 'var(--bg-gradient)',
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 40px',
            color: 'var(--text-primary)'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed', top: '20px', right: '20px',
                        fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)', width: '45px', height: '45px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', zIndex: 3001,
                        color: 'var(--text-primary)'
                    }}
                >✕</button>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '10px' }}>Our Journey 🗺️</h2>
                <p style={{ textAlign: 'center', opacity: 0.6 }}>Every step brought us here.</p>

                <div style={{ marginTop: '50px', position: 'relative' }}>
                    {/* Center Line */}
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(0,0,0,0.1)', transform: 'translateX(-50%)' }} />

                    {milestones.map((m, i) => (
                        <div key={m.id} style={{
                            display: 'flex',
                            justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
                            marginBottom: '40px',
                            position: 'relative'
                        }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute', left: '50%', top: '20px',
                                width: '14px', height: '14px', borderRadius: '50%', background: 'var(--accent-color)',
                                transform: 'translateX(-50%)', border: '3px solid var(--bg-color)', zIndex: 1
                            }} />

                            <div className="glass-card" style={{
                                width: '45%',
                                padding: '20px',
                                background: '#FFFFFF',
                                textAlign: i % 2 === 0 ? 'right' : 'left',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                                border: 'none'
                            }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{m.title}</h4>
                                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '5px' }}>{new Date(m.date).toLocaleDateString()}</span>
                                {m.desc && <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>{m.desc}</p>}
                                <button onClick={() => deleteItem(m.id)} style={{ color: 'red', opacity: 0.3, marginTop: '10px', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ marginTop: '60px', padding: '30px', background: '#FFFFFF', border: '1px dashed #ccc', textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Add Milestone</h4>
                    <input placeholder="Title (e.g. First Date)" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', marginBottom: '15px', padding: '12px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9' }} />
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '100%', marginBottom: '15px', padding: '12px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9' }} />
                    <textarea placeholder="Reflection..." value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ width: '100%', marginBottom: '20px', padding: '12px', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9', height: '80px' }} />
                    <button onClick={addMilestone} style={{ width: '100%', padding: '15px', background: 'black', color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>Add to Timeline</button>
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
