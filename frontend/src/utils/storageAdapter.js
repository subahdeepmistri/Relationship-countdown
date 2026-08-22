/**
 * Storage Adapter Pattern v2.0
 * ===================================
 * Unified abstraction layer for ALL data persistence.
 * 
 * ARCHITECTURE:
 * - Single source of truth for ALL storage keys
 * - Built-in error handling with fallbacks
 * - JSON parsing with validation
 * - Ready for future cloud sync integration
 */

// ============================================
// STORAGE KEYS - All keys in ONE place
// ============================================
const KEYS = {
    // Relationship Data
    PARTNER_1: 'rc_partner1',
    PARTNER_2: 'rc_partner2',
    NICKNAME: 'rc_nickname',
    START_DATE: 'rc_start_date',
    EVENTS: 'rc_events',

    // Settings
    NOTIFICATIONS: 'rc_notifications',
    AI_ENABLED: 'rc_ai_enabled',
    AI_KEY: 'rc_ai_key',
    LOCK_ENABLED: 'rc_lock_enabled',
    SETUP_COMPLETE: 'rc_setup_complete',
    PHOTOS_SET: 'rc_photos_set',
    ANNIVERSARY_TYPE: 'rc_anniversary_type',

    // Long Distance Settings
    LD_ENABLED: 'rc_ld_enabled',
    LD_OFFSET: 'rc_ld_offset',
    LD_MEET: 'rc_ld_meet',
    LD_MY_LOC: 'rc_ld_my_loc',
    LD_PARTNER_LOC: 'rc_ld_partner_loc',

    // Feature Data (Previously hardcoded in components)
    CAPSULES: 'rc_capsules',
    GOALS: 'rc_goals',
    LEGACY_MESSAGES: 'rc_legacy',

    // Voice Diary
    VOICE_ENTRIES: 'rc_voice_entries',

    // Daily Questions
    DAILY_ANSWERS: 'rc_daily_answers',

    // Love Notes
    LOVE_NOTES: 'rc_love_notes',

    // Scrapbook Metadata
    SCRAPBOOK_META: 'rc_scrapbook_meta',

    // Journey/Timeline
    JOURNEY: 'rc_journey',

    // App Meta
    APP_VERSION: 'rc_app_version',
    LAST_SYNC: 'rc_last_sync',
    DATA_VERSION: 'rc_data_version',
};

// ============================================
// ERROR TYPES
// ============================================
const StorageError = {
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    PARSE_ERROR: 'PARSE_ERROR',
    WRITE_ERROR: 'WRITE_ERROR',
    READ_ERROR: 'READ_ERROR',
};

// ============================================
// STORAGE OPERATIONS
// ============================================
export const storage = {
    KEYS,
    StorageError,

    /**
     * Get a value from storage with full error handling
     * @param {string} key - Storage key (use KEYS constant)
     * @param {any} defaultValue - Fallback value if key doesn't exist or parsing fails
     * @returns {any} The stored value or defaultValue
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);

            // Key doesn't exist
            if (item === null || item === undefined) {
                return defaultValue;
            }

            // Handle boolean strings
            if (item === 'true') return true;
            if (item === 'false') return false;

            // Handle numeric strings
            if (/^-?\d+(\.\d+)?$/.test(item)) {
                return parseFloat(item);
            }

            // Try to parse JSON for objects/arrays
            if (item.startsWith('{') || item.startsWith('[')) {
                try {
                    const parsed = JSON.parse(item);
                    // Validate arrays - ensure they are actually arrays
                    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
                        console.warn(`Storage: Expected array for ${key}, got ${typeof parsed}. Using default.`);
                        return defaultValue;
                    }
                    return parsed;
                } catch (parseError) {
                    console.error(`Storage: JSON parse failed for ${key}:`, parseError);
                    return defaultValue;
                }
            }

            // Return as string
            return item;
        } catch (error) {
            console.error(`Storage: Read failed for ${key}:`, error);
            return defaultValue;
        }
    },

    /**
     * Set a value in storage with full error handling
     * @param {string} key - Storage key (use KEYS constant)
     * @param {any} value - Value to store
     * @returns {{ success: boolean, error?: string }} Result object
     */
    set: (key, value) => {
        try {
            let serialized;

            if (value === null || value === undefined) {
                serialized = '';
            } else if (typeof value === 'object') {
                serialized = JSON.stringify(value);
            } else {
                serialized = String(value);
            }

            localStorage.setItem(key, serialized);
            storage.notifyChange(key);
            return { success: true };
        } catch (error) {
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError' ||
                error.code === 22 ||
                error.code === 1014) {
                console.error(`Storage: Quota exceeded when writing ${key}`);
                return { success: false, error: StorageError.QUOTA_EXCEEDED };
            }

            console.error(`Storage: Write failed for ${key}:`, error);
            return { success: false, error: StorageError.WRITE_ERROR };
        }
    },

    /**
     * Remove a key from storage
     * @param {string} key - Storage key to remove
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            storage.notifyChange(key);
            return { success: true };
        } catch (error) {
            console.error(`Storage: Remove failed for ${key}:`, error);
            return { success: false };
        }
    },

    /**
     * Clear all app storage (dangerous - use with caution)
     */
    clear: () => {
        try {
            // Only clear our app's keys, not all localStorage
            Object.values(KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            storage.notifyChange(null);
            return { success: true };
        } catch (error) {
            console.error('Storage: Clear failed:', error);
            return { success: false };
        }
    },

    /**
     * Check available storage space (approximate) - localStorage only (sync)
     * @returns {{ used: number, available: number, total: number, percentUsed: number }} in bytes
     */
    getStorageInfo: () => {
        try {
            let used = 0;
            for (const key in localStorage) {
                if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                    used += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
                }
            }
            // Most browsers allow 5-10MB for localStorage
            const total = 5 * 1024 * 1024; // 5MB estimate
            return {
                used,
                available: total - used,
                total,
                percentUsed: Math.round((used / total) * 100)
            };
        } catch {
            return { used: 0, available: 0, total: 0, percentUsed: 0 };
        }
    },

    /**
     * Full system storage report (async). Includes localStorage + real sizes of media in IndexedDB.
     * Used by dashboard progress bars to show "actual output from entire system".
     * percentUsed is rough (LS vs 5MB + media as additive "used bytes" for color coding).
     */
    getFullStorageInfo: async (getMediaSizeFn) => {
        const ls = storage.getStorageInfo();
        let mediaBytes = 0;
        try {
            if (typeof getMediaSizeFn === 'function') {
                mediaBytes = await getMediaSizeFn();
            }
        } catch { /* ignore */ }
        const totalUsed = ls.used + mediaBytes;
        // For visual health: treat high media as "more used" but LS % is the constrained one.
        // We'll expose raw numbers + a combined health score (lower used = healthier vault).
        const lsPercent = ls.percentUsed;
        // Rough combined: if media > 50MB treat as significant usage
        const mediaMB = Math.round(mediaBytes / (1024 * 1024));
        const health = Math.max(0, Math.min(100, Math.round(100 - (lsPercent * 0.6 + (mediaMB > 100 ? 30 : mediaMB / 5)))));
        return {
            ...ls,
            mediaBytes,
            mediaMB,
            totalUsed,
            lsPercent,
            healthScore: health, // 0-100 trustworthy "vault health" (higher better)
            lastChecked: new Date().toISOString()
        };
    },

    /**
     * Notify listeners (dashboard cards, etc.) that app data changed.
     * Enables live updates to progress bars / system status without full reload.
     */
    notifyChange: (key = null) => {
        try {
            window.dispatchEvent(new CustomEvent('rc-storage-mutated', { detail: { key, ts: Date.now() } }));
        } catch { /* ignore dispatch errors */ }

        // Auto-touch LAST_SYNC for core relationship/settings data so SystemStatus "last sync" / freshness always reflects reality
        const CORE_KEYS = [KEYS.PARTNER_1, KEYS.PARTNER_2, KEYS.NICKNAME, KEYS.START_DATE, KEYS.EVENTS, KEYS.NOTIFICATIONS, KEYS.AI_ENABLED, KEYS.AI_KEY, KEYS.LD_ENABLED, KEYS.LD_OFFSET, KEYS.LD_MEET, KEYS.LD_MY_LOC, KEYS.LD_PARTNER_LOC, KEYS.SETUP_COMPLETE, KEYS.PHOTOS_SET, KEYS.ANNIVERSARY_TYPE];
        if (key && CORE_KEYS.includes(key)) {
            try { localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString()); } catch { /* ignore */ }
        }
    },

    /**
     * Safely update an array item (add, update, or remove)
     * @param {string} key - Storage key for the array
     * @param {string} itemId - ID field value to find
     * @param {object|null} newData - New data (null to delete)
     * @param {string} idField - Field name for ID (default: 'id')
     */
    updateArrayItem: (key, itemId, newData, idField = 'id') => {
        try {
            const array = storage.get(key, []);

            if (!Array.isArray(array)) {
                console.error(`Storage: ${key} is not an array`);
                return { success: false, error: 'NOT_AN_ARRAY' };
            }

            const index = array.findIndex(item => item[idField] === itemId);

            if (newData === null) {
                // Delete
                if (index > -1) {
                    array.splice(index, 1);
                }
            } else if (index > -1) {
                // Update
                array[index] = { ...array[index], ...newData };
            } else {
                // Add
                array.push(newData);
            }

            // storage.set already notifies listeners — don't dispatch twice.
            return storage.set(key, array);
        } catch (error) {
            console.error(`Storage: updateArrayItem failed for ${key}:`, error);
            return { success: false, error: 'UPDATE_FAILED' };
        }
    },

    /**
     * Export all app data (for backup/sync)
     * @returns {object} All app data
     */
    exportAll: () => {
        const data = {};
        Object.entries(KEYS).forEach(([name, key]) => {
            data[name] = storage.get(key);
        });
        data._exportedAt = new Date().toISOString();
        data._version = storage.get(KEYS.DATA_VERSION, 1);
        return data;
    },

    /**
     * Import app data (from backup/sync)
     * @param {object} data - Data to import
     * @param {boolean} merge - If true, merge with existing; if false, replace
     */
    importAll: (data, merge = false) => {
        try {
            if (!merge) {
                storage.clear();
            }

            Object.entries(KEYS).forEach(([name, key]) => {
                if (data[name] !== undefined) {
                    storage.set(key, data[name]);
                }
            });
            storage.notifyChange(null);

            return { success: true };
        } catch (error) {
            console.error('Storage: Import failed:', error);
            return { success: false };
        }
    }
};
