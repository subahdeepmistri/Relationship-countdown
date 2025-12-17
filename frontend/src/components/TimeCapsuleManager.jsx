import React, { useState, useEffect } from 'react';

const TimeCapsuleManager = ({ onClose }) => {
    const [capsules, setCapsules] = useState([]);
    const [view, setView] = useState('list'); // list, create, view-capsule
    const [newContent, setNewContent] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [selectedCapsule, setSelectedCapsule] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_capsules') || '[]');
        setCapsules(saved);
    }, []);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2000);
    };

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
        showToast('Capsule Buried ⏳');
    };

    const deleteCapsule = (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this capsule permanently?')) {
            const updated = capsules.filter(c => c.id !== id);
            setCapsules(updated);
            localStorage.setItem('rc_capsules', JSON.stringify(updated));
            setView('list'); // if dragging or similar
            showToast('Capsule Deleted 🗑️');
        }
    };

    const isUnlocked = (date) => Date.now() >= date;

    const openCapsule = (cap) => {
        if (isUnlocked(cap.unlockDate)) {
            setSelectedCapsule(cap);
            setView('view-capsule');
        } else {
            const daysLeft = Math.ceil((cap.unlockDate - Date.now()) / (1000 * 60 * 60 * 24));
            showToast(`Locked for ${daysLeft} more days 🔒`);
        }
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
            <div style={{ position: 'fixed', top: '-10%', right: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {toastMsg && (
                <div style={{
                    position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.9)', color: '#333', padding: '10px 20px', borderRadius: '30px',
                    fontWeight: 'bold', zIndex: 3005, boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    {toastMsg}
                </div>
            )}

            <button
                onClick={onClose}
                className="no-print"
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

            {view === 'create' && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3002, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreateView
                        newContent={newContent}
                        setNewContent={setNewContent}
                        unlockDate={unlockDate}
                        setUnlockDate={setUnlockDate}
                        onSave={saveCapsule}
                        onCancel={() => setView('list')}
                    />
                </div>
            )}

            {view === 'view-capsule' && selectedCapsule && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3002, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ViewCapsule cap={selectedCapsule} onBack={() => { setView('list'); setSelectedCapsule(null); }} onDelete={(id) => deleteCapsule(id)} />
                </div>
            )}

            {view === 'list' && (
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '3rem',
                        textAlign: 'center',
                        marginBottom: '10px',
                        background: 'linear-gradient(to right, #fff, #a5f3fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(165, 243, 252, 0.3)'
                    }}>Time Capsules ⏳</h2>
                    <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '10px', color: '#cbd5e1' }}>Lock memories until the time is right.</p>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.6, marginBottom: '40px', color: '#94a3b8' }}>
                        (For long-term 5+ year messages, check Legacy Mode)
                    </p>

                    {capsules.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '30px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            marginBottom: '40px'
                        }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🏺</div>
                            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>No capsules sealed yet.<br />Write a message for your future selves.</p>
                            <button
                                onClick={() => setView('create')}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    padding: '16px 40px', borderRadius: '50px',
                                    fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                + Create First Capsule
                            </button>
                        </div>
                    )}

                    {capsules.length > 0 && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '25px', paddingBottom: '100px' }}>
                                {capsules.map(cap => {
                                    const unlocked = isUnlocked(cap.unlockDate);
                                    return (
                                        <div
                                            key={cap.id}
                                            onClick={() => openCapsule(cap)}
                                            className="glass-card"
                                            style={{
                                                position: 'relative',
                                                padding: '25px',
                                                cursor: 'pointer',
                                                background: unlocked
                                                    ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                                                    : 'rgba(255,255,255,0.05)',
                                                color: unlocked ? '#0f172a' : 'white',
                                                border: unlocked ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '24px',
                                                textAlign: 'center',
                                                aspectRatio: '1',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                transition: 'transform 0.2s',
                                                boxShadow: unlocked ? '0 10px 30px rgba(56, 189, 248, 0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            {unlocked && (
                                                <button
                                                    onClick={(e) => deleteCapsule(cap.id, e)}
                                                    title="Delete Capsule"
                                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer', opacity: 0.6 }}
                                                >
                                                    ✕
                                                </button>
                                            )}

                                            <div style={{ fontSize: '3rem', marginBottom: '15px', filter: unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                                                {unlocked ? '🔓' : '🔒'}
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                                {unlocked ? 'Open Me!' : 'Locked'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                Unlock: {new Date(cap.unlockDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ position: 'fixed', bottom: '110px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 3002 }}>
                                <button
                                    onClick={() => setView('create')}
                                    style={{
                                        pointerEvents: 'auto',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white',
                                        padding: '16px 32px', borderRadius: '50px',
                                        fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)',
                                        transition: 'transform 0.2s',
                                        display: 'inline-flex', alignItems: 'center', gap: '8px'
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>+</span> Bury New Capsule
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div >
    );
};

// Extracted Sub-components
const CreateView = ({ newContent, setNewContent, unlockDate, setUnlockDate, onSave, onCancel }) => (
    <div style={{ padding: '40px', textAlign: 'left', background: 'rgba(30, 41, 59, 0.95)', borderRadius: '30px', width: '90%', maxWidth: '500px', color: 'white', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <h3 style={{ marginTop: 0, fontSize: '1.8rem', marginBottom: '10px' }}>Create Time Capsule</h3>
        <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '25px', color: '#cbd5e1' }}>Write a message for the future. It will stay sealed until the date you choose.</p>

        <textarea
            style={{
                width: '100%',
                height: '150px',
                marginBottom: '25px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '15px',
                borderRadius: '16px',
                fontSize: '1rem',
                color: 'white',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
            }}
            placeholder="Dear Future Us..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
        />

        <label style={{ display: 'block', marginBottom: '35px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#cbd5e1', letterSpacing: '1px' }}>UNLOCK DATE</span>
            <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '15px', marginTop: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1rem', outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', fontFamily: 'sans-serif' }}
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
            />
        </label>

        <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '15px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Cancel</button>
            <button onClick={onSave} style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)' }}>Seal Capsule 🔒</button>
        </div>
    </div>
);

const ViewCapsule = ({ cap, onBack, onDelete }) => (
    <div style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>Memory Unlocked 🔓</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '40px', fontSize: '1.1rem' }}>Sealed on {new Date(cap.createdAt).toLocaleDateString()}</p>

        <div style={{ background: '#f8fafc', borderRadius: '25px', color: '#334155', padding: '40px', textAlign: 'left', fontStyle: 'italic', lineHeight: '1.8', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', fontSize: '1.3rem', whiteSpace: 'pre-wrap', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '4rem', color: '#e2e8f0', zIndex: 0, fontFamily: 'serif' }}>"</span>
            <div style={{ position: 'relative', zIndex: 1 }}>{cap.content}</div>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px' }}>
            <button onClick={onBack} style={{ padding: '15px 35px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>Back to List</button>
            <button onClick={() => { onDelete(cap.id); onBack(); }} style={{ padding: '15px 35px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderRadius: '30px', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>Delete</button>
        </div>
    </div>
);

export default TimeCapsuleManager;
