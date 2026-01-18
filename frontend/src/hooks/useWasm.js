import { useState, useEffect, useCallback } from 'react';

// FAILSAFE: MOCK DATA FOR DEVELOPMENT (Since Rust is missing)
const MOCK_START_DATE = new Date("2023-01-24T00:00:00"); // Updated to User Date
const MOCK_ANNIVERSARY_DATE = new Date("2024-01-24T00:00:00");

export function useWasm() {
  const [isLoaded, setIsLoaded] = useState(true); // Mock loaded immediately

  // Mock function to replace Rust's get_relationship_stats
  const getRelationshipStats = useCallback(() => {
    const now = new Date();
    const diff = now - MOCK_START_DATE;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    };
  }, []);

  const getAnniversaryCountdown = useCallback(() => {
    const now = new Date();
    // Dynamic Date from Setup Wizard
    const storedDate = localStorage.getItem('rc_start_date') || '2023-01-24';

    // Manual Parse to Local Midnight (Fixes Timezone Offsets)
    let startDate;
    if (storedDate.includes('-')) {
      const [y, m, d] = storedDate.split('-').map(Number);
      startDate = new Date(y, m - 1, d, 0, 0, 0, 0);
    } else {
      startDate = new Date(storedDate);
    }

    // 1. STRICT "IS TODAY" CHECK
    // Only compare Month and Date. Year is irrelevant for "Is it the anniversary?"
    const isToday = now.getDate() === startDate.getDate() && now.getMonth() === startDate.getMonth();

    // 2. CALCULATION FOR "DAYS REMAINING" (Next Anniversary)
    let nextAnniversary = new Date();
    nextAnniversary.setMonth(startDate.getMonth());
    nextAnniversary.setDate(startDate.getDate());
    nextAnniversary.setHours(0, 0, 0, 0); // Midnight start

    const currentYear = now.getFullYear();
    nextAnniversary.setFullYear(currentYear);

    const nowMidnight = new Date(now);
    nowMidnight.setHours(0, 0, 0, 0);

    // If strictly in the past, move to next year
    if (nextAnniversary < nowMidnight) {
      nextAnniversary.setFullYear(currentYear + 1);
    }
    // If today, daysLeft should be 0.
    // Logic above works: if today, nextAnn==nowMidnight (since we set hours 0), so not <. Wont increment.
    // diff will be 0.

    const diff = nextAnniversary - nowMidnight;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return {
      days_remaining: daysLeft,
      is_today: isToday
    };
  }, []);

  const getDailyLoveMessage = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const cached = localStorage.getItem(`rc_message_${today}`);

    // 1. Return cached if exists
    if (cached) return cached;

    // 2. Check for AI Settings
    const useAI = localStorage.getItem('rc_ai_enabled') === 'true';
    const apiKey = localStorage.getItem('rc_ai_key');

    if (useAI && apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "system",
              content: "Generate a short, romantic, elegant love message (max 2 sentences). No cheesiness. Warm and emotional tone."
            }]
          })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
          const aiMessage = data.choices[0].message.content.trim();
          localStorage.setItem(`rc_message_${today}`, aiMessage);
          return aiMessage;
        }
      } catch (error) {
        console.error("AI Fetch failed, falling back", error);
      }
    }

    // 3. Fallback to Static List
    const messages = [
      "I love you more than yesterday.",
      "You are my favorite thought.",
      "Every moment with you is a gift.",
      "My heart beats for you.",
      "You make my world brighter.",
      "In your smile, I see something more beautiful than the stars.",
      "Loving you is the easiest thing I've ever done.",
      "You are my today and all of my tomorrows."
    ];
    // Hash day to pick consistent random message if not using cached/AI
    const dayNum = new Date().getDate();
    const msg = messages[dayNum % messages.length];

    // Only cache if we want consistency for the day even on reload
    localStorage.setItem(`rc_message_${today}`, msg);
    return msg;
  }, []);

  return {
    isLoaded,
    getRelationshipStats,
    getAnniversaryCountdown,
    getDailyLoveMessage
  };
}
