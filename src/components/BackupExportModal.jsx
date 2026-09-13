import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Download, Copy, Share2, FileText, X, Check, FolderCheck, ChevronDown, ChevronUp } from 'lucide-react';
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

    const [copied, setCopied] = useState(false);
    const [downloadedStatus, setDownloadedStatus] = useState(false);
    const [showRawText, setShowRawText] = useState(false);

    const jsonStr = backupExportInfo?.jsonStr || '';
    const fileName = backupExportInfo?.fileName || 'nappo_visited_sites.json';

    // Create clean Blob Object URL for direct <a> tag download (Android Chrome & iOS Safari compatible)
    const downloadBlobUrl = useMemo(() => {
        if (!jsonStr) return '#';
        const blob = new Blob([jsonStr], { type: 'application/octet-stream' });
        return URL.createObjectURL(blob);
    }, [jsonStr]);

    useEffect(() => {
        return () => {
            if (downloadBlobUrl && downloadBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(downloadBlobUrl);
            }
        };
    }, [downloadBlobUrl]);

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

    // 1. Copy JSON to Clipboard
    const handleCopyToClipboard = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(jsonStr);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = jsonStr;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy backup data:", err);
        }
    };

    // 2. Share Backup via Native System Share Sheet (Supports native "Save to Device / Files / Downloads")
    const handleShareText = async () => {
        if (typeof window !== 'undefined' && navigator.share) {
            try {
                // Try sharing actual file attachment if browser supports file sharing
                const file = new File([jsonStr], fileName, { type: 'application/json' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'nAPPo Trails Backup Data',
                        text: 'nAPPo Trails visited sites backup file.'
                    });
                    setDownloadedStatus(true);
                    setTimeout(() => setDownloadedStatus(false), 5000);
                    return;
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.log("File share failed, falling back to text share:", err);
            }

            try {
                await navigator.share({
                    title: 'nAPPo Trails Backup Data',
                    text: jsonStr
                });
            } catch (err) {
                if (err && err.name !== 'AbortError') {
                    console.log("Share text failed fallback:", err);
                    handleCopyToClipboard();
                }
            }
        } else {
            handleCopyToClipboard();
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
                backgroundColor: 'rgba(0, 0, 0, 0.70)',
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
                    maxWidth: '440px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: isDark ? '#191b1f' : '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
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
                {/* Close Button (Red and white modal-close-btn) */}
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setShowBackupExportModal(false)}
                    title="Close"
                    style={{ position: 'absolute', top: '15px', right: '15px' }}
                >
                    <X size={18} strokeWidth={2.5} color="white" />
                </button>

                {/* Status Badge */}
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
                        marginBottom: '14px',
                        color: '#2ecc71'
                    }}
                >
                    <CheckCircle2 size={32} />
                </div>

                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Backup Ready & Saved
                </h2>

                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Your visited sites backup file has been generated. Tap below to save your backup file directly to your phone's Downloads folder:
                </p>

                {/* File Details Box */}
                <div
                    style={{
                        width: '100%',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                        textAlign: 'left',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        Backup File Name
                    </div>
                    <code style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {fileName}
                    </code>
                </div>

                {/* Download Toast Notification */}
                {downloadedStatus && (
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(46, 204, 113, 0.15)',
                            border: '1px solid #2ecc71',
                            color: '#2ecc71',
                            borderRadius: '10px',
                            padding: '10px',
                            marginBottom: '14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Check size={16} />
                        <span>{fileName} saved to Downloads folder!</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '16px' }}>

                    {/* Option 1: Direct Real <a> Link Download (Required for Android Chrome compatibility) */}
                    <a
                        href={downloadBlobUrl}
                        download={fileName}
                        onClick={() => {
                            setDownloadedStatus(true);
                            setTimeout(() => setDownloadedStatus(false), 5000);
                        }}
                        style={{
                            width: '100%',
                            textDecoration: 'none',
                            display: 'block'
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid var(--accent-primary)',
                                backgroundColor: 'var(--accent-primary)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(88, 166, 255, 0.3)',
                                boxSizing: 'border-box'
                            }}
                        >
                            <Download size={18} />
                            <span>Save .JSON File to Downloads Folder</span>
                        </div>
                    </a>

                    {/* Option 2: Copy to Clipboard */}
                    <button
                        type="button"
                        onClick={handleCopyToClipboard}
                        style={{
                            width: '100%',
                            padding: '11px',
                            borderRadius: '12px',
                            border: copied ? '1px solid #2ecc71' : '1px solid var(--border-color)',
                            backgroundColor: copied ? '#2ecc71' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                            color: copied ? '#fff' : 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span>{copied ? 'Copied to Clipboard!' : 'Copy Backup Content to Clipboard'}</span>
                    </button>

                    {/* Option 3: Share / Email Text (WhatsApp, Email, Notes) */}
                    <button
                        type="button"
                        onClick={handleShareText}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Share2 size={16} />
                        <span>Send / Share via Email, WhatsApp or Notes</span>
                    </button>
                </div>

                {/* Where to find your file guide box */}
                <div
                    style={{
                        width: '100%',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        textAlign: 'left',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        <FolderCheck size={16} style={{ color: '#2ecc71' }} />
                        <span>How to Find Your Downloaded File:</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                        • 🤖 <strong>Android Phone:</strong> Open <strong>Files</strong> (or <em>My Files</em>) app &rarr; <strong>Downloads</strong> folder (or search for <em>nappo</em>).<br />
                        • 🍎 <strong>iPhone (iOS):</strong> Open <strong>Files</strong> app &rarr; <strong>On My iPhone</strong> (or <em>iCloud Drive</em>) &rarr; <strong>Downloads</strong>.
                    </div>
                </div>

                {/* Collapsible Raw JSON Data Box */}
                <div style={{ width: '100%', marginBottom: '16px' }}>
                    <button
                        type="button"
                        onClick={() => setShowRawText(prev => !prev)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '4px'
                        }}
                    >
                        <FileText size={15} />
                        <span>{showRawText ? 'Hide Raw Backup JSON Text' : 'View Raw Backup JSON Text'}</span>
                        {showRawText ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showRawText && (
                        <div style={{ marginTop: '8px', width: '100%', textAlign: 'left' }}>
                            <textarea
                                readOnly
                                value={jsonStr}
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: isDark ? '#0d1117' : '#f6f8fa',
                                    color: isDark ? '#c9d1d9' : '#24292e',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    resize: 'none',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* OK Close Button */}
                <button
                    type="button"
                    onClick={() => setShowBackupExportModal(false)}
                    style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
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
