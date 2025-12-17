export const getStartDate = () => {
    // Priority: 1. rc_start_date (Simple string) 2. rc_events (Complex object)
    const storedDate = localStorage.getItem('rc_start_date');
    if (storedDate) return new Date(storedDate);

    const events = JSON.parse(localStorage.getItem('rc_events') || '[]');
    const mainEvent = events.find(e => e.isMain) || events[0];
    if (mainEvent) return new Date(mainEvent.date);

    return null;
};

export const getRelationshipStats = () => {
    const start = getStartDate();
    if (!start) return null;

    const now = new Date();
    // Use absolute difference to handle future dates
    let diff = now - start;
    let isFuture = false;

    if (diff < 0) {
        diff = Math.abs(diff);
        isFuture = true;
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
        days,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60,
        isFuture
    };
};

export const getNextMilestone = () => {
    const start = getStartDate();
    if (!start) return null;

    const now = new Date();
    // Use start of day for accurate day diffs
    const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
    const nowDay = new Date(now); nowDay.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(nowDay - startDay);
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 1. Next "Hundred" Milestone
    const nextHundred = (Math.floor(daysElapsed / 100) + 1) * 100;
    const daysToHundred = nextHundred - daysElapsed;

    // 2. Next Anniversary
    let nextAnniversary = new Date(start);
    nextAnniversary.setFullYear(now.getFullYear());
    // If anniversary passed this year, look at next year
    if (nextAnniversary <= nowDay) {
        nextAnniversary.setFullYear(now.getFullYear() + 1);
    }
    const daysToAnniversary = Math.ceil((nextAnniversary - nowDay) / (1000 * 60 * 60 * 24));

    // Calculate which "Year" it will be
    const years = nextAnniversary.getFullYear() - start.getFullYear();

    // 3. Compare and Return
    // Use strictly less than so Anniversary wins ties (it's more important)
    if (daysToHundred < daysToAnniversary) {
        return {
            type: 'hundred',
            title: `${nextHundred} Days Together`,
            daysLeft: daysToHundred,
            date: 'Coming Soon',
            icon: '💯'
        };
    } else {
        return {
            type: 'anniversary',
            title: `${years === 1 ? '1st' : years === 2 ? '2nd' : years + 'th'} Anniversary`,
            daysLeft: daysToAnniversary,
            date: nextAnniversary.toLocaleDateString(),
            icon: '🎉'
        };
    }
};

export const getDailySeed = () => {
    // Returns a consistent number for the day (e.g. 20231024) to seed random rotations
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};
