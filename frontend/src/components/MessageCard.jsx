import React, { useEffect, useState } from 'react';
import { getRelationshipStats, getDailySeed } from '../utils/relationshipLogic';
import { useRelationship } from '../context/RelationshipContext';

const MessageCard = () => {
    const { settings } = useRelationship();
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMessage = async () => {
            const stats = getRelationshipStats();
            if (!stats) {
                setMessage("Start your journey to see magic here ✨");
                setVisible(true);
                return;
            }

            const today = new Date().toLocaleDateString();
            const cachedMsg = localStorage.getItem('rc_daily_ai_msg');
            const cachedDate = localStorage.getItem('rc_daily_ai_date');

            // 1. Check Cache
            if (cachedMsg && cachedDate === today) {
                setMessage(cachedMsg);
                setVisible(true);
                return;
            }

            // 2. Check AI Settings
            if (settings.aiEnabled && settings.aiKey) {
                setLoading(true);
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${settings.aiKey.trim()}`
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a romantic AI. Write a VERY short, one-sentence love message/horoscope for a couple who has been together for specific days. Be sweet, not cheesy. Maximum 15 words."
                                },
                                {
                                    role: "user",
                                    content: `We have been together for ${stats.days} days. Give us a daily insight.`
                                }
                            ],
                            max_tokens: 50,
                            temperature: 0.7
                        })
                    });

                    if (response.status === 401) throw new Error('Invalid API Key. Please check settings.');
                    if (response.status === 429) throw new Error('Quota Exceeded/Rate Limit. Check OpenAI billing.');
                    if (!response.ok) throw new Error('AI Connection Failed. Try again later.');

                    const data = await response.json();
                    const aiText = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "Love is mysterious...";

                    // Cache and Set
                    localStorage.setItem('rc_daily_ai_msg', aiText);
                    localStorage.setItem('rc_daily_ai_date', today);
                    setMessage(aiText);

                } catch (error) {
                    console.error("AI Generation Failed:", error);
                    // If AI was explicitly enabled, show the error so the user knows
                    setMessage(`⚠️ ${error.message}`);
                } finally {
                    setLoading(false);
                    setVisible(true);
                }
            } else {
                // 3. Static Fallback
                setStaticMessage(stats.days);
                setVisible(true);
            }
        };

        fetchMessage();
    }, [settings.aiEnabled, settings.aiKey]); // Retry when settings change

    const setStaticMessage = (days) => {
        const templates = [
            `Today you completed ${days} days together ❤️`,
            `Day ${days}: Still choosing each other.`,
            `Another day stronger together (Day ${days})`,
            `${days} days of love and counting ✨`,
            `Calculating... Yup, ${days} days of happiness.`
        ];
        const seed = getDailySeed();
        setMessage(templates[seed % templates.length]);
    };

    return (
        <div className="pop-card" style={{
            marginTop: '20px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textAlign: 'center',
            background: '#F0F9FF',
            border: '2px dashed #BAE6FD',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            cursor: message.startsWith('⚠️') ? 'default' : 'pointer',
            position: 'relative'
        }}>
            {/* Lock Icon Overlay for "Private" feel */}
            {settings.aiEnabled && !loading && !message.startsWith('⚠️') && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.5 }}>
                    🔒
                </div>
            )}

            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#0284C7', marginBottom: '15px', fontWeight: '700' }}>
                {settings.aiEnabled ? '✨ AI Daily Insight' : 'Daily Love Note'}
            </h3>

            {loading ? (
                <div style={{ animation: 'pulse 1.5s infinite', color: '#38BDF8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Writing something sweet... ✍️
                </div>
            ) : (
                <div style={{ position: 'relative', width: '100%' }}>
                    <p style={{
                        fontSize: '1.4rem',
                        lineHeight: '1.5',
                        fontFamily: 'var(--font-serif)',
                        color: message.startsWith('⚠️') ? '#EF4444' : '#0C4A6E',
                        margin: 0,
                        padding: '0 10px',
                        transform: message ? 'rotate(-1deg)' : 'none'
                    }}>
                        {message || "Someday, this will be full of us."}
                    </p>
                    {message && !message.startsWith('⚠️') && (
                        <div
                            style={{
                                marginTop: '15px',
                                padding: '12px', // Increased touch area
                                fontSize: '0.75rem',
                                color: '#0EA5E9',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'inline-block' // Ensure padding works
                            }}
                            title="Toggle Privacy"
                        >
                            Tap to Keep Private
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            `}</style>
        </div>
    );
};

export default MessageCard;
