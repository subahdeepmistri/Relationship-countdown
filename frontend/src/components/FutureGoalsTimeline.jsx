import React, { useState, useEffect } from 'react';

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
        const updated = goals.map(g =>
            g.id === id ? { ...g, status: g.status === 'achieved' ? 'planned' : 'achieved' } : g
        );
        setGoals(updated);
        localStorage.setItem('rc_goals', JSON.stringify(updated));
    };

    const deleteGoal = (id) => {
        const updated = goals.filter(g => g.id !== id);
        setGoals(updated);
        localStorage.setItem('rc_goals', JSON.stringify(updated));
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

                <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '10px', textAlign: 'center' }}>Our Future</h2>
                <p style={{ opacity: 0.6, marginBottom: '50px', textAlign: 'center' }}>Dreams we are building together.</p>

                <div style={{ position: 'relative', paddingLeft: '30px', borderLeft: '2px solid rgba(0,0,0,0.1)', marginLeft: '10px' }}>
                    {goals.map(goal => (
                        <div key={goal.id} style={{ marginBottom: '40px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: '-39px', top: '0',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: goal.status === 'achieved' ? 'var(--accent-secondary)' : '#fff',
                                border: '4px solid var(--bg-color)',
                                boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
                            }} />

                            <div className="pop-card" style={{
                                padding: '20px',
                                background: goal.status === 'achieved' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                                border: '1px solid rgba(255,255,255,0.6)',
                                opacity: goal.status === 'achieved' ? 0.6 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', textDecoration: goal.status === 'achieved' ? 'line-through' : 'none', fontSize: '1.2rem' }}>
                                            {goal.title}
                                        </h3>
                                        {goal.date && <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Target: {new Date(goal.date).toLocaleDateString()}</p>}
                                    </div>
                                    <button onClick={() => deleteGoal(goal.id)} style={{ opacity: 0.3, fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                                </div>

                                <button
                                    onClick={() => toggleStatus(goal.id)}
                                    style={{
                                        marginTop: '15px',
                                        fontSize: '0.8rem',
                                        padding: '5px 15px',
                                        borderRadius: '15px',
                                        background: goal.status === 'achieved' ? 'transparent' : 'var(--text-primary)',
                                        color: goal.status === 'achieved' ? 'var(--accent-secondary)' : 'white',
                                        border: goal.status === 'achieved' ? '1px solid var(--accent-secondary)' : 'none',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {goal.status === 'achieved' ? '✨ Achieved' : 'Mark as Done'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Goal Form */}
                    <div style={{ marginBottom: '50px', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: '-37px', top: '20px',
                            width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)'
                        }} />
                        <div className="pop-card" style={{ padding: '25px', background: '#FFFFFF', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 15px 0' }}>Add New Dream</h4>
                            <input
                                type="text"
                                placeholder="e.g. Move to Paris"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f9', boxSizing: 'border-box' }}
                            />
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f9', boxSizing: 'border-box' }}
                            />
                            <button
                                onClick={addGoal}
                                style={{ background: 'var(--accent-color)', color: 'white', padding: '12px 20px', borderRadius: '30px', width: '100%', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
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
