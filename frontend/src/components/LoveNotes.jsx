import React, { useState, useEffect } from 'react';

const LoveNotes = () => {
    const [note, setNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const savedNote = localStorage.getItem('rc_love_note');
        if (savedNote) setNote(savedNote);
    }, []);

    const handleSave = () => {
        localStorage.setItem('rc_love_note', note);
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📝 Love Note
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ fontSize: '0.8rem', color: '#B45309', textDecoration: 'underline' }}
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
                        className="w-full bg-white/50 border border-orange-200 rounded-xl p-3 text-slate-700 font-medium focus:ring-2 focus:ring-orange-300 outline-none resize-none"
                        rows="3"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            onClick={handleSave}
                            className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:bg-orange-500 transition-colors"
                        >
                            Save Note
                        </button>
                    </div>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)}>
                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-heading)',
                        color: note ? '#4B5563' : '#9CA3AF',
                        fontStyle: note ? 'normal' : 'italic'
                    }}>
                        {note || "Tap to write a love note..."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoveNotes;
