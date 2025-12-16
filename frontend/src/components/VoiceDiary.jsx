import React, { useState, useEffect, useRef } from 'react';
import { saveAudio, getAudio, deleteAudio } from '../utils/db'; // Make sure this path is correct

const VoiceDiary = ({ onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [entries, setEntries] = useState([]);
    const [playingId, setPlayingId] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioRef = useRef(new Audio());
    const timerRef = useRef(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('rc_voice_entries') || '[]');
        setEntries(saved);

        return () => {
            audioRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Safari support: check for mp4, otherwise webm
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
                mimeType = 'audio/aac';
            }

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
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Start Timer
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic error:", err);
            alert("Microphone access denied or not available. Please check settings.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const playEntry = async (id) => {
        if (playingId === id) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        try {
            const blob = await getAudio(id);
            if (blob) {
                const url = URL.createObjectURL(blob);
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingId(id);
                audioRef.current.onended = () => {
                    setPlayingId(null);
                    URL.revokeObjectURL(url);
                };
            } else {
                alert("Audio file not found in storage.");
            }
        } catch (e) {
            console.error("Playback failed", e);
        }
    };

    const deleteEntry = async (id) => {
        if (!confirm("Delete this voice note?")) return;
        await deleteAudio(id);
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        localStorage.setItem('rc_voice_entries', JSON.stringify(updated));
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'var(--bg-gradient)',
            zIndex: 3000,
            overflowY: 'auto',
            padding: '40px 20px',
            color: 'var(--text-primary)'
        }}>
            <button
                onClick={onClose}
                style={{
                    position: 'fixed', top: '20px', right: '20px',
                    fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)', width: '45px', height: '45px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.5)', cursor: 'pointer', zIndex: 3001,
                    color: 'var(--text-primary)'
                }}
            >✕</button>

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '10px' }}>Voice Capsules 🎙️</h2>
                <p style={{ opacity: 0.7, marginBottom: '40px' }}>Record a message for your future selves.</p>

                {/* Recorder UI */}
                <div style={{ padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '30px', marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '2rem', fontFamily: 'monospace', marginBottom: '20px', color: isRecording ? '#e74c3c' : 'var(--text-primary)' }}>
                        {isRecording ? formatTime(recordingDuration) : '0:00'}
                    </div>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: isRecording ? '#e74c3c' : 'var(--text-primary)',
                            color: 'white', border: 'none',
                            boxShadow: isRecording ? '0 0 0 10px rgba(231, 76, 60, 0.2)' : '0 10px 20px rgba(0,0,0,0.1)',
                            fontSize: '1.5rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isRecording ? '⬛' : '●'}
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.6 }}>
                        {isRecording ? 'Recording... Tap to Stop' : 'Tap to Record'}
                    </p>
                </div>

                {/* List */}
                <div style={{ textAlign: 'left' }}>
                    {entries.map(entry => (
                        <div key={entry.id} className="glass-card" style={{
                            marginBottom: '15px', padding: '20px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: '#FFFFFF'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{entry.title}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                    {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {formatTime(entry.duration || 0)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    onClick={() => playEntry(entry.id)}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: playingId === entry.id ? 'var(--accent-color)' : '#f0f0f0',
                                        color: playingId === entry.id ? 'white' : 'black',
                                        border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {playingId === entry.id ? '⏸' : '▶'}
                                </button>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '1.2rem' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VoiceDiary;
