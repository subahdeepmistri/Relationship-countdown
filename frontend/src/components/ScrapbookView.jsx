import React, { useState, useEffect, useRef } from 'react';
import { savePhoto, getPhotos, deletePhoto } from '../utils/db';

const DEFAULT_PHOTOS = [
    { id: 'def1', src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7', caption: "Where it all began", date: "Jan 2023" },
    { id: 'def2', src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2', caption: "Our first adventure", date: "Mar 2023" },
    { id: 'def3', src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70', caption: "Just us", date: "July 2023" },
];

const ScrapbookView = ({ onClose }) => {
    const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
    const [lightboxIndex, setLightboxIndex] = useState(null); // Index of photo active in lightbox
    const fileInputRef = useRef(null);

    // Swipe state
    const touchStart = useRef(null);
    const touchEnd = useRef(null);

    useEffect(() => {
        loadCustomPhotos();
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, photos]);

    const loadCustomPhotos = async () => {
        try {
            const stored = await getPhotos();
            // Stored is array of { id, blob }
            const processed = stored.map(item => ({
                id: item.id,
                src: URL.createObjectURL(item.blob),
                caption: "New Memory", // Default caption
                date: new Date(item.id).toLocaleDateString(), // Use ID timestamp
                isCustom: true
            }));
            setPhotos([...DEFAULT_PHOTOS, ...processed]);
        } catch (e) {
            console.error("Failed to load photos", e);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const id = Date.now();
            await savePhoto(id, file); // Shared storage

            const newPhoto = {
                id,
                src: URL.createObjectURL(file),
                caption: "New Memory",
                date: new Date().toLocaleDateString(),
                isCustom: true
            };
            setPhotos(prev => [...prev, newPhoto]);
        } catch (err) {
            console.error("Failed to save photo", err);
            alert("Could not save photo.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this photo?")) return;

        // 1. Optimistic UI Update: Remove immediately from screen
        setPhotos(prev => prev.filter(p => p.id !== id));

        // Close lightbox if open on this photo
        setLightboxIndex(null);

        // 2. Background DB Deletion for Custom Photos
        const isCustom = typeof id === 'number';
        if (isCustom) {
            try {
                await deletePhoto(id);
            } catch (err) {
                console.error("Failed to delete from DB", err);
            }
        }
    };

    // Lightbox Logic
    const nextPhoto = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    // Swipe Handlers
    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    }

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    }

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) nextPhoto();
        if (isRightSwipe) prevPhoto();
    }

    return (
        <div className="scrapbook-container" style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'white',
            zIndex: 2000,
            overflowY: 'auto',
            padding: '40px 40px 120px 40px'
        }}>
            {/* Top Controls */}
            <div className="no-print" style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: '10px', zIndex: 10 }}>
                <button
                    onClick={handleImportClick}
                    style={{ padding: '10px 20px', background: 'var(--accent-color)', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >
                    + Import Photo
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: 'black', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>Print / Save PDF</button>
                <button onClick={onClose} style={{ padding: '10px 20px', background: '#ccc', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: '#333' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '3rem', marginBottom: '10px' }}>Our Story</h1>
                <p style={{ fontStyle: 'italic', marginBottom: '50px' }}>A collection of beautiful moments. (Tap photo to view)</p>

                {photos.map((photo, index) => (
                    <div key={photo.id} style={{ marginBottom: '100px', pageBreakInside: 'avoid', position: 'relative' }}>
                        <div
                            onClick={() => setLightboxIndex(index)} // Trigger Lightbox
                            style={{
                                padding: '20px',
                                background: '#fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                display: 'inline-block',
                                transform: index % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)',
                                position: 'relative',
                                cursor: 'zoom-in'
                            }}>
                            <img src={photo.src} alt={photo.caption} style={{ maxWidth: '100%', maxHeight: '500px', display: 'block' }} />

                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent bubbling
                                    handleDelete(photo.id);
                                }}
                                className="no-print"
                                style={{
                                    position: 'absolute', top: '-15px', right: '-15px',
                                    background: '#e74c3c', color: 'white',
                                    width: '35px', height: '35px', borderRadius: '50%',
                                    border: '3px solid white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                    zIndex: 100,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                title="Remove Photo"
                            >
                                ✕
                            </button>
                        </div>
                        <h3 style={{ marginTop: '20px', fontFamily: 'serif', fontWeight: 'normal' }}>{photo.caption}</h3>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>{photo.date}</span>
                    </div>
                ))}

                <div style={{ marginTop: '100px', borderTop: '1px solid #eee', paddingTop: '50px' }}>
                    <p>And many more memories to come...</p>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
                <div
                    className="no-print"
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.95)', zIndex: 3000,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button
                        onClick={() => setLightboxIndex(null)}
                        style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: '2rem', padding: '10px' }}
                    >✕</button>

                    {/* Left Arrow (Desktop) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                        style={{
                            position: 'absolute', left: 20, color: 'white', fontSize: '3rem', padding: '20px',
                            display: window.innerWidth < 768 ? 'none' : 'block' // Hide on mobile (use swipes)
                        }}
                    >‹</button>

                    <img
                        src={photos[lightboxIndex].src}
                        style={{ maxHeight: '80vh', maxWidth: '95vw', boxShadow: '0 0 50px rgba(0,0,0,0.5)', borderRadius: '5px' }}
                        alt="Zoomed Memory"
                    />

                    <div style={{ color: 'white', marginTop: '20px', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'serif', margin: 0 }}>{photos[lightboxIndex].caption}</h2>
                        <p style={{ opacity: 0.7 }}>{photos[lightboxIndex].date}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '10px' }}>Swipe left/right to browse</p>
                    </div>

                    {/* Right Arrow (Desktop) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                        style={{
                            position: 'absolute', right: 20, color: 'white', fontSize: '3rem', padding: '20px',
                            display: window.innerWidth < 768 ? 'none' : 'block'
                        }}
                    >›</button>
                </div>
            )}
        </div>
    );
};

export default ScrapbookView;
