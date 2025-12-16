import { requestNotificationPermission } from './notifications';

export const checkGentleReminder = () => {
    const lastOpened = localStorage.getItem('rc_last_opened');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Update last opened
    localStorage.setItem('rc_last_opened', now);

    if (!lastOpened) return; // First run

    if (now - parseInt(lastOpened) > sevenDays) {
        // If permission not granted, we can't do much here since app is opening NOW.
        // However, if we had background sync this would be useful.
        // For now, this logic resets the timer so we don't spam if they just opened it.

        // In a real PWA with Push API, the server would handle the 7 day check.
        // Client-side only limitation: We can only react when they OPEN the app, or use Notification Triggers (experimental).
        console.log("Welcome back! It's been a while.");
    }
};

// Only for local testing of logic - In production Push API is needed for true "Reminder"
export const scheduleLocalReminder = () => {
    // Experimental Notification Triggers API or simple setTimeout for session
    // This is mostly symbolic in a pure client-side PWA without Background Sync
};
