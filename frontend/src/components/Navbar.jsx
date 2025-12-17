import React from 'react';

const Navbar = ({ onNavigate, activeView }) => {
    return (
        <div className="navbar-dock">
            <NavItem
                icon="⏳"
                label="Capsules"
                onClick={() => onNavigate('capsules')}
                isActive={activeView === 'capsules'}
            />
            <NavItem
                icon="🚀"
                label="Future"
                onClick={() => onNavigate('goals')}
                isActive={activeView === 'goals'}
            />
            <NavItem
                icon="🎙️"
                label="Diary"
                onClick={() => onNavigate('voice')}
                isActive={activeView === 'voice'}
            />
            <NavItem
                icon="🗺️"
                label="Journey"
                onClick={() => onNavigate('journey')}
                isActive={activeView === 'journey'}
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
            gap: '5px',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
            background: isActive ? 'rgba(255,255,255,0.5)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '8px 12px',
            borderRadius: '12px',
            opacity: isActive ? 1 : 0.7
        }}
        onMouseOver={(e) => {
            if (!isActive) e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
            e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
            if (!isActive) e.currentTarget.style.transform = 'scale(1) translateY(0)';
            if (!isActive) e.currentTarget.style.opacity = '0.7';
        }}
    >
        <span style={{ fontSize: '1.5rem', filter: isActive ? 'drop-shadow(0 0 8px var(--accent-primary))' : 'none' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '700' : '500', letterSpacing: '0.5px' }}>{label}</span>
    </button>
);

export default Navbar;
