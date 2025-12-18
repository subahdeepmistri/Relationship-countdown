import React from 'react';

const Navbar = ({ onNavigate, activeView }) => {
    return (
        <div className="navbar-dock">
            <NavItem
                icon={<Icons.Time />}
                label="Capsules"
                onClick={() => onNavigate('capsules')}
                isActive={activeView === 'capsules'}
            />
            <NavItem
                icon={<Icons.Rocket />}
                label="Future"
                onClick={() => onNavigate('goals')}
                isActive={activeView === 'goals'}
            />
            <NavItem
                icon={<Icons.Mic />}
                label="Diary"
                onClick={() => onNavigate('voice')}
                isActive={activeView === 'voice'}
            />
            <NavItem
                icon={<Icons.Map />}
                label="Journey"
                onClick={() => onNavigate('journey')}
                isActive={activeView === 'journey'}
            />
            <NavItem
                icon={<Icons.Info />}
                label="About"
                onClick={() => onNavigate('about')}
                isActive={activeView === 'about'}
            />
        </div>
    );
};

const NavItem = ({ icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className="nav-item"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.7)',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '6px 10px',
            borderRadius: '16px',
            opacity: isActive ? 1 : 0.6,
            minWidth: '64px'
        }}
        onMouseOver={(e) => {
            if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
            if (!isActive) e.currentTarget.style.transform = 'translateY(0)';
            if (!isActive) e.currentTarget.style.opacity = '0.6';
        }}
    >
        <span style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            filter: isActive ? 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.4))' : 'none',
            transition: 'all 0.3s ease'
        }}>
            {icon}
        </span>
        <span style={{
            fontSize: '0.7rem',
            fontWeight: isActive ? '600' : '500',
            letterSpacing: '0.3px'
        }}>
            {label}
        </span>
    </button>
);

// --- SVG Icons (Lucide Style) ---
const Icons = {
    Time: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Rocket: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    Mic: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    Map: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    Info: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

export default Navbar;
