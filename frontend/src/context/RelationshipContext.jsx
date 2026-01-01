import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { storage } from '../utils/storageAdapter';

const RelationshipContext = createContext();

export const useRelationship = () => {
    const context = useContext(RelationshipContext);
    if (!context) {
        throw new Error('useRelationship must be used within a RelationshipProvider');
    }
    return context;
};

export const RelationshipProvider = ({ children }) => {
    // --- INITIAL STATE ---
    // We check storage for existing data, defaulting to empty strings/false

    // Helper to load full state from storage
    const loadStateFromStorage = () => ({
        relationship: {
            partner1: storage.get(storage.KEYS.PARTNER_1, ''),
            partner2: storage.get(storage.KEYS.PARTNER_2, ''),
            nickname: storage.get(storage.KEYS.NICKNAME, ''),
            startDate: storage.get(storage.KEYS.START_DATE, ''),
            events: storage.get(storage.KEYS.EVENTS, []),
        },
        settings: {
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
        }
    });

    const [state, setState] = useState(loadStateFromStorage());

    // --- MIGRATION & VALIDATION ---
    useEffect(() => {
        // Ensure events is an array
        if (!Array.isArray(state.relationship.events)) {
            // Migration: Check for legacy date
            const legacyDate = storage.get(storage.KEYS.START_DATE);
            if (legacyDate) {
                const initialEvent = [{
                    id: 'legacy-init',
                    title: 'The Beginning',
                    date: legacyDate,
                    emoji: '💖',
                    isMain: true
                }];
                // We don't just set state, we write to storage to fix it permanently
                storage.set(storage.KEYS.EVENTS, initialEvent);
                setState(prev => ({
                    ...prev,
                    relationship: { ...prev.relationship, events: initialEvent }
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    relationship: { ...prev.relationship, events: [] }
                }));
            }
        }
    }, []);

    // --- MULTI-TAB SYNC ---
    useEffect(() => {
        const handleStorageChange = (e) => {
            // If any critical key changes in another tab, reload state
            if (Object.values(storage.KEYS).includes(e.key)) {
                console.log('🔄 Syncing state from another tab...');
                setState(loadStateFromStorage());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- ACTIONS ---

    const updateRelationship = useCallback((updates) => {
        setState(prev => {
            const newState = { ...prev, relationship: { ...prev.relationship, ...updates } };

            // Persist
            if (updates.partner1 !== undefined) storage.set(storage.KEYS.PARTNER_1, updates.partner1);
            if (updates.partner2 !== undefined) storage.set(storage.KEYS.PARTNER_2, updates.partner2);
            if (updates.nickname !== undefined) storage.set(storage.KEYS.NICKNAME, updates.nickname);
            if (updates.startDate !== undefined) storage.set(storage.KEYS.START_DATE, updates.startDate);
            if (updates.events !== undefined) storage.set(storage.KEYS.EVENTS, updates.events);

            return newState;
        });
    }, []);

    const updateSettings = useCallback((updates) => {
        setState(prev => {
            const newState = { ...prev, settings: { ...prev.settings, ...updates } };

            // Persist
            if (updates.notifications !== undefined) storage.set(storage.KEYS.NOTIFICATIONS, updates.notifications);
            if (updates.aiEnabled !== undefined) storage.set(storage.KEYS.AI_ENABLED, updates.aiEnabled);
            if (updates.aiKey !== undefined) storage.set(storage.KEYS.AI_KEY, updates.aiKey);
            if (updates.appLockEnabled !== undefined) storage.set(storage.KEYS.LOCK_ENABLED, updates.appLockEnabled);
            if (updates.setupComplete !== undefined) storage.set(storage.KEYS.SETUP_COMPLETE, updates.setupComplete);
            if (updates.photosSet !== undefined) storage.set(storage.KEYS.PHOTOS_SET, updates.photosSet);
            if (updates.anniversaryType !== undefined) storage.set(storage.KEYS.ANNIVERSARY_TYPE, updates.anniversaryType);

            if (updates.longDistance) {
                if (updates.longDistance.enabled !== undefined) storage.set(storage.KEYS.LD_ENABLED, updates.longDistance.enabled);
                if (updates.longDistance.offset !== undefined) storage.set(storage.KEYS.LD_OFFSET, updates.longDistance.offset);
                if (updates.longDistance.meet !== undefined) storage.set(storage.KEYS.LD_MEET, updates.longDistance.meet);
                if (updates.longDistance.myLoc !== undefined) storage.set(storage.KEYS.LD_MY_LOC, updates.longDistance.myLoc);
                if (updates.longDistance.partnerLoc !== undefined) storage.set(storage.KEYS.LD_PARTNER_LOC, updates.longDistance.partnerLoc);
            }

            return newState;
        });
    }, []);

    const resetApp = useCallback(() => {
        storage.clear();
        setState(loadStateFromStorage()); // Will revert to defaults
        window.location.reload();
    }, []);

    return (
        <RelationshipContext.Provider value={{
            relationship: state.relationship,
            settings: state.settings,
            updateRelationship,
            updateSettings,
            resetApp
        }}>
            {children}
        </RelationshipContext.Provider>
    );
};
