/**
 * Centralized Date Utilities
 * ==========================
 * All date parsing and calculations for the app should go through here.
 * Goal: Consistent local-midnight handling, proper anniversary math,
 * long-distance time, and future-date support.
 */

import { storage } from './storageAdapter';

/**
 * Resolve the effective start date for calculations.
 * Callers may omit the argument (legacy call sites do); in that case we
 * fall back to the stored start date, then to the first timeline event.
 */
function resolveStartDateStr(dateStr) {
  if (dateStr) return dateStr;
  const stored = storage.get(storage.KEYS.START_DATE, '');
  if (stored) return stored;
  const events = storage.get(storage.KEYS.EVENTS, []);
  const mainEvent = Array.isArray(events) ? (events.find(e => e.isMain) || events[0]) : null;
  return mainEvent ? mainEvent.date : '';
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  // Force local midnight for YYYY-MM-DD strings (avoids UTC shift bugs)
  if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.length >= 10) {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }
  }
  const d = new Date(dateStr);
  // Guard against Invalid Date (corrupt stored value)
  if (isNaN(d.getTime())) return null;
  // Normalize to local midnight
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function getRelationshipStats(startDateStr) {
  const start = parseLocalDate(resolveStartDateStr(startDateStr));
  if (!start) return null;

  const now = new Date();
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
    isFuture,
  };
}

export function getNextMilestone(startDateStr) {
  const start = parseLocalDate(resolveStartDateStr(startDateStr));
  if (!start) return null;

  const now = new Date();
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const nowDay = new Date(now);
  nowDay.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(nowDay - startDay);
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Next hundred
  const nextHundred = (Math.floor(daysElapsed / 100) + 1) * 100;
  const daysToHundred = nextHundred - daysElapsed;

  // Next anniversary (proper local)
  let nextAnniversary = new Date(start);
  nextAnniversary.setFullYear(now.getFullYear());
  nextAnniversary.setHours(0, 0, 0, 0);

  if (nextAnniversary <= nowDay) {
    nextAnniversary.setFullYear(now.getFullYear() + 1);
  }

  const daysToAnniversary = Math.ceil((nextAnniversary - nowDay) / (1000 * 60 * 60 * 24));
  const years = nextAnniversary.getFullYear() - start.getFullYear();

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (daysToHundred < daysToAnniversary) {
    const hundredDate = new Date(nowDay.getTime() + daysToHundred * 24 * 60 * 60 * 1000);
    return {
      type: 'hundred',
      title: `${nextHundred} Days Together`,
      daysLeft: daysToHundred,
      date: hundredDate.toLocaleDateString(undefined, { dateStyle: 'long' }),
      icon: '💯',
    };
  } else {
    return {
      type: 'anniversary',
      title: `${getOrdinal(years)} Anniversary`,
      daysLeft: daysToAnniversary,
      date: nextAnniversary.toLocaleDateString(),
      icon: '🎉',
    };
  }
}

export function getAnniversaryCountdown(startDateStr) {
  const resolved = resolveStartDateStr(startDateStr);
  if (!resolved) {
    return { days_remaining: 365, is_today: false };
  }
  const start = parseLocalDate(resolved);
  if (!start) {
    return { days_remaining: 365, is_today: false };
  }

  const now = new Date();

  // Is today the anniversary? (month + day only)
  const isToday =
    now.getDate() === start.getDate() &&
    now.getMonth() === start.getMonth();

  // Next anniversary date
  let nextAnn = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  nextAnn.setHours(0, 0, 0, 0);

  const nowMid = new Date(now);
  nowMid.setHours(0, 0, 0, 0);

  if (nextAnn < nowMid) {
    nextAnn.setFullYear(now.getFullYear() + 1);
  }

  const diff = nextAnn - nowMid;
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    days_remaining: Math.max(0, daysLeft),
    is_today: isToday,
  };
}

// For long distance clock - adds hours offset to a date
export function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + parseFloat(hours || 0));
  return d;
}

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getDailySeed() {
  // Returns a consistent number for the day (e.g. 20231024) to seed random rotations
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}
