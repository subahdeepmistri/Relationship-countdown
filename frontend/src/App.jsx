import React from 'react';
import ThemeBackground from './components/ThemeBackground';
import Counter from './components/Counter';
import MessageCard from './components/MessageCard';

import AnniversaryOverlay from './components/AnniversaryOverlay';
import Settings from './components/Settings';
import MemoryCarousel from './components/MemoryCarousel';
import PrivateSection from './components/PrivateSection';
// import LinkToTimeline from './components/LinkToTimeline'; // Removed, integrated in Navbar or App state
import MilestoneCelebration from './components/MilestoneCelebration';
import TimelineView from './components/TimelineView';
import LoveNotes from './components/LoveNotes';
import { useState, useEffect } from 'react';
import { checkAnniversaryNotification } from './utils/notifications';
import { useWasm } from './hooks/useWasm';
import ScrapbookView from './components/ScrapbookView';
import TimeCapsuleManager from './components/TimeCapsuleManager';
import DistanceClock from './components/DistanceClock';
import { checkGentleReminder } from './utils/reminders';
import FutureGoalsTimeline from './components/FutureGoalsTimeline';
import YearlyRecap from './components/YearlyRecap';
import SyncManager from './components/SyncManager';
import VoiceDiary from './components/VoiceDiary';
import JourneyMap from './components/JourneyMap';
import LegacyCapsule from './components/LegacyCapsule';

import Navbar from './components/Navbar';
import MoodPulse from './components/MoodPulse';
import DailyQuestion from './components/DailyQuestion';

import AnniversarySelection from './components/AnniversarySelection';
import DateSelection from './components/DateSelection';
import PhotoSelection from './components/PhotoSelection';
import NotificationSelection from './components/NotificationSelection';
import WelcomeScreen from './components/WelcomeScreen'; // New Onboarding
import NextMilestoneCard from './components/NextMilestoneCard'; // Phase 4 Milestone
import { getProfileImage } from './utils/db'; // Import DB
import { getStartDate } from './utils/relationshipLogic';

import SecurityLock from './components/SecurityLock';

function App() {
  // App Lock State: Unlocked if NO lock enabled, otherwise locked initially
  const [isAppUnlocked, setIsAppUnlocked] = useState(() => {
    return localStorage.getItem('rc_lock_enabled') !== 'true';
  });

  // Initialize from localStorage immediately to prevent "flash" of consent screen
  const [hasConsented, setHasConsented] = useState(true);

  const [hasSelectedType, setHasSelectedType] = useState(() => {
    return !!localStorage.getItem('rc_anniversary_type');
  });

  const [hasSelectedDate, setHasSelectedDate] = useState(() => {
    return !!localStorage.getItem('rc_start_date');
  });

  const [hasSelectedPhotos, setHasSelectedPhotos] = useState(() => {
    return localStorage.getItem('rc_photos_set') === 'true';
  });

  const [isSetupComplete, setIsSetupComplete] = useState(() => {
    return localStorage.getItem('rc_setup_complete') === 'true';
  });

  const [profileImages, setProfileImages] = useState({ left: null, right: null });

  // NAVIGATION STATE: Single source of truth to prevent overlaps
  const [activeView, setActiveView] = useState('home');

  const [isNightOwl, setIsNightOwl] = useState(false);
  const [longDistance, setLongDistance] = useState(null); // { offset, meet }

  const { getAnniversaryCountdown } = useWasm();

  // Unified Navigation Handler
  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleClose = () => {
    setActiveView('home');
  };

  // ... (useEffects remain unchanged) ...

  // Check for notification on mount/update & Load LD settings
  useEffect(() => {
    // 1. Shareable Link Parsing (Magical Viral Feature) 🌟
    const params = new URLSearchParams(window.location.search);
    const sharedDate = params.get('date');
    const p1 = params.get('p1') || params.get('name1');
    const p2 = params.get('p2') || params.get('name2');

    if (sharedDate) {
      // Auto-configure from link
      localStorage.setItem('rc_start_date', sharedDate);
      // Also normalize into events
      const newEvent = { id: 'shared-start', title: 'The Beginning', date: sharedDate, emoji: '❤️', isMain: true };
      localStorage.setItem('rc_events', JSON.stringify([newEvent]));

      if (p1) localStorage.setItem('rc_partner1', p1);
      if (p2) localStorage.setItem('rc_partner2', p2);

      // Clean URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);

      // Force reload to apply immediately
      window.location.reload();
      return;
    }

    checkGentleReminder(); // Update last opened timestamp

    // START DATE OVERRIDE (User Request)
    // Ensures the date is set to their specific anniversary
    const TARGET_DATE = '2023-01-24';
    if (localStorage.getItem('rc_start_date') !== TARGET_DATE) {
      console.log("Updating start date to user preference:", TARGET_DATE);
      localStorage.setItem('rc_start_date', TARGET_DATE);

      // Also update the main event in rc_events if it exists
      const events = JSON.parse(localStorage.getItem('rc_events') || '[]');
      const mainIndex = events.findIndex(e => e.isMain);
      if (mainIndex >= 0) {
        events[mainIndex].date = TARGET_DATE;
        localStorage.setItem('rc_events', JSON.stringify(events));
      } else {
        // If no events, create the main one
        events.push({
          id: 'main-event',
          title: 'The Beginning',
          date: TARGET_DATE,
          emoji: '❤️',
          isMain: true
        });
        localStorage.setItem('rc_events', JSON.stringify(events));
      }

      // Force reload to apply changes fresh
      window.location.reload();
    }

    // Load LD settings
    const ldEnabled = localStorage.getItem('rc_ld_enabled') === 'true';
    if (ldEnabled) {
      setLongDistance({
        offset: parseInt(localStorage.getItem('rc_ld_offset') || '0'),
        meet: localStorage.getItem('rc_ld_meet')
      });
    }

    // We assume 'getAnniversaryCountdown' is synchronous-ish or fast enough in mock
    // In real app, we might wait for isLoaded
    const status = getAnniversaryCountdown();
    if (status && status.is_today) {
      checkAnniversaryNotification(true);
    }
  }, [getAnniversaryCountdown, setLongDistance]);

  // Night Owl Check & Scrapbook Listener
  useEffect(() => {
    const handleScrapbook = () => setActiveView('scrapbook');
    window.addEventListener('open-scrapbook', handleScrapbook);

    const checkTime = () => {
      const h = new Date().getHours();
      setIsNightOwl(h >= 23 || h < 5);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => {
      window.removeEventListener('open-scrapbook', handleScrapbook);
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Phase 3 Migration: Ensure rc_events exists
    const events = localStorage.getItem('rc_events');
    const legacyDate = localStorage.getItem('rc_start_date');

    if (!events && legacyDate) {
      // Migrate legacy date to events array
      const initialEvent = [{
        id: Date.now().toString(),
        title: "The Beginning",
        date: legacyDate,
        emoji: "❤️",
        isMain: true
      }];
      localStorage.setItem('rc_events', JSON.stringify(initialEvent));
    }
  }, []);

  useEffect(() => {
    // Load profile images
    if (hasSelectedPhotos) {
      Promise.all([
        getProfileImage('profile_1'),
        getProfileImage('profile_2')
      ]).then(([blob1, blob2]) => {
        setProfileImages({
          left: blob1 ? URL.createObjectURL(blob1) : null,
          right: blob2 ? URL.createObjectURL(blob2) : null
        });
      });
    }
  }, [hasSelectedPhotos]);

  useEffect(() => {
    // PWA Install Prompt Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // setDeferredPrompt(e); // These states are not defined in the original code
      // setShowInstallModal(true); // These states are not defined in the original code
    });
  }, []);

  // --- RENDERING GATES ---

  // 1. App Lock (Highest Priority)
  if (!isAppUnlocked) {
    return <SecurityLock initialMode="verify" onSuccess={() => setIsAppUnlocked(true)} />;
  }



  const handleTypeSelect = (type) => {
    localStorage.setItem('rc_anniversary_type', type);
    setHasSelectedType(true);
  };

  if (!hasSelectedDate) {
    return <WelcomeScreen onComplete={() => window.location.reload()} />;
  }

  // Legacy/Partial setup handling (if Type selected but not Date? WelcomeScreen handles both now)
  // Converting the flow: WelcomeScreen sets Type -> Date -> Names.
  // So 'hasSelectedType' check is redundant if we gated on Date.
  // But wait, if user had Type but not Date? WelcomeScreen handles it.


  const handlePhotoSelect = () => {
    localStorage.setItem('rc_photos_set', 'true');
    setHasSelectedPhotos(true);
    // No reload needed, useEffect will catch it
    setActiveView('home');
  };

  if (!hasSelectedPhotos) {
    // Use PhotoSelection purely for initial setup here
    return <PhotoSelection onSelect={handlePhotoSelect} onBack={() => setHasSelectedDate(false)} />;
  }

  const handleSetupComplete = () => {
    localStorage.setItem('rc_setup_complete', 'true');
    setIsSetupComplete(true);
  };

  if (!isSetupComplete) {
    return (
      <NotificationSelection
        onComplete={handleSetupComplete}
        onBack={() => setHasSelectedPhotos(false)}
        profileImages={profileImages}
      />
    );
  }

  // Dynamic Title Logic
  const getTitle = () => {
    // 1. Check Personalization
    const nickname = localStorage.getItem('rc_nickname');
    const p1 = localStorage.getItem('rc_partner1');
    const p2 = localStorage.getItem('rc_partner2');

    if (nickname) return nickname;
    if (p1 && p2) return `${p1} ❤️ ${p2}`;

    // 2. If we have profile images, they are shown in the distinct image block, 
    //    but update the text fallback just in case or if images are missing.
    //    (The original logic returned a DIV here which overrides the H1 styles in the render method, 
    //     so we should handle that carefully. The render method wraps {getTitle()} in an H1.
    //     If we return a div, strictly speaking it's invalid HTML (div inside h1), but browsers handle it.
    //     Better to return text or span unless we want to replace the whole H1.)

    // For now, let's keep the image logic if it was effectively replacing the title
    // But since we are "Personalizing", the names are better than images in the H1 text slot usually.
    // Let's prioritize the text if set.

    const type = localStorage.getItem('rc_anniversary_type') || 'couple';
    const map = {
      'couple': 'Us',
      'birthday': 'B-Day',
      'wedding': 'Vows',
      'general': 'Time',
      'puppy': 'Puppy',
      'kitten': 'Kitty'
    };
    return map[type] || 'Us';
  };

  return (
    <>
      {/* EXCLUSIVE VIEWS - Only one renders at a time */}
      {activeView === 'scrapbook' && <ScrapbookView onClose={handleClose} />}
      {activeView === 'capsules' && <TimeCapsuleManager onClose={handleClose} />}
      {activeView === 'goals' && <FutureGoalsTimeline onClose={handleClose} />}
      {activeView === 'recap' && <YearlyRecap onClose={handleClose} />}
      {activeView === 'sync' && <SyncManager onClose={handleClose} />}
      {activeView === 'voice' && <VoiceDiary onClose={handleClose} />}
      {activeView === 'journey' && <JourneyMap onClose={handleClose} />}
      {activeView === 'legacy' && <LegacyCapsule onClose={handleClose} />}
      {activeView === 'timeline' && <TimelineView onClose={handleClose} />}

      {/* Settings & Edit Photos */}
      <Settings
        isOpen={activeView === 'settings'}
        onClose={handleClose}
        onEditPhotos={() => setActiveView('edit-photos')}
      />

      {activeView === 'edit-photos' && (
        <PhotoSelection
          isEditing={true}
          onBack={() => setActiveView('settings')} // Go back to settings
          onSelect={() => {
            setActiveView('settings'); // Return to settings after save
            window.location.reload(); // Reload to update images
          }}
        />
      )}

      {/* BACKGROUND & DECOR */}
      <div className="blob-bg">
        <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FDE68A' }}></div>
        <div className="blob" style={{ bottom: '10%', right: '-10%', width: '400px', height: '400px', background: '#FECACA' }}></div>
      </div>

      <div className="app-container" style={{ paddingBottom: '150px' }}>

        {/* 1. Header Section - Minimal */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          padding: '0 10px' // Slight inner spacing
        }}>
          {/* Sync Button (Left) - Modern Squircle */}
          <button
            onClick={() => setActiveView('sync')}
            title="Sync & Updates"
            className="modern-btn"
            style={{
              width: '48px', height: '48px',
              borderRadius: '16px', // Modern Squircle
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          >
            {/* Clean Refresh Icon Element */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--accent-primary)', // Using theme accent
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)',
              marginBottom: '8px',
              border: '1px solid rgba(249, 115, 22, 0.1)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
              EST. {getStartDate() ? getStartDate().getFullYear() : new Date().getFullYear()}
            </span>
            <h1 style={{
              margin: '0 0 5px 0',
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              letterSpacing: '-1px',
              textShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              {getTitle()}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              opacity: 0.85,
              fontWeight: '500'
            }}>
              Tracking love, one day at a time
            </p>
          </div>

          {/* Settings Button (Right) - Modern Squircle */}
          <button
            onClick={() => setActiveView('settings')}
            title="Settings"
            style={{
              width: '48px', height: '48px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          >
            {/* Clean Settings Icon Element */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </header>

        <div className="bento-grid">
          {/* Main Counter - Floating Geometric Card */}
          <div className="pop-card" style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', border: 'none', boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.15)' }}>
            <Counter />
          </div>

          {/* Phase 4: Next Milestone Dashboard */}
          <NextMilestoneCard />

          {/* Mood Pulse - Pill Container */}
          <div className="pop-card" style={{ padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ❤️ Daily Vibe
            </h3>
            <MoodPulse />
          </div>

          {/* Message Card */}
          <MessageCard />

          {/* Love Notes (Phase 2 Add) */}
          <LoveNotes />
        </div>   {/* Long Distance Clock (Conditional) */}
        {longDistance && (
          <div className="glass-card bento-item-full">
            <DistanceClock
              partnerOffset={longDistance.offset}
              meetingDate={longDistance.meet}
            />
          </div>
        )}
      </div>

      <MemoryCarousel />

      <DailyQuestion />

      {/* Old buttons removed in favor of Navbar */}

      {/* Updated Footer Buttons with SVGs */}
      <div style={{ marginTop: '30px', paddingBottom: '120px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => setActiveView('recap')}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Year in Review
        </button>

        <button
          onClick={() => setActiveView('legacy')}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5" /><path d="M22 12h-5" /><path d="M7 12l2-2 2 2 2-2 2 2" /><rect x="2" y="7" width="20" height="10" rx="3" /></svg>
          Legacy Check
        </button>
      </div>

      <Navbar
        onNavigate={handleNavigate}
        activeView={activeView}
      />

      <AnniversaryOverlay />
      <MilestoneCelebration />
      <PrivateSection />

      {isNightOwl && (
        <div style={{
          marginTop: '20px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.5)', padding: '5px 15px', borderRadius: '20px',
          marginBottom: '100px'
        }}>
          <span title="Secret Night Mode Active">🌙</span>
          <p style={{ margin: 0, fontWeight: '500' }}>The night is ours.</p>
        </div>
      )}



    </>
  );
}

export default App;
