import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Toast - Reusable toast notification with premium styling
 * 
 * @param {boolean} isVisible - Whether the toast is visible
 * @param {string} message - Message to display
 * @param {string} variant - Style variant: 'success', 'error', 'info' (default: 'success')
 * @param {string} position - Position: 'top', 'bottom' (default: 'bottom')
 */
const Toast = ({
    isVisible,
    message,
    variant = 'success',
    position = 'bottom'
}) => {
    const variants = {
        success: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#064e3b',
            icon: '💖'
        },
        error: {
            background: 'rgba(254, 226, 226, 0.95)',
            color: '#991b1b',
            icon: '⚠️'
        },
        info: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1e293b',
            icon: '✨'
        }
    };

    const colors = variants[variant] || variants.success;
    const positionStyles = position === 'top'
        ? { top: '100px' }
        : { bottom: '100px' };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: position === 'top' ? -50 : 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.95 }}
                    style={{
                        position: 'fixed',
                        ...positionStyles,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: colors.background,
                        color: colors.color,
                        padding: '12px 24px',
                        borderRadius: '50px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)',
                        zIndex: 5000,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(10px)',
                        pointerEvents: 'none'
                    }}
                >
                    <span>{colors.icon}</span>
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
