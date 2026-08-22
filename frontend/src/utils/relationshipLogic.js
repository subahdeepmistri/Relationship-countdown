// Centralized implementations (re-exports for easy migration)
export {
  parseLocalDate,
  getRelationshipStats,
  getNextMilestone,
  getDailySeed,
} from './dateUtils';

// Thin wrapper for getStartDate that matches old expectations (uses storage + parse)
import { parseLocalDate } from './dateUtils';
import { storage } from './storageAdapter';

export const getStartDate = () => {
  const storedDate = storage.get(storage.KEYS.START_DATE, null);
  if (storedDate) return parseLocalDate(storedDate);

  const events = storage.get(storage.KEYS.EVENTS, []);
  const mainEvent = events.find(e => e.isMain) || events[0];
  if (mainEvent) return parseLocalDate(mainEvent.date);

  return null;
};
