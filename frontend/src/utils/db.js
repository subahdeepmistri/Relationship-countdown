// Generic IndexedDB wrapper for Media (Audio & Photos)
const DB_NAME = 'rc_media_db';
const AUDIO_STORE = 'audio_files';
const PHOTO_STORE = 'photo_files';
const PROFILE_STORE = 'profile_photos';

const DB_VERSION = 4; // Bump version for private vault

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(AUDIO_STORE)) {
                db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(PHOTO_STORE)) {
                db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(PROFILE_STORE)) {
                db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
            }

        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// Profile Images Store
export const saveProfileImage = async (id, file) => {
    // id should be 'profile_1' or 'profile_2'
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, 'readwrite');
        const store = tx.objectStore(PROFILE_STORE);
        const request = store.put({ id, blob: file, date: new Date().toISOString() });

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
        tx.oncomplete = () => resolve();
    });
};

export const getProfileImage = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, 'readonly');
        const store = tx.objectStore(PROFILE_STORE);
        const request = store.get(id);

        request.onsuccess = (e) => resolve(e.target.result ? e.target.result.blob : null);
        request.onerror = (e) => reject(e);
    });
};

// Generic Helpers
const saveToStore = async (storeName, id, blob) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ id, blob });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
};

const getFromStore = async (storeName, id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = (e) => resolve(e.target.result ? e.target.result.blob : null);
        request.onerror = (e) => reject(e);
    });
};

const getAllFromStore = async (storeName) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = (e) => resolve(e.target.result || []);
        request.onerror = (e) => reject(e);
    });
};

const deleteFromStore = async (storeName, id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
};

// Audio API
export const saveAudio = (id, blob) => saveToStore(AUDIO_STORE, id, blob);
export const getAudio = (id) => getFromStore(AUDIO_STORE, id);
export const deleteAudio = (id) => deleteFromStore(AUDIO_STORE, id);

// Photo API
export const savePhoto = async (id, blob, caption = '', date = new Date().toISOString()) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([PHOTO_STORE], 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE);
        const request = store.put({ id, blob, caption, date });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
};
export const getPhotos = () => getAllFromStore(PHOTO_STORE);
export const deletePhoto = (id) => deleteFromStore(PHOTO_STORE, id);


