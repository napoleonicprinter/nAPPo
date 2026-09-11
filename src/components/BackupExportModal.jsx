import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FolderCheck, CheckCircle2, X, Folder, HardDrive, Smartphone, Cloud, FileSpreadsheet, ArrowRight, RefreshCw } from 'lucide-react';
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

    const [selectedFolderOption, setSelectedFolderOption] = useState('downloads');
    const [customFolderName, setCustomFolderName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    const folderOptions = [
        { id: 'downloads', name: 'Downloads Folder', desc: 'Standard device downloads directory (/Downloads)', icon: HardDrive },
        { id: 'documents', name: 'Documents Folder', desc: 'Personal documents directory (/Documents)', icon: Folder },
        { id: 'files_app', name: 'Files App / Save to Files', desc: 'Native Android My Files or iOS Files app location', icon: Smartphone },
        { id: 'cloud', name: 'Cloud Drive (Google Drive / iCloud)', desc: 'Cloud storage folder or share menu', icon: Cloud },
        { id: 'custom', name: 'Custom Subfolder', desc: 'Specify a custom folder path or name', icon: FileSpreadsheet }
    ];

    const getFolderDisplayName = () => {
        if (selectedFolderOption === 'custom' && customFolderName.trim()) {
            return `Custom Folder (${customFolderName.trim()})`;
        }
        const opt = folderOptions.find(o => o.id === selectedFolderOption);
        return opt ? opt.name : 'Downloads Folder';
    };

    const handleExecuteSave = async (e) => {
        if (e) e.stopPropagation();
        const targetFolder = getFolderDisplayName();
        setIsSaving(true);
        try {
            await exportUserData(targetFolder);
        } finally {
            setIsSaving(false);
        }
    };

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100000,
                padding: '16px',
                boxSizing: 'border-box'
            }}
            onClick={() => setShowBackupExportModal(false)}
        >
            <div
                className="animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: '430px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: isDark ? '#191b1f' : '#ffffff',
                    border: isSaved ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid var(--border-color)',
                    borderRadius: '18px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
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

                {/* Status Icon Badge */}
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

                {/* Header Title */}
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {titleText}
                </h2>

                {/* Description */}
                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {messageText}
                </p>

                {/* File Details Box */}
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
                        gap: '12px',
                        boxSizing: 'border-box'
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

                    {isSaved ? (
                        /* Saved Confirmation Info */
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                Saved Location / Folder
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#2ecc71', marginBottom: '6px' }}>
                                <FolderCheck size={18} />
                                <span>{backupExportInfo.folder || 'Downloads Folder'}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                                • <strong>Android:</strong> Open <strong>Files</strong> (or <em>My Files</em>) app &rarr; <strong>Downloads</strong> folder.<br />
                                • <strong>iPhone (iOS):</strong> Open <strong>Files</strong> app &rarr; <strong>On My iPhone</strong> (or <em>iCloud Drive</em>) &rarr; <strong>Downloads</strong>.
                            </div>
                        </div>
                    ) : (
                        /* Pending State Folder Options Selector */
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                Choose Storage Location / Folder
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {folderOptions.map(opt => {
                                    const IconComp = opt.icon;
                                    const isSelected = selectedFolderOption === opt.id;
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedFolderOption(opt.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                borderRadius: '10px',
                                                border: isSelected
                                                    ? '2px solid var(--accent-primary, #58a6ff)'
                                                    : '1px solid var(--border-color)',
                                                backgroundColor: isSelected
                                                    ? (isDark ? 'rgba(88, 166, 255, 0.15)' : 'rgba(88, 166, 255, 0.08)')
                                                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <div style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                                                <IconComp size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {opt.name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                    {opt.desc}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--border-color)',
                                                    backgroundColor: '#fff',
                                                    boxSizing: 'border-box',
                                                    flexShrink: 0
                                                }}
                                            />
                                        </div>
                                    );
                                })}

                                {selectedFolderOption === 'custom' && (
                                    <div style={{ marginTop: '4px' }}>
                                        <input
                                            type="text"
                                            value={customFolderName}
                                            onChange={(e) => setCustomFolderName(e.target.value)}
                                            placeholder="e.g. nAPPo_Backups"
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--accent-primary)',
                                                backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : '#fff',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.82rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    {isSaved ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowBackupExportModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '11px',
                                    borderRadius: '10px',
                                    border: '1px solid #2ecc71',
                                    backgroundColor: '#2ecc71',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <CheckCircle2 size={18} />
                                <span>OK</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    exportUserData(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <RefreshCw size={15} />
                                <span>Save Again / Choose Another Folder</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleExecuteSave}
                                disabled={isSaving}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--accent-primary)',
                                    backgroundColor: 'var(--accent-primary, #58a6ff)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    cursor: isSaving ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isSaving ? 0.7 : 1,
                                    boxShadow: '0 4px 14px rgba(88, 166, 255, 0.3)'
                                }}
                            >
                                <FolderCheck size={20} />
                                <span>{isSaving ? 'Saving File...' : 'Choose Folder & Save File'}</span>
                                <ArrowRight size={18} />
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
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, getPortalContainer());
};

export default BackupExportModal;
