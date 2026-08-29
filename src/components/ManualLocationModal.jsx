import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ManualLocationModal = () => {
    const {
        showManualLocationModal,
        setShowManualLocationModal,
        manualCoords,
        saveManualLocation,
        getPortalContainer,
        registerBackHandler,
        unregisterBackHandler,
        userCoords
    } = useAppContext();

    const [latInput, setLatInput] = useState('');
    const [lonInput, setLonInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (showManualLocationModal) {
            const initialLat = manualCoords?.lat ?? userCoords?.lat ?? '';
            const initialLon = manualCoords?.lon ?? userCoords?.lon ?? '';
            setLatInput(initialLat !== '' ? String(initialLat) : '');
            setLonInput(initialLon !== '' ? String(initialLon) : '');
            setErrorMsg('');

            registerBackHandler('manualLocationModal', () => {
                setShowManualLocationModal(false);
            }, 85);

            return () => unregisterBackHandler('manualLocationModal');
        }
    }, [showManualLocationModal, manualCoords, userCoords, registerBackHandler, unregisterBackHandler, setShowManualLocationModal]);

    if (!showManualLocationModal) return null;

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');

        if (!latInput.trim() || !lonInput.trim()) {
            setErrorMsg('Please enter both latitude and longitude.');
            return;
        }

        const latNum = parseFloat(latInput.replace(',', '.'));
        const lonNum = parseFloat(lonInput.replace(',', '.'));

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setErrorMsg('Latitude must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
            setErrorMsg('Longitude must be a valid number between -180 and 180.');
            return;
        }

        const success = saveManualLocation(latNum, lonNum);
        if (!success) {
            setErrorMsg('Invalid coordinates provided.');
        }
    };

    const modalContent = (
        <div
            className="manual-location-backdrop animate-fade-in"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                zIndex: 2147483647,
                padding: '16px'
            }}
            onClick={() => setShowManualLocationModal(false)}
        >
            <div
                className="manual-location-card glass-panel animate-scale-up"
                style={{
                    position: 'fixed',
                    top: '60px',
                    width: 'calc(100% - 32px)',
                    maxWidth: '380px',
                    backgroundColor: 'var(--bg-color, #1e1e1e)',
                    color: 'var(--text-primary, #ffffff)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
                    overflow: 'hidden',
                    zIndex: 2147483647
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
                        <MapPin size={18} color="#ff4444" />
                        <span>Manual Location Entry</span>
                    </div>
                    <button
                        onClick={() => setShowManualLocationModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary, #aaa)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                        }}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} style={{ padding: '16px 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: '1.35' }}>
                        Enter custom latitude and longitude coordinates to set your location manually:
                    </div>

                    {errorMsg && (
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#ff4444',
                            background: 'rgba(255, 68, 68, 0.15)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}>
                            {errorMsg}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.9 }}>
                            Latitude (-90° to 90°)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 48.8566"
                            value={latInput}
                            onChange={(e) => setLatInput(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
                                background: 'rgba(0, 0, 0, 0.25)',
                                color: 'var(--text-primary, #fff)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.9 }}>
                            Longitude (-180° to 180°)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 2.3522"
                            value={lonInput}
                            onChange={(e) => setLonInput(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
                                background: 'rgba(0, 0, 0, 0.25)',
                                color: 'var(--text-primary, #fff)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setShowManualLocationModal(false)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-primary, #fff)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#ff4444',
                                color: '#ffffff',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Check size={16} />
                            Set Location
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, getPortalContainer());
};

export default ManualLocationModal;
