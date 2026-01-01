import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onNavigate, activeView }) => {
    const navItems = useMemo(() => [
        { id: 'capsules', label: 'Capsules', icon: Icons.Heart, color: '#E11D48', bg: 'rgba(225, 29, 72, 1)' }, // Rose
        { id: 'goals', label: 'Dreams', icon: Icons.Rocket, color: '#0EA5E9', bg: 'rgba(14, 165, 233, 1)' },   // Sky
        { id: 'voice', label: 'Diary', icon: Icons.Mic, color: '#10B981', bg: 'rgba(16, 185, 129, 1)' },      // Emerald
        { id: 'journey', label: 'Journey', icon: Icons.Map, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 1)' },  // Violet
        { id: 'about', label: 'About', icon: Icons.Info, color: '#F97316', bg: 'rgba(249, 115, 22, 1)' },     // Orange
    ], []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'auto',
                minWidth: '320px',
                maxWidth: '90%',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                pointerEvents: 'none'
            }}
        >
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '6px',
                pointerEvents: 'auto',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                gap: '8px'
            }}>
                {navItems.map((item) => {
                    const isActive = activeView === item.id || (item.id === 'capsules' && !activeView);

                    return (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={isActive}
                            onClick={() => onNavigate(item.id)}
                        />
                    );
                })}
            </nav>
        </div>
    );
};

const NavItem = ({ item, isActive, onClick }) => {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = useCallback(() => {
        setClickCount(prev => prev + 1);
        onClick();
    }, [onClick]);

    return (
        <button
            onClick={handleClick}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
            }}
        >
            {/* Glitter Effects - Triggered on click */}
            <AnimatePresence>
                {isActive && (
                    <Sparkles key={clickCount} color={item.bg} />
                )}
            </AnimatePresence>

            <motion.div
                layout
                initial={false}
                animate={{
                    width: isActive ? 'auto' : '44px',
                    backgroundColor: isActive ? item.bg : 'transparent',
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    borderRadius: '20px',
                    padding: isActive ? '0 16px' : '0 8px',
                    overflow: 'visible', // Visible for sparkles potentially
                    whiteSpace: 'nowrap',
                    position: 'relative'
                }}
            >
                {/* Icon */}
                <motion.div
                    layout="position"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        zIndex: 2
                    }}
                >
                    <item.icon isActive={isActive} size={22} />
                </motion.div>

                {/* Text Label */}
                <AnimatePresence mode="popLayout">
                    {isActive && (
                        <motion.span
                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            style={{
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                letterSpacing: '0.3px',
                                textTransform: 'capitalize',
                                fontFamily: 'var(--font-heading, sans-serif)',
                                overflow: 'hidden',
                                zIndex: 2
                            }}
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    );
};

// --- Sparkle Component ---
const Sparkles = ({ color }) => {
    // Generate random particles
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            angle: (i / 8) * 360, // Distribute around circle
            dist: 20 + Math.random() * 15, // Random distance
            size: 2 + Math.random() * 3, // Random size
            delay: Math.random() * 0.1
        }));
    }, []);

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 0 }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                        x: Math.cos(p.angle * Math.PI / 180) * p.dist,
                        y: Math.sin(p.angle * Math.PI / 180) * p.dist,
                        opacity: 0,
                        scale: p.scale
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: p.delay
                    }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size,
                        backgroundColor: '#FFF', // White sparkles for contrast
                        borderRadius: '50%',
                        boxShadow: `0 0 4px ${color}` // Colored glow matchin pill
                    }}
                />
            ))}
            {/* Extra star shape */}
            <motion.svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                initial={{ opacity: 1, scale: 0, rotate: 0 }}
                animate={{ opacity: 0, scale: 1.5, rotate: 90 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ position: 'absolute', top: '-10px', left: '-10px', fill: '#FFF' }}
            >
                <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
            </motion.svg>
        </div>
    );
};


// Note: Icons are now OUTLINES only (fill="none") but stronger stroke when active
const Icons = {
    Heart: ({ isActive, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? "none" : "none"} stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    ),
    Rocket: ({ isActive, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? "none" : "none"} stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    Mic: ({ isActive, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? "none" : "none"} stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    Map: ({ isActive, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? "none" : "none"} stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    Info: ({ isActive, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={isActive ? "none" : "none"} stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

export default Navbar;
