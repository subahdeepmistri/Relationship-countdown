import React, { useEffect, useState } from 'react';
import { useWasm } from '../hooks/useWasm';

const MessageCard = () => {
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const startDate = localStorage.getItem('rc_start_date');
        if (startDate) {
            const start = new Date(startDate);
            const now = new Date();
            const diffTime = Math.abs(now - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            setMessage(`Today you completed ${diffDays} days together ❤️`);
            setTimeout(() => setVisible(true), 500);
        } else {
            setMessage("Start your journey to see magic here ✨");
            setTimeout(() => setVisible(true), 500);
        }
    }, []);

    return (
        <div className="pop-card" style={{
            marginTop: '0rem', // Adjusted for bento grid
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease, transform 1s ease',
            textAlign: 'center',
            background: '#F0F9FF', // Distinct light blue
            border: '1px solid #BAE6FD'
        }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0284C7', marginBottom: '15px', fontWeight: '700' }}>
                Daily Update
            </h3>
            <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.5',
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                color: '#0C4A6E',
                margin: 0
            }}>
                {message}
            </p>
        </div>
    );
};

export default MessageCard;
