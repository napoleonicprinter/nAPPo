import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FolderCheck, CheckCircle2, X, Folder, HardDrive, Smartphone, Cloud, FileSpreadsheet, Check, ArrowRight } from 'lucide-react';
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

    const [showFolderOverlay, setShowFolderOverlay] = useState(false);
    const [selectedFolderOption, setSelectedFolderOption] = useState('downloads');
    const [customFolderName, setCustomFolderName] = useState('');

    useEffect(() => {
        if (showBackupExportModal) {
            registerBackHandler('backupExportModal', () => {
                if (showFolderOverlay) {
                    setShowFolderOverlay(false);
                } else {
                    setShowBackupExportModal(false);
                }
            }, 95);
            return () => unregisterBackHandler('backupExportModal');
        }
    }, [showBackupExportModal, showFolderOverlay, registerBackHandler, unregisterBackHandler, setShowBackupExportModal]);

    // Automatically trigger folder overlay when opened in pending export state
    useEffect(() => {
        if (showBackupExportModal && backupExportInfo && backupExportInfo.isSaved === false) {
            setShowFolderOverlay(true);
        }
    }, [showBackupExportModal, backupExportInfo]);

    if (!showBackupExportModal || !backupExportInfo) return null;

    const isDark = theme === 'dark';
    const isSaved = backupExportInfo.isSaved !== false;
    const titleText = backupExportInfo.title || (isSaved ? 'Backup Saved Successfully' : 'Export Visited Sites Backup');
    const messageText = backupExportInfo.message || (isSaved ? 'Your visited sites backup file has been saved to your device.' : 'Select a folder or location on your device to save your visited sites backup file.');

    const folderOptions = [
        { id: 'downloads', name: 'Downloads Folder', desc: 'Standard device downloads directory (/Downloads)', icon: HardDrive },
        { id: 'documents', name: 'Documents Folder', desc: 'Personal documents directory (/Documents)', icon: Folder },
        { id: 'files_app', name: 'Files App / Save to Files', desc: 'Native Android My Files or iOS Files app window', icon: Smartphone },
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

    const handleConfirmSave = (e) => {
        if (e) e.stopPropagation();
        const targetFolder = getFolderDisplayName();
        setShowFolderOverlay(false);
        exportUserData(targetFolder);
    };

    // --- Folder Selection Overlay Window (Pops up overlaying the Export window) ---
    const renderFolderOverlay = () => {
        if (!showFolderOverlay) return null;

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100010,
                    padding: '16px'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowFolderOverlay(false);
                }}
            >
                <div
                    className="glass-panel animate-pop-in"
                    style={{
                        width: '100%',
                        maxWidth: '430px',
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        backgroundColor: isDark ? 'rgba(20, 22, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        border: '1.5px solid var(--accent-primary, #58a6ff)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(88, 166, 255, 0.15)',
                                border: '1px solid rgba(88, 166, 255, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-primary, #58a6ff)',
                                flexShrink: 0
                            }}
                        >
                            <FolderCheck size={26} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Select Storage Folder
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Pick target destination folder on your device
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFolderOverlay(false)}
                            style={{
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
                    </div>

                    {/* File Name Info Pill */}
                    <div
                        style={{
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.82rem'
                        }}
                    >
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>File:</span>
                        <code style={{ color: 'var(--accent-primary)', fontWeight: 600, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            {backupExportInfo.fileName}
                        </code>
                    </div>

                    {/* Folder Options List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
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
                                        gap: '12px',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: isSelected
                                            ? '2px solid var(--accent-primary, #58a6ff)'
                                            : '1px solid var(--border-color)',
                                        backgroundColor: isSelected
                                            ? (isDark ? 'rgba(88, 166, 255, 0.12)' : 'rgba(88, 166, 255, 0.08)')
                                            : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div
                                        style={{
                                            color: isSelected ? 'var(--accent-primary, #58a6ff)' : 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <IconComp size={22} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {opt.name}
                                        </div>
                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            {opt.desc}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: isSelected ? '6px solid var(--accent-primary, #58a6ff)' : '2px solid var(--border-color)',
                                            backgroundColor: '#fff',
                                            boxSizing: 'border-box',
                                            flexShrink: 0
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Custom Folder Name Input (when 'custom' selected) */}
                    {selectedFolderOption === 'custom' && (
                        <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                Enter Custom Folder Name / Path:
                            </label>
                            <input
                                type="text"
                                value={customFolderName}
                                onChange={(e) => setCustomFolderName(e.target.value)}
                                placeholder="e.g. nAPPo_Backups or My_Trails"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--accent-primary)',
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : '#fff',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.88rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    {/* Action Buttons inside Folder Selection Overlay */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <button
                            type="button"
                            onClick={handleConfirmSave}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid var(--accent-primary)',
                                backgroundColor: 'var(--accent-primary, #58a6ff)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.92rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(88, 166, 255, 0.35)'
                            }}
                        >
                            <FolderCheck size={20} />
                            <span>Confirm & Save to Folder</span>
                            <ArrowRight size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowFolderOverlay(false)}
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
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Export Modal Window ---
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
                            setShowFolderOverlay(true);
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

            {renderFolderOverlay()}
        </div>
    );

    return createPortal(modalContent, getPortalContainer());
};

export default BackupExportModal;
