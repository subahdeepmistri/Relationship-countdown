import React from 'react';

const ConsentScreen = ({ onAgree }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'var(--bg-gradient)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            color: 'var(--text-primary)',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', opacity: 0.8 }}>Service Operation Guide</h3>
            </div>

            {/* Hero Icon */}
            <div style={{
                width: '120px', height: '120px',
                borderRadius: '50%',
                background: '#FFEBEE', // Light pinkish red
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem',
                marginBottom: '30px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}>
                📢
            </div>

            {/* Content Box */}
            <div style={{
                background: '#E3F2FD', // Light blue like screenshot
                borderRadius: '20px',
                padding: '25px',
                width: '100%',
                maxWidth: '400px',
                flexGrow: 1, // fill space but allow scroll
                marginBottom: '100px', // Space for button
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#37474F'
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem' }}>Hello!</p>

                <p style={{ marginBottom: '15px' }}>
                    The <strong>"Us" App</strong> strives to provide you with the best private experience for your relationship.
                </p>

                <p style={{ marginBottom: '15px' }}>
                    To ensure your privacy and security, we operate on a strictly <strong>local-first</strong> basis. All your memories, photos, and messages are stored directly on this device.
                </p>

                <p style={{ marginBottom: '15px' }}>
                    <strong>Data Collection & Privacy:</strong><br />
                    We do not upload your personal photos or voice diaries to any cloud servers.
                    Collected information (e.g., anniversary dates) is strictly managed locally and is never used for purposes other than counting down your special moments.
                </p>

                <p style={{ marginBottom: '15px' }}>
                    By agreeing, you confirm that you understand your data is yours alone.
                    For more details, please refer to our internal [Privacy Promise].
                </p>
            </div>

            {/* Footer / Action */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, width: '100%',
                padding: '20px',
                background: 'white',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                boxShadow: '0 -5px 20px rgba(0,0,0,0.1)'
            }}>
                <p style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '15px', opacity: 0.6 }}>
                    Please press [Agree] to start your countdown.
                </p>
                <button
                    onClick={onAgree}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: '#5C6BC0', // Indigo/Blue like screenshot
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Agree
                </button>
            </div>
        </div>
    );
};

export default ConsentScreen;
