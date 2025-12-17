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

    // Missing Refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(new Audio());

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
                const id = Date.now();
                const newEntry = {
                    id,
                    date: new Date().toISOString(),
                    title: `Entry ${new Date().toLocaleDateString()}`,
                    duration: recordingDuration
                };

                await saveAudio(id, blob);
                const updated = [newEntry, ...entries];
                setEntries(updated);
                localStorage.setItem('rc_voice_entries', JSON.stringify(updated));
                stream.getTracks().forEach(track => track.stop());
                setRecordingDuration(0);
                setIsPaused(false);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsPaused(false);

            startTimer();

        } catch (err) {
            console.error("Mic error:", err);
            setPermState('denied');
            alert("Microphone access denied. Please enable it in your browser settings.");
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            stopTimer();
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            startTimer();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            stopTimer();
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
            background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', // Deep Night Blue
            zIndex: 3000,
            overflowY: 'auto',
            padding: '40px 20px',
            color: 'white', // Default text white
            backdropFilter: 'blur(20px)'
        }}>
            {/* Background Atmosphere Blobs */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <button
                onClick={onClose}
                className="no-print"
                style={{
                    position: 'fixed', top: '20px', right: '20px',
                    fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)', width: '45px', height: '45px',
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
                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3rem',
                    marginBottom: '10px',
                    background: 'linear-gradient(to right, #fff, #a5f3fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(165, 243, 252, 0.3)'
                }}>Voice Capsules 🎙️</h2>
                <p style={{ opacity: 0.8, marginBottom: '50px', color: '#cbd5e1', fontSize: '1.1rem' }}>Record a message for your future selves.</p>

                {/* Recorder UI */}
                <div className="glass-card" style={{
                    padding: '50px 30px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '40px',
                    marginBottom: '50px',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                }}>
                    <div style={{
                        fontSize: '3.5rem',
                        fontFamily: 'monospace',
                        marginBottom: '30px',
                        color: isRecording ? '#ef4444' : 'white',
                        textShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none',
                        transition: 'color 0.3s'
                    }}>
                        {isRecording ? formatTime(recordingDuration) : '0:00'}
                    </div>

                    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Record/Stop Button */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={permState === 'denied'}
                            style={{
                                width: '90px', height: '90px', borderRadius: '50%',
                                background: isRecording ? '#ef4444' : permState === 'denied' ? '#475569' : 'white',
                                color: isRecording ? 'white' : 'var(--bg-color)',
                                border: 'none',
                                boxShadow: isRecording ? '0 0 0 10px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.6)' : '0 10px 30px rgba(255,255,255,0.4)',
                                fontSize: '1.5rem', cursor: permState === 'denied' ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                transform: isRecording ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            {isRecording ? '⬛' : '●'}
                        </button>

                        {/* Pause/Resume Button (Only visible when recording) */}
                        {isRecording && (
                            <button
                                onClick={isPaused ? resumeRecording : pauseRecording}
                                style={{
                                    width: '70px', height: '70px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', cursor: 'pointer',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                {isPaused ? '▶' : '⏸'}
                            </button>
                        )}
                    </div>

                    <p style={{ marginTop: '25px', fontSize: '1rem', opacity: 0.7, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {permState === 'denied' ? 'Microphone Access Denied' : isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Tap to Record'}
                    </p>
                </div>

                {/* List */}
                <div style={{ textAlign: 'left', paddingBottom: '100px' }}>
                    {entries.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            opacity: 0.5,
                            padding: '40px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📼</span>
                            Your voice diary is empty.
                        </div>
                    )}

                    {entries.map(entry => (
                        <div key={entry.id} className="glass-card" style={{
                            marginBottom: '20px', padding: '25px',
                            display: 'flex', flexDirection: 'column', gap: '15px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'white', marginBottom: '5px' }}>{entry.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {formatTime(entry.duration || 0)}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => playEntry(entry.id)}
                                        style={{
                                            width: '50px', height: '50px', borderRadius: '50%',
                                            background: playingId === entry.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: playingId === entry.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {playingId === entry.id ? '⏸' : '▶'}
                                    </button>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.2rem', color: '#f87171', padding: '5px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar (Only for playing item) */}
                            {playingId === entry.id && (
                                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${playbackProgress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.1s linear', borderRadius: '3px' }} />
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
