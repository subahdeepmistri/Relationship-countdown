import React, { useState } from 'react';
import { useCapsules } from '../hooks/useDataHooks';

const TimeCapsuleManager = ({ onClose }) => {
    // Use centralized hook instead of direct localStorage
    const {
        capsules,
        loading,
        error,
        addCapsule,
        deleteCapsule: deleteCapsuleFromHook,
        isUnlocked,
        clearError
    } = useCapsules();

    const [view, setView] = useState('list'); // list, create, view-capsule
    const [newContent, setNewContent] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [selectedCapsule, setSelectedCapsule] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2000);
    };

    // Show error from hook
    React.useEffect(() => {
        if (error) {
            showToast(error);
            clearError();
        }
    }, [error, clearError]);

    const saveCapsule = () => {
        if (!newContent || !unlockDate) return;

        const result = addCapsule(newContent, unlockDate);

        if (result.success) {
            setView('list');
            setNewContent('');
            setUnlockDate('');
            showToast('Capsule Buried ⏳');
        }
    };

    const deleteCapsule = (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this capsule permanently?')) {
            const result = deleteCapsuleFromHook(id);
            if (result.success) {
                setView('list');
                showToast('Capsule Deleted 🗑️');
            }
        }
    };

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
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)', // Deep Night w/ slight glow top
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 110px',
            color: 'white',
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

            {toastMsg && (
                <div style={{
                    position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.95)', color: '#1e293b', padding: '12px 24px', borderRadius: '50px',
                    fontWeight: '600', zIndex: 3005, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {toastMsg}
                </div>
            )}

            <button
                onClick={onClose}
                className="no-print"
                style={{
                    position: 'fixed', top: '24px', right: '24px',
                    fontSize: '1.2rem', background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)', width: '48px', height: '48px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', zIndex: 3001,
                    color: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >✕</button>

            {view === 'create' && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3002, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3002, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ViewCapsule cap={selectedCapsule} onBack={() => { setView('list'); setSelectedCapsule(null); }} onDelete={(id) => deleteCapsule(id)} />
                </div>
            )}

            {view === 'list' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>
                        <div style={{
                            display: 'inline-block', padding: '6px 16px', borderRadius: '30px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.6)', marginBottom: '15px', backdropFilter: 'blur(5px)'
                        }}>
                            Eternal Storage
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
                        }}>Time Capsules</h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-serif)', maxWidth: '400px', margin: '0 auto' }}>
                            "Some moments are too precious to be forgotten, only waiting to be remembered."
                        </p>
                    </div>

                    {capsules.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '40px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            marginBottom: '40px'
                        }}>
                            <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>🏺</div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'white' }}>The Collection is Empty</h3>
                            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: '30px', lineHeight: '1.6' }}>
                                Seal a memory today for a future you will cherish.<br />
                                A letter, a promise, or a feeling.
                            </p>
                            <button
                                onClick={() => setView('create')}
                                style={{
                                    background: 'var(--accent-lux-gradient)',
                                    color: 'white',
                                    padding: '16px 40px', borderRadius: '50px',
                                    fontSize: '1.1rem', fontWeight: '600', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 10px 40px rgba(251, 113, 133, 0.4)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                + Seal First Memory
                            </button>
                        </div>
                    )}

                    {capsules.length > 0 && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', paddingBottom: '100px' }}>
                                {capsules.map(cap => {
                                    const unlocked = isUnlocked(cap.unlockDate);
                                    return (
                                        <div
                                            key={cap.id}
                                            onClick={() => openCapsule(cap)}
                                            style={{
                                                position: 'relative',
                                                padding: '24px',
                                                cursor: 'pointer',
                                                background: unlocked
                                                    ? 'rgba(255,255,255,0.9)'
                                                    : 'rgba(255,255,255,0.03)',
                                                color: unlocked ? '#0f172a' : 'white',
                                                border: unlocked ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '32px',
                                                textAlign: 'center',
                                                aspectRatio: '0.85',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: unlocked ? '0 20px 40px -10px rgba(255,255,255,0.2)' : '0 4px 20px rgba(0,0,0,0.2)',
                                                backdropFilter: 'blur(10px)',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={e => {
                                                if (!unlocked) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3), 0 0 15px rgba(255,255,255,0.05)';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!unlocked) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                }
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = unlocked ? '0 20px 40px -10px rgba(255,255,255,0.2)' : '0 4px 20px rgba(0,0,0,0.2)';
                                            }}
                                        >
                                            {/* Glow effect for locked cards */}
                                            {!unlocked && <div style={{
                                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                                width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                                                pointerEvents: 'none'
                                            }} />}

                                            {unlocked && (
                                                <button
                                                    onClick={(e) => deleteCapsule(cap.id, e)}
                                                    title="Delete Capsule"
                                                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', fontSize: '0.8rem', cursor: 'pointer', color: '#64748b' }}
                                                >
                                                    ✕
                                                </button>
                                            )}

                                            <div style={{
                                                fontSize: '2.5rem', marginBottom: '15px',
                                                filter: unlocked ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' : 'grayscale(1) opacity(0.7)',
                                                transition: 'all 0.3s'
                                            }} className={!unlocked ? 'animate-pulse-slow' : ''}>
                                                {unlocked ? '📜' : '🔒'}
                                            </div>

                                            <div style={{ fontSize: '0.95rem', fontWeight: unlocked ? '800' : '600', marginBottom: '8px', letterSpacing: '-0.02em', color: unlocked ? '#1e293b' : 'rgba(255,255,255,0.9)' }}>
                                                {unlocked ? 'Memory Unlocked' : 'Sealed Memory'}
                                            </div>

                                            {unlocked ? (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                                                    Read now
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Opens on</div>
                                                    <div style={{
                                                        fontSize: '0.8rem', color: '#cbd5e1',
                                                        padding: '4px 10px', background: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '12px', backdropFilter: 'blur(5px)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        textShadow: '0 0 10px rgba(255,255,255,0.3)'
                                                    }}>
                                                        {new Date(cap.unlockDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ position: 'fixed', bottom: '100px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 3002 }}>
                                <button
                                    onClick={() => setView('create')}
                                    style={{
                                        pointerEvents: 'auto',
                                        background: 'var(--accent-lux-gradient)', color: 'white',
                                        padding: '18px 36px', borderRadius: '50px',
                                        fontSize: '1rem', fontWeight: '700', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 10px 40px rgba(251, 113, 133, 0.5), 0 0 0 4px rgba(251, 113, 133, 0.2)',
                                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                                        letterSpacing: '0.5px'
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>+</span> Seal a Memory
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
    <div className="pop-card" style={{ padding: '40px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '40px', width: '90%', maxWidth: '500px', color: '#1e293b', border: 'none', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' }}>
        <h3 style={{ marginTop: 0, fontSize: '2rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>Seal a Memory</h3>
        <p style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '30px', color: '#475569', lineHeight: '1.5' }}>
            Write a message for the future. It will remain locked inside this capsule until the moment is right.
        </p>

        <textarea
            style={{
                width: '100%',
                height: '160px',
                marginBottom: '25px',
                background: '#f1f5f9',
                border: '2px solid transparent',
                padding: '20px',
                borderRadius: '24px',
                fontSize: '1.05rem',
                color: '#334155',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-serif)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.03)'
            }}
            onFocus={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#fb7185'; }}
            onBlur={e => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = 'transparent'; }}
            placeholder="Dear Future Us..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
        />

        <label style={{ display: 'block', marginBottom: '35px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Unlock Date</span>
            <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0',
                    fontSize: '1rem', outline: 'none', background: 'white', color: '#334155',
                    fontFamily: 'var(--font-heading)', fontWeight: '600'
                }}
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
            />
        </label>

        <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '16px', border: 'none', background: '#f1f5f9', color: '#64748b', borderRadius: '20px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'background 0.2s' }}>Cancel</button>
            <button onClick={onSave} style={{ flex: 1, background: 'var(--accent-lux-gradient)', color: 'white', padding: '16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 10px 25px rgba(251, 113, 133, 0.4)' }}>Seal It 🔒</button>
        </div>
    </div>
);

const ViewCapsule = ({ cap, onBack, onDelete }) => (
    <div style={{ padding: '20px', textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
            background: 'white', borderRadius: '40px', padding: '40px', width: '100%',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '8px',
                background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)'
            }} />

            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📜</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '5px', color: '#1e293b', fontFamily: 'var(--font-heading)' }}>Memory Unlocked</h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.9rem', fontWeight: '500' }}>
                Sealed on {new Date(cap.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>

            <div style={{
                background: '#f8fafc', borderRadius: '24px', color: '#334155', padding: '30px',
                textAlign: 'left', fontStyle: 'italic', lineHeight: '1.8', margin: '0 0 30px',
                fontSize: '1.2rem', whiteSpace: 'pre-wrap', position: 'relative',
                fontFamily: 'var(--font-serif)', border: '1px dashed #cbd5e1'
            }}>
                "{cap.content}"
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={onBack} style={{ padding: '15px 30px', background: '#f1f5f9', color: '#475569', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>Keep it Safe</button>
                <button onClick={() => { onDelete(cap.id); onBack(); }} style={{ padding: '15px 30px', background: '#fef2f2', color: '#ef4444', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>Delete</button>
            </div>
        </div>
    </div>
);

export default TimeCapsuleManager;
