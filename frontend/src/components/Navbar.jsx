import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onNavigate, activeView }) => {
    // Nav items configuration
    const navItems = useMemo(() => [
        { id: 'capsules', label: 'Capsules', icon: Icons.Heart },
        { id: 'goals', label: 'Dreams', icon: Icons.Rocket },
        { id: 'voice', label: 'Diary', icon: Icons.Mic },
        { id: 'journey', label: 'Journey', icon: Icons.Map },
        { id: 'about', label: 'About', icon: Icons.Info },
    ], []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)', // Responsive width
                maxWidth: '400px', // Cap width on desktop
                zIndex: 9999, // High z-index
                display: 'flex',
                justifyContent: 'center',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)' // iOS safe area
            }}
        >
            <nav style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)', // 5 equal columns
                // alignItems: 'stretch', // Default behavior ensures full height for centering
                width: '100%',
                height: '58px', // Reduced height as requested (was 64px)
                padding: '0 8px',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '32px',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            }}>
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeView === item.id || (item.id === 'capsules' && !activeView)}
                        onClick={() => onNavigate(item.id)}
                    />
                ))}
            </nav>
        </div>
    );
};

const NavItem = ({ item, isActive, onClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 1000)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                padding: '4px 0',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--accent-lux)'}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
        >
            {/* Custom Tooltip - only on desktop hover */}
            <AnimatePresence>
                {isHovered && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={{
                            position: 'absolute',
                            top: '-35px',
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {item.label}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileTap={{ scale: 0.9 }}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%'
                }}
            >
                {/* Active Indicator */}
                {isActive && (
                    <motion.div
                        layoutId="active-nav-indicator"
                        style={{
                            position: 'absolute',
                            top: '0px',
                            width: '24px', height: '3px',
                            borderRadius: '2px',
                            background: 'var(--accent-lux)',
                            boxShadow: '0 2px 8px rgba(251, 113, 133, 0.8)'
                        }}
                    />
                )}

                <motion.div
                    animate={{
                        y: isActive ? 1 : 0,
                        color: isActive ? 'var(--accent-lux)' : 'rgba(148, 163, 184, 0.6)',
                        scale: isActive ? 1.05 : 1,
                        filter: isActive ? 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.5))' : 'none'
                    }}
                    style={{
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: '4px'
                    }}
                >
                    <item.icon isActive={isActive} />
                </motion.div>

                {/* Visible Label for Mobile */}
                <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '600',
                    marginTop: '2px',
                    color: isActive ? 'var(--accent-lux)' : 'rgba(148, 163, 184, 0.5)',
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s'
                }}>
                    {item.label}
                </span>
            </motion.div>
        </button>
    );
};

const Icons = {
    Heart: ({ isActive }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: isActive ? 'none' : 'heartbeat-safe 3s infinite ease-in-out' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            {/* Inline safe animation definition */}
            <style>{`
                @keyframes heartbeat-safe {
                    0% { transform: scale(1); }
                    15% { transform: scale(1.15); }
                    30% { transform: scale(1); }
                    45% { transform: scale(1.15); }
                    60% { transform: scale(1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </svg>
    ),
    Rocket: ({ isActive }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' } : {}}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    Mic: ({ isActive }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' } : {}}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    Map: ({ isActive }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))' } : {}}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    Info: ({ isActive }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

export default Navbar;
