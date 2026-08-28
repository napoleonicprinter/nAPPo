import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPinOff, RefreshCw, X, Smartphone, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const GpsDeniedModal = () => {
    const {
        showGpsDeniedModal,
        setShowGpsDeniedModal,
        requestGeolocation,
        getPortalContainer,
        registerBackHandler,
        unregisterBackHandler
    } = useAppContext();

    useEffect(() => {
        if (showGpsDeniedModal) {
            registerBackHandler('gpsDeniedModal', () => {
                setShowGpsDeniedModal(false);
            }, 85);
            return () => unregisterBackHandler('gpsDeniedModal');
        }
    }, [showGpsDeniedModal, registerBackHandler, unregisterBackHandler, setShowGpsDeniedModal]);

    if (!showGpsDeniedModal) return null;

    const handleRetry = async () => {
        setShowGpsDeniedModal(false);
        if (Capacitor.isNativePlatform()) {
            try {
                await Geolocation.requestPermissions();
            } catch (e) {
                // ignore
            }
        }
        requestGeolocation();
    };

    const isNative = Capacitor.isNativePlatform();

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100000,
                padding: '20px'
            }}
            onClick={() => setShowGpsDeniedModal(false)}
        >
            <div
                className="glass-panel animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    borderRadius: '16px',
                    padding: '24px',
                    backgroundColor: 'var(--bg-primary, #1e1e1e)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                    color: 'var(--text-primary, #fff)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setShowGpsDeniedModal(false)}
                    style={{
                        position: 'absolute',
                        right: '16px',
                        top: '16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #aaa)',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                    title="Close"
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 68, 68, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff4444',
                        marginBottom: '4px'
                    }}>
                        <MapPinOff size={28} />
                    </div>

                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                        GPS Location Access Blocked
                    </h2>

                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary, #ccc)', lineHeight: 1.5 }}>
                        Location permission was denied or disabled for nAPPo Trails. Please enable location to use My GPS Location:
                    </p>

                    <div style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '14px',
                        textAlign: 'left',
                        fontSize: '0.86rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        margin: '8px 0',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        {!isNative ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <Globe size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ lineHeight: 1.4 }}>
                                    <strong>In your browser:</strong> Click the lock icon 🔒 or site settings in your browser address bar at the top, change <strong>Location</strong> permission to <strong>Allow</strong>, then tap <strong>Try Again</strong>.
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <Smartphone size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ lineHeight: 1.4 }}>
                                    <strong>On your device:</strong> Go to <strong>Settings &gt; Apps &gt; nAPPo Trails &gt; Permissions</strong>, turn on <strong>Location</strong>, then tap <strong>Try Again</strong>.
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                        <button
                            onClick={() => setShowGpsDeniedModal(false)}
                            style={{
                                flex: 1,
                                padding: '11px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
                                background: 'transparent',
                                color: 'var(--text-primary, #fff)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRetry}
                            style={{
                                flex: 1,
                                padding: '11px',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#ff4444',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <RefreshCw size={16} /> Try Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const container = getPortalContainer ? getPortalContainer() : document.body;
    return createPortal(modalContent, container);
};

export default GpsDeniedModal;
