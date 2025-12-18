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
            marginTop: '0rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease, transform 1s ease',
            textAlign: 'center',
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0284C7', marginBottom: '15px', fontWeight: '700' }}>
                {settings.aiEnabled ? '✨ AI Daily Vibe' : 'Daily Update'}
            </h3>

            {loading ? (
                <div style={{ animation: 'pulse 1.5s infinite', color: '#38BDF8', fontSize: '0.9rem' }}>
                    Generating magic... ✨
                </div>
            ) : (
                <p style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.5',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '600',
                    color: message.startsWith('⚠️') ? '#EF4444' : '#0C4A6E',
                    margin: 0,
                    padding: '0 10px'
                }}>
                    {message}
                </p>
            )}

            <style>{`
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            `}</style>
        </div>
    );
};

export default MessageCard;
