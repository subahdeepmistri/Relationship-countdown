import React from 'react';

const AboutSection = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2000,
            background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', // Deep Night Blue
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            overflowY: 'auto',
            animation: 'fadeIn 0.4s ease-out',
            color: 'white'
        }}>
            {/* Background Atmosphere Blobs */}
            <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexShrink: 0
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    margin: 0,
                    background: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(249, 115, 22, 0.2))'
                }}>Our Story</h2>

                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>

                {/* Intro */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '10px',
                        animation: 'float 6s ease-in-out infinite'
                    }}>
                        ❤️
                    </div>
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.8',
                        color: '#cbd5e1',
                        fontWeight: '500'
                    }}>
                        Counting moments, keeping promises, and bridging distances.
                    </p>
                </div>

                {/* Developer / Dedication Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)', // Deep slate glass
                    backdropFilter: 'blur(15px)',
                    borderRadius: '32px',
                    padding: '32px',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Elements */}
                    <div style={{
                        position: 'absolute', top: -50, right: -50, width: 120, height: 120,
                        background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }} />

                    <p style={{
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontSize: '0.75rem',
                        color: '#F472B6',
                        fontWeight: '700',
                        marginBottom: '16px'
                    }}>
                        Created with Love
                    </p>

                    <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2.5rem',
                        margin: '0 0 10px 0',
                        background: 'linear-gradient(to right, #F472B6, #F97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        For Sexie
                    </h3>

                    <p style={{
                        fontSize: '0.9rem',
                        color: '#94a3b8',
                        marginBottom: '30px',
                        fontStyle: 'italic'
                    }}>
                        Currently maintained by <b>Spidey</b> 🕸️
                    </p>

                    <div style={{
                        borderTop: '2px dashed rgba(255,255,255,0.1)',
                        margin: '20px 0',
                        width: '100%'
                    }} />

                    <div style={{ textAlign: 'left', marginTop: '20px' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Developer Contact</p>

                        {/* Developer Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '14px',
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#38bdf8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'white' }}>Subhadeep Mistri</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Designer & Developer</div>
                            </div>
                        </div>

                        {/* Contact Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="mailto:subhadeepmistri1990@gmail.com" style={{
                                fontSize: '0.9rem', color: '#e2e8f0', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                </div>
                                subhadeepmistri1990@gmail.com
                            </a>

                            <a href="tel:8250518317" style={{
                                fontSize: '0.9rem', color: '#e2e8f0', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                +91 8250518317
                            </a>
                        </div>
                    </div>

                </div>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    opacity: 0.6,
                    color: '#94a3b8'
                }}>
                    v1.0.0 • Forever & Always
                </div>
            </div>
        </div>
    );
};



export default AboutSection;
