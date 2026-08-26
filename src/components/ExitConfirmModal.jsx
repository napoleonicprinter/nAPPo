import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const ExitConfirmModal = () => {
    const {
        showExitConfirm, setShowExitConfirm,
        getPortalContainer, registerBackHandler, unregisterBackHandler, theme
    } = useAppContext();

    useEffect(() => {
        if (showExitConfirm) {
            registerBackHandler('exitConfirmModal', () => {
                setShowExitConfirm(false);
            }, 90);
            return () => unregisterBackHandler('exitConfirmModal');
        }
    }, [showExitConfirm, registerBackHandler, unregisterBackHandler, setShowExitConfirm]);

    if (!showExitConfirm) return null;

    const handleConfirmExit = () => {
        if (Capacitor.isNativePlatform()) {
            App.exitApp();
        } else {
            setShowExitConfirm(false);
            try {
                window.close();
            } catch (e) {
                // ignore
            }
        }
    };

    const isDark = theme === 'dark';

    const modalContent = (
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
                zIndex: 100000,
                padding: '20px'
            }}
            onClick={() => setShowExitConfirm(false)}
        >
            <div
                className="glass-panel animate-pop-in"
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '340px',
                    backgroundColor: isDark ? '#1e2228' : '#ffffff',
                    color: isDark ? '#f0f6fc' : '#1f2328',
                    borderRadius: '16px',
                    padding: '24px 20px 20px 20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 68, 68, 0.12)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px auto',
                        color: '#ff4444'
                    }}
                >
                    <LogOut size={26} strokeWidth={2.2} />
                </div>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 700 }}>
                    Close App
                </h3>

                <p style={{ margin: '0 0 22px 0', fontSize: '0.95rem', opacity: 0.85, lineHeight: 1.4 }}>
                    Do you want to close the App?
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowExitConfirm(false)}
                        className="glass-panel"
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f3f4f6',
                            color: isDark ? '#ffffff' : '#333333',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        NO
                    </button>

                    <button
                        onClick={handleConfirmExit}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#ff4444',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)'
                        }}
                    >
                        YES
                    </button>
                </div>
            </div>
        </div>
    );

    return getPortalContainer
        ? createPortal(modalContent, getPortalContainer())
        : modalContent;
};

export default ExitConfirmModal;
