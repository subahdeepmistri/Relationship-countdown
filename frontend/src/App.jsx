import React, { useState, useEffect } from 'react';
import { useRelationship } from './context/RelationshipContext';

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
import ScrapbookView from './components/ScrapbookView';
import TimeCapsuleManager from './components/TimeCapsuleManager';
import DistanceClock from './components/DistanceClock';
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
import { getProfileImage } from './utils/db'; // Keep DB for blobs until migrated (optional)
import { getStartDate } from './utils/relationshipLogic'; // Can likely be replaced by context data

import SecurityLock from './components/SecurityLock';
import { checkAnniversaryNotification } from './utils/notifications';
import { useWasm } from './hooks/useWasm';
import { checkGentleReminder } from './utils/reminders';

function App() {
  const { relationship, settings, updateRelationship, updateSettings } = useRelationship();

  // Local Session State (Navigation & Security)
  const [activeView, setActiveView] = useState('home');
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(!settings.appLockEnabled);
  const [isNightOwl, setIsNightOwl] = useState(false);
  const [profileImages, setProfileImages] = useState({ left: null, right: null });

  // WAZM Hook for calculations
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
        events: [{ id: 'shared-start', title: 'The Beginning', date: sharedDate, emoji: '❤️', isMain: true }]
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

    // Check Wasm Anniversary
    const status = getAnniversaryCountdown();
    if (status && status.is_today) {
      checkAnniversaryNotification(true);
    }
  }, [getAnniversaryCountdown, updateRelationship]); // Added updateRelationship to dependencies

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
  const handleNavigate = (view) => setActiveView(view);
  const handleClose = () => setActiveView('home');

  // --- RENDER GATES ---

  // 1. Security Lock (Pin required?)
  // If app lock is enabled within settings, but session is not unlocked
  if (settings.appLockEnabled && !isSessionUnlocked) {
    return <SecurityLock initialMode="verify" onSuccess={() => setIsSessionUnlocked(true)} />;
  }

  // 2. Onboarding Flow
  if (!relationship.startDate) {
    return <WelcomeScreen onComplete={() => window.location.reload()} />;
    // Note: WelcomeScreen likely reloads internally or we can fix it too. 
    // Ideally it should call updateRelationship and we re-render. 
    // But for now, let's leave WelcomeScreen as is or it might break if it expects reload.
    // Actually, if WelcomeScreen updates LS, Context won't know unless we hook it up.
    // But Context loads from LS on mount. Updates to LS *after* mount won't auto-update Context
    // unless we use the 'storage' event or the Context setters.
    // *Critical*: The WelcomeScreen must be refactored to use Context setters, OR we allow the reload there.
    // User said "Rewrite from scratch". Checking WelcomeScreen next would be smart.
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
    if (relationship.partner1 && relationship.partner2) return `${relationship.partner1} ❤️ ${relationship.partner2}`;

    const type = settings.anniversaryType || 'couple';
    const map = { 'couple': 'Us', 'birthday': 'B-Day', 'wedding': 'Vows', 'general': 'Time', 'puppy': 'Puppy', 'kitten': 'Kitty' };
    return map[type] || 'Us';
  };

  return (
    <>
      <ThemeBackground />

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

      {/* Settings & Overlays */}
      <Settings
        isOpen={activeView === 'settings'}
        onClose={handleClose}
        onEditPhotos={() => setActiveView('edit-photos')}
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

      <div className="app-container" style={{ paddingBottom: '150px' }}>
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
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
              color: 'var(--accent-primary)', marginBottom: '8px',
              border: '1px solid rgba(249, 115, 22, 0.1)', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
              EST. {new Date(relationship.startDate).getFullYear() || new Date().getFullYear()}
            </span>
            <h1 style={{
              margin: '0 0 5px 0', fontSize: '1.8rem', color: 'var(--text-primary)',
              letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              {getTitle()}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', opacity: 0.85, fontWeight: '500' }}>
              Tracking love, one day at a time
            </p>
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

          <div className="pop-card" style={{ padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ❤️ Daily Vibe
            </h3>
            <MoodPulse />
          </div>

          <MessageCard />
          <LoveNotes />
        </div>

        {settings.longDistance.enabled && (
          <div className="glass-card bento-item-full">
            <DistanceClock
              partnerOffset={settings.longDistance.offset}
              meetingDate={settings.longDistance.meet}
            />
          </div>
        )}
      </div>

      <MemoryCarousel />
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
