/**
 * Custom Hooks for Data Management
 * ==================================
 * Centralized data access pattern for all feature data.
 * Components should NEVER directly access localStorage.
 * 
 * Benefits:
 * - Consistent error handling
 * - Automatic state synchronization
 * - Easy to test
 * - Ready for cloud sync
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storageAdapter';

// ============================================
// useCapsules - Time Capsule Management
// ============================================
export const useCapsules = () => {
    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load capsules on mount
    useEffect(() => {
        try {
            const saved = storage.get(storage.KEYS.CAPSULES, []);
            setCapsules(Array.isArray(saved) ? saved : []);
            setLoading(false);
        } catch (err) {
            console.error('useCapsules: Load failed', err);
            setError('Failed to load capsules');
            setCapsules([]);
            setLoading(false);
        }
    }, []);

    // Add a new capsule
    const addCapsule = useCallback((content, unlockDate) => {
        try {
            const newCapsule = {
                id: Date.now(),
                content: content.trim(),
                unlockDate: new Date(unlockDate).getTime(),
                createdAt: Date.now()
            };

            setCapsules(prev => {
                const updated = [...prev, newCapsule];
                const result = storage.set(storage.KEYS.CAPSULES, updated);

                if (!result.success) {
                    setError(result.error === storage.StorageError.QUOTA_EXCEEDED
                        ? 'Storage full! Delete some capsules first.'
                        : 'Failed to save capsule.');
                    return prev; // Rollback
                }

                return updated;
            });

            return { success: true, capsule: newCapsule };
        } catch (err) {
            console.error('useCapsules: Add failed', err);
            setError('Failed to create capsule');
            return { success: false };
        }
    }, []);

    // Delete a capsule
    const deleteCapsule = useCallback((id) => {
        try {
            setCapsules(prev => {
                const updated = prev.filter(c => c.id !== id);
                storage.set(storage.KEYS.CAPSULES, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useCapsules: Delete failed', err);
            setError('Failed to delete capsule');
            return { success: false };
        }
    }, []);

    // Check if a capsule is unlocked
    const isUnlocked = useCallback((unlockDate) => {
        return Date.now() >= unlockDate;
    }, []);

    // Get counts
    const counts = {
        total: capsules.length,
        locked: capsules.filter(c => !isUnlocked(c.unlockDate)).length,
        unlocked: capsules.filter(c => isUnlocked(c.unlockDate)).length
    };

    // Clear error
    const clearError = useCallback(() => setError(null), []);

    return {
        capsules,
        loading,
        error,
        clearError,
        addCapsule,
        deleteCapsule,
        isUnlocked,
        counts
    };
};

// ============================================
// useGoals - Future Goals Management
// ============================================
export const useGoals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load goals on mount (sorted by date)
    useEffect(() => {
        try {
            const saved = storage.get(storage.KEYS.GOALS, []);
            const sorted = Array.isArray(saved)
                ? saved.sort((a, b) => new Date(a.date) - new Date(b.date))
                : [];
            setGoals(sorted);
            setLoading(false);
        } catch (err) {
            console.error('useGoals: Load failed', err);
            setError('Failed to load goals');
            setGoals([]);
            setLoading(false);
        }
    }, []);

    // Add a new goal
    const addGoal = useCallback((title, date) => {
        try {
            const newGoal = {
                id: Date.now(),
                title: title.trim(),
                date: date || null,
                status: 'planned', // planned | achieved
                createdAt: Date.now()
            };

            setGoals(prev => {
                const updated = [...prev, newGoal].sort((a, b) =>
                    new Date(a.date || 0) - new Date(b.date || 0)
                );

                const result = storage.set(storage.KEYS.GOALS, updated);
                if (!result.success) {
                    setError('Failed to save goal');
                    return prev;
                }

                return updated;
            });

            return { success: true, goal: newGoal };
        } catch (err) {
            console.error('useGoals: Add failed', err);
            setError('Failed to create goal');
            return { success: false };
        }
    }, []);

    // Toggle goal status
    const toggleStatus = useCallback((id) => {
        try {
            setGoals(prev => {
                const updated = prev.map(g =>
                    g.id === id
                        ? { ...g, status: g.status === 'planned' ? 'achieved' : 'planned' }
                        : g
                );
                storage.set(storage.KEYS.GOALS, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useGoals: Toggle failed', err);
            return { success: false };
        }
    }, []);

    // Delete a goal
    const deleteGoal = useCallback((id) => {
        try {
            setGoals(prev => {
                const updated = prev.filter(g => g.id !== id);
                storage.set(storage.KEYS.GOALS, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useGoals: Delete failed', err);
            setError('Failed to delete goal');
            return { success: false };
        }
    }, []);

    // Get counts
    const counts = {
        total: goals.length,
        planned: goals.filter(g => g.status === 'planned').length,
        achieved: goals.filter(g => g.status === 'achieved').length
    };

    const clearError = useCallback(() => setError(null), []);

    return {
        goals,
        loading,
        error,
        clearError,
        addGoal,
        toggleStatus,
        deleteGoal,
        counts
    };
};

// ============================================
// useLegacyMessages - Legacy Capsule Messages
// ============================================
export const useLegacyMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load messages on mount
    useEffect(() => {
        try {
            const saved = storage.get(storage.KEYS.LEGACY_MESSAGES, []);
            setMessages(Array.isArray(saved) ? saved : []);
            setLoading(false);
        } catch (err) {
            console.error('useLegacyMessages: Load failed', err);
            setError('Failed to load messages');
            setMessages([]);
            setLoading(false);
        }
    }, []);

    // Seal a new message
    const sealMessage = useCallback((text, years) => {
        try {
            const unlockDate = new Date();
            unlockDate.setFullYear(unlockDate.getFullYear() + years);

            const newMessage = {
                id: Date.now(),
                text: text.trim(),
                unlockDate: unlockDate.getTime(),
                createdAt: Date.now()
            };

            setMessages(prev => {
                const updated = [...prev, newMessage];
                const result = storage.set(storage.KEYS.LEGACY_MESSAGES, updated);

                if (!result.success) {
                    setError(result.error === storage.StorageError.QUOTA_EXCEEDED
                        ? 'Storage full! Delete some messages first.'
                        : 'Failed to save message.');
                    return prev;
                }

                return updated;
            });

            return { success: true, message: newMessage };
        } catch (err) {
            console.error('useLegacyMessages: Seal failed', err);
            setError('Failed to seal message');
            return { success: false };
        }
    }, []);

    // Delete a message
    const deleteMessage = useCallback((id) => {
        try {
            setMessages(prev => {
                const updated = prev.filter(m => m.id !== id);
                storage.set(storage.KEYS.LEGACY_MESSAGES, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useLegacyMessages: Delete failed', err);
            setError('Failed to delete message');
            return { success: false };
        }
    }, []);

    // Clear all messages (hard reset)
    const clearAll = useCallback(() => {
        try {
            setMessages([]);
            storage.set(storage.KEYS.LEGACY_MESSAGES, []);
            return { success: true };
        } catch (err) {
            console.error('useLegacyMessages: Clear failed', err);
            setError('Failed to clear messages');
            return { success: false };
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        messages,
        loading,
        error,
        clearError,
        sealMessage,
        deleteMessage,
        clearAll,
        count: messages.length
    };
};

// ============================================
// useAppStats - Aggregate Stats for Recap
// ============================================
export const useAppStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();

            // Get start date
            const startDateStr = storage.get(storage.KEYS.START_DATE, null);
            const startDate = startDateStr ? new Date(startDateStr) : today;

            // Calculate days
            const diff = today - startDate;
            const totalDays = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

            // Get capsules count
            const capsules = storage.get(storage.KEYS.CAPSULES, []);

            // Get goals stats
            const goals = storage.get(storage.KEYS.GOALS, []);
            const achievedGoals = Array.isArray(goals)
                ? goals.filter(g => g.status === 'achieved').length
                : 0;

            // Get legacy messages count
            const legacyMessages = storage.get(storage.KEYS.LEGACY_MESSAGES, []);

            setStats({
                year: currentYear,
                totalDays,
                startDate: startDateStr,
                capsules: {
                    total: Array.isArray(capsules) ? capsules.length : 0
                },
                goals: {
                    total: Array.isArray(goals) ? goals.length : 0,
                    achieved: achievedGoals
                },
                legacyMessages: {
                    total: Array.isArray(legacyMessages) ? legacyMessages.length : 0
                }
            });

            setLoading(false);
        } catch (err) {
            console.error('useAppStats: Load failed', err);
            setLoading(false);
        }
    }, []);

    return { stats, loading };
};

// ============================================
// useJourney - Journey Milestones Management
// ============================================
export const useJourney = () => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load milestones on mount (sorted by date)
    useEffect(() => {
        try {
            const saved = storage.get(storage.KEYS.JOURNEY, []);
            const sorted = Array.isArray(saved)
                ? saved.sort((a, b) => new Date(a.date) - new Date(b.date))
                : [];
            setMilestones(sorted);
            setLoading(false);
        } catch (err) {
            console.error('useJourney: Load failed', err);
            setError('Failed to load milestones');
            setMilestones([]);
            setLoading(false);
        }
    }, []);

    // Add a new milestone
    const addMilestone = useCallback((title, date, desc = '') => {
        try {
            const newMilestone = {
                id: Date.now(),
                title: title.trim(),
                date,
                desc: desc.trim(),
                createdAt: Date.now()
            };

            setMilestones(prev => {
                const updated = [...prev, newMilestone].sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                );

                const result = storage.set(storage.KEYS.JOURNEY, updated);
                if (!result.success) {
                    setError(result.error === storage.StorageError.QUOTA_EXCEEDED
                        ? 'Storage full! Delete some milestones first.'
                        : 'Failed to save milestone.');
                    return prev;
                }

                return updated;
            });

            return { success: true, milestone: newMilestone };
        } catch (err) {
            console.error('useJourney: Add failed', err);
            setError('Failed to create milestone');
            return { success: false };
        }
    }, []);

    // Delete a milestone
    const deleteMilestone = useCallback((id) => {
        try {
            setMilestones(prev => {
                const updated = prev.filter(m => m.id !== id);
                storage.set(storage.KEYS.JOURNEY, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useJourney: Delete failed', err);
            setError('Failed to delete milestone');
            return { success: false };
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        milestones,
        loading,
        error,
        clearError,
        addMilestone,
        deleteMilestone,
        count: milestones.length
    };
};

// ============================================
// useVoiceDiary - Voice Entry Metadata Management
// ============================================
// Note: Audio blobs are stored in IndexedDB via db.js
// This hook manages ONLY the metadata (entries list)
export const useVoiceDiary = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load entries on mount
    useEffect(() => {
        try {
            const saved = storage.get(storage.KEYS.VOICE_ENTRIES, []);
            setEntries(Array.isArray(saved) ? saved : []);
            setLoading(false);
        } catch (err) {
            console.error('useVoiceDiary: Load failed', err);
            setError('Failed to load voice entries');
            setEntries([]);
            setLoading(false);
        }
    }, []);

    // Add a new entry (metadata only - blob saved separately via db.js)
    const addEntry = useCallback((id, duration) => {
        try {
            const newEntry = {
                id,
                date: new Date().toISOString(),
                title: `Capsule ${new Date().toLocaleDateString()}`,
                duration: duration || 0
            };

            setEntries(prev => {
                const updated = [newEntry, ...prev];

                const result = storage.set(storage.KEYS.VOICE_ENTRIES, updated);
                if (!result.success) {
                    setError(result.error === storage.StorageError.QUOTA_EXCEEDED
                        ? 'Storage full! Delete some entries first.'
                        : 'Failed to save entry.');
                    return prev;
                }

                return updated;
            });

            return { success: true, entry: newEntry };
        } catch (err) {
            console.error('useVoiceDiary: Add failed', err);
            setError('Failed to create entry');
            return { success: false };
        }
    }, []);

    // Delete an entry (metadata only - blob should be deleted separately)
    const deleteEntry = useCallback((id) => {
        try {
            setEntries(prev => {
                const updated = prev.filter(e => e.id !== id);
                storage.set(storage.KEYS.VOICE_ENTRIES, updated);
                return updated;
            });
            return { success: true };
        } catch (err) {
            console.error('useVoiceDiary: Delete failed', err);
            setError('Failed to delete entry');
            return { success: false };
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        entries,
        loading,
        error,
        clearError,
        addEntry,
        deleteEntry,
        count: entries.length
    };
};
