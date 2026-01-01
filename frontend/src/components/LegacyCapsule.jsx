import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useLegacyMessages } from '../hooks/useDataHooks';
import '../styles/LegacyMode.css'; // Make sure to retain basic CSS or replace if needed, but we'll use inline mostly for the new vibe

const LegacyCapsule = ({ onClose }) => {
    const {
        messages,
        loading,
        error,
        sealMessage,
        deleteMessage,
        clearAll,
        clearError
    } = useLegacyMessages();

    // Sound effect refs (placeholders - real audio would require files)
    // We will visualize sound with animations

    const [view, setView] = useState('main'); // main, writing, viewing-orb
    const [selectedOrb, setSelectedOrb] = useState(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 10%, #172033 0%, #0F172A 100%)',
                zIndex: 4000,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Ambient Space Noise */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Stars / Particles */}
            <StarField />

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: '24px', right: '24px',
                    zIndex: 50, background: 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: '50%',
                    width: '44px', height: '44px',
                    color: 'white', fontSize: '1.2rem',
                    cursor: 'pointer', backdropFilter: 'blur(10px)'
                }}
            >✕</button>

            {/* Content Switcher */}
            <AnimatePresence mode="wait">
                {view === 'main' && (
                    <MainVaultView
                        key="main"
                        messages={messages}
                        onWrite={() => setView('writing')}
                        onOrbClick={(msg) => { setSelectedOrb(msg); setView('viewing-orb'); }}
                        onClose={onClose}
                        onClearAll={clearAll}
                    />
                )}
                {view === 'writing' && (
                    <SealingInterface
                        key="writing"
                        onSeal={(text, years) => {
                            sealMessage(text, years);
                            setView('main');
                        }}
                        onCancel={() => setView('main')}
                    />
                )}
                {view === 'viewing-orb' && selectedOrb && (
                    <OrbDetailView
                        key="orb-view"
                        orb={selectedOrb}
                        onClose={() => { setSelectedOrb(null); setView('main'); }}
                        onDelete={(id) => { deleteMessage(id); setView('main'); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Sub-Components ---

const MainVaultView = ({ messages, onWrite, onOrbClick, onClearAll }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '80px 20px 40px', position: 'relative', zIndex: 10,
                width: '100%', boxSizing: 'border-box'
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <div style={{
                    width: '80px', height: '80px', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                    borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 0 30px rgba(100, 200, 255, 0.1)'
                }}>
                    <span style={{ fontSize: '2.5rem' }}>🏦</span>
                </div>
                <h2 style={{
                    color: 'white', fontFamily: 'var(--font-heading)',
                    fontSize: '2rem', margin: '0 0 8px', letterSpacing: '-0.5px'
                }}>Legacy Vault</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '280px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Secure messages for a distant future.
                    <br />stored locally & encrypted.
                </p>
            </motion.div>

            {/* Glowing Orbs Grid */}
            <div style={{
                flex: 1, width: '100%', maxWidth: '500px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '24px', paddingBottom: '100px', alignContent: 'start'
            }}>
                {messages.map((msg, i) => (
                    <OrbItem key={msg.id} msg={msg} index={i} onClick={() => onOrbClick(msg)} />
                ))}

                {/* Add Button as the last item if list is short, or floating */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onWrite}
                    style={{
                        aspectRatio: '1', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)',
                        background: 'transparent', color: 'rgba(255,255,255,0.5)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.8rem', gap: '4px'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>+</span>
                    <span>New</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

const OrbItem = ({ msg, index, onClick }) => {
    const isReady = new Date() >= new Date(msg.unlockDate);
    return (
        <motion.div
            layoutId={`orb-${msg.id}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            style={{
                aspectRatio: '1',
                borderRadius: '50%',
                position: 'relative',
                cursor: 'pointer'
            }}
        >
            {/* The Orb */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: isReady
                    ? 'radial-gradient(circle at 30% 30%, #a5f3fc, #0891b2)'
                    : 'radial-gradient(circle at 30% 30%, #64748b, #1e293b)',
                boxShadow: isReady
                    ? '0 0 20px rgba(8, 145, 178, 0.6), inset 2px 2px 5px rgba(255,255,255,0.5)'
                    : 'inset 2px 2px 5px rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {isReady ? '🔏' : '🔒'}
            </div>
            {/* Year Label */}
            <div style={{
                position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.75rem', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap'
            }}>
                {new Date(msg.unlockDate).getFullYear()}
            </div>
        </motion.div>
    );
};

const SealingInterface = ({ onSeal, onCancel }) => {
    const [text, setText] = useState('');
    const [years, setYears] = useState(5);
    const [isHolding, setIsHolding] = useState(false);

    // Hold Logic
    const controls = useAnimation();
    const holdTime = 2000; // 2 seconds
    const holdTimer = useRef(null);

    const startHold = () => {
        if (!text.trim()) return;
        setIsHolding(true);
        controls.start({
            strokeDashoffset: 0,
            transition: { duration: holdTime / 1000, ease: "linear" }
        });
        holdTimer.current = setTimeout(() => {
            onSeal(text, years);
        }, holdTime);
    };

    const endHold = () => {
        setIsHolding(false);
        controls.stop();
        controls.set({ strokeDashoffset: 283 }); // Reset circle (2 * PI * 45 ≈ 283)
        if (holdTimer.current) clearTimeout(holdTimer.current);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                padding: '24px', alignItems: 'center', zIndex: 20
            }}
        >
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '30px' }}>
                Seal Your Legacy
            </h3>

            {/* Editor */}
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write a message for the future..."
                style={{
                    width: '100%', height: '200px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px', padding: '20px', color: 'white', fontSize: '1.1rem',
                    fontFamily: 'inherit', resize: 'none', outline: 'none',
                    marginBottom: '40px'
                }}
            />

            {/* Time Dials */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
                {[1, 5, 10, 20].map(y => (
                    <button
                        key={y}
                        onClick={() => setYears(y)}
                        style={{
                            padding: '12px 18px', borderRadius: '16px',
                            border: years === y ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                            background: years === y ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: years === y ? '#38bdf8' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        +{y}y
                    </button>
                ))}
            </div>

            {/* Hold to Seal Button */}
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                {/* SVG Ring */}
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                    <motion.circle
                        cx="50" cy="50" r="45" stroke="#38bdf8" strokeWidth="6" fill="none"
                        strokeDasharray="283"
                        strokeDashoffset="283" // Hidden initially
                        animate={controls}
                    />
                </svg>

                {/* Inner Button */}
                <button
                    onMouseDown={startHold}
                    onMouseUp={endHold}
                    onMouseLeave={endHold}
                    onTouchStart={startHold}
                    onTouchEnd={endHold}
                    disabled={!text.trim()}
                    style={{
                        position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                        borderRadius: '50%', border: 'none',
                        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                        color: 'white', fontSize: '0.9rem', fontWeight: 'bold',
                        opacity: !text.trim() ? 0.5 : 1,
                        cursor: !text.trim() ? 'not-allowed' : 'pointer',
                        boxShadow: isHolding ? '0 0 30px rgba(56, 189, 248, 0.6)' : 'none',
                        transition: 'box-shadow 0.2s'
                    }}
                >
                    {isHolding ? 'HOLD...' : 'HOLD TO SEAL'}
                </button>
            </div>

            <button onClick={onCancel} style={{ marginTop: '30px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                Cancel
            </button>
        </motion.div>
    );
};

const OrbDetailView = ({ orb, onClose, onDelete }) => {
    const isUnlocked = new Date() >= new Date(orb.unlockDate);

    return (
        <motion.div
            layoutId={`orb-${orb.id}`}
            style={{
                position: 'absolute', inset: 0, zIndex: 30,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '40px'
            }}
        >
            <button onClick={onClose} style={{ position: 'absolute', top: '24px', left: '24px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ←
            </button>

            {/* Glowing Orb Big */}
            <div style={{
                width: '150px', height: '150px', borderRadius: '50%',
                background: isUnlocked
                    ? 'radial-gradient(circle at 30% 30%, #a5f3fc, #0891b2)'
                    : 'radial-gradient(circle at 30% 30%, #64748b, #1e293b)',
                boxShadow: isUnlocked
                    ? '0 0 60px rgba(8, 145, 178, 0.4)'
                    : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', marginBottom: '40px'
            }}>
                {isUnlocked ? '🔏' : '🔒'}
            </div>

            {isUnlocked ? (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'white', marginBottom: '20px' }}>Memory Unlocked</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '400px' }}>
                        "{orb.text}"
                    </p>
                </div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>Sealed until {new Date(orb.unlockDate).getFullYear()}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>This message is encrypted for the future.</p>
                </div>
            )}

            <button
                onClick={() => onDelete(orb.id)}
                style={{
                    marginTop: '60px', padding: '12px 24px', borderRadius: '50px',
                    border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)',
                    cursor: 'pointer', fontWeight: '600'
                }}
            >
                Destroy Capsule
            </button>
        </motion.div>
    );
};


// Simple Background Starfield
const StarField = () => {
    // Generate static random stars
    const stars = React.useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            size: Math.random() * 2 + 1 + 'px',
            opacity: Math.random(),
            animationDuration: Math.random() * 3 + 2 + 's'
        }));
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
            {stars.map((s, i) => (
                <div key={i} style={{
                    position: 'absolute', top: s.top, left: s.left, width: s.size, height: s.size,
                    background: 'white', borderRadius: '50%', opacity: s.opacity,
                    boxShadow: '0 0 4px rgba(255,255,255,0.8)'
                }} />
            ))}
        </div>
    );
};

export default LegacyCapsule;
