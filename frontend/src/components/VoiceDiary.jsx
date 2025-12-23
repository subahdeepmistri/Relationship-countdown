import React, { useState, useEffect, useRef } from 'react';
import { saveAudio, getAudio, deleteAudio } from '../utils/db'; // Make sure this path is correct

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

    // Missing Refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(new Audio());
    const pressTimerRef = useRef(null); // To detect actual "hold" intent vs tap

    // Load entries on mount
    useEffect(() => {
        const saved = localStorage.getItem('rc_voice_entries');
        if (saved) {
            try {
                setEntries(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse voice entries", e);
            }
        }
    }, []);

    // Heart burst effect reset
    useEffect(() => {
        if (saveSuccess) {
            const t = setTimeout(() => setSaveSuccess(false), 2000);
            return () => clearTimeout(t);
        }
    }, [saveSuccess]);

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
                localStorage.setItem('rc_voice_entries', JSON.stringify(updated));
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

        // Visual feedback immediate, but recording starts
        startRecording();
    };

    const handlePressEnd = (e) => {
        // Stop immediately on release
        if (isRecording) {
            // If duration was 0 (instant tap), we could discard, but let's just save for simplicity or logic check inside onstop
            stopRecording();
        }
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

    // ... deleteEntry and formatTime remain same ...
    const deleteEntry = async (id) => {
        if (!window.confirm("Delete this voice note permanently?")) return;
        await deleteAudio(id);
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        localStorage.setItem('rc_voice_entries', JSON.stringify(updated));
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)', // Reference Radial
            zIndex: 3000,
            overflowY: 'auto',
            padding: '80px 20px 110px 20px',
            color: 'white', // Default text white
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
                style={{
                    position: 'fixed', top: '24px', right: '24px',
                    fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)', width: '48px', height: '48px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 3001,
                    color: 'white',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >✕</button>

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'inline-block', padding: '6px 16px', borderRadius: '30px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)', marginBottom: '15px', backdropFilter: 'blur(5px)'
                }}>
                    Spoken Hearts
                </div>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.5rem',
                    marginBottom: '10px',
                    background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    letterSpacing: '-1px'
                }}>Voice Capsules 🎙️</h2>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-serif)', maxWidth: '400px', margin: '0 auto 50px' }}>
                    Your future selves are waiting to hear this.
                </p>

                {/* Recorder UI */}
                <div className="glass-card" style={{
                    padding: '50px 30px',
                    background: isRecording ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '40px',
                    marginBottom: '50px',
                    backdropFilter: 'blur(15px)',
                    border: isRecording ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isRecording ? '0 0 50px rgba(239, 68, 68, 0.2)' : '0 20px 60px rgba(0,0,0,0.4)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Soft Waveform Animation (CSS only) */}
                    {isRecording && (
                        <div style={{
                            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                            opacity: 0.1, pointerEvents: 'none',
                            background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
                            animation: 'waveform 20s linear infinite'
                        }} />
                    )}
                    <style>{`
                        @keyframes waveform { 
                            0% { transform: translateX(0); } 
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes ripple {
                            0% { transform: scale(1); opacity: 0.6; }
                            100% { transform: scale(2.5); opacity: 0; }
                        }
                     `}</style>

                    {saveSuccess && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', zIndex: 10,
                            animation: 'fadeIn 0.3s'
                        }}>
                            <div style={{ fontSize: '4rem', animation: 'float 1s infinite' }}>❤️</div>
                        </div>
                    )}

                    <div style={{
                        fontSize: '4rem',
                        fontFamily: 'monospace',
                        marginBottom: '40px',
                        color: isRecording ? '#ef4444' : 'white',
                        textShadow: isRecording ? '0 0 30px rgba(239, 68, 68, 0.6)' : 'none',
                        transition: 'all 0.3s',
                        fontWeight: 'lighter'
                    }}>
                        {isRecording ? formatTime(recordingDuration) : '0:00'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        {/* Hold to Record Button */}
                        <div style={{ position: 'relative' }}>
                            {/* Ripple Effect Ring */}
                            {isRecording && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    borderRadius: '50%', background: 'rgba(239, 68, 68, 0.5)',
                                    animation: 'ripple 1.5s infinite linear'
                                }} />
                            )}

                            <button
                                onMouseDown={handlePressStart}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                onTouchStart={(e) => { e.preventDefault(); handlePressStart(e); }} // Prevent default to avoid ghost click
                                onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(e); }}
                                disabled={permState === 'denied'}
                                style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: isRecording ? '#ef4444' : permState === 'denied' ? '#475569' : 'white',
                                    color: isRecording ? 'white' : 'var(--bg-color)',
                                    border: 'none',
                                    boxShadow: isRecording
                                        ? '0 0 0 6px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.6)'
                                        : '0 15px 40px rgba(0,0,0,0.3), inset 0 -5px 10px rgba(0,0,0,0.1)',
                                    fontSize: '2rem', cursor: permState === 'denied' ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                                    position: 'relative', zIndex: 2
                                }}
                            >
                                {isRecording ? '⬛' : '🎙️'}
                            </button>
                        </div>

                        <p style={{
                            marginTop: '10px', fontSize: '0.9rem',
                            color: isRecording ? '#fca5a5' : '#94a3b8',
                            letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600',
                            transition: 'color 0.3s'
                        }}>
                            {permState === 'denied' ? 'Microphone Access Denied' : isRecording ? 'Recording... Release to Save' : 'Hold to Record'}
                        </p>
                    </div>
                </div>

                {/* List */}
                <div style={{ textAlign: 'left', paddingBottom: '100px' }}>
                    {entries.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            opacity: 0.6,
                            padding: '60px 20px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '30px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📼</span>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#cbd5e1' }}>No shared thoughts yet.<br />Break the silence.</p>
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
                                        onClick={() => deleteEntry(entry.id)}
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
        </div>
    );
};

export default VoiceDiary;
