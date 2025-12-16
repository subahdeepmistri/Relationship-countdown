import React, { useState } from 'react';

const AnniversarySelection = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState('couple');

    const types = [
        { id: 'couple', label: 'Couple', icon: '👩‍❤️‍👨', bg: '#FFEBEE', border: '#FF5252' }, // Red tint
        { id: 'birthday', label: 'Birthday', icon: '🎂', bg: '#F3E5F5', border: '#E1BEE7' }, // Purple tint
        { id: 'wedding', label: 'Wedding Anniversary', icon: '💍', bg: '#FFFDE7', border: '#FFF59D' }, // Yellow tint
        { id: 'general', label: 'General Anniversaries', icon: '📅', bg: '#E3F2FD', border: '#BBDEFB' }, // Blue tint
        { id: 'puppy', label: "Puppy's Birthday", icon: '🐶', bg: '#E8F5E9', border: '#C8E6C9' }, // Green tint
        { id: 'kitten', label: "Kitten's Birthday", icon: '🐱', bg: '#FFF3E0', border: '#FFE0B2' }, // Orange tint
    ];

    const handleNext = () => {
        if (selectedId) {
            onSelect(selectedId);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'white',
            zIndex: 9000,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto'
        }}>
            <div style={{ padding: '20px 20px 120px 20px' }}> {/* Padding bottom for fixed button */}
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    color: '#555',
                    fontFamily: 'sans-serif',
                    marginBottom: '20px',
                    fontWeight: 'normal'
                }}>Select the type of anniversary</h2>

                {/* Import Button */}
                <button style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '30px',
                    borderRadius: '15px',
                    border: '1px solid #eee',
                    background: '#F5F5F7',
                    color: '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    ☁️ Import anniversaries from backup
                </button>

                {/* Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                }}>
                    {types.map(type => {
                        const isSelected = selectedId === type.id;
                        return (
                            <div
                                key={type.id}
                                onClick={() => setSelectedId(type.id)}
                                style={{
                                    background: type.bg,
                                    borderRadius: '15px',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid #FF5252` : '2px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* Checkmark for selected */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px', left: '-10px',
                                        background: '#FF5252',
                                        color: 'white',
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem'
                                    }}>✓</div>
                                )}

                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{type.icon}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>{type.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Bottom Button */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, width: '100%',
                background: 'white',
                padding: '20px',
                borderTop: '1px solid #eee'
            }}>
                <button
                    onClick={handleNext}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: '#5C6BC0', // Indigo/Blue matching previous screen logic/theme
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AnniversarySelection;
