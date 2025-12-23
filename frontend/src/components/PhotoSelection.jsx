import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveProfileImage, getProfileImage } from '../utils/db'; // Added getProfileImage import
import '../styles/theme.css';

const PhotoSelection = ({ onSelect, onBack, isEditing = false }) => {
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);

    // Name State
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');

    // Persistence IDs for animation (tracks "who" is in the slot)
    const [slotIds, setSlotIds] = useState(['p1-id', 'p2-id']);

    // Dirty Checking State
    const [initialNames, setInitialNames] = useState({ n1: '', n2: '' });
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [showHeartText, setShowHeartText] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Derived state for dirty checking
    const hasChanges = img1 || img2 || name1 !== initialNames.n1 || name2 !== initialNames.n2;

    // Lock body scroll when component acts as a full-screen modal
    useEffect(() => {
        // Prevent scrolling on the main page
        document.body.style.overflow = 'hidden';

        // Cleanup: Re-enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Initial Load for Edit Mode & Names
    useEffect(() => {
        // Load names from localStorage

        const storedName1 = localStorage.getItem('rc_partner1') || '';
        const storedName2 = localStorage.getItem('rc_partner2') || '';
        if (storedName1) setName1(storedName1);
        if (storedName2) setName2(storedName2);

        // Capture initial state for dirty checking
        setInitialNames({ n1: storedName1, n2: storedName2 });

        if (isEditing) {
            Promise.all([
                getProfileImage('profile_1'),
                getProfileImage('profile_2')
            ]).then(([blob1, blob2]) => {
                if (blob1) setPreview1(URL.createObjectURL(blob1));
                if (blob2) setPreview2(URL.createObjectURL(blob2));
            });
        }
    }, [isEditing]);

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (index === 1) {
                setImg1(file);
                setPreview1(URL.createObjectURL(file));
            } else {
                setImg2(file);
                setPreview2(URL.createObjectURL(file));
            }
        }
    };

    const handleSwap = () => {
        // Swap Names
        const tempName = name1;
        setName1(name2);
        setName2(tempName);

        // Swap Previews
        const tempPreview = preview1;
        setPreview1(preview2);
        setPreview2(tempPreview);

        const tempImg = img1;
        setImg1(img2);
        setImg2(tempImg);

        // Swap IDs to trigger layout animation
        setSlotIds([slotIds[1], slotIds[0]]);
    };

    const handleNext = async () => {
        setIsSaving(true);
        // Save to IndexedDB
        // Note: Logic handles if img is null (keeps existing) or new file
        if (img1) await saveProfileImage('profile_1', img1);
        if (img2) await saveProfileImage('profile_2', img2);

        // Save Names to LocalStorage
        localStorage.setItem('rc_partner1', name1);
        localStorage.setItem('rc_partner2', name2);

        // Create minimal delay for animation feel if operation is instant
        await new Promise(resolve => setTimeout(resolve, 800));

        setIsSaving(false);
        setSaveSuccess(true);
        setShowToast(true);

        // Notify parent after delay
        setTimeout(() => {
            onSelect();
        }, 1500);
    };

    // Neutral Default Avatar (Cute Cloud Style)
    const DEFAULT_AVATAR = "https://img.icons8.com/clouds/100/user.png";

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            // Opaque background to hide the home page content
            backgroundColor: '#0f172a', // Solid base color
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Gradient overlay
            zIndex: 99999, // Super high z-index to cover Navbar and everything else
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Effects */}
            <div className="blob" style={{
                position: 'fixed', top: '20%', left: '-10%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                filter: 'blur(50px)', zIndex: -1
            }}></div>
            <div className="blob" style={{
                position: 'fixed', bottom: '10%', right: '-10%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                filter: 'blur(50px)', zIndex: -1
            }}></div>

            {/* Header */}
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                position: 'relative',
                zIndex: 2
            }}>
                <button
                    onClick={() => {
                        if (hasChanges) {
                            setShowUnsavedModal(true);
                        } else {
                            onBack();
                        }
                    }}
                    style={{
                        width: '44px', height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ✕
                </button>
                <div>
                    <h2 style={{
                        fontSize: '1.8rem',
                        color: 'white',
                        fontWeight: '700',
                        margin: 0,
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        {isEditing ? 'Our Profile' : 'Setup'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', fontFamily: 'var(--font-serif)', opacity: 0.9 }}>
                        How you see each other here.
                    </p>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '320px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'popIn 0.3s ease-out'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💾</div>
                        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '1.2rem' }}>Save changes to your profile?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.5' }}>You have unsaved edits.</p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button onClick={handleNext} style={{
                                padding: '14px', background: 'var(--accent-lux-gradient)', color: 'white',
                                border: 'none', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Save Changes</button>
                            <button onClick={onBack} style={{
                                padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'
                            }}>Discard</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
                // Post-Avatar Spacing
                paddingBottom: '140px', // Extra padding for valid scroll space above fixed bottom bar
                position: 'relative',
                zIndex: 2
            }}>
                {/* Photo Area */}
                <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', marginBottom: '60px', width: '100%', maxWidth: '500px' }}>

                    {/* Left Photo & Name */}
                    <motion.div
                        layout
                        key={slotIds[0]}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="photo-container"
                        style={{ width: '130px', zIndex: 10 }} // Fixed width to prevent layout jump
                    >
                        <div className={`photo-ring ${!preview1 ? 'empty' : ''}`} style={{ boxShadow: preview1 ? '0 10px 30px rgba(0,0,0,0.2)' : 'none' }}>
                            <img
                                src={preview1 || DEFAULT_AVATAR}
                                alt="Profile 1"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', opacity: preview1 ? 1 : 0.6 }}
                            />
                        </div>
                        <label className="upload-btn">
                            <span className="camera-icon">📷</span> Change Photo
                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 1)} />
                        </label>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name1}
                            onChange={(e) => setName1(e.target.value)}
                            className="glass-input"
                            style={{
                                width: '120px',
                                marginTop: '10px',
                                textAlign: 'center',
                                padding: '8px 12px'
                            }}
                        />
                    </motion.div>

                    {/* Middle: Heart & Swap */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '22px', // Moved up ~8px
                        gap: '8px',
                        position: 'relative'
                    }}>
                        <div
                            onClick={() => {
                                setShowHeartText(true);
                                setTimeout(() => setShowHeartText(false), 2000);
                            }}
                            style={{
                                fontSize: '2.2rem', // Reduced from 2.5rem
                                color: '#EC4899',
                                animation: 'heartbeatLow 2s infinite ease-in-out',
                                filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.5))',
                                cursor: 'pointer',
                                userSelect: 'none',
                                transition: 'transform 0.2s'
                            }}>❤️</div>

                        {/* "Together" Text */}
                        <div style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            fontSize: '0.75rem', color: '#fda4af', whiteSpace: 'nowrap',
                            opacity: showHeartText ? 1 : 0, transition: 'opacity 0.5s ease',
                            fontFamily: 'var(--font-serif)', pointerEvents: 'none', marginTop: '5px'
                        }}>
                            Together.
                        </div>

                        <button
                            onClick={handleSwap}
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'rgba(255,255,255,0.8)',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s',
                                marginTop: '10px'
                            }}
                            title="Switch Sides"
                            className="swap-btn"
                        >
                            ⇄
                        </button>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>
                            Tap to switch
                        </p>
                    </div>

                    {/* Right Photo & Name */}
                    <motion.div
                        layout
                        key={slotIds[1]}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="photo-container"
                        style={{ width: '130px', zIndex: 10 }}
                    >
                        <div className="photo-ring" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <img
                                src={preview2 || DEFAULT_AVATAR}
                                alt="Profile 2"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>
                        <label className="upload-btn">
                            <span className="camera-icon">📷</span> Change Photo
                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 2)} />
                        </label>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name2}
                            onChange={(e) => setName2(e.target.value)}
                            className="glass-input"
                            style={{
                                width: '120px',
                                marginTop: '10px',
                                textAlign: 'center',
                                padding: '8px 12px'
                            }}
                        />
                    </motion.div>
                </div>

                {/* Input Helper Text */}
                <p style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.8rem',
                    fontFamily: "'Inter', sans-serif", // Clean sans-serif as requested
                    marginTop: '-40px', // Pull up closer to inputs
                    marginBottom: '40px', // More breathing room before card
                    letterSpacing: '0.3px',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    These names appear across your memories.
                </p>

                {/* Info Glass Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px', // Reduced from 24px
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>⭐</span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'white', fontFamily: 'var(--font-heading)' }}>The Main Characters</h3>
                    </div>

                    <p style={{ marginBottom: '15px', fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6', fontFamily: 'var(--font-serif)' }}>
                        Make this space feel like you.<br />
                        <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Tap ⇄ to switch sides.</span>
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9, filter: 'sepia(20%) hue-rotate(180deg) brightness(1.2)' }}>🔒</span>
                        <span>Details stay private on this device.</span>
                    </div>
                </div>
            </div >

            {/* Sticky Next Button */}
            < div style={{
                position: 'fixed',
                bottom: 0, left: 0, width: '100%',
                background: '#0f172a', // Solid background for the bar itself
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                display: 'flex', justifyContent: 'center',
                zIndex: 100000 // Even higher than the container to float on top
            }}>
                <button
                    onClick={handleNext}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '16px',
                        background: saveSuccess ? '#10B981' : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: saveSuccess ? '50px' : '20px',
                        fontSize: saveSuccess ? '1.5rem' : '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSaving ? 0.9 : 1,
                        boxShadow: hasChanges && !saveSuccess ? '0 10px 25px -5px rgba(236, 72, 153, 0.5)' : 'none',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        letterSpacing: '0.5px'
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {isSaving ? 'Saving...' : (saveSuccess ? '✔' : 'Save Changes')}
                </button>
            </div >

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            left: '50%',
                            translateX: '-50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            zIndex: 100001,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        <span>Profile updated ❤️</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Injected Styles */}
            < style > {`
                .photo-ring {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    padding: 4px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }
                .photo-ring.empty {
                    border: 2px dashed rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.02);
                }
                .photo-ring:active {
                    transform: scale(0.97);
                    border-color: rgba(255,255,255,0.3);
                    box-shadow: 0 0 20px rgba(255,255,255,0.15);
                }
                .photo-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.3s ease;
                }
                .upload-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 8px 16px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 50px;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .upload-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                .upload-btn:active .camera-icon {
                    transform: rotate(-10deg) scale(1.2);
                    display: inline-block;
                }
                .camera-icon {
                    transition: transform 0.2s ease;
                }
                .glass-input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 50px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                    caret-color: #EC4899;
                }
                .glass-input:focus {
                    background: rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 255, 255, 0.8);
                    box-shadow: 0 0 20px rgba(255,255,255,0.2);
                    transform: scale(1.02);
                }
                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 0.9rem;
                }
                .swap-btn:hover {
                    background: rgba(255,255,255,0.2) !important;
                    transform: rotate(180deg);
                }
                @keyframes heartbeatLow {
                    0% { transform: scale(1); }
                    15% { transform: scale(1.1); } 
                    30% { transform: scale(1); }
                    45% { transform: scale(1.1); }
                    60% { transform: scale(1); }
                    100% { transform: scale(1); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }
            `}</style >
        </div >
    );
};

export default PhotoSelection;
