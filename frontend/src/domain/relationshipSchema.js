/**
 * Domain Layer: Relationship Schema
 * ==================================
 * Pure validation/normalization rules for relationship & settings data.
 *
 * LAYERING RULES:
 * - This module MUST NOT import React, hooks, or storage adapters.
 * - It is the single authority on what constitutes valid persisted state.
 * - Every ingestion path (localStorage load, magic-link sync, backup
 *   import) MUST funnel raw data through these validators before it
 *   reaches state or render code.
 */

// ============================================
// PRIMITIVES
// ============================================

const asString = (value, fallback = '') => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return fallback; // objects/booleans are never valid text fields
};

const asBool = (value, fallback = false) =>
    typeof value === 'boolean' ? value : fallback;

const isValidDate = (value) =>
    !!value && !Number.isNaN(new Date(value).getTime());

// ============================================
// ENTITY: Timeline Event
// ============================================

/** Validate one timeline event; returns null for entries that can't be trusted. */
const sanitizeEvent = (event) => {
    if (!event || typeof event !== 'object' || Array.isArray(event)) return null;
    const date = asString(event.date);
    if (!isValidDate(date)) return null;
    return {
        id: asString(event.id) || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: asString(event.title, 'Untitled').slice(0, 100),
        date,
        emoji: asString(event.emoji, '📅').slice(0, 4),
        isMain: asBool(event.isMain)
    };
};

/**
 * Normalize an events collection. Drops null/garbage entries, validates
 * dates, dedupes by id (magic links can carry duplicates).
 */
export const sanitizeEvents = (events) => {
    if (!Array.isArray(events)) return [];
    const seen = new Set();
    const out = [];
    for (const raw of events) {
        const event = sanitizeEvent(raw);
        if (event && !seen.has(event.id)) {
            seen.add(event.id);
            out.push(event);
        }
    }
    return out;
};

// ============================================
// AGGREGATE: Relationship
// ============================================

export const sanitizeRelationship = (raw = {}) => ({
    partner1: asString(raw.partner1).slice(0, 60),
    partner2: asString(raw.partner2).slice(0, 60),
    nickname: asString(raw.nickname).slice(0, 60),
    startDate: (() => {
        const d = asString(raw.startDate);
        return isValidDate(d) ? d : '';
    })(),
    events: sanitizeEvents(raw.events)
});

// ============================================
// VALUE OBJECT: Long-Distance Config
// ============================================

export const LD_DEFAULTS = Object.freeze({
    enabled: false,
    offset: '',
    meet: '',
    myLoc: '',
    partnerLoc: ''
});

/**
 * Deep-merge long-distance config over defaults. A partial payload
 * (e.g. {enabled:true} from an older schema) must never erase sibling
 * fields — a naive shallow spread turned them into `undefined`.
 */
export const sanitizeLongDistance = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...LD_DEFAULTS };
    return {
        enabled: asBool(raw.enabled),
        offset: asString(raw.offset),
        meet: asString(raw.meet),
        myLoc: asString(raw.myLoc),
        partnerLoc: asString(raw.partnerLoc)
    };
};

// ============================================
// AGGREGATE: Settings
// ============================================

export const sanitizeSettings = (raw = {}) => ({
    notifications: asBool(raw.notifications),
    aiEnabled: asBool(raw.aiEnabled),
    aiKey: asString(raw.aiKey).slice(0, 200),
    appLockEnabled: asBool(raw.appLockEnabled),
    longDistance: sanitizeLongDistance(raw.longDistance),
    setupComplete: asBool(raw.setupComplete),
    photosSet: asBool(raw.photosSet),
    anniversaryType: asString(raw.anniversaryType)
});
