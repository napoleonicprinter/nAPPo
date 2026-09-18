import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useAppContext, useBackHandler } from '../context/AppContext';

const NavErrorModal = ({ errorData, onClose, onResetAndView }) => {
    const { theme, getPortalContainer } = useAppContext();

    useBackHandler('navErrorModalBack', !!errorData, () => onClose && onClose(), 50);

    if (!errorData) return null;

    const handleReset = () => {
        if (errorData.failedFilters && errorData.failedFilters.length > 0) {
            errorData.failedFilters.forEach(f => {
                if (typeof f.reset === 'function') f.reset();
            });
        }
        if (onResetAndView) {
            onResetAndView(errorData.targetSite);
        }
    };

    return createPortal(
        <div
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
                alignItems: 'center',
                zIndex: 2147483647,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                className="glass-panel animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    backgroundColor: theme === 'dark' ? 'rgba(25, 27, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>

                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 83, 80, 0.15)',
                        border: '1.5px solid rgba(239, 83, 80, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: '#ef5350'
                    }}
                >
                    <AlertTriangle size={32} />
                </div>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {errorData.title}
                </h3>

                <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.45', fontWeight: 500 }}>
                    {errorData.message}
                </p>

                {errorData.distance !== undefined && (
                    <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        Distance to site: <strong>{errorData.distance} km</strong>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '11px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >
                        OK
                    </button>
                    {errorData.targetSite && (
                        <button
                            type="button"
                            onClick={handleReset}
                            style={{
                                flex: 1.5,
                                padding: '11px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: 'var(--accent-primary)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                cursor: 'pointer'
                            }}
                        >
                            {errorData.resetButtonText || 'Reset & View'}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        getPortalContainer ? getPortalContainer() : document.body
    );
};

export default NavErrorModal;
