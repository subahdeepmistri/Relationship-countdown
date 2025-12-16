import React, { useState, useEffect } from 'react';

const TimeCapsuleManager = ({ onClose }) => {
    const [capsules, setCapsules] = useState([]);
    const [view, setView] = useState('list'); // list, create, view-capsule
    const [newContent, setNewContent] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [selectedCapsule, setSelectedCapsule] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_capsules') || '[]');
        setCapsules(saved);
    }, []);

    const saveCapsule = () => {
        if (!newContent || !unlockDate) return;

        const newCapsule = {
            id: Date.now(),
            content: newContent,
            unlockDate: new Date(unlockDate).getTime(),
            createdAt: Date.now()
        };

        const updated = [...capsules, newCapsule];
        setCapsules(updated);
        localStorage.setItem('rc_capsules', JSON.stringify(updated));
        setView('list');
        setNewContent('');
        setUnlockDate('');
    };

    const isUnlocked = (date) => Date.now() >= date;

    const openCapsule = (cap) => {
        if (isUnlocked(cap.unlockDate)) {
            setSelectedCapsule(cap);
            setView('view-capsule');
        }
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
            <button
                onClick={onClose}
                className="no-print"
                style={{
                    position: 'fixed', top: '20px', right: '20px',
                    fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)', width: '45px', height: '45px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', zIndex: 3001,
                    color: 'var(--text-primary)'
                }}
            >✕</button>

            {view === 'create' && (
                <CreateView
                    newContent={newContent}
                    setNewContent={setNewContent}
                    unlockDate={unlockDate}
                    setUnlockDate={setUnlockDate}
                    onSave={saveCapsule}
                    onCancel={() => setView('list')}
                />
            )}

            {view === 'view-capsule' && selectedCapsule && (
                <ViewCapsule cap={selectedCapsule} onBack={() => setView('list')} />
            )}

            {view === 'list' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '10px' }}>Time Capsules ⏳</h2>
                    <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '40px' }}>Lock memories until the time is right.</p>

                    {capsules.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #ccc', borderRadius: '20px', opacity: 0.6 }}>
                            No capsules sealed yet.
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                        {capsules.map(cap => {
                            const unlocked = isUnlocked(cap.unlockDate);
                            return (
                                <div
                                    key={cap.id}
                                    onClick={() => openCapsule(cap)}
                                    className="pop-card"
                                    style={{
                                        padding: '20px',
                                        cursor: unlocked ? 'pointer' : 'default',
                                        background: unlocked ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                                        border: unlocked ? '1px solid var(--accent-secondary)' : '1px solid transparent',
                                        textAlign: 'center',
                                        aspectRatio: '1',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        transition: 'transform 0.2s',
                                        transform: 'scale(1)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '10px', filter: unlocked ? 'none' : 'grayscale(1)' }}>
                                        {unlocked ? '🔓' : '🔒'}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {unlocked ? 'Open Me!' : 'Locked'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                        Unlock: {new Date(cap.unlockDate).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setView('create')}
                        style={{
                            display: 'block', margin: '40px auto',
                            background: 'var(--text-primary)', color: 'white',
                            padding: '15px 40px', borderRadius: '30px',
                            fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                        }}
                    >
                        + Bury New Capsule
                    </button>
                </div>
            )}
        </div >
    );
};

// Extracted Sub-components
const CreateView = ({ newContent, setNewContent, unlockDate, setUnlockDate, onSave, onCancel }) => (
    <div style={{ padding: '20px', textAlign: 'left', background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
        <h3>Create Time Capsule</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Write a message for the future.</p>

        <textarea
            style={{
                width: '100%',
                height: '150px',
                margin: '20px 0',
                background: '#f9f9f9',
                border: '1px solid #eee',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '1rem',
                color: 'var(--text-primary)'
            }}
            placeholder="Dear Future Us..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
        />

        <label style={{ display: 'block', marginBottom: '20px' }}>
            Unlock Date: <br />
            <input
                type="date"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #eee' }}
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
            />
        </label>

        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onSave} style={{ background: 'var(--accent-color)', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Seal Capsule</button>
            <button onClick={onCancel} style={{ padding: '10px 20px', border: 'none', background: '#eee', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
        </div>
    </div>
);

const ViewCapsule = ({ cap, onBack }) => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Memory Unlocked 🔓</h2>
        <div style={{ background: 'white', borderRadius: '20px', color: '#333', padding: '30px', textAlign: 'left', fontStyle: 'italic', lineHeight: '1.6', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            "{cap.content}"
        </div>
        <p style={{ marginTop: '20px', opacity: 0.6, fontSize: '0.8rem' }}>
            Sealed on {new Date(cap.createdAt).toLocaleDateString()}
        </p>
        <button onClick={onBack} style={{ marginTop: '30px', padding: '10px 20px', background: '#eee', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>Back</button>
    </div>
);

export default TimeCapsuleManager;
