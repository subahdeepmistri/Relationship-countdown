/**
 * Storage Adapter Pattern
 * Abstraction layer for data persistence.
 * Currently uses localStorage, but can be easily swapped for an API/DB adapter later.
 */

const KEYS = {
    PARTNER_1: 'rc_partner1',
    PARTNER_2: 'rc_partner2',
    NICKNAME: 'rc_nickname',
    START_DATE: 'rc_start_date',
    EVENTS: 'rc_events',
    NOTIFICATIONS: 'rc_notifications',
    AI_ENABLED: 'rc_ai_enabled',
    AI_KEY: 'rc_ai_key',
    LOCK_ENABLED: 'rc_lock_enabled',
    SETUP_COMPLETE: 'rc_setup_complete',
    PHOTOS_SET: 'rc_photos_set',
    ANNIVERSARY_TYPE: 'rc_anniversary_type',
    LD_ENABLED: 'rc_ld_enabled',
    LD_OFFSET: 'rc_ld_offset',
    LD_MEET: 'rc_ld_meet'
};

export const storage = {
    KEYS,

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            // Attempt to parse JSON if it looks like an object/array/boolean
            if (item === 'true') return true;
            if (item === 'false') return false;
            if (item.startsWith('{') || item.startsWith('[')) {
                return JSON.parse(item);
            }
            return item;
        } catch (e) {
            console.warn(`Error reading ${key} from storage:`, e);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            if (typeof value === 'object') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, String(value));
            }
            // Manually dispatch storage event for same-tab updates if needed, 
            // but usually we rely on React state for the active tab.
        } catch (e) {
            console.error(`Error writing ${key} to storage:`, e);
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};
