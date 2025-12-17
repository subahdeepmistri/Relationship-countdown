import React, { useState, useEffect } from 'react';
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

    const [isSaving, setIsSaving] = useState(false);

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
        const storedName1 = localStorage.getItem('rc_partner1');
        const storedName2 = localStorage.getItem('rc_partner2');
        if (storedName1) setName1(storedName1);
        if (storedName2) setName2(storedName2);

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

        // Swap Files (for saving)
        const tempImg = img1;
        setImg1(img2);
        setImg2(tempImg);
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

        // Notify parent even if images skipped (optional)
        onSelect();
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
                    onClick={onBack}
                    style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    ✕
                </button>
                <h2 style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    fontWeight: '700',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {isEditing ? 'Our Profile' : 'Setup'}
                </h2>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
                paddingBottom: '140px', // Extra padding for valid scroll space above fixed bottom bar
                position: 'relative',
                zIndex: 2
            }}>
                {/* Photo Area */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', marginBottom: '40px' }}>

                    {/* Left Photo & Name */}
                    <div className="photo-container">
                        <div className="photo-ring" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <img
                                src={preview1 || DEFAULT_AVATAR}
                                alt="Profile 1"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>
                        <label className="upload-btn">
                            📷 Photo
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
                    </div>

                    {/* Middle: Heart & Swap */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '30px', // Align roughly with centers
                        gap: '10px'
                    }}>
                        <div style={{
                            fontSize: '2.5rem',
                            color: '#EC4899',
                            animation: 'pulse 1.5s infinite ease-in-out',
                            filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.6))'
                        }}>❤️</div>

                        <button
                            onClick={handleSwap}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.2s'
                            }}
                            title="Switch Sides"
                        >
                            ⇄
                        </button>
                    </div>

                    {/* Right Photo & Name */}
                    <div className="photo-container">
                        <div className="photo-ring" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <img
                                src={preview2 || DEFAULT_AVATAR}
                                alt="Profile 2"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }}
                            />
                        </div>
                        <label className="upload-btn">
                            📷 Photo
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
                    </div>
                </div>

                {/* Info Glass Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>Design Your Space</h3>
                    </div>

                    <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        Customize your profiles however you like. Tap ⇄ to switch sides.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                        <span>🔒</span>
                        <span>Details stay private on this device.</span>
                    </div>
                </div>
            </div>

            {/* Sticky Next Button */}
            <div style={{
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
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.5)',
                        transition: 'transform 0.2s',
                        letterSpacing: '0.5px'
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Injected Styles */}
            <style>{`
                .photo-ring {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    padding: 4px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease;
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
                }
                .upload-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                .glass-input {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .glass-input:focus {
                    background: rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default PhotoSelection;
