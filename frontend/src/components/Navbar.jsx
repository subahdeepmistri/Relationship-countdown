import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onNavigate, activeView }) => {
    // Nav items configuration
    const navItems = useMemo(() => [
        { id: 'capsules', label: 'Capsules', icon: Icons.Time },
        { id: 'goals', label: 'Future', icon: Icons.Rocket },
        { id: 'voice', label: 'Diary', icon: Icons.Mic },
        { id: 'journey', label: 'Journey', icon: Icons.Map },
        { id: 'about', label: 'About', icon: Icons.Info },
    ], []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '430px', // Mobile optimized max width
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.75)', // Deep Navy with transparency
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '32px',
                boxShadow: '0 10px 40px -10px rgba(2, 6, 23, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeView === item.id}
                        onClick={() => onNavigate(item.id)}
                    />
                ))}
            </nav>
        </div>
    );
};

const NavItem = ({ item, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                flex: 1,
                height: '100%',
                opacity: 1, // Controlled by internal elements
                WebkitTapHighlightColor: 'transparent',
                padding: '4px'
            }}
        >
            <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%'
                }}
            >
                {/* Active Indicator (Glowing Dot) */}
                {isActive && (
                    <motion.div
                        layoutId="active-nav-indicator"
                        style={{
                            position: 'absolute',
                            top: '-8px', // Position slightly above or change to bottom depending on preference
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#F472B6', // Soft pink
                            boxShadow: '0 0 8px 2px rgba(244, 114, 182, 0.6)'
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                    />
                )}

                {/* Icon Container */}
                <motion.div
                    animate={{
                        y: isActive ? -2 : 0,
                        color: isActive ? '#F472B6' : 'rgba(148, 163, 184, 0.8)', // Pink vs Muted Blue-Gray
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.3))' : 'none'
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'relative' }}
                >
                    <item.icon isActive={isActive} />
                </motion.div>

                {/* Label */}
                <motion.span
                    animate={{
                        opacity: isActive ? 1 : 0.6,
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        scale: isActive ? 1.05 : 1
                    }}
                    style={{
                        fontSize: '0.65rem',
                        fontWeight: isActive ? 600 : 500,
                        letterSpacing: '0.02em',
                        marginTop: '2px'
                    }}
                >
                    {item.label}
                </motion.span>
            </motion.div>
        </button>
    );
};

// --- Icons (Enhanced w/ Motion Props) ---
const Icons = {
    Time: ({ isActive }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <motion.circle cx="12" cy="12" r="10" initial={false} animate={{ strokeOpacity: 1 }} />
            <motion.polyline
                points="12 6 12 12 16 14"
                initial={false}
                animate={{ pathLength: 1 }}
            />
        </svg>
    ),
    Rocket: ({ isActive }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    Mic: ({ isActive }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    Map: ({ isActive }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    Info: ({ isActive }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

export default Navbar;
