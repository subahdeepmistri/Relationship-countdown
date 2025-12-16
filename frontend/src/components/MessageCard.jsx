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
        <div style={{
            marginTop: '2rem',
            padding: '20px',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease, transform 1s ease'
        }}>
            <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                fontFamily: 'serif',
                fontStyle: 'italic'
            }}>
                "{message}"
            </p>
        </div>
    );
};

export default MessageCard;
