import React, { useEffect, useState } from 'react';
import { getRelationshipStats, getStartDate, getDailySeed } from '../utils/relationshipLogic';

const MessageCard = () => {
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const stats = getRelationshipStats();
        if (stats) {
            // Dynamic Copy Rotation 🔄
            const templates = [
                `Today you completed ${stats.days} days together ❤️`,
                `Day ${stats.days}: Still choosing each other.`,
                `Another day stronger together (Day ${stats.days})`,
                `${stats.days} days of love and counting ✨`,
                `Calculating... Yup, ${stats.days} days of happiness.`
            ];

            // Deterministic rotation based on date seed
            const seed = getDailySeed();
            const msg = templates[seed % templates.length];

            setMessage(msg);
            setTimeout(() => setVisible(true), 500);
        } else {
            setMessage("Start your journey to see magic here ✨");
            setTimeout(() => setVisible(true), 500);
        }
    }, []);

    return (
        <div className="pop-card" style={{
            marginTop: '0rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease, transform 1s ease',
            textAlign: 'center',
            background: '#F0F9FF',
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
