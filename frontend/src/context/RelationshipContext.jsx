import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { storage } from '../utils/storageAdapter';
import {
    sanitizeRelationship,
    sanitizeSettings,
    sanitizeLongDistance
} from '../domain/relationshipSchema';

/* eslint-disable react-refresh/only-export-components -- Context file intentionally exports hook + provider for convenience */
export { sanitizeRelationship, sanitizeSettings } from '../domain/relationshipSchema';

const RelationshipContext = createContext();

export const useRelationship = () => {
    const context = useContext(RelationshipContext);
    if (!context) {
        throw new Error('useRelationship must be used within a RelationshipProvider');
    }
    return context;
};

// --- DATA GATEWAY: flat storage keys -> aggregate shape ---

const loadStateFromStorage = () => ({
    relationship: sanitizeRelationship({
        partner1: storage.get(storage.KEYS.PARTNER_1, ''),
        partner2: storage.get(storage.KEYS.PARTNER_2, ''),
        nickname: storage.get(storage.KEYS.NICKNAME, ''),
        startDate: storage.get(storage.KEYS.START_DATE, ''),
        events: storage.get(storage.KEYS.EVENTS, []),
    }),
    settings: sanitizeSettings({
        notifications: storage.get(storage.KEYS.NOTIFICATIONS, false),
        aiEnabled: storage.get(storage.KEYS.AI_ENABLED, false),
        aiKey: storage.get(storage.KEYS.AI_KEY, ''),
        appLockEnabled: storage.get(storage.KEYS.LOCK_ENABLED, false),
        longDistance: {
            enabled: storage.get(storage.KEYS.LD_ENABLED, false),
            offset: storage.get(storage.KEYS.LD_OFFSET, ''),
            meet: storage.get(storage.KEYS.LD_MEET, ''),
            myLoc: storage.get(storage.KEYS.LD_MY_LOC, ''),
            partnerLoc: storage.get(storage.KEYS.LD_PARTNER_LOC, '')
        },
        setupComplete: storage.get(storage.KEYS.SETUP_COMPLETE, false),
        photosSet: storage.get(storage.KEYS.PHOTOS_SET, false),
        anniversaryType: storage.get(storage.KEYS.ANNIVERSARY_TYPE, '')
    })
});

// Keys owned by this aggregate — cross-tab changes to them trigger re-hydration.
const SYNC_KEYS = [
    storage.KEYS.PARTNER_1,
    storage.KEYS.PARTNER_2,
    storage.KEYS.NICKNAME,
    storage.KEYS.START_DATE,
    storage.KEYS.EVENTS,
    storage.KEYS.NOTIFICATIONS,
    storage.KEYS.AI_ENABLED,
    storage.KEYS.AI_KEY,
    storage.KEYS.LOCK_ENABLED,
    storage.KEYS.SETUP_COMPLETE,
    storage.KEYS.PHOTOS_SET,
    storage.KEYS.ANNIVERSARY_TYPE,
    storage.KEYS.LD_ENABLED,
    storage.KEYS.LD_OFFSET,
    storage.KEYS.LD_MEET,
    storage.KEYS.LD_MY_LOC,
    storage.KEYS.LD_PARTNER_LOC
];

export const RelationshipProvider = ({ children }) => {
    const [state, setState] = useState(loadStateFromStorage);

    // --- MULTI-TAB SYNC ---
    // Only sync on changes to relationship/settings keys, NOT feature data like capsules/goals
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (SYNC_KEYS.includes(e.key)) {
                setState(loadStateFromStorage());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- COMMANDS ---
    // Updates pass through the same domain sanitizers as loads, so magic-link
    // / share payloads (`?sync=`) cannot inject malformed state. Sanitized
    // fields are persisted individually to keep the flat key layout.

    const updateRelationship = useCallback((updates = {}) => {
        setState(prev => {
            const incoming = sanitizeRelationship({ ...prev.relationship, ...updates });

            if ('partner1' in updates) storage.set(storage.KEYS.PARTNER_1, incoming.partner1);
            if ('partner2' in updates) storage.set(storage.KEYS.PARTNER_2, incoming.partner2);
            if ('nickname' in updates) storage.set(storage.KEYS.NICKNAME, incoming.nickname);
            if ('startDate' in updates) storage.set(storage.KEYS.START_DATE, incoming.startDate);
            if ('events' in updates) storage.set(storage.KEYS.EVENTS, incoming.events);

            return { ...prev, relationship: incoming };
        });
    }, []);

    const updateSettings = useCallback((updates = {}) => {
        setState(prev => {
            const mergedRaw = {
                ...prev.settings,
                ...updates,
                longDistance: updates.longDistance !== undefined
                    ? sanitizeLongDistance({
                        ...prev.settings.longDistance,
                        ...updates.longDistance
                    })
                    : prev.settings.longDistance
            };
            const incoming = sanitizeSettings(mergedRaw);

            if ('notifications' in updates) storage.set(storage.KEYS.NOTIFICATIONS, incoming.notifications);
            if ('aiEnabled' in updates) storage.set(storage.KEYS.AI_ENABLED, incoming.aiEnabled);
            if ('aiKey' in updates) storage.set(storage.KEYS.AI_KEY, incoming.aiKey);
            if ('appLockEnabled' in updates) storage.set(storage.KEYS.LOCK_ENABLED, incoming.appLockEnabled);
            if ('setupComplete' in updates) storage.set(storage.KEYS.SETUP_COMPLETE, incoming.setupComplete);
            if ('photosSet' in updates) storage.set(storage.KEYS.PHOTOS_SET, incoming.photosSet);
            if ('anniversaryType' in updates) storage.set(storage.KEYS.ANNIVERSARY_TYPE, incoming.anniversaryType);

            if (updates.longDistance) {
                storage.set(storage.KEYS.LD_ENABLED, incoming.longDistance.enabled);
                storage.set(storage.KEYS.LD_OFFSET, incoming.longDistance.offset);
                storage.set(storage.KEYS.LD_MEET, incoming.longDistance.meet);
                storage.set(storage.KEYS.LD_MY_LOC, incoming.longDistance.myLoc);
                storage.set(storage.KEYS.LD_PARTNER_LOC, incoming.longDistance.partnerLoc);
            }

            return { ...prev, settings: incoming };
        });
    }, []);

    const resetApp = useCallback(() => {
        // Wipe localStorage keys AND IndexedDB media so "Erase All Data"
        // genuinely removes every trace (photos, voice notes, profiles).
        storage.clear();
        import('../utils/db').then(({ clearAllMedia }) => clearAllMedia()).catch((e) => {
            console.error('Failed to clear media during reset:', e);
        });
        setState(loadStateFromStorage()); // Will revert to defaults
        window.location.reload();
    }, []);

    // Memoized so consumers only re-render when relationship/settings data
    // or action identities actually change — not on every provider render.
    const value = useMemo(() => ({
        relationship: state.relationship,
        settings: state.settings,
        updateRelationship,
        updateSettings,
        resetApp
    }), [state.relationship, state.settings, updateRelationship, updateSettings, resetApp]);

    return (
        <RelationshipContext.Provider value={value}>
            {children}
        </RelationshipContext.Provider>
    );
};
