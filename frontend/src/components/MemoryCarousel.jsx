import React, { useState, useEffect, useRef } from 'react';
import { savePhoto, getPhotos, deletePhoto } from '../utils/db';
import '../styles/theme.css';

const MemoryCarousel = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Lightbox State
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // Delete State
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const fileInputRef = useRef(null);

    // Load Memories from IndexedDB
    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const memoryList = await getPhotos();
            // Sort by createdAt desc
            memoryList.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            setPhotos(memoryList);
        } catch (error) {
            console.error("Error fetching memories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Prompt for Caption
        const caption = prompt("Add a caption for this memory (optional):") || "";

        setIsUploading(true);

        try {
            const id = `memory_${Date.now()}`;
            const createdAt = new Date().toISOString();

            // Save to IndexedDB
            await savePhoto(id, file, caption, createdAt);

            // Reload photos
            await loadPhotos();

            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (err) {
            console.error("Error saving memory:", err);
            alert("Failed to save image locally.");
            setIsUploading(false);
        }
    };

    const confirmDelete = (photo) => {
        setPhotoToDelete(photo);
    };

    const performDelete = async () => {
        if (!photoToDelete) return;

        const { id } = photoToDelete;

        try {
            await deletePhoto(id);
            if (selectedPhoto?.id === id) setSelectedPhoto(null);
            await loadPhotos();

        } catch (err) {
            console.error("Error deleting memory:", err);
            alert("Could not delete memory.");
        } finally {
            setPhotoToDelete(null);
        }
    };

    return (
        <section style={{ padding: '0 20px', marginBottom: '60px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>
                    Our Memories
                </h3>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            background: 'var(--accent-color)', color: 'white', fontWeight: 'bold',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            boxShadow: '0 4px 10px rgba(255, 112, 67, 0.3)'
                        }}
                    >
                        + Add Photo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>Loading memories...</div>
            ) : photos.length === 0 ? (
                <div style={{
                    padding: '60px 20px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--shape-radius)',
                    border: '2px dashed rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📸</div>
                    <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>No memories saved yet.<br />Add a photo to your personal collection!</p>
                </div>
            ) : (
                <div className="masonry-grid">
                    {photos.map(photo => (
                        <div
                            key={photo.id}
                            className="memory-item"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img src={URL.createObjectURL(photo.blob)} alt="Memory" loading="lazy" />
                            <div className="memory-overlay">
                                <span style={{ fontSize: '0.9rem', color: 'white' }}>👁️ View</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.95)', zIndex: 10000,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                        style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>

                    <img
                        src={URL.createObjectURL(selectedPhoto.blob)}
                        alt="Full Memory"
                        style={{
                            maxWidth: '90%', maxHeight: '70vh', objectFit: 'contain',
                            borderRadius: '5px', boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Caption & Date */}
                    <div style={{ marginTop: '20px', textAlign: 'center', color: 'white', maxWidth: '80%' }} onClick={(e) => e.stopPropagation()}>
                        {selectedPhoto.caption && (
                            <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0', fontFamily: 'var(--font-serif)' }}>
                                "{selectedPhoto.caption}"
                            </p>
                        )}
                        <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>
                            {new Date(selectedPhoto.createdAt || selectedPhoto.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(selectedPhoto); }}
                        style={{
                            marginTop: '30px', padding: '10px 20px',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ff6b6b', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        🗑️ Delete Memory
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {photoToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', zIndex: 11000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '15px',
                        maxWidth: '300px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Delete permanently?</h4>
                        <p style={{ margin: '0 0 20px 0', opacity: 0.6, fontSize: '0.9rem' }}>This will remove the photo from your device.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setPhotoToDelete(null)}
                                style={{
                                    padding: '10px 20px', background: '#f0f0f0', border: 'none',
                                    borderRadius: '10px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={performDelete}
                                style={{
                                    padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none',
                                    borderRadius: '10px', cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .masonry-grid {
                    column-count: 2;
                    column-gap: 15px;
                }
                @media (min-width: 768px) {
                    .masonry-grid {
                        column-count: 3;
                    }
                }
                .memory-item {
                    break-inside: avoid;
                    margin-bottom: 15px;
                    border-radius: 15px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    transition: transform 0.2s ease;
                }
                .memory-item img {
                    width: 100%;
                    height: auto;
                    display: block;
                    transition: transform 0.3s ease;
                }
                .memory-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .memory-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.3);
                    display: flex; alignItems: center; justifyContent: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .memory-item:hover .memory-overlay {
                    opacity: 1;
                }
            `}</style>
        </section>
    );
};

export default MemoryCarousel;
