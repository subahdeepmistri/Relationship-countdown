import React, { useEffect, useState } from 'react';
import { useWasm } from '../hooks/useWasm';

const MessageCard = () => {
    const { isLoaded, getDailyLoveMessage } = useWasm();
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            Promise.resolve(getDailyLoveMessage()).then(msg => {
                setMessage(msg);
                setTimeout(() => setVisible(true), 500);
            });
        }
    }, [isLoaded, getDailyLoveMessage]);

    return (
        <div className="glass-card" style={{
            marginTop: '2rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease, transform 1s ease',
            textAlign: 'center'
        }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-color)', marginBottom: '15px' }}>Daily Reflection</h3>
            <p style={{
                fontSize: '1.2rem',
                lineHeight: '1.6',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                margin: 0
            }}>
                "{message}"
            </p>
        </div>
    );
};

export default MessageCard;
