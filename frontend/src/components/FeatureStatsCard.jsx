import React, { useState, useEffect } from 'react';
import { useCapsules, useGoals, useVoiceDiary, useJourney } from '../hooks/useDataHooks';
import { storage } from '../utils/storageAdapter';
import { getPhotos } from '../utils/db';

/**
 * FeatureStatsCard - Premium Dashboard stats overview
 * Displays activity counts for all features in the system
 */
const FeatureStatsCard = ({ onNavigate }) => {
    // Use custom hooks for data
    const { counts: capsuleCounts } = useCapsules();
    const { counts: goalCounts } = useGoals();
    const { count: voiceCount } = useVoiceDiary();
    const { count: journeyCount } = useJourney();

    // Local state for data not covered by hooks
    const [photoCount, setPhotoCount] = useState(0);
    const [dailyStreak, setDailyStreak] = useState(0);
    const [legacyCount, setLegacyCount] = useState(0);
    const [storageInfo, setStorageInfo] = useState({ percentUsed: 0 });

    useEffect(() => {
        // Load photo count from IndexedDB
        getPhotos().then(photos => {
            setPhotoCount(photos?.length || 0);
        }).catch(() => setPhotoCount(0));

        // Load legacy messages count
        const legacy = storage.get(storage.KEYS.LEGACY_MESSAGES, []);
        setLegacyCount(Array.isArray(legacy) ? legacy.length : 0);

        // Calculate daily answer streak
        const answers = storage.get(storage.KEYS.DAILY_ANSWERS, {});
        const streak = calculateStreak(answers);
        setDailyStreak(streak);

        // Get storage info
        setStorageInfo(storage.getStorageInfo());
    }, []);

    // Calculate consecutive days streak
    const calculateStreak = (answers) => {
        if (!answers || typeof answers !== 'object') return 0;

        const dates = Object.keys(answers).sort((a, b) => new Date(b) - new Date(a));
        if (dates.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < dates.length; i++) {
            const answerDate = new Date(dates[i]);
            answerDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (answerDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    // Stats configuration
    const stats = [
        {
            id: 'capsules',
            icon: '💝',
            label: 'Capsules',
            value: capsuleCounts.total,
            subtitle: capsuleCounts.locked > 0 ? `${capsuleCounts.locked} locked` : null,
            color: '#E11D48',
            gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)'
        },
        {
            id: 'goals',
            icon: '🚀',
            label: 'Dreams',
            value: goalCounts.total,
            subtitle: goalCounts.achieved > 0 ? `${goalCounts.achieved} achieved` : null,
            color: '#0EA5E9',
            gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)'
        },
        {
            id: 'voice',
            icon: '🎙️',
            label: 'Diary',
            value: voiceCount,
            subtitle: voiceCount > 0 ? 'voice entries' : null,
            color: '#10B981',
            gradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
        },
        {
            id: 'journey',
            icon: '🗺️',
            label: 'Journey',
            value: journeyCount,
            subtitle: journeyCount > 0 ? 'milestones' : null,
            color: '#8B5CF6',
            gradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
        },
        {
            id: 'scrapbook',
            icon: '📸',
            label: 'Memories',
            value: photoCount,
            subtitle: photoCount > 0 ? 'photos' : null,
            color: '#F59E0B',
            gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
        },
        {
            id: 'daily',
            icon: '✨',
            label: 'Streak',
            value: dailyStreak,
            subtitle: dailyStreak > 0 ? `day${dailyStreak !== 1 ? 's' : ''} streak` : 'Start today!',
            color: '#6366F1',
            gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
        }
    ];

    // Don't show if no data at all
    const hasAnyData = stats.some(s => s.value > 0);

    return (
        <div className="pop-card" style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header gradient accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #E11D48, #F59E0B, #10B981, #6366F1)',
                opacity: 0.8
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>📊</span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--text-secondary)'
                    }}>
                        Your Story Stats
                    </span>
                </div>

                {/* Storage indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: '12px',
                    fontSize: '0.65rem',
                    color: 'var(--text-secondary)'
                }}>
                    <span>💾</span>
                    <div style={{
                        width: '40px',
                        height: '4px',
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(storageInfo.percentUsed, 100)}%`,
                            height: '100%',
                            background: storageInfo.percentUsed > 80
                                ? '#EF4444'
                                : storageInfo.percentUsed > 50
                                    ? '#F59E0B'
                                    : '#10B981',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <span>{storageInfo.percentUsed}%</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
            }}>
                {stats.map((stat) => (
                    <StatTile
                        key={stat.id}
                        stat={stat}
                        onClick={() => onNavigate && onNavigate(stat.id)}
                        hasData={hasAnyData}
                    />
                ))}
            </div>

            {/* Legacy Messages indicator - if any exist */}
            {legacyCount > 0 && (
                <div
                    onClick={() => onNavigate && onNavigate('legacy')}
                    style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(168, 85, 247, 0.08))',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>📜</span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#8B5CF6'
                        }}>
                            {legacyCount} Legacy Message{legacyCount !== 1 ? 's' : ''} Sealed
                        </span>
                    </div>
                    <span style={{ color: '#8B5CF6', fontSize: '0.9rem' }}>→</span>
                </div>
            )}

            {/* Empty state prompt */}
            {!hasAnyData && (
                <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '12px'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        fontStyle: 'italic'
                    }}>
                        Start creating memories to see your story grow 💫
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Individual stat tile component
 */
const StatTile = ({ stat, onClick, hasData }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            style={{
                padding: '14px 10px',
                background: stat.gradient,
                borderRadius: '16px',
                border: `1px solid ${stat.color}15`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isPressed ? 'scale(0.96)' : 'scale(1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${stat.color}10 0%, transparent 60%)`,
                pointerEvents: 'none'
            }} />

            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
                {stat.icon}
            </div>

            <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: stat.color,
                lineHeight: 1,
                marginBottom: '4px'
            }}>
                {stat.value}
            </div>

            <div style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: stat.color,
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {stat.label}
            </div>

            {stat.subtitle && stat.value > 0 && (
                <div style={{
                    fontSize: '0.6rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    opacity: 0.7
                }}>
                    {stat.subtitle}
                </div>
            )}
        </div>
    );
};

export default FeatureStatsCard;
