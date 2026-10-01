import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CloudDownload, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Sparkles, Database, Clock, MapPin, Compass, Zap } from 'lucide-react';
import { useAppContext, useBackHandler } from '../context/AppContext';
import './UpdateSitesModal.css';

const UpdateSitesModal = ({ isOpen, onClose }) => {
    const {
        getPortalContainer,
        checkForDataUpdates,
        lastSyncTime,
        allSites,
        setView,
        setShowOnlyNew,
        setNewSitesDays
    } = useAppContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateResult, setUpdateResult] = useState(null);

    useBackHandler('updateSitesModal', isOpen, onClose, 40);

    if (!isOpen) return null;

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateResult(null);
        try {
            const res = await checkForDataUpdates();
            setUpdateResult(res);
        } catch (err) {
            setUpdateResult({ success: false, error: err.message || 'Failed to update' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExploreNewSites = () => {
        setShowOnlyNew(true);
        setNewSitesDays(7);
        setView('card');
        onClose();
    };

    const totalSitesCount = updateResult?.totalSites || (allSites || []).length;
    const formattedLastSync = lastSyncTime || new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return createPortal(
        <div className="view-modal-overlay update-sites-modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className="view-modal-content glass-panel update-sites-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Larger Logo and Red Close Button */}
                <div className="update-modal-header">
                    <div className="update-modal-title-row">
                        <div className="update-logo-wrapper">
                            <img src="/assets/NT_logo.png" alt="nAPPo Trails" className="update-modal-logo-large" />
                        </div>
                        <div className="update-modal-title-info">
                            <div className="update-header-tag">
                                <Sparkles size={12} className="tag-sparkle" />
                                <span>LIVE DATABASE</span>
                            </div>
                            <h2>Database Update</h2>
                            <p>Napoleonic Historical Archive</p>
                        </div>
                    </div>
                    <button className="modal-close-btn update-close-btn" onClick={onClose} title="Close">
                        <X size={20} strokeWidth={2.5} color="white" />
                    </button>
                </div>

                {/* Body */}
                <div className="update-modal-body">
                    {/* Hero Stats Card - Large Bold Sites Count & Last Sync Date */}
                    <div className="update-stats-hero">
                        <div className="hero-stat-card total-sites-card">
                            <div className="hero-stat-icon-wrapper sites-icon-glow">
                                <Database size={24} />
                            </div>
                            <div className="hero-stat-details">
                                <span className="hero-stat-label">TOTAL SITES</span>
                                <span className="hero-stat-number">{totalSitesCount}</span>
                                <span className="hero-stat-sub">Napoleonic Landmarks</span>
                            </div>
                        </div>

                        <div className="hero-stat-card last-sync-card">
                            <div className="hero-stat-icon-wrapper sync-icon-glow">
                                <Clock size={20} />
                            </div>
                            <div className="hero-stat-details">
                                <span className="hero-stat-label">LAST UPDATE DATE</span>
                                <span className="hero-stat-date">{formattedLastSync}</span>
                                <span className="hero-stat-sub">Cloud Synchronized</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Result / Status Showcase */}
                    {updateResult ? (
                        <div className={`update-result-card animate-fade-in ${
                            updateResult.success 
                                ? (updateResult.newSitesCount > 0 ? 'success-new-enthusiastic' : 'success-current-enthusiastic') 
                                : 'error-enthusiastic'
                        }`}>
                            {updateResult.success ? (
                                updateResult.newSitesCount > 0 ? (
                                    <>
                                        <div className="result-badge-icon badge-new-pulse">
                                            <Sparkles size={28} className="sparkle-anim" />
                                        </div>
                                        <div className="result-text">
                                            <h4 className="result-title-celebration">🎉 Fantastic Discovery!</h4>
                                            <p className="result-msg-celebration">
                                                <strong>+{updateResult.newSitesCount}</strong> brand new Napoleonic site{updateResult.newSitesCount > 1 ? 's have' : ' has'} been successfully added to your archive!
                                            </p>
                                            <div className="result-pill-badge">
                                                <MapPin size={13} />
                                                <span>Archive total: <strong>{updateResult.totalSites}</strong> sites</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="result-badge-icon badge-current">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <div className="result-text">
                                            <h4 className="result-title-uptodate">✨ Fully Up to Date!</h4>
                                            <p className="result-msg">
                                                Your archive is 100% current with all the latest battlefields, monuments, artworks, and GPS coordinates.
                                            </p>
                                            <span className="result-sub-bold">
                                                All <strong>{totalSitesCount}</strong> historical sites are loaded & ready to explore!
                                            </span>
                                        </div>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="result-badge-icon badge-error">
                                        <AlertCircle size={28} />
                                    </div>
                                    <div className="result-text">
                                        <h4 className="result-title-error">Connection Issue</h4>
                                        <p className="result-msg">
                                            Could not reach the cloud repository. Please check your internet connection and try again.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="update-intro-section">
                            <div className="update-badge-enthusiastic">
                                <Zap size={14} />
                                <span>Instant Cloud Synchronization</span>
                            </div>
                            <p className="update-description">
                                Stay at the cutting edge of Napoleonic research! Check for newly documented battlefields, monuments, museums, and historical maps directly from the cloud repository.
                            </p>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="update-actions">
                        {!updateResult || !updateResult.success ? (
                            <button
                                className="btn-primary update-btn update-btn-enthusiastic"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <RefreshCw size={20} className="spin-icon" />
                                        <span>Fetching Latest Sites...</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudDownload size={22} />
                                        <span>Check & Update Sites Now</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="update-post-actions">
                                {updateResult.newSitesCount > 0 && (
                                    <button
                                        className="btn-primary update-btn update-btn-celebrate"
                                        onClick={handleExploreNewSites}
                                    >
                                        <Compass size={20} />
                                        <span>Explore new sites</span>
                                        <ArrowRight size={20} />
                                    </button>
                                )}
                                <button
                                    className="btn-outline update-recheck-btn"
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    style={updateResult.newSitesCount <= 0 ? { width: '100%', padding: '12px 16px' } : {}}
                                >
                                    <RefreshCw size={16} className={isUpdating ? 'spin-icon' : ''} />
                                    <span>{updateResult.newSitesCount > 0 ? 'Check Again' : 'Check for More Updates'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default UpdateSitesModal;


