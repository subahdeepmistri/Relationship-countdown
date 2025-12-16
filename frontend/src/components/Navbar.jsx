import React from 'react';

const Navbar = ({ onNavigate }) => {
    return (
        <div className="navbar-dock">
            <NavItem icon="⏳" label="Capsules" onClick={() => onNavigate('capsules')} />
            <NavItem icon="🚀" label="Future" onClick={() => onNavigate('goals')} />
            <NavItem icon="🎙️" label="Diary" onClick={() => onNavigate('voice')} />
            <NavItem icon="🗺️" label="Journey" onClick={() => onNavigate('journey')} />
        </div>
    );
};

const NavItem = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="nav-item"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
    >
        <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500', letterSpacing: '0.5px' }}>{label}</span>
    </button>
);

export default Navbar;
