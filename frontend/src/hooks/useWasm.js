import { useState, useEffect } from 'react';

// FAILSAFE: MOCK DATA FOR DEVELOPMENT (Since Rust is missing)
const MOCK_START_DATE = new Date("2023-01-24T00:00:00"); // Updated to User Date
const MOCK_ANNIVERSARY_DATE = new Date("2024-01-24T00:00:00");

export function useWasm() {
  const [isLoaded, setIsLoaded] = useState(true); // Mock loaded immediately

  // Mock function to replace Rust's get_relationship_stats
  const getRelationshipStats = () => {
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
  };

  const getAnniversaryCountdown = () => {
    const now = new Date();
    // Dynamic Date from Setup Wizard
    const storedDate = localStorage.getItem('rc_start_date') || '2023-01-24';
    const startDate = new Date(storedDate); // Renamed to avoid conflict with global MOCK_START_DATE

    let nextAnniversary = new Date();
    nextAnniversary.setMonth(startDate.getMonth());
    nextAnniversary.setDate(startDate.getDate());
    nextAnniversary.setHours(0, 0, 0, 0); // Set to start of the day for accurate comparison

    // If the anniversary has already passed this year, set it for next year
    if (nextAnniversary < now) {
      nextAnniversary.setFullYear(now.getFullYear() + 1);
    } else {
      // If it's in the future this year, ensure it's for the current year
      nextAnniversary.setFullYear(now.getFullYear());
    }

    const diff = nextAnniversary - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return {
      days_remaining: daysLeft,
      is_today: daysLeft === 0 || (now.getDate() === nextAnniversary.getDate() && now.getMonth() === nextAnniversary.getMonth())
    };
  };

  const getDailyLoveMessage = async () => {
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
  };

  return {
    isLoaded,
    getRelationshipStats,
    getAnniversaryCountdown,
    getDailyLoveMessage
  };
}
