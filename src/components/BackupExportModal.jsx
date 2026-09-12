import React, { useState, useEffect } from 'react';
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
    const jsonStr = backupExportInfo.jsonStr || '';
    const fileName = backupExportInfo.fileName || 'nappo_visited_sites.json';

    // 1. Direct Binary Octet-Stream File Download Trigger (Forces Android Download Manager to save .json file to Downloads folder)
    const handleTriggerDownload = (e) => {
        if (e) e.stopPropagation();
        try {
            const octetBlob = new Blob([jsonStr], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(octetBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            setDownloadedStatus(true);
            setTimeout(() => setDownloadedStatus(false), 4000);
        } catch (err) {
            try {
                const encodedData = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(jsonStr || '');
                const link = document.createElement('a');
                link.href = encodedData;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setDownloadedStatus(true);
                setTimeout(() => setDownloadedStatus(false), 4000);
            } catch (e2) {
                console.error("Direct download error:", e2);
                exportUserData('Downloads Folder');
            }
        }
    };

    // 2. Copy JSON to Clipboard
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

    // 3. Share Backup via Native Text Share Sheet (WhatsApp, Email, Drive, Notes)
    const handleShareText = async () => {
        if (typeof window !== 'undefined' && navigator.share) {
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
                    Your visited sites backup file has been generated. Use any option below to download or copy your backup:
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
                        <span>{fileName} downloaded to Downloads folder!</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '16px' }}>

                    {/* Option 1: Direct Binary File Download */}
                    <button
                        type="button"
                        onClick={handleTriggerDownload}
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
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Download size={18} />
                        <span>Save .JSON File to Downloads Folder</span>
                    </button>

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
