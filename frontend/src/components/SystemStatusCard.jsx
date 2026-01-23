import React, { useState, useEffect } from 'react';
import { useRelationship } from '../context/RelationshipContext';
import { storage } from '../utils/storageAdapter';

/**
 * SystemStatusCard - Premium status indicator for active features
 * Displays active settings configurations at a glance on the Dashboard
 */
const SystemStatusCard = ({ onOpenSettings }) => {
    const { settings, relationship } = useRelationship();

    const eventsCount = (relationship.events || []).length;
    const hasAI = settings.aiEnabled && settings.aiKey;
    const hasNotifications = settings.notifications;
    const hasLongDistance = settings.longDistance?.enabled;
    const hasNames = !!(relationship.partner1 || relationship.partner2);

    // Live clock for Long Distance
    const [currentTime, setCurrentTime] = useState(new Date());
    const [partnerTime, setPartnerTime] = useState('--:--');
    const [meetingCountdown, setMeetingCountdown] = useState(null);
    const [lastSync, setLastSync] = useState(null);

    // Load last sync time
    useEffect(() => {
        const syncTime = storage.get(storage.KEYS.LAST_SYNC, null);
        setLastSync(syncTime);
    }, []);

    useEffect(() => {
        if (!hasLongDistance) return;

        const tick = () => {
            const now = new Date();
            setCurrentTime(now);

            // Calculate partner time
            const offsetVal = parseFloat(settings.longDistance.offset);
            if (!isNaN(offsetVal)) {
                const date = new Date(now);
                date.setHours(date.getHours() + offsetVal);
                setPartnerTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }

            // Calculate meeting countdown
            if (settings.longDistance.meet) {
                const meetDate = new Date(settings.longDistance.meet);
                const diff = meetDate - now;
                if (diff > 0) {
                    setMeetingCountdown(Math.ceil(diff / (1000 * 60 * 60 * 24)));
                } else {
                    setMeetingCountdown(0);
                }
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [hasLongDistance, settings.longDistance]);

    // Calculate active features count
    const activeFeatures = [hasAI, hasNotifications, hasLongDistance, eventsCount > 0, hasNames].filter(Boolean).length;

    // If nothing is configured, don't show the card
    if (activeFeatures === 0) return null;

    // Mask API key for display
    const getMaskedKey = () => {
        if (!settings.aiKey) return null;
        const key = settings.aiKey;
        if (key.length <= 8) return '••••••••';
        return `${key.slice(0, 4)}${'•'.repeat(8)}${key.slice(-4)}`;
    };

    return (
        <div className="pop-card" style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle gradient accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--accent-lux-gradient)',
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
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981, #34D399)',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                        animation: 'pulse 2s infinite'
                    }} />
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#10B981'
                    }}>
                        System Active
                    </span>
                </div>

                <button
                    onClick={onOpenSettings}
                    style={{
                        background: 'rgba(0, 0, 0, 0.03)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Configure
                </button>
            </div>

            {/* Status Badges */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: hasLongDistance || hasAI || hasNames ? '16px' : '0'
            }}>
                {hasNotifications && (
                    <StatusBadge
                        icon="🔔"
                        label="Reminders"
                        color="#10B981"
                        bgColor="rgba(16, 185, 129, 0.1)"
                    />
                )}

                {hasAI && (
                    <StatusBadge
                        icon="🤖"
                        label="AI Active"
                        color="#8B5CF6"
                        bgColor="rgba(139, 92, 246, 0.1)"
                    />
                )}

                {hasLongDistance && (
                    <StatusBadge
                        icon="🌍"
                        label="Long Distance"
                        color="#38BDF8"
                        bgColor="rgba(56, 189, 248, 0.1)"
                    />
                )}

                {eventsCount > 0 && (
                    <StatusBadge
                        icon="📅"
                        label={`${eventsCount} Event${eventsCount > 1 ? 's' : ''}`}
                        color="#F472B6"
                        bgColor="rgba(244, 114, 182, 0.1)"
                    />
                )}

                {lastSync && (
                    <StatusBadge
                        icon="🔄"
                        label={formatSyncTime(lastSync)}
                        color="#3B82F6"
                        bgColor="rgba(59, 130, 246, 0.1)"
                    />
                )}
            </div>

            {/* Partner Names Display */}
            {hasNames && (
                <div style={{
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.08), rgba(249, 115, 22, 0.08))',
                    borderRadius: '12px',
                    border: '1px solid rgba(251, 113, 133, 0.15)',
                    marginBottom: hasLongDistance || hasAI ? '12px' : '0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {relationship.partner1 || '—'}
                        </span>
                        <span style={{ fontSize: '1.1rem' }}>💕</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {relationship.partner2 || '—'}
                        </span>
                    </div>
                    {relationship.nickname && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '6px',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic'
                        }}>
                            "{relationship.nickname}"
                        </div>
                    )}
                </div>
            )}

            {/* Long Distance Details */}
            {hasLongDistance && (
                <div style={{
                    padding: '14px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(34, 211, 238, 0.08))',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    marginBottom: hasAI ? '12px' : '0'
                }}>
                    {/* Locations & Times */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: meetingCountdown !== null ? '12px' : '0'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                {settings.longDistance.myLoc || 'Me'}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '0 12px'
                        }}>
                            <span style={{ fontSize: '1rem' }}>✈️</span>
                            {settings.longDistance.offset && (
                                <span style={{
                                    fontSize: '0.65rem',
                                    color: '#38BDF8',
                                    fontWeight: '600',
                                    marginTop: '2px'
                                }}>
                                    {parseFloat(settings.longDistance.offset) >= 0 ? '+' : ''}{settings.longDistance.offset}h
                                </span>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                {settings.longDistance.partnerLoc || 'Them'}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38BDF8' }}>
                                {partnerTime}
                            </div>
                        </div>
                    </div>

                    {/* Meeting Countdown */}
                    {meetingCountdown !== null && (
                        <div style={{
                            textAlign: 'center',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: meetingCountdown === 0 ? '#10B981' : '#38BDF8'
                        }}>
                            {meetingCountdown === 0 ? (
                                <span>💖 Together at last!</span>
                            ) : (
                                <span>🎯 <strong>{meetingCountdown}</strong> days until reunion</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* AI Configuration Status */}
            {hasAI && (
                <div style={{
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(168, 85, 247, 0.08))',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.15)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '0.9rem' }}>🔑</span>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'monospace'
                            }}>
                                {getMaskedKey()}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#10B981'
                            }} />
                            <span style={{
                                fontSize: '0.65rem',
                                color: '#10B981',
                                fontWeight: '600'
                            }}>
                                Connected
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Preview (if events exist and no other sections shown) */}
            {eventsCount > 0 && !hasLongDistance && !hasAI && !hasNames && (
                <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--text-secondary)',
                        marginBottom: '10px',
                        opacity: 0.7
                    }}>
                        Your Story Timeline
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {(relationship.events || []).slice(0, 3).map((event, idx) => (
                            <div key={event.id || idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 12px',
                                background: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: '10px',
                                border: '1px solid rgba(0, 0, 0, 0.03)'
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>{event.emoji || '💖'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {event.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-secondary)',
                                        opacity: 0.7
                                    }}>
                                        {new Date(event.date).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {eventsCount > 3 && (
                            <button
                                onClick={onOpenSettings}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent-lux)',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    textAlign: 'left'
                                }}
                            >
                                + {eventsCount - 3} more events →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Individual status badge component
 */
const StatusBadge = ({ icon, label, color, bgColor }) => (
    <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: bgColor,
        borderRadius: '20px',
        border: `1px solid ${color}20`,
        transition: 'all 0.2s'
    }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
        <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: color
        }}>
            {label}
        </span>
    </div>
);

export default SystemStatusCard;
