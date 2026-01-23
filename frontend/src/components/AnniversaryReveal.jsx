import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import SyncManager from './SyncManager';
import './AnniversaryReveal.css';

// REVEAL TIME: January 24th, 2026 at 12:00 AM (midnight) IST
const REVEAL_DATE = new Date('2026-01-24T00:00:00+05:30');

function AnniversaryReveal({ children }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [showTransition, setShowTransition] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showSyncManager, setShowSyncManager] = useState(false);

    // Triple-tap detection for secret sync access
    const tapCountRef = useRef(0);
    const tapTimerRef = useRef(null);

    useEffect(() => {
        // Check for dev bypass
        const params = new URLSearchParams(window.location.search);
        if (params.get('unlock') === 'true') {
            setIsUnlocked(true);
            setIsRevealed(true);
            return;
        }

        // Check for sync bypass
        if (params.get('sync') === 'true') {
            setShowSyncManager(true);
            return;
        }

        // Check if already past reveal time
        const checkTime = () => {
            const now = new Date();
            if (now >= REVEAL_DATE) {
                triggerReveal();
                return true;
            }
            return false;
        };

        // Initial check
        if (!checkTime()) {
            // Check every second until reveal
            const timer = setInterval(() => {
                if (checkTime()) {
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, []);

    // Handle secret triple-tap on heart to access sync
    const handleSecretTap = () => {
        tapCountRef.current += 1;

        // Clear previous timer
        if (tapTimerRef.current) {
            clearTimeout(tapTimerRef.current);
        }

        // If 3 taps within 1 second, open sync
        if (tapCountRef.current >= 3) {
            tapCountRef.current = 0;
            setShowSyncManager(true);
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(100);
        } else {
            // Reset tap count after 1 second
            tapTimerRef.current = setTimeout(() => {
                tapCountRef.current = 0;
            }, 1000);
        }
    };

    const triggerReveal = () => {
        setShowTransition(true);

        // Fire confetti burst
        const duration = 4000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#FB7185', '#F472B6', '#FDA4AF', '#FDE68A', '#FFFFFF']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#FB7185', '#F472B6', '#FDA4AF', '#FDE68A', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // After transition, show the app
        setTimeout(() => {
            setIsRevealed(true);
        }, 5000);
    };

    // Show Sync Manager overlay if secret accessed
    if (showSyncManager && !isRevealed) {
        return <SyncManager onClose={() => setShowSyncManager(false)} />;
    }

    // If revealed, render the app
    if (isRevealed) {
        return children;
    }

    // Transition screen (at reveal moment)
    if (showTransition) {
        return (
            <div className="reveal-container reveal-transition">
                <div className="reveal-content">
                    {/* Floating Elements */}
                    <div className="floating-elements">
                        <span className="float-item dumbbell left">💪</span>
                        <span className="float-item heart-main">💖</span>
                        <span className="float-item dumbbell right">💪</span>
                    </div>

                    {/* Main Reveal Message */}
                    <div className="reveal-message">
                        <h1 className="reveal-title fade-in-up">3 Years</h1>
                        <p className="reveal-subtitle fade-in-up delay-1">
                            ...and every rep was worth it 💖
                        </p>
                        <div className="reveal-tagline fade-in-up delay-2">
                            <span className="sparkle">✨</span>
                            Where our story began... in the gym
                            <span className="sparkle">✨</span>
                        </div>
                    </div>

                    {/* Pulsing Heart */}
                    <div className="heart-pulse-container">
                        <div className="heart-pulse">💗</div>
                        <div className="heart-ring ring-1"></div>
                        <div className="heart-ring ring-2"></div>
                        <div className="heart-ring ring-3"></div>
                    </div>

                    <p className="loading-text fade-in-up delay-3">Opening your surprise...</p>
                </div>
            </div>
        );
    }

    // Teaser screen (before reveal)
    return (
        <div className="reveal-container teaser-screen">
            <div className="reveal-content">
                {/* Floating Gym Elements */}
                <div className="floating-elements">
                    <span className="float-item dumbbell left">💪</span>
                    <span className="float-item heart-main pulse-heart">💖</span>
                    <span className="float-item dumbbell right">💪</span>
                </div>

                {/* Main Teaser Message */}
                <div className="teaser-message">
                    {/* SECRET: Triple-tap heart to access sync */}
                    <div
                        className="teaser-icon"
                        onClick={handleSecretTap}
                        style={{ cursor: 'pointer' }}
                        title="Something hidden here..."
                    >
                        <div className="heart-glow">💕</div>
                    </div>

                    <h2 className="teaser-title">Something Special</h2>
                    <h3 className="teaser-subtitle">is loading for you...</h3>

                    <div className="teaser-hint">
                        <span className="sparkle-small">✨</span>
                        Where we first met
                        <span className="sparkle-small">✨</span>
                    </div>
                </div>

                {/* Loading Dots */}
                <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>

                {/* Decorative Elements */}
                <div className="gym-backdrop">
                    <div className="backdrop-dumbbell left-deco">🏋️</div>
                    <div className="backdrop-heart center-deco">💗</div>
                    <div className="backdrop-dumbbell right-deco">🏋️</div>
                </div>
            </div>
        </div>
    );
}

export default AnniversaryReveal;

