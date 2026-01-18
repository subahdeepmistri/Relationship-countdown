import React from 'react';

/**
 * ConfirmModal - Reusable confirmation dialog with premium dark theme
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} title - Modal title
 * @param {string} message - Modal body message
 * @param {string} icon - Emoji icon to display (default: 🗑️)
 * @param {string} confirmText - Text for confirm button (default: "Delete")
 * @param {string} cancelText - Text for cancel button (default: "Keep It")
 * @param {string} variant - Color variant: 'danger' (red), 'warning' (amber), 'info' (blue)
 * @param {function} onConfirm - Called when confirm button is clicked
 * @param {function} onCancel - Called when modal is dismissed
 */
const ConfirmModal = ({
    isOpen,
    title,
    message,
    icon = '🗑️',
    confirmText = 'Delete',
    cancelText = 'Keep It',
    variant = 'danger',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    // Variant-based color schemes
    const variants = {
        danger: {
            iconBg: 'rgba(239, 68, 68, 0.15)',
            iconBorder: 'rgba(239, 68, 68, 0.3)',
            buttonBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            buttonShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
        },
        warning: {
            iconBg: 'rgba(251, 191, 36, 0.15)',
            iconBorder: 'rgba(251, 191, 36, 0.3)',
            buttonBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            buttonShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        },
        info: {
            iconBg: 'rgba(56, 189, 248, 0.15)',
            iconBorder: 'rgba(56, 189, 248, 0.3)',
            buttonBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            buttonShadow: '0 4px 15px rgba(56, 189, 248, 0.4)'
        }
    };

    const colors = variants[variant] || variants.danger;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    padding: '32px 28px',
                    maxWidth: '340px',
                    width: '90%',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div
                    style={{
                        width: '72px',
                        height: '72px',
                        margin: '0 auto 20px',
                        background: colors.iconBg,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${colors.iconBorder}`
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>{icon}</span>
                </div>

                {/* Title */}
                <h3
                    style={{
                        color: 'white',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        margin: '0 0 12px 0',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    {title}
                </h3>

                {/* Message */}
                <p
                    style={{
                        color: '#94a3b8',
                        fontSize: '0.95rem',
                        margin: '0 0 28px 0',
                        lineHeight: '1.5'
                    }}
                >
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '16px',
                            border: 'none',
                            background: colors.buttonBg,
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: colors.buttonShadow,
                            transition: 'all 0.2s'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
