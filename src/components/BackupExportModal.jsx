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
        theme,
        exportUserData
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
    const isSaved = backupExportInfo.isSaved !== false;
    const titleText = backupExportInfo.title || (isSaved ? 'Backup Saved Successfully' : 'Export Visited Sites Backup');
    const messageText = backupExportInfo.message || (isSaved ? 'Your visited sites backup file has been saved to your device.' : 'Select a folder or location on your device to save your visited sites backup file.');

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
                    maxHeight: '90vh',
                    overflowY: 'auto',
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
                        backgroundColor: isSaved ? 'rgba(46, 204, 113, 0.15)' : 'rgba(88, 166, 255, 0.15)',
                        border: isSaved ? '1.5px solid rgba(46, 204, 113, 0.4)' : '1.5px solid rgba(88, 166, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: isSaved ? '#2ecc71' : 'var(--accent-primary, #58a6ff)'
                    }}
                >
                    {isSaved ? <CheckCircle2 size={32} /> : <FolderCheck size={32} />}
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {titleText}
                </h2>

                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {messageText}
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
                            {isSaved ? 'Saved Location / Folder' : 'Target Location'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            <FolderCheck size={18} style={{ color: isSaved ? '#2ecc71' : 'var(--accent-primary)' }} />
                            <span>{backupExportInfo.folder || 'Downloads Folder'}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', textAlign: 'left', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                            • <strong>Android:</strong> Open <strong>Files</strong> (or <em>My Files</em>) app &rarr; <strong>Downloads</strong> folder.<br />
                            • <strong>iPhone (iOS):</strong> Open <strong>Files</strong> app &rarr; <strong>On My iPhone</strong> (or <em>iCloud Drive</em>) &rarr; <strong>Downloads</strong>.<br />
                            • <strong>Web Share Sheet:</strong> If a share menu popped up, the file was sent to the app or destination you selected (e.g. Google Drive, WhatsApp, Files).
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <button
                        type="button"
                        onClick={() => {
                            exportUserData();
                        }}
                        style={{
                            width: '100%',
                            padding: '11px',
                            borderRadius: '10px',
                            border: '1px solid var(--accent-primary)',
                            backgroundColor: 'var(--accent-primary)',
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
                        <FolderCheck size={18} />
                        <span>{isSaved ? 'Choose Another Folder / Share File' : 'Choose Folder / Save File'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowBackupExportModal(false)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease'
                        }}
                    >
                        {isSaved ? 'OK' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, getPortalContainer());
};

export default BackupExportModal;
