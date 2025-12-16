import React, { useState, useEffect } from 'react';
import { saveProfileImage, getProfileImage } from '../utils/db'; // Added getProfileImage import

const PhotoSelection = ({ onSelect, onBack, isEditing = false }) => {
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Load for Edit Mode
    useEffect(() => {
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

    const handleNext = async () => {
        setIsSaving(true);
        // Save to IndexedDB
        if (img1) await saveProfileImage('profile_1', img1);
        if (img2) await saveProfileImage('profile_2', img2);

        // Notify parent even if images skipped (optional)
        onSelect();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'white',
            zIndex: 9000,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            color: '#333'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none', border: 'none',
                        fontSize: '1.5rem', cursor: 'pointer', color: '#555'
                    }}
                >
                    &lt;
                </button>
                <h2 style={{ fontSize: '1.2rem', color: '#555', fontWeight: 'normal', margin: 0 }}>
                    {isEditing ? 'Edit photos.' : 'Set photos.'}
                </h2>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '50px'
            }}>
                {/* Photo Area */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '50px' }}>
                    {/* Left Photo */}
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                border: '3px solid #ffab91',
                                background: '#FFEBEE',
                                padding: '3px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={preview1 || "https://img.icons8.com/doodle/96/boy.png"}
                                alt="Profile 1"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        </div>
                        <label style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            background: '#039BE5',
                            color: 'white',
                            padding: '5px 15px',
                            fontSize: '0.8rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>
                            Add Photo
                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 1)} />
                        </label>
                    </div>

                    {/* Heart */}
                    <div style={{ fontSize: '2rem', color: '#FF4081', marginTop: '-40px' }}>❤️</div>

                    {/* Right Photo */}
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                border: '3px solid #ffab91',
                                background: '#FFEBEE',
                                padding: '3px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={preview2 || "https://img.icons8.com/doodle/96/girl.png"}
                                alt="Profile 2"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        </div>
                        <label style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            background: '#039BE5',
                            color: 'white',
                            padding: '5px 15px',
                            fontSize: '0.8rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>
                            Add Photo
                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 2)} />
                        </label>
                    </div>
                </div>

                {/* Info Box */}
                <div style={{
                    background: '#E8EAF6', // Light indigo/purple tint
                    padding: '20px',
                    borderRadius: '15px',
                    fontSize: '0.9rem',
                    color: '#7986CB',
                    lineHeight: '1.5',
                    width: '90%',
                    maxWidth: '400px',
                    textAlign: 'left'
                }}>
                    <strong style={{ display: 'block', marginBottom: '10px', fontSize: '1rem', color: '#5C6BC0' }}>
                        Try setting lovely photos of you and your love!
                    </strong>
                    <p style={{ marginBottom: '10px', fontSize: '0.8rem' }}>
                        [No personal information is shared or transmitted.]
                        All information is stored only on activated devices.
                    </p>
                    <p style={{ fontSize: '0.8rem' }}>
                        Please allow the app to access the camera and external memory.
                    </p>
                </div>
            </div>

            {/* Sticky Next Button */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, width: '100%',
                background: 'white',
                padding: '20px',
                borderTop: '1px solid #eee'
            }}>
                <button
                    onClick={handleNext}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: '#5C6BC0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Next')}
                </button>
            </div>
        </div>
    );
};

export default PhotoSelection;
