import React from 'react';
import ThemeBackground from './components/ThemeBackground';
import Counter from './components/Counter';
import MessageCard from './components/MessageCard';
import BackgroundMusic from './components/BackgroundMusic';
import AnniversaryOverlay from './components/AnniversaryOverlay';
import Settings from './components/Settings';
import MemoryCarousel from './components/MemoryCarousel';
import PrivateSection from './components/PrivateSection';
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

  const { getAnniversaryCountdown } = useWasm();

  const handleNavigate = (view) => {
    if (view === 'capsules') setShowCapsules(true);
    if (view === 'goals') setShowGoals(true);
    if (view === 'voice') setShowVoice(true);
    if (view === 'journey') setShowJourney(true);
  };

  // ... (useEffects remain unchanged) ...

  // Check for notification on mount/update & Load LD settings
  useEffect(() => {
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

  if (!hasSelectedType) {
    return <AnniversarySelection onSelect={handleTypeSelect} />;
  }

  const handleDateSelect = (date) => {
    localStorage.setItem('rc_start_date', date);
    setHasSelectedDate(true);
  };

  if (!hasSelectedDate) {
    return <DateSelection onSelect={handleDateSelect} onBack={() => setHasSelectedType(false)} />;
  }

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
    // If we have profile images, show them instead of text (or alongside)
    if (profileImages.left || profileImages.right) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img
            src={profileImages.left || "https://img.icons8.com/doodle/96/boy.png"}
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }}
            alt="Profile 1"
          />
          <span style={{ fontSize: '2rem' }}>❤️</span>
          <img
            src={profileImages.right || "https://img.icons8.com/doodle/96/girl.png"}
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid white', objectFit: 'cover' }}
            alt="Profile 2"
          />
        </div>
      )
    }

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
    <ThemeBackground>
      <>
        {showScrapbook && <ScrapbookView onClose={() => setShowScrapbook(false)} />}
        {showCapsules && <TimeCapsuleManager onClose={() => setShowCapsules(false)} />}
        {showGoals && <FutureGoalsTimeline onClose={() => setShowGoals(false)} />}
        {showRecap && <YearlyRecap onClose={() => setShowRecap(false)} />}
        {showSync && <SyncManager onClose={() => setShowSync(false)} />}
        {showVoice && <VoiceDiary onClose={() => setShowVoice(false)} />}
        {showJourney && <JourneyMap onClose={() => setShowJourney(false)} />}
        {showLegacy && <LegacyManager onClose={() => setShowLegacy(false)} />}

        <div className="app-container" style={{ paddingBottom: '100px' }}>
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            marginBottom: '20px',
            position: 'relative'
          }}>
            {/* Sync Button (Left) */}
            <button
              onClick={() => setShowSync(true)}
              style={{
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                opacity: 0.7
              }}
            >
              🔄
            </button>

            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'min(4rem, 12vw)', // Responsive font size
              margin: '0 10px',
              lineHeight: 1,
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              flex: 1, // Allow it to fill space but shrink if needed
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {getTitle()}
            </div>

            {/* Settings Button (Right) */}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                opacity: 0.7
              }}
            >
              ⚙️
            </button>
          </header>

          <MoodPulse />

          <Counter />

          {longDistance && (
            <DistanceClock
              partnerOffset={longDistance.offset}
              meetingDate={longDistance.meet}
            />
          )}

          <div style={{ margin: '40px 0' }}>
            <MessageCard />
          </div>
        </div>

        <MemoryCarousel />

        <DailyQuestion />

        {/* Old buttons removed in favor of Navbar */}

        <div style={{ marginTop: '30px', paddingBottom: '120px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button onClick={() => setShowRecap(true)} style={{ fontSize: '0.8rem', opacity: 0.6, textDecoration: 'underline' }}>Year in Review</button>
          <button onClick={() => setShowLegacy(true)} style={{ fontSize: '0.8rem', opacity: 0.6, textDecoration: 'underline' }}>Legacy Check</button>
        </div>

        <Navbar onNavigate={handleNavigate} />

        <AnniversaryOverlay />

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
    </ThemeBackground >
  );
}

export default App;
