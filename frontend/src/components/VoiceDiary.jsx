import React, { useState, useEffect, useRef } from 'react';
import { saveAudio, getAudio, deleteAudio } from '../utils/db';
import { storage } from '../utils/storageAdapter';

const VoiceDiary = ({ onClose }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0); // 0-100
    const [playbackTime, setPlaybackTime] = useState(0);

    // Missing State
    const [entries, setEntries] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [permState, setPermState] = useState('prompt'); // 'prompt', 'granted', 'denied'
    const [playingId, setPlayingId] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false); // For heart burst feedback
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // For delete confirmation modal

    // Missing Refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(new Audio());
    const pressTimerRef = useRef(null); // To detect actual "hold" intent vs tap

    // Load entries on mount using storage adapter
    useEffect(() => {
        const saved = storage.get(storage.KEYS.VOICE_ENTRIES, []);
        setEntries(saved);
    }, []);

    // Heart burst effect reset
    useEffect(() => {
        if (saveSuccess) {
            const t = setTimeout(() => setSaveSuccess(false), 2000);
            return () => clearTimeout(t);
        }
    }, [saveSuccess]);

    // CRITICAL: Clean up timer on unmount to prevent memory leak
    useEffect(() => {
        return () => {
            stopTimer();
            // Also stop any active recording if component unmounts
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            // CRITICAL: Stop and clean up audio to prevent background playback
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current.load(); // Force release of any audio resources
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermState('granted');

            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                // If recording was super short (< 1s), discard it (accidental tap)
                if (chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) < 1000) { // Rough size check, or better check duration
                    // check handled in handleMouseUp roughly, but here we can just save
                }

                const id = Date.now();
                const newEntry = {
                    id,
                    date: new Date().toISOString(),
                    title: `Capsule ${new Date().toLocaleDateString()}`,
                    duration: recordingDuration
                };

                await saveAudio(id, blob);
                const updated = [newEntry, ...entries];
                setEntries(updated);
                storage.set(storage.KEYS.VOICE_ENTRIES, updated);
                stream.getTracks().forEach(track => track.stop());

                setRecordingDuration(0);
                setIsPaused(false);
                setSaveSuccess(true); // Trigger success animation
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingDuration(0);

            startTimer();

        } catch (err) {
            console.error("Mic error:", err);
            setPermState('denied');
            alert("Microphone access denied. Please enable it in your browser settings.");
        }
    };

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            stopTimer();
        }
    };

    // Interaction Handlers for "Hold to Record"
    const handlePressStart = (e) => {
        if (e.button !== 0 && e.type === 'mousedown') return; // Only left click or touch
        if (permState === 'denied') return;

        // If already recording, stop it (toggle behavior)
        if (isRecording) {
            stopRecording();
            return;
        }

        // Start recording
        startRecording();
    };

    const handlePressEnd = (e) => {
        // Only stop on release if we're in "hold to record" mode
        // Since we now support tap-to-stop, we don't need to stop here
        // This prevents double-stop issues
    };


    const playEntry = async (id) => {
        if (playingId === id) {
            // Toggle Pause/Play
            if (audioRef.current.paused) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
            return;
        }

        try {
            const blob = await getAudio(id);
            if (blob) {
                const url = URL.createObjectURL(blob);
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingId(id);

                audioRef.current.ontimeupdate = () => {
                    setPlaybackTime(audioRef.current.currentTime);
                    if (audioRef.current.duration) {
                        setPlaybackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                    }
                };

                audioRef.current.onended = () => {
                    setPlayingId(null);
                    setPlaybackProgress(0);
                    setPlaybackTime(0);
                    URL.revokeObjectURL(url);
                };
            } else {
                alert("Audio file not found.");
            }
        } catch (e) {
            console.error("Playback failed", e);
        }
    };

    // Show delete confirmation modal
    const requestDelete = (id) => {
        setDeleteConfirmId(id);
    };

    // Perform the actual delete
    const confirmDelete = async () => {
        if (!deleteConfirmId) return;

        // CRITICAL: Stop playback if this entry is currently playing
        if (playingId === deleteConfirmId) {
            audioRef.current.pause();
            audioRef.current.src = '';
            setPlayingId(null);
            setPlaybackProgress(0);
            setPlaybackTime(0);
        }

        await deleteAudio(deleteConfirmId);
        const updated = entries.filter(e => e.id !== deleteConfirmId);
        setEntries(updated);
        storage.set(storage.KEYS.VOICE_ENTRIES, updated);
        setDeleteConfirmId(null);
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)',
            zIndex: 3000,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            padding: '80px 16px 110px 16px',
            color: 'white',
            backdropFilter: 'blur(20px)'
        }}>
            {/* Grain/Vignette Overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                pointerEvents: 'none', zIndex: 0, opacity: 0.4
            }} />
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Background Atmosphere Blobs */}
            <div className={isRecording ? "animate-pulse-slow" : ""} style={{ position: 'fixed', top: '-10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'all 0.5s' }} />
            <div className={isRecording ? "animate-pulse-slow" : ""} style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'all 0.5s' }} />

            <button
                onClick={onClose}
                className="no-print"
                aria-label="Close Voice Diary"
                style={{
                    position: 'fixed', top: '24px', right: '24px',
                    fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)', width: '48px', height: '48px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', zIndex: 3001,
                    color: 'white',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onFocus={e => e.currentTarget.style.outline = '2px solid var(--accent-lux)'}
                onBlur={e => e.currentTarget.style.outline = 'none'}
            >✕</button>

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>


                {/* Premium Badge with Shimmer */}
                <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 114, 182, 0.15) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontSize: '0.75rem',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#f87171',
                    marginBottom: '20px',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: '600'
                }}>
                    {/* Shimmer overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer-badge 3s ease-in-out infinite',
                        pointerEvents: 'none'
                    }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>🎙️ Spoken Hearts 🎙️</span>
                </div>

                {/* Premium Title */}
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.8rem',
                    margin: '0 0 12px 0',
                    background: 'linear-gradient(135deg, #fff 0%, #f87171 50%, #F472B6 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 4s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 4px 20px rgba(239, 68, 68, 0.3))',
                    letterSpacing: '-1px',
                    fontWeight: '700'
                }}>Voice Capsules</h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-serif)',
                    maxWidth: '400px',
                    margin: '0 auto 50px',
                    fontStyle: 'italic'
                }}>Your future selves are waiting to hear this</p>

                {/* Compact Recorder UI */}
                <div className="glass-card" style={{
                    padding: '20px 24px',
                    background: isRecording ? 'rgba(30, 41, 59, 0.95)' : 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '24px',
                    marginBottom: '24px',
                    backdropFilter: 'blur(15px)',
                    border: isRecording ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isRecording ? '0 0 40px rgba(239, 68, 68, 0.15)' : '0 12px 40px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Subtle Waveform Animation (CSS only) */}
                    {isRecording && (
                        <div style={{
                            position: 'absolute', top: '0', left: '0', width: '200%', height: '100%',
                            opacity: 0.08, pointerEvents: 'none',
                            background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, #fff 3px, #fff 5px)',
                            animation: 'waveform 15s linear infinite'
                        }} />
                    )}
                    <style>{`
                        @keyframes waveform { 
                            0% { transform: translateX(0); } 
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes ripple {
                            0% { transform: scale(1); opacity: 0.5; }
                            100% { transform: scale(2); opacity: 0; }
                        }
                        @keyframes pulse-ring {
                            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                            50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                        }
                     `}</style>

                    {saveSuccess && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 10,
                            animation: 'fadeIn 0.2s'
                        }}>
                            <div style={{ fontSize: '2.5rem', animation: 'float 0.8s infinite' }}>❤️</div>
                        </div>
                    )}

                    {/* Horizontal Layout */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* Mic Button */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {isRecording && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    borderRadius: '50%', background: 'rgba(239, 68, 68, 0.4)',
                                    animation: 'ripple 1.2s infinite ease-out'
                                }} />
                            )}
                            <button
                                onMouseDown={handlePressStart}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                onTouchStart={(e) => { e.preventDefault(); handlePressStart(e); }}
                                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(e); }}
                                disabled={permState === 'denied'}
                                style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: isRecording
                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                        : permState === 'denied'
                                            ? '#475569'
                                            : 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)',
                                    color: isRecording ? 'white' : 'var(--bg-color)',
                                    border: 'none',
                                    boxShadow: isRecording
                                        ? '0 4px 20px rgba(239, 68, 68, 0.5)'
                                        : '0 8px 24px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.1)',
                                    fontSize: '1.5rem',
                                    cursor: permState === 'denied' ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isRecording ? 'scale(1.05)' : 'scale(1)',
                                    position: 'relative', zIndex: 2,
                                    animation: isRecording ? 'pulse-ring 1.5s infinite' : 'none'
                                }}
                            >
                                {isRecording ? '⏹' : '🎙️'}
                            </button>
                        </div>

                        {/* Timer & Status */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '2rem',
                                fontFamily: 'monospace',
                                fontWeight: '500',
                                color: isRecording ? '#f87171' : 'white',
                                textShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
                                transition: 'all 0.3s',
                                marginBottom: '4px',
                                letterSpacing: '2px'
                            }}>
                                {isRecording ? formatTime(recordingDuration) : '0:00'}
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                color: isRecording ? '#fca5a5' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.5px',
                                transition: 'color 0.3s'
                            }}>
                                {permState === 'denied'
                                    ? 'Microphone access denied'
                                    : isRecording
                                        ? 'Recording... tap to stop'
                                        : entries.length === 0
                                            ? 'Tap to capture your first thought'
                                            : 'Tap to record a new message'}
                            </p>
                        </div>

                        {/* Recording indicator dot */}
                        {isRecording && (
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                animation: 'pulse 1s infinite',
                                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                                flexShrink: 0
                            }} />
                        )}
                    </div>
                </div>

                {/* List */}
                <div style={{ textAlign: 'left', paddingBottom: '100px' }}>
                    {entries.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '32px 24px',
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            position: 'relative'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>📼</span>
                                <span style={{
                                    fontSize: '1rem',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: '500'
                                }}>Your voice capsules will appear here</span>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.4)',
                                fontStyle: 'italic'
                            }}>
                                Record moments you want to remember forever
                            </p>
                        </div>
                    )}

                    {entries.map(entry => (
                        <div key={entry.id} className="glass-card" style={{
                            marginBottom: '20px', padding: '25px',
                            display: 'flex', flexDirection: 'column', gap: '15px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white', marginBottom: '5px' }}>{entry.title}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} • {formatTime(entry.duration || 0)}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => playEntry(entry.id)}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            background: playingId === entry.id ? 'var(--accent-lux-gradient)' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: playingId === entry.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.4rem',
                                            transition: 'all 0.2s',
                                            boxShadow: playingId === entry.id ? '0 5px 20px rgba(236, 72, 153, 0.4)' : 'none'
                                        }}
                                    >
                                        {playingId === entry.id ? '⏸' : '▶'}
                                    </button>
                                    <button
                                        onClick={() => requestDelete(entry.id)}
                                        aria-label="Delete voice note"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.1rem', color: '#f87171', padding: '10px' }}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar (Only for playing item) */}
                            {playingId === entry.id && (
                                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${playbackProgress}%`, height: '100%', background: 'var(--accent-lux-gradient)', transition: 'width 0.1s linear', borderRadius: '3px' }} />
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', width: '40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                        {formatTime(playbackTime)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={cancelDelete}
                >
                    <div
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '28px',
                            padding: '32px 28px',
                            maxWidth: '340px',
                            width: '90%',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Warning Icon */}
                        <div style={{
                            width: '72px', height: '72px',
                            margin: '0 auto 20px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <span style={{ fontSize: '2rem' }}>🗑️</span>
                        </div>

                        <h3 style={{
                            color: 'white',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            margin: '0 0 12px 0',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            Delete Voice Note?
                        </h3>

                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            margin: '0 0 28px 0',
                            lineHeight: '1.5'
                        }}>
                            This memory will be permanently erased from your diary. This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Keep It
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceDiary;
