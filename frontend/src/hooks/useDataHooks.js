/**
 * Custom Hooks for Data Management
 * ==================================
 * Centralized data access pattern for all feature data.
 * Components should NEVER directly access localStorage.
 *
 * ARCHITECTURE (v2):
 * Every feature collection used to re-implement the same 5 concerns
 * (lazy load, live sync, add, delete, error handling) — ~600 lines of
 * drifted copy-paste. They now share one engine:
 *
 *   useStorageSyncValue(key)  → reactive primitive: read + live-reload
 *   useCollection(key, opts)  → CRUD array wrapper with rollback + errors
 *
 * The six exported hooks below keep their exact public APIs, so no
 * component changes were needed. Per-feature differences are declared
 * as data (sort comparator, insert position), not duplicated code.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { storage } from '../utils/storageAdapter';

// ============================================
// PRIMITIVE: reactive single-key storage value
// ============================================

/**
 * Subscribe to a storage key and keep it in state, re-reading whenever the
 * key is mutated locally ('rc-storage-mutated') or from another tab
 * ('storage' event). This is the single source of live-sync logic — the old
 * code base had 7 hand-rolled copies of this listener pair.
 *
 * @param {string} key - Storage key (storage.KEYS.*)
 * @param {(raw: any) => any} [select] - Optional transform applied to raw value
 * @returns {[any, (updater: any) => void]} value and raw setState
 */
export function useStorageSyncValue(key, select) {
    const read = useCallback(() => {
        try {
            const raw = storage.get(key, null);
            return select ? select(raw) : raw;
        } catch (err) {
            console.error(`useStorageSyncValue[${key}]: read failed`, err);
            return undefined;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const [value, setValue] = useState(read);
    const readRef = useRef(read);
    readRef.current = read;

    useEffect(() => {
        setValue(readRef.current());

        const onMut = () => setValue(readRef.current());
        const onStorage = (e) => {
            if (!e.key || e.key === key) setValue(readRef.current());
        };

        window.addEventListener('rc-storage-mutated', onMut);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('rc-storage-mutated', onMut);
            window.removeEventListener('storage', onStorage);
        };
    }, [key]);

    return [value, setValue];
}

// ============================================
// ENGINE: generic collection CRUD over a storage key
// ============================================

/**
 * @param {string} key - Storage key holding a JSON array
 * @param {object} [options]
 * @param {(a: object, b: object) => number} [options.sort] - Comparator kept
 *   invariant after every load/add (goals & journey sort by date).
 * @param {'append'|'prepend'} [options.insert='append']
 * @returns collection state + mutation helpers
 */
function useCollection(key, { sort, insert = 'append' } = {}) {
    const order = (items) => (sort ? [...items].sort(sort) : items);

    // Guarantees an array even if storage holds garbage (defensive parity
    // with what each legacy hook did inline with its own try/Array.isArray).
    const selectArray = (raw) => {
        try {
            if (!Array.isArray(raw)) return [];
            return sort ? [...raw].sort(sort) : raw;
        } catch {
            return [];
        }
    };

    const [items, setItems] = useStorageSyncValue(key, selectArray);
    const [error, setError] = useState(null);

    // Ref mirror so mutation callbacks never read stale closures, and so
    // persistence happens exactly once per mutation (the legacy version
    // wrote to storage inside the setState updater, which double-fires
    // under StrictMode).
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const commit = useCallback((updated, failureMessage) => {
        const ordered = order(updated);
        const result = storage.set(key, ordered);
        if (!result.success) {
            setError(
                result.error === storage.StorageError.QUOTA_EXCEEDED
                    ? 'Storage full! Delete some items first.'
                    : failureMessage
            );
            return false;
        }
        setItems(ordered);
        return true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const addItem = useCallback((item, failureMessage = 'Failed to save.') =>
        commit(insert === 'prepend' ? [item, ...itemsRef.current] : [...itemsRef.current, item], failureMessage),
        [commit, insert]);

    const removeItem = useCallback((id) =>
        commit(itemsRef.current.filter(item => item.id !== id), 'Failed to delete.'),
        [commit]);

    const mapItem = useCallback((id, fn, failureMessage = 'Failed to update.') =>
        commit(itemsRef.current.map(item => (item.id === id ? fn(item) : item)), failureMessage),
        [commit]);

    const replaceAll = useCallback((next) => {
        try {
            setItems(next);
            const result = storage.set(key, next);
            return { success: !!result.success };
        } catch (err) {
            console.error(`${key}: replaceAll failed`, err);
            return { success: false };
        }
    }, [key, setItems]);

    return { items, setItems, error, setError, commit, addItem, removeItem, mapItem, replaceAll };
}

const byDate = (a, b) => (new Date(a.date || 0)) - (new Date(b.date || 0));
const quotaError = (result, fallback) =>
    result.error === storage.StorageError.QUOTA_EXCEEDED
        ? 'Storage full! Delete some items first.'
        : fallback;

// ============================================
// useCapsules - Time Capsule Management
// ============================================
export const useCapsules = () => {
    const { items: capsules, error, setError, addItem, removeItem } =
        useCollection(storage.KEYS.CAPSULES);

    const addCapsule = useCallback((content, unlockDate) => {
        try {
            const newCapsule = {
                id: Date.now(),
                content: content.trim(),
                unlockDate: new Date(unlockDate).getTime(),
                createdAt: Date.now()
            };
            addItem(newCapsule, quotaError(null, 'Failed to save capsule.'));
            return { success: true, capsule: newCapsule };
        } catch (err) {
            console.error('useCapsules: Add failed', err);
            setError('Failed to create capsule');
            return { success: false };
        }
    }, [addItem, setError]);

    const deleteCapsule = useCallback((id) => {
        try {
            removeItem(id);
            return { success: true };
        } catch (err) {
            console.error('useCapsules: Delete failed', err);
            setError('Failed to delete capsule');
            return { success: false };
        }
    }, [removeItem, setError]);

    const isUnlocked = useCallback((unlockDate) => Date.now() >= unlockDate, []);

    const counts = {
        total: capsules.length,
        locked: capsules.filter(c => !isUnlocked(c.unlockDate)).length,
        unlocked: capsules.filter(c => isUnlocked(c.unlockDate)).length
    };

    const clearError = useCallback(() => setError(null), [setError]);

    return { capsules, loading: false, error, clearError, addCapsule, deleteCapsule, isUnlocked, counts };
};

// ============================================
// useGoals - Future Goals Management
// ============================================
export const useGoals = () => {
    const { items: goals, error, setError, addItem, removeItem, mapItem } =
        useCollection(storage.KEYS.GOALS, { sort: byDate });

    const addGoal = useCallback((title, date) => {
        try {
            const newGoal = {
                id: Date.now(),
                title: title.trim(),
                date: date || null,
                status: 'planned', // planned | achieved
                createdAt: Date.now()
            };
            addItem(newGoal, 'Failed to save goal');
            return { success: true, goal: newGoal };
        } catch (err) {
            console.error('useGoals: Add failed', err);
            setError('Failed to create goal');
            return { success: false };
        }
    }, [addItem, setError]);

    const toggleStatus = useCallback((id) => {
        try {
            mapItem(id, g => ({ ...g, status: g.status === 'planned' ? 'achieved' : 'planned' }));
            return { success: true };
        } catch (err) {
            console.error('useGoals: Toggle failed', err);
            return { success: false };
        }
    }, [mapItem]);

    const deleteGoal = useCallback((id) => {
        try {
            removeItem(id);
            return { success: true };
        } catch (err) {
            console.error('useGoals: Delete failed', err);
            setError('Failed to delete goal');
            return { success: false };
        }
    }, [removeItem, setError]);

    const counts = {
        total: goals.length,
        planned: goals.filter(g => g.status === 'planned').length,
        achieved: goals.filter(g => g.status === 'achieved').length
    };

    const clearError = useCallback(() => setError(null), [setError]);

    return { goals, loading: false, error, clearError, addGoal, toggleStatus, deleteGoal, counts };
};

// ============================================
// useLegacyMessages - Legacy Capsule Messages
// ============================================
export const useLegacyMessages = () => {
    const { items: messages, error, setError, addItem, removeItem, replaceAll } =
        useCollection(storage.KEYS.LEGACY_MESSAGES);

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
            addItem(newMessage, 'Failed to save message.');
            return { success: true, message: newMessage };
        } catch (err) {
            console.error('useLegacyMessages: Seal failed', err);
            setError('Failed to seal message');
            return { success: false };
        }
    }, [addItem, setError]);

    const deleteMessage = useCallback((id) => {
        try {
            removeItem(id);
            return { success: true };
        } catch (err) {
            console.error('useLegacyMessages: Delete failed', err);
            setError('Failed to delete message');
            return { success: false };
        }
    }, [removeItem, setError]);

    // Clear all messages (hard reset)
    const clearAll = useCallback(() => {
        try {
            return replaceAll([]);
        } catch (err) {
            console.error('useLegacyMessages: Clear failed', err);
            setError('Failed to clear messages');
            return { success: false };
        }
    }, [replaceAll, setError]);

    const clearError = useCallback(() => setError(null), [setError]);

    return {
        messages,
        loading: false,
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
    // Lazy compute stats on init (all sync storage reads)
    const [stats] = useState(() => {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();

            const startDateStr = storage.get(storage.KEYS.START_DATE, null);
            const startDate = startDateStr ? new Date(startDateStr) : today;

            const diff = today - startDate;
            const totalDays = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

            const capsules = storage.get(storage.KEYS.CAPSULES, []);
            const goals = storage.get(storage.KEYS.GOALS, []);
            const achievedGoals = Array.isArray(goals)
                ? goals.filter(g => g.status === 'achieved').length
                : 0;

            const legacyMessages = storage.get(storage.KEYS.LEGACY_MESSAGES, []);

            return {
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
            };
        } catch (err) {
            console.error('useAppStats: Load failed', err);
            return null;
        }
    });

    return { stats, loading: false };
};

// ============================================
// useJourney - Journey Milestones Management
// ============================================
export const useJourney = () => {
    const { items: milestones, error, setError, addItem, removeItem } =
        useCollection(storage.KEYS.JOURNEY, { sort: byDate });

    const addMilestone = useCallback((title, date, desc = '') => {
        try {
            const newMilestone = {
                id: Date.now(),
                title: title.trim(),
                date,
                desc: desc.trim(),
                createdAt: Date.now()
            };
            addItem(newMilestone, 'Failed to save milestone.');
            return { success: true, milestone: newMilestone };
        } catch (err) {
            console.error('useJourney: Add failed', err);
            setError('Failed to create milestone');
            return { success: false };
        }
    }, [addItem, setError]);

    const deleteMilestone = useCallback((id) => {
        try {
            removeItem(id);
            return { success: true };
        } catch (err) {
            console.error('useJourney: Delete failed', err);
            setError('Failed to delete milestone');
            return { success: false };
        }
    }, [removeItem, setError]);

    const clearError = useCallback(() => setError(null), [setError]);

    return {
        milestones,
        loading: false,
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
    const { items: entries, error, setError, addItem, removeItem } =
        useCollection(storage.KEYS.VOICE_ENTRIES, { insert: 'prepend' });

    const addEntry = useCallback((id, duration) => {
        try {
            const newEntry = {
                id,
                date: new Date().toISOString(),
                title: `Capsule ${new Date().toLocaleDateString()}`,
                duration: duration || 0
            };
            addItem(newEntry, 'Failed to save entry.');
            return { success: true, entry: newEntry };
        } catch (err) {
            console.error('useVoiceDiary: Add failed', err);
            setError('Failed to create entry');
            return { success: false };
        }
    }, [addItem, setError]);

    const deleteEntry = useCallback((id) => {
        try {
            removeItem(id);
            return { success: true };
        } catch (err) {
            console.error('useVoiceDiary: Delete failed', err);
            setError('Failed to delete entry');
            return { success: false };
        }
    }, [removeItem, setError]);

    const clearError = useCallback(() => setError(null), [setError]);

    return {
        entries,
        loading: false,
        error,
        clearError,
        addEntry,
        deleteEntry,
        count: entries.length
    };
};
