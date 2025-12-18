import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    if (!needRefresh) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--card-bg)',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 10000,
            border: '1px solid var(--accent-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎁</span>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Update Available!</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        A new version of the app is ready.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                <button
                    onClick={() => updateServiceWorker(true)}
                    style={{
                        flex: 1,
                        padding: '8px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Update Now
                </button>
                <button
                    onClick={close}
                    style={{
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Dismiss
                </button>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UpdatePrompt;
