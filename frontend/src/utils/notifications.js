// Utility to handle permission requests and local checks

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const checkAnniversaryNotification = (isAnniversaryToday) => {
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
        });
    }
};
