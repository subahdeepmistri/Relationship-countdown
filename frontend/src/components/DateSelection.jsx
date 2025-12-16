import React, { useState } from 'react';

const DateSelection = ({ onSelect, onBack }) => {
    // Default to today or saved date
    const [date, setDate] = useState(() => {
        return localStorage.getItem('rc_start_date') || new Date().toISOString().split('T')[0];
    });
    const [repeat, setRepeat] = useState(false);

    const handleNext = () => {
        if (date) {
            if (date === new Date().toISOString().split('T')[0]) {
                if (!confirm("Are you sure you want to start 'Today'? The counter will be 0.")) return;
            }
            localStorage.setItem('rc_repeat_yearly', repeat);
            onSelect(date);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'white',
            zIndex: 9000,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            color: '#333'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none',
                        fontSize: '1.5rem', cursor: 'pointer', color: '#555'
                    }}
                >
                    &lt;
                </button>
                <h2 style={{
                    fontSize: '1.2rem',
                    color: '#555',
                    fontWeight: 'normal',
                    margin: 0
                }}>Select the date to celebrate</h2>
            </div>

            <div style={{ padding: '0 20px 120px 20px' }}>
                {/* Date Input Section */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Select Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                            width: '90%',
                            padding: '15px',
                            fontSize: '1.2rem',
                            border: '1px solid #ddd',
                            borderRadius: '10px',
                            background: '#fcfcfc',
                            color: '#333'
                        }}
                    />
                </div>

                {/* Repeat Section */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '15px' }}>Repeat Settings</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="repeat"
                                checked={!repeat}
                                onChange={() => setRepeat(false)}
                                style={{ transform: 'scale(1.5)' }}
                            />
                            No Repeat
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="repeat"
                                checked={repeat}
                                onChange={() => setRepeat(true)}
                                style={{ transform: 'scale(1.5)' }}
                            />
                            Repeat
                        </label>
                    </div>
                </div>

                {/* Notification Guide Box */}
                <div style={{
                    background: '#E3F2FD', // Light blue tint
                    padding: '20px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: '#455A64',
                    lineHeight: '1.6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#1976D2', fontWeight: 'bold' }}>
                        <span>ℹ️</span> Notification Guide
                    </div>
                    <p style={{ marginBottom: '10px' }}>
                        We'll show you the days elapsed from your selected anniversary.
                    </p>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '5px' }}>We'll notify you at 100-day intervals: 100, 200, 300 days...</li>
                        <li style={{ marginBottom: '5px' }}>We'll remind you of yearly anniversaries: 1st, 2nd, 3rd year...</li>
                        <li>Important dates get advance notice at 30, 10, 7, and 1 day before.</li>
                    </ul>
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
                        background: '#5C6BC0', // Indigo/Blue
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

export default DateSelection;
