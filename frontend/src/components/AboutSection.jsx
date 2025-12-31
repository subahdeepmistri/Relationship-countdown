import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const AboutSection = ({ onClose }) => {
    const [isEasterEggVisible, setIsEasterEggVisible] = useState(false);

    const [longPressTimer, setLongPressTimer] = useState(null);

    const handleStart = () => {
        const timer = setTimeout(() => {
            setIsEasterEggVisible(prev => !prev);
        }, 800); // 800ms for long press
        setLongPressTimer(timer);
    };

    const handleEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const [timeLeft, setTimeLeft] = useState({});
    const [isLocked, setIsLocked] = useState(true);

    useEffect(() => {
        const targetDate = new Date('2024-01-01T00:00:00'); // TEMPORARILY UNLOCKED - was 2026-01-24

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
                setIsLocked(true);
            } else {
                if (isLocked) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#F472B6', '#F97316', '#FFFFFF']
                    });
                }
                setIsLocked(false);
            }
            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [isLocked]);


    const handleHeartInteraction = () => {
        setIsEasterEggVisible(prev => !prev);
    };

    if (isLocked) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2000,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Darker, more mysterious
                    backdropFilter: 'blur(30px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}>
                <button
                    onClick={onClose}
                    aria-label="Close About section"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ✕
                </button>

                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(244,114,182,0.4))' }}>
                    🔒
                </motion.div>

                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '30px',
                    fontWeight: '300',
                    letterSpacing: '1px',
                    textAlign: 'center',
                    color: '#e2e8f0'
                }}>
                    This story unlocks in...
                </h2>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    textAlign: 'center',
                    fontFamily: 'monospace' // Or a better font if available
                }}>
                    {Object.keys(timeLeft).length > 0 && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F472B6' }}>{timeLeft.days}</span>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7 }}>Days</span>
                            </div>
                            <span style={{ fontSize: '2rem', color: '#475569' }}>:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F472B6' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7 }}>Hrs</span>
                            </div>
                            <span style={{ fontSize: '2rem', color: '#475569' }}>:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F472B6' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7 }}>Mins</span>
                            </div>
                            <span style={{ fontSize: '2rem', color: '#475569' }}>:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F472B6' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.7 }}>Secs</span>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                zIndex: 2000,
                background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px 110px 16px',
                overflowY: 'auto',
                overflowX: 'hidden',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.4s ease-out',
                color: 'white'
            }}>
            {/* Grain/Vignette Overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                pointerEvents: 'none', zIndex: -1, opacity: 0.4
            }} />
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none', zIndex: -1
            }} />

            {/* Background Atmosphere Blobs - Adjusted Z-Index and Colors */}
            <div className="animate-pulse-slow" style={{ position: 'fixed', top: '-10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div className="animate-float" style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '30px',
                flexShrink: 0,
                position: 'relative'
            }}>
                {/* Floating Sparkle Decorations */}
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '20%',
                    fontSize: '1.2rem',
                    animation: 'sparkle 3s ease-in-out infinite',
                    animationDelay: '0s',
                    pointerEvents: 'none'
                }}>✨</div>
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '25%',
                    fontSize: '0.9rem',
                    animation: 'sparkle 3s ease-in-out infinite',
                    animationDelay: '1s',
                    pointerEvents: 'none'
                }}>⭐</div>
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    left: '10%',
                    fontSize: '0.8rem',
                    animation: 'sparkle 3s ease-in-out infinite',
                    animationDelay: '2s',
                    pointerEvents: 'none'
                }}>💫</div>

                <div style={{ padding: '0 20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        <span style={{ position: 'relative', zIndex: 1 }}>✦ About Us ✦</span>
                    </div>

                    {/* Premium Title */}
                    <h2 style={{
                        fontSize: '2.8rem',
                        margin: '0 0 8px 0',
                        fontFamily: 'var(--font-heading)',
                        background: 'linear-gradient(135deg, #fff 0%, #F472B6 50%, #F97316 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 4s ease infinite',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 20px rgba(244, 114, 182, 0.3))',
                        letterSpacing: '-1px',
                        fontWeight: '700'
                    }}>Our Story</h2>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontStyle: 'italic',
                        margin: 0,
                        letterSpacing: '0.5px'
                    }}>A love written in code</p>
                </div>

                {/* Close Button - Enhanced */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.7)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>

                {/* Intro - Premium Heart Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    marginTop: '10px',
                    position: 'relative'
                }}>
                    {/* Heart Container with Glow Rings */}
                    <div
                        title="Every beat leads back to you."
                        onDoubleClick={handleHeartInteraction}
                        onMouseDown={handleStart}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchEnd={handleEnd}
                        style={{
                            position: 'relative',
                            width: '110px',
                            height: '110px',
                            margin: '0 auto 15px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            touchAction: 'manipulation',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>

                        {/* Outer Glow Ring */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            border: '2px solid rgba(244, 114, 182, 0.3)',
                            animation: 'ring-expand 2s ease-out infinite'
                        }} />

                        {/* Middle Glow Ring */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            border: '2px solid rgba(244, 114, 182, 0.4)',
                            animation: 'ring-expand 2s ease-out infinite',
                            animationDelay: '0.5s'
                        }} />

                        {/* Inner Glow Ring */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '55px',
                            height: '55px',
                            borderRadius: '50%',
                            border: '2px solid rgba(244, 114, 182, 0.5)',
                            animation: 'ring-expand 2s ease-out infinite',
                            animationDelay: '1s'
                        }} />

                        {/* Animated SVG Heart */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: 'heart-beat 1.5s ease-in-out infinite',
                            filter: 'drop-shadow(0 0 20px rgba(244, 114, 182, 0.6))',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="1 2 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ display: 'block' }}
                            >
                                <defs>
                                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#F472B6" />
                                        <stop offset="50%" stopColor="#FB7185" />
                                        <stop offset="100%" stopColor="#F97316" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    fill="url(#heartGradient)"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Text Content */}
                    {isEasterEggVisible ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                minHeight: '80px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                background: 'rgba(244, 114, 182, 0.1)',
                                borderRadius: '20px',
                                padding: '20px',
                                border: '1px solid rgba(244, 114, 182, 0.2)'
                            }}>
                            <p style={{
                                fontSize: '1.4rem',
                                lineHeight: '1.6',
                                color: '#F472B6',
                                fontWeight: '600',
                                margin: 0,
                                fontFamily: '"Dancing Script", cursive',
                                fontStyle: 'italic',
                                textShadow: '0 2px 15px rgba(244, 114, 182, 0.5)'
                            }}>
                                "If you're reading this…
                            </p>
                            <p style={{
                                fontSize: '1.4rem',
                                lineHeight: '1.6',
                                color: '#F472B6',
                                fontWeight: '600',
                                margin: '5px 0 0 0',
                                fontFamily: '"Dancing Script", cursive',
                                fontStyle: 'italic',
                                textShadow: '0 2px 15px rgba(244, 114, 182, 0.5)'
                            }}>
                                I still choose you. Always."
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <p style={{
                                fontSize: '1.15rem',
                                lineHeight: '1.8',
                                color: '#e2e8f0',
                                fontWeight: '500',
                                margin: 0,
                                letterSpacing: '0.3px'
                            }}>
                                Counting moments, keeping promises, and bridging distances.
                            </p>
                            <p style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255,255,255,0.4)',
                                marginTop: '8px',
                                marginBottom: 0
                            }}>
                                ✨ Tap the heart for a secret message
                            </p>
                        </div>
                    )}
                </div>

                {/* Developer / Dedication Card - Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '28px',
                        padding: '32px',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                    <style>
                        {`
                            @keyframes bloom {
                                0% { transform: scale(0.5); opacity: 0; filter: blur(4px); }
                                70% { transform: scale(1.1); opacity: 1; filter: blur(0px); }
                                100% { transform: scale(1); opacity: 1; filter: blur(0px); }
                            }
                        `}
                    </style>

                    {/* Decorative Elements - Enhanced */}
                    <div style={{
                        position: 'absolute', top: -60, right: -60, width: 150, height: 150,
                        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float-gentle 6s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -40, left: -40, width: 120, height: 120,
                        background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        animation: 'float-gentle 6s ease-in-out infinite',
                        animationDelay: '3s'
                    }} />

                    <p style={{
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontSize: '0.75rem',
                        color: '#F472B6',
                        fontWeight: '700',
                        marginBottom: '16px'
                    }}>
                        CREATED WITH LOVE
                    </p>

                    <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2.0rem',
                        margin: '0 0 20px 0',
                        background: 'linear-gradient(to right, #F472B6, #F97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        For Sexie <span style={{
                            display: 'inline-block',
                            animation: 'bloom 1.5s ease-out forwards',
                            animationDelay: '0.3s',
                            opacity: 0 // Start invisible for fade-in effect
                        }}>🌸</span>
                    </h3>

                    <div style={{
                        fontSize: '1rem',
                        color: '#cbd5e1',
                        marginBottom: '30px',
                        lineHeight: '1.7',
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <p style={{ marginBottom: '16px' }}>
                            This app exists because <b>you exist</b> in my life.<br />
                            Every second counted here is a quiet reminder that
                            even when we’re apart, <b>we’re never truly distant.</b>
                        </p>
                        <p style={{ marginBottom: '16px' }}>
                            I made this for our third anniversary,
                            but it carries something far greater than a date —
                            it carries <b>our story, our effort, and our forever.</b>
                        </p>

                        <div style={{ textAlign: 'right', marginTop: '16px', fontStyle: 'italic', fontFamily: '"Dancing Script", cursive' }}>
                            Always yours,<br />
                            <strong>Spidey 🕷️</strong>
                        </div>
                    </div>

                    <div style={{
                        borderTop: '2px dashed rgba(255,255,255,0.1)',
                        margin: '20px 0',
                        width: '100%'
                    }} />

                    <div style={{ textAlign: 'left', marginTop: '20px' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>The One Who Built This—For You</p>

                        {/* Developer Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '14px',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#38bdf8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'white' }}>Subhadeep Mistri</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Designer & Developer</div>
                            </div>
                        </div>

                        {/* Contact Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="mailto:subhadeepmistri1990@gmail.com" style={{
                                fontSize: '0.9rem', color: '#e2e8f0', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                </div>
                                subhadeepmistri1990@gmail.com
                            </a>

                            <a href="tel:8250518317" style={{
                                fontSize: '0.9rem', color: '#e2e8f0', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                +91 8250518317
                            </a>
                        </div>
                    </div>

                </motion.div>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>💝</span>
                        <span style={{
                            fontSize: '0.85rem',
                            color: '#F472B6',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>Made with Love</span>
                        <span style={{ fontSize: '1.2rem' }}>💝</span>
                    </div>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.4)',
                        margin: 0,
                        lineHeight: 1.6
                    }}>
                        Built to last forever • v1.1.1<br />
                        Lovingly maintained by Spidey 🕷️
                    </p>
                </div>
            </div>
        </motion.div >
    );
};



export default AboutSection;
