import React, { useState, useEffect } from 'react';

const LoveNotes = () => {
    const [note, setNote] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Soft Char Limit
    const CHAR_LIMIT = 280;

    useEffect(() => {
        const savedNote = localStorage.getItem('rc_love_note');
        const timestamp = localStorage.getItem('rc_love_note_time');
        if (savedNote) setNote(savedNote);
        if (timestamp) setLastUpdated(new Date(timestamp).toLocaleDateString());
    }, []);

    const handleSave = () => {
        localStorage.setItem('rc_love_note', note);
        localStorage.setItem('rc_love_note_time', new Date().toISOString());
        setLastUpdated('Just now');
        setIsEditing(false);
    };

    return (
        <div className="pop-card" style={{ padding: '24px', background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: '#D97706',
                    fontWeight: '700',
                    display: 'flex', alignItems: 'center', gap: '8px', margin: 0
                }}>
                    📝 Love Note
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ fontSize: '0.8rem', color: '#B45309', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Write a short memory or note..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            background: 'rgba(255,255,255,0.7)',
                            border: '2px solid #FDE68A',
                            borderRadius: '16px',
                            padding: '16px',
                            fontFamily: 'var(--font-primary)',
                            fontSize: '1rem',
                            color: '#4B5563',
                            outline: 'none',
                            resize: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: note.length > CHAR_LIMIT ? 'red' : '#9CA3AF' }}>
                            {note.length}/{CHAR_LIMIT}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={!note.trim()}
                            style={{
                                background: !note.trim() ? '#E5E7EB' : '#F59E0B',
                                color: !note.trim() ? '#9CA3AF' : 'white',
                                padding: '8px 16px', borderRadius: '20px',
                                border: 'none', fontWeight: 'bold', fontSize: '0.85rem',
                                cursor: !note.trim() ? 'not-allowed' : 'pointer',
                                boxShadow: !note.trim() ? 'none' : '0 2px 4px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            Save Note
                        </button>
                    </div>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-heading)',
                        color: note ? '#4B5563' : '#9CA3AF',
                        fontStyle: note ? 'normal' : 'italic',
                        whiteSpace: 'pre-wrap',
                        margin: 0
                    }}>
                        {note || "Tap to write a love note..."}
                    </p>
                    {lastUpdated && (
                        <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.7rem', color: '#D97706', opacity: 0.7 }}>
                            Written: {lastUpdated}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoveNotes;
