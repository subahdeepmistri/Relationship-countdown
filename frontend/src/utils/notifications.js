// Utility to handle permission requests and local checks

const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

// One key accumulates per day forever — sweep ones older than 7 days.
const pruneStaleNotifiedKeys = () => {
    try {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rc_notified_')) {
                const dateStr = key.slice('rc_notified_'.length);
                if (!Number.isNaN(Date.parse(dateStr)) && Date.parse(dateStr) < cutoff) {
                    localStorage.removeItem(key);
                }
            }
        }
    } catch { /* non-fatal */ }
};

export const requestNotificationPermission = async () => {
    if (!notificationsSupported()) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const checkAnniversaryNotification = (isAnniversaryToday) => {
    if (!notificationsSupported()) return;

    pruneStaleNotifiedKeys();

    // Check if we already notified today to avoid spam
    const today = new Date().toISOString().slice(0, 10);
    const notifiedKey = `rc_notified_${today}`;

    if (localStorage.getItem(notifiedKey)) return; // Already notified

    if (isAnniversaryToday && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('Happy Anniversary! ❤️', {
                body: 'I have a special voice message waiting for you. Tap to listen. 🎙️',
                icon: '/pwa-192x192.png',
                tag: 'anniversary-notification',
                renotify: true,
                requireInteraction: true
            });
            localStorage.setItem(notifiedKey, 'true');
        }).catch(() => {
            // Service worker unavailable — fall back to page-level notification
            try {
                new Notification('Happy Anniversary! ❤️', {
                    body: 'I have a special voice message waiting for you. Tap to listen. 🎙️',
                    icon: '/pwa-192x192.png',
                    tag: 'anniversary-notification'
                });
                localStorage.setItem(notifiedKey, 'true');
            } catch { /* best effort only */ }
        });
    }
};
