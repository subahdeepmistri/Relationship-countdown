import React, { useState, useEffect, startTransition } from 'react';
import { useRelationship } from './context/RelationshipContext';

import ThemeBackground from './components/ThemeBackground';
import Counter from './components/Counter';
import MessageCard from './components/MessageCard';
import AnniversaryOverlay from './components/AnniversaryOverlay';
import Settings from './components/Settings';
import MemoryCarousel from './components/MemoryCarousel';

// import LinkToTimeline from './components/LinkToTimeline'; // Removed, integrated in Navbar or App state
import MilestoneCelebration from './components/MilestoneCelebration';
import TimelineView from './components/TimelineView';
import LoveNotes from './components/LoveNotes';
import ScrapbookView from './components/ScrapbookView';
import TimeCapsuleManager from './components/TimeCapsuleManager';
import DistanceClock from './components/DistanceClock';
import FutureGoalsTimeline from './components/FutureGoalsTimeline';
import YearlyRecap from './components/YearlyRecap';
import SyncManager from './components/SyncManager';
import VoiceDiary from './components/VoiceDiary';
import JourneyMap from './components/JourneyMap';
import LegacyCapsule from './components/LegacyCapsule';
import AboutSection from './components/AboutSection';
import SystemStatusCard from './components/SystemStatusCard';
import FeatureStatsCard from './components/FeatureStatsCard';

import Navbar from './components/Navbar';

import DailyQuestion from './components/DailyQuestion';

import AnniversarySelection from './components/AnniversarySelection';
import DateSelection from './components/DateSelection';
import PhotoSelection from './components/PhotoSelection';
import NotificationSelection from './components/NotificationSelection';
import WelcomeScreen from './components/WelcomeScreen';
import OnboardingChoice from './components/OnboardingChoice';
import NextMilestoneCard from './components/NextMilestoneCard';
import { getProfileImage } from './utils/db'; // Keep DB for blobs until migrated (optional)
import { getStartDate } from './utils/relationshipLogic'; // Can likely be replaced by context data

import { checkAnniversaryNotification } from './utils/notifications';
import { useWasm } from './hooks/useWasm';
import { checkGentleReminder } from './utils/reminders';
import EventHorizon from './components/EventHorizon';

import UpdatePrompt from './components/UpdatePrompt';

function App() {
  const APP_VERSION = '1.1.0';
  useEffect(() => console.log(`App Version: ${APP_VERSION}`), []);

  const { relationship, settings, updateRelationship, updateSettings } = useRelationship();

  // Local Session State (Navigation & Security)
  const [activeView, setActiveView] = useState('home');
  const [showOnboardingChoice, setShowOnboardingChoice] = useState(
    !relationship.startDate && !localStorage.getItem('rc_onboarding_choice_made')
  );

  const [isNightOwl, setIsNightOwl] = useState(false);
  const [profileImages, setProfileImages] = useState({ left: null, right: null });

  // Easter Egg & Modals State (must be declared before early returns)
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showFirstPhotoModal, setShowFirstPhotoModal] = useState(false);
  const [useRealNames, setUseRealNames] = useState(false);
  const longPressTimer = React.useRef(null);

  // WASM Hook for calculations
  const { getAnniversaryCountdown } = useWasm();

  // --- EFFECTS ---

  // 1. Shareable Link & Initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedDate = params.get('date');

    if (sharedDate) {
      // Auto-configure from link via Context
      const updates = {
        startDate: sharedDate,
        // Also normalize events
        events: [{ id: 'shared-start', title: 'The Beginning', date: sharedDate, emoji: '💖', isMain: true }]
      };

      const p1 = params.get('p1') || params.get('name1');
      const p2 = params.get('p2') || params.get('name2');
      if (p1) updates.partner1 = p1;
      if (p2) updates.partner2 = p2;

      updateRelationship(updates);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkGentleReminder();

    // Check Wasm Anniversary (Instant & Periodic)
    const checkAnniversary = () => {
      const status = getAnniversaryCountdown();
      if (status && status.is_today) {
        checkAnniversaryNotification(true);
      }
    };

    checkAnniversary(); // Immediate check
    const midnightTimer = setInterval(checkAnniversary, 60000); // Check every minute

    return () => clearInterval(midnightTimer);
  }, [getAnniversaryCountdown, updateRelationship]);

  // 2. Profile Images Loading (Side Effect for Blobs)
  useEffect(() => {
    if (settings.photosSet) {
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
  }, [settings.photosSet]);

  // 3. Night Owl & Scrapbook Listener
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

  // --- NAVIGATION HANDLERS ---
  // Use startTransition to defer heavy component rendering
  // This allows navbar animations to complete instantly while views load in background
  const handleNavigate = (view) => {
    startTransition(() => {
      setActiveView(view);
    });
  };
  const handleClose = () => {
    startTransition(() => {
      setActiveView('home');
    });
  };

  // --- RENDER GATES ---





  // 2. Onboarding Flow - Show OnboardingChoice first for new users
  if (!relationship.startDate && showOnboardingChoice) {
    return (
      <OnboardingChoice
        onStartFresh={() => {
          localStorage.setItem('rc_onboarding_choice_made', 'true');
          setShowOnboardingChoice(false);
        }}
        onImportComplete={() => {
          localStorage.setItem('rc_onboarding_choice_made', 'true');
          window.location.reload(); // Reload to pick up imported data
        }}
      />
    );
  }

  if (!relationship.startDate) {
    return (
      <WelcomeScreen
        updateRelationship={updateRelationship}
        updateSettings={updateSettings}
        onBack={() => {
          localStorage.removeItem('rc_onboarding_choice_made');
          setShowOnboardingChoice(true);
        }}
      />
    );
  }

  if (!settings.photosSet) {
    return (
      <PhotoSelection
        onSelect={() => updateSettings({ photosSet: true })}
        onBack={() => updateRelationship({ startDate: '' })} // Go back logic
      />
    );
  }

  if (!settings.setupComplete) {
    return (
      <NotificationSelection
        onComplete={() => updateSettings({ setupComplete: true })}
        onBack={() => updateSettings({ photosSet: false })}
        profileImages={profileImages}
      />
    );
  }

  // --- MAIN APP RENDER ---

  const getTitle = () => {
    if (relationship.nickname) return relationship.nickname;
    if (relationship.partner1 && relationship.partner2) return `${relationship.partner1} 💖 ${relationship.partner2}`;

    const type = settings.anniversaryType || 'couple';
    const map = { 'couple': 'Us', 'birthday': 'B-Day', 'wedding': 'Vows', 'general': 'Time', 'puppy': 'Puppy', 'kitten': 'Kitty' };
    return map[type] || 'Us';
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowFirstPhotoModal(true); // Changed to show First Photo modal on connector long press
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <>
      <UpdatePrompt />
      <ThemeBackground />

      {/* EASTER EGG OVERLAY */}
      {showEasterEgg && (
        <div
          onClick={() => setShowEasterEgg(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 3000, background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '24px', animation: 'fadeIn 0.8s ease-out', color: 'white'
          }}>

          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>💖</div>

          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '16px',
            background: 'linear-gradient(to right, #F472B6, #F97316)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            If you’re reading this…
          </h2>

          <p style={{
            fontSize: '1.2rem', lineHeight: '1.6', color: '#cbd5e1', maxWidth: '400px',
            fontStyle: 'italic', fontWeight: '300'
          }}>
            I still choose you.<br />
            Always.
          </p>

          <div style={{ marginTop: '40px', opacity: 0.5, fontSize: '0.9rem' }}>
            (Tap anywhere to close)
          </div>
        </div>
      )}

      {/* FIRST PHOTO MODAL */}
      {showFirstPhotoModal && (
        <div
          onClick={() => setShowFirstPhotoModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 3000, background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '24px', animation: 'fadeIn 0.3s ease-out', color: 'var(--text-primary)'
          }}>
          <div style={{
            width: '280px', padding: '20px', background: 'white',
            borderRadius: '24px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)',
            transform: 'scale(1)', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-lux)', fontWeight: '700', marginBottom: '15px' }}>
              First Memory
            </p>
            <div style={{ width: '100%', height: '200px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {/* Placeholder or meaningful image if available */}
              <span style={{ fontSize: '3rem' }}>📸</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: '0 0 5px 0' }}>
              "Where it all began..."
            </p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {new Date(relationship.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      )}

      {/* EXCLUSIVE VIEWS */}
      {activeView === 'scrapbook' && <ScrapbookView onClose={handleClose} />}
      {activeView === 'capsules' && <TimeCapsuleManager onClose={handleClose} />}
      {activeView === 'goals' && <FutureGoalsTimeline onClose={handleClose} />}
      {activeView === 'recap' && <YearlyRecap onClose={handleClose} />}
      {activeView === 'sync' && <SyncManager onClose={handleClose} />}
      {activeView === 'voice' && <VoiceDiary onClose={handleClose} />}
      {activeView === 'journey' && <JourneyMap onClose={handleClose} />}
      {activeView === 'legacy' && <LegacyCapsule onClose={handleClose} />}
      {activeView === 'timeline' && <TimelineView onClose={handleClose} />}
      {activeView === 'about' && <AboutSection onClose={handleClose} />}

      {/* Settings & Overlays */}
      <Settings
        isOpen={activeView === 'settings'}
        onClose={handleClose}
        onEditPhotos={() => setActiveView('edit-photos')}
        onOpenAbout={() => setActiveView('about')}
      />

      {activeView === 'edit-photos' && (
        <PhotoSelection
          isEditing={true}
          onBack={() => setActiveView('settings')}
          onSelect={() => {
            setActiveView('settings');
            // Re-fetch images - handled by effect dependency on photosSet? 
            // We might need a trigger. Let's toggle a dummy state or just assume blobs update?
            // PhotoSelection saves to IndexedDB.
            // We can force reload images by updating a version counter in Context if we wanted purity.
            // For now, reload fits the image blob architecture until that is refactored.
            window.location.reload();
          }}
        />
      )}

      {/* BACKGROUND DECOR */}
      <div className="blob-bg">
        <div className="blob" style={{ top: '-10%', left: '-10%', width: '500px', height: '500px', background: '#FDE68A' }}></div>
        <div className="blob" style={{ bottom: '10%', right: '-10%', width: '400px', height: '400px', background: '#FECACA' }}></div>
      </div>

      <div className="app-container" style={{ paddingBottom: '200px' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '0 10px'
        }}>
          {/* Sync Button */}
          <button
            onClick={() => setActiveView('sync')}
            title="Sync & Updates"
            className="modern-btn"
            style={{
              width: '48px', height: '48px', borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>

          <div style={{ textAlign: 'center' }}>

            {/* Couple Avatars Header v2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', position: 'relative' }}>

              {/* Animated Halo Background */}
              <div className="animate-pulse-slow" style={{
                position: 'absolute', width: '220px', height: '100px',
                background: 'var(--accent-lux-gradient)', opacity: 0.15,
                filter: 'blur(40px)', zIndex: 0, borderRadius: '50%'
              }}></div>

              <div style={{ position: 'relative', width: '210px', height: '88px', zIndex: 2 }}>
                {/* Left Avatar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: '88px', height: '88px', borderRadius: '50%',
                  border: '4px solid white', overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 5,
                  background: '#f1f5f9', transition: 'transform 0.3s ease'
                }}>
                  {profileImages.left ? (
                    <img src={profileImages.left} alt="P1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#cbd5e1' }}>👤</div>
                  )}
                </div>

                {/* Right Avatar */}
                <div style={{
                  position: 'absolute', right: 0, top: 0,
                  width: '88px', height: '88px', borderRadius: '50%',
                  border: '4px solid white', overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 5,
                  background: '#f1f5f9', transition: 'transform 0.3s ease'
                }}>
                  {profileImages.right ? (
                    <img src={profileImages.right} alt="P2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#cbd5e1' }}>👤</div>
                  )}
                </div>

                {/* Heart Connector v2 */}
                <div
                  className="animate-heartbeat"
                  title="Every beat is yours."
                  onDoubleClick={() => setShowEasterEgg(true)}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--accent-lux-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, border: '3px solid white', fontSize: '0.9rem', color: 'white',
                    boxShadow: '0 4px 15px rgba(251, 113, 133, 0.4)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                  💖
                </div>
              </div>
            </div>

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
              color: 'var(--accent-lux)', marginBottom: '12px',
              border: '1px solid rgba(251, 113, 133, 0.1)', letterSpacing: '0.05em'
            }}>
              EST. {new Date(relationship.startDate).getFullYear() || new Date().getFullYear()}
            </span>

            {/* GREETING UPDATE */}
            <div style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', opacity: 0.8 }}>
              {(() => {
                const h = new Date().getHours();
                if (h < 12) return 'Good Morning,';
                if (h < 18) return 'Good Afternoon,';
                return 'Good Evening,';
              })()} {relationship.partner1 || 'Love'}
            </div>

            {/* Title Section (Click to toggle) */}
            <div onClick={() => setUseRealNames(!useRealNames)} style={{ cursor: 'pointer' }}>
              <h1 style={{
                margin: '0 0 5px 0', fontSize: '2.2rem', color: 'var(--text-primary)',
                letterSpacing: '-0.03em', textShadow: '0 4px 20px rgba(0,0,0,0.08)',
                fontFamily: 'var(--font-heading)'
              }}>
                {useRealNames
                  ? `${relationship.partner1} & ${relationship.partner2}`
                  : getTitle()
                }
              </h1>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', opacity: 0.9, fontWeight: '500', fontFamily: 'var(--font-serif)' }}>
                Some people count days.<br />
                I count moments with you.
              </p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setActiveView('settings')}
            title="Settings"
            style={{
              width: '48px', height: '48px', borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </header>

        <div className="bento-grid">
          <div className="pop-card" style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', border: 'none', boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.15)' }}>
            <Counter />
          </div>

          <NextMilestoneCard />

          <SystemStatusCard onOpenSettings={() => setActiveView('settings')} />

          <FeatureStatsCard onNavigate={handleNavigate} />

          <MessageCard />
          <LoveNotes />
        </div>

        {settings.longDistance.enabled && (
          <div className="glass-card bento-item-full">
            <DistanceClock
              partnerOffset={settings.longDistance.offset}
              meetingDate={settings.longDistance.meet}
              myLoc={settings.longDistance.myLoc}
              partnerLoc={settings.longDistance.partnerLoc}
            />
          </div>
        )}
      </div>

      <MemoryCarousel />
      <EventHorizon />
      <DailyQuestion />

      {/* Footer Navigation */}
      <div style={{ marginTop: '30px', paddingBottom: '120px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button onClick={() => setActiveView('recap')} style={{ padding: '12px 24px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Year in Review
        </button>

        <button onClick={() => setActiveView('legacy')} style={{ padding: '12px 24px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5" /><path d="M22 12h-5" /><path d="M7 12l2-2 2 2 2-2 2 2" /><rect x="2" y="7" width="20" height="10" rx="3" /></svg>
          Legacy Check
        </button>
      </div>

      <Navbar onNavigate={handleNavigate} activeView={activeView} />
      <AnniversaryOverlay />
      <MilestoneCelebration />


      {isNightOwl && (
        <div style={{
          marginTop: '20px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.5)', padding: '5px 15px', borderRadius: '20px',
          marginBottom: '100px'
        }}>
          <span title="Secret Night Mode Active">🌛</span>
          <p style={{ margin: 0, fontWeight: '500' }}>The night is ours.</p>
        </div>
      )}
    </>
  );
}

export default App;
