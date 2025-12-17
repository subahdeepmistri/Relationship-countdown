import React from 'react';
import ThemeBackground from './components/ThemeBackground';
import Counter from './components/Counter';
import MessageCard from './components/MessageCard';
import BackgroundMusic from './components/BackgroundMusic';
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
import LegacyManager from './components/LegacyManager';

import Navbar from './components/Navbar';
import MoodPulse from './components/MoodPulse';
import DailyQuestion from './components/DailyQuestion';
import ConsentScreen from './components/ConsentScreen';
import AnniversarySelection from './components/AnniversarySelection';
import DateSelection from './components/DateSelection';
import PhotoSelection from './components/PhotoSelection';
import NotificationSelection from './components/NotificationSelection';
import WelcomeScreen from './components/WelcomeScreen'; // New Onboarding
import NextMilestoneCard from './components/NextMilestoneCard'; // Phase 4 Milestone
import { getProfileImage } from './utils/db'; // Import DB

import SecurityLock from './components/SecurityLock';

function App() {
  // App Lock State: Unlocked if NO lock enabled, otherwise locked initially
  const [isAppUnlocked, setIsAppUnlocked] = useState(() => {
    return localStorage.getItem('rc_lock_enabled') !== 'true';
  });

  // Initialize from localStorage immediately to prevent "flash" of consent screen
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('rc_consent_agreed') === 'true';
  });

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
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);
  const [showCapsules, setShowCapsules] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [isNightOwl, setIsNightOwl] = useState(false);
  const [longDistance, setLongDistance] = useState(null); // { offset, meet }

  const [showTimeline, setShowTimeline] = useState(false);

  const { getAnniversaryCountdown } = useWasm();

  const handleNavigate = (view) => {
    if (view === 'capsules') setShowCapsules(true);
    if (view === 'goals') setShowGoals(true);
    if (view === 'voice') setShowVoice(true);
    if (view === 'journey') setShowJourney(true);
    if (view === 'timeline') setShowTimeline(true); // New Timeline View
  };

  // ... (useEffects remain unchanged) ...

  // Check for notification on mount/update & Load LD settings
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
    const handleScrapbook = () => setShowScrapbook(true);
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

  const handleAgree = () => {
    localStorage.setItem('rc_consent_agreed', 'true');
    setHasConsented(true);
  };

  if (!hasConsented) {
    return <ConsentScreen onAgree={handleAgree} />;
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
  };

  if (!hasSelectedPhotos) {
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
      {showScrapbook && <ScrapbookView onClose={() => setShowScrapbook(false)} />}
      {showCapsules && <TimeCapsuleManager onClose={() => setShowCapsules(false)} />}
      {showGoals && <FutureGoalsTimeline onClose={() => setShowGoals(false)} />}
      <div className="blob-bg">
        <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FDE68A' }}></div>
        <div className="blob" style={{ bottom: '10%', right: '-10%', width: '400px', height: '400px', background: '#FECACA' }}></div>
      </div>

      {showRecap && <YearlyRecap onClose={() => setShowRecap(false)} />}
      {showSync && <SyncManager onClose={() => setShowSync(false)} />}
      {showVoice && <VoiceDiary onClose={() => setShowVoice(false)} />}
      {showJourney && <JourneyMap onClose={() => setShowJourney(false)} />}
      {showLegacy && <LegacyManager onClose={() => setShowLegacy(false)} />}
      {showTimeline && <TimelineView onClose={() => setShowTimeline(false)} />}

      <div className="app-container">

        {/* 1. Header Section - Minimal */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          {/* Sync Button (Left) */}
          <button
            onClick={() => setShowSync(true)}
            style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
          >
            🔄
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#FFFFFF',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--accent-primary)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '8px'
            }}>
              EST. 2024
            </span>
            <h1 style={{
              margin: 0,
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              letterSpacing: '-1px'
            }}>
              {getTitle()}
            </h1>
          </div>

          {/* Settings Button (Right) */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: '48px', height: '48px',

              borderRadius: '50%',
              background: 'var(--glass-bg)',
              border: 'var(--glass-border)',
              fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
          >
            ⚙️
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

      <div style={{ marginTop: '30px', paddingBottom: '120px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => setShowRecap(true)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          📅 Year in Review
        </button>

        <button
          onClick={() => setShowLegacy(true)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔍 Legacy Check
        </button>
      </div>

      <Navbar onNavigate={handleNavigate} />

      <AnniversaryOverlay />
      <MilestoneCelebration />
      <PrivateSection />

      {isNightOwl && (
        <div style={{ marginTop: '20px', opacity: 0.5, fontSize: '0.8rem' }}>
          <span title="Secret Night Mode Active">🌙</span>
          <p>The night is ours.</p>
        </div>
      )}

      <BackgroundMusic />



      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onEditPhotos={() => {
          setShowSettings(false);
          setIsEditingPhotos(true);
        }}
      />

      {isEditingPhotos && (
        <PhotoSelection
          isEditing={true}
          onBack={() => setIsEditingPhotos(false)}
          onSelect={() => {
            setIsEditingPhotos(false);
            // Reload images
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default App;
