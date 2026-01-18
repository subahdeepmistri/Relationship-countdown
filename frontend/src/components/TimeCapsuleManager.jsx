import React, { useState } from 'react';
import { useCapsules } from '../hooks/useDataHooks';
import { ConfirmModal } from './shared';

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
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // For themed delete modal

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

    const requestDeleteCapsule = (id, e) => {
        if (e) e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const confirmDeleteCapsule = () => {
        if (deleteConfirmId) {
            const result = deleteCapsuleFromHook(deleteConfirmId);
            if (result.success) {
                setView('list');
                showToast('Capsule Deleted 🗑️');
            }
            setDeleteConfirmId(null);
        }
    };

    const cancelDeleteCapsule = () => {
        setDeleteConfirmId(null);
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirmId !== null}
                title="Delete Time Capsule?"
                message="This memory will be permanently erased. This action cannot be undone."
                icon="🗑️"
                confirmText="Delete"
                cancelText="Keep It"
                variant="danger"
                onConfirm={confirmDeleteCapsule}
                onCancel={cancelDeleteCapsule}
            />

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
                aria-label="Close Time Capsules"
                style={{
                    position: 'fixed', top: '24px', right: '24px',
                    fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)', width: '48px', height: '48px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', zIndex: 3001,
                    color: 'white',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onFocus={e => e.currentTarget.style.outline = '2px solid var(--accent-lux)'}
                onBlur={e => e.currentTarget.style.outline = 'none'}
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
                    <ViewCapsule cap={selectedCapsule} onBack={() => { setView('list'); setSelectedCapsule(null); }} onDelete={(id) => requestDeleteCapsule(id)} />
                </div>
            )}

            {view === 'list' && (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>


                        {/* Premium Badge with Shimmer */}
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 20px',
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)',
                            border: '1px solid rgba(244, 114, 182, 0.3)',
                            fontSize: '0.75rem',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            color: '#F472B6',
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
                            <span style={{ position: 'relative', zIndex: 1 }}>💌 Eternal Storage 💌</span>
                        </div>

                        {/* Premium Title */}
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '2.8rem',
                            margin: '0 0 12px 0',
                            background: 'linear-gradient(135deg, #fff 0%, #F472B6 50%, #F97316 100%)',
                            backgroundSize: '200% 200%',
                            animation: 'gradient-shift 4s ease infinite',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 4px 20px rgba(244, 114, 182, 0.3))',
                            letterSpacing: '-1px',
                            fontWeight: '700'
                        }}>Time Capsules</h2>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.5)',
                            fontFamily: 'var(--font-serif)',
                            maxWidth: '400px',
                            margin: '0 auto',
                            fontStyle: 'italic'
                        }}>Moments sealed in time, waiting to be discovered</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '20px',
                            paddingBottom: '100px'
                        }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    padding: '24px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '32px',
                                    aspectRatio: '0.85',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div className="animate-pulse-slow" style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.08)', marginBottom: '15px'
                                    }} />
                                    <div style={{ width: '80%', height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '7px', marginBottom: '8px' }} />
                                    <div style={{ width: '50%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && capsules.length === 0 && (
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
                                background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 70%)',
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }} />

                            {/* Animated Capsule Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(244, 114, 182, 0.2)',
                                animation: 'float-gentle 4s ease-in-out infinite'
                            }}>
                                <span style={{ fontSize: '2.5rem' }}>🏺</span>
                            </div>

                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '1.3rem',
                                color: 'white',
                                fontWeight: '600'
                            }}>The Collection is Empty</h3>

                            <p style={{
                                margin: '0 0 25px 0',
                                fontSize: '0.95rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.6
                            }}>
                                Seal a memory today for a future you will cherish.<br />
                                A letter, a promise, or a feeling.
                            </p>

                            <button
                                onClick={() => setView('create')}
                                style={{
                                    background: 'var(--accent-lux-gradient)',
                                    color: 'white',
                                    padding: '16px 40px',
                                    borderRadius: '50px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 40px rgba(251, 113, 133, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 15px 50px rgba(251, 113, 133, 0.6)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 10px 40px rgba(251, 113, 133, 0.4)'}
                            >
                                + Seal First Memory
                            </button>
                        </div>
                    )}

                    {!loading && capsules.length > 0 && (
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
                                                    onClick={(e) => requestDeleteCapsule(cap.id, e)}
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
                                                {unlocked ? '📃' : '🔒'}
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
    <div style={{
        padding: '40px 28px',
        textAlign: 'center',
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '36px',
        width: '92%',
        maxWidth: '440px',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
    }}>
        {/* Top Accent Line */}
        <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: '3px',
            background: 'linear-gradient(90deg, transparent, rgba(251, 113, 133, 0.6), transparent)',
            borderRadius: '0 0 10px 10px'
        }} />

        {/* Atmospheric Glow */}
        <div style={{
            position: 'absolute', top: '-50px', right: '-50px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
        }} />

        {/* Icon */}
        <div style={{
            width: '80px', height: '80px',
            margin: '0 auto 24px',
            background: 'rgba(251, 113, 133, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(251, 113, 133, 0.2)',
            position: 'relative'
        }}>
            <span style={{ fontSize: '2.2rem' }}>💌</span>
        </div>

        <h3 style={{
            marginTop: 0,
            fontSize: '1.8rem',
            marginBottom: '10px',
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
        }}>Seal a Memory</h3>

        <p style={{
            fontSize: '0.95rem',
            marginBottom: '28px',
            color: '#94a3b8',
            lineHeight: '1.6',
            maxWidth: '320px',
            margin: '0 auto 28px'
        }}>
            Write a message for the future. It will remain locked until the moment is right.
        </p>

        <textarea
            style={{
                width: '100%',
                height: '140px',
                marginBottom: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '18px',
                borderRadius: '20px',
                fontSize: '1rem',
                color: 'white',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s',
                fontFamily: 'var(--font-serif)',
                lineHeight: '1.6'
            }}
            onFocus={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(251, 113, 133, 0.4)';
                e.target.style.boxShadow = '0 0 0 4px rgba(251, 113, 133, 0.1)';
            }}
            onBlur={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
            }}
            placeholder="Dear Future Us..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            maxLength={1000}
        />

        {/* Character Counter */}
        <div style={{
            display: 'flex', justifyContent: 'flex-end', marginBottom: '20px',
            fontSize: '0.75rem', color: newContent.length > 900 ? '#fbbf24' : 'rgba(255,255,255,0.4)'
        }}>
            {newContent.length} / 1000
        </div>

        <label style={{ display: 'block', marginBottom: '28px', textAlign: 'left' }}>
            <span style={{
                fontWeight: '700',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '10px',
                display: 'block'
            }}>When should it unlock?</span>
            <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                style={{
                    width: '100%',
                    padding: '16px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '1rem',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                }}
                onFocus={e => {
                    e.target.style.borderColor = 'rgba(251, 113, 133, 0.4)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(251, 113, 133, 0.1)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                }}
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
            />
        </label>

        <div style={{ display: 'flex', gap: '12px' }}>
            <button
                onClick={onCancel}
                style={{
                    flex: 1,
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8',
                    borderRadius: '18px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                }}
            >Cancel</button>
            <button
                onClick={onSave}
                style={{
                    flex: 1.2,
                    background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '18px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.5)',
                    transition: 'all 0.2s'
                }}
            >Seal It 🔐</button>
        </div>

        {/* Privacy Badge */}
        <div style={{
            marginTop: '20px', display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: '6px'
        }}>
            <span style={{ fontSize: '0.9rem' }}>🔒</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Private & Stored Locally
            </span>
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

            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📃</div>
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
