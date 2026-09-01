import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FolderCheck, CheckCircle2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BackupExportModal = () => {
    const {
        showBackupExportModal,
        setShowBackupExportModal,
        backupExportInfo,
        getPortalContainer,
        registerBackHandler,
        unregisterBackHandler,
        theme
    } = useAppContext();

    useEffect(() => {
        if (showBackupExportModal) {
            registerBackHandler('backupExportModal', () => {
                setShowBackupExportModal(false);
            }, 95);
            return () => unregisterBackHandler('backupExportModal');
        }
    }, [showBackupExportModal, registerBackHandler, unregisterBackHandler, setShowBackupExportModal]);

    if (!showBackupExportModal || !backupExportInfo) return null;

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
            onClick={() => setShowBackupExportModal(false)}
        >
            <div
                className="glass-panel animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    backgroundColor: isDark ? 'rgba(25, 27, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
                    onClick={() => setShowBackupExportModal(false)}
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
                        backgroundColor: 'rgba(46, 204, 113, 0.15)',
                        border: '1.5px solid rgba(46, 204, 113, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: '#2ecc71'
                    }}
                >
                    <CheckCircle2 size={32} />
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Backup Saved Successfully
                </h2>

                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Your visited sites backup file has been generated and saved automatically to your device.
                </p>

                <div
                    style={{
                        width: '100%',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}
                >
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            File Name
                        </div>
                        <code
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--accent-primary)',
                                wordBreak: 'break-all',
                                fontFamily: 'monospace'
                            }}
                        >
                            {backupExportInfo.fileName}
                        </code>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            Saved Location / Folder
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <FolderCheck size={18} style={{ color: '#2ecc71' }} />
                            <span>Downloads Folder</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowBackupExportModal(false)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );

    return createPortal(modalContent, getPortalContainer());
};

export default BackupExportModal;
