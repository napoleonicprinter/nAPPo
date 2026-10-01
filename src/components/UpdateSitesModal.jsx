import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CloudDownload, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Sparkles, Database, Clock, MapPin } from 'lucide-react';
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

    return createPortal(
        <div className="view-modal-overlay update-sites-modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className="view-modal-content glass-panel update-sites-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="update-modal-header">
                    <div className="update-modal-title-row">
                        <div className="update-logo-wrapper">
                            <img src="/assets/NT_logo.png" alt="nAPPo Trails" className="update-modal-logo-large" />
                        </div>
                        <div className="update-modal-title-info">
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
                    {/* Live Database Stats Badge */}
                    <div className="update-stats-showcase">
                        <div className="update-stat-box sites-stat-box">
                            <div className="stat-icon-wrapper sites-icon-bg">
                                <Database size={20} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Total Historical Sites</span>
                                <span className="stat-value-large">{totalSitesCount}</span>
                            </div>
                        </div>

                        <div className="update-stat-box sync-stat-box">
                            <div className="stat-icon-wrapper sync-icon-bg">
                                <Clock size={16} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Last Synchronization</span>
                                <span className="stat-date-prominent">{lastSyncTime || 'Ready to sync'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Result Banner */}
                    {updateResult ? (
                        <div className={`update-result-card animate-fade-in ${updateResult.success ? (updateResult.newSitesCount > 0 ? 'success-new-enthusiastic' : 'success-current-enthusiastic') : 'error-enthusiastic'}`}>
                            {updateResult.success ? (
                                updateResult.newSitesCount > 0 ? (
                                    <>
                                        <div className="result-badge-icon badge-new-pulse">
                                            <Sparkles size={24} className="sparkle-anim" />
                                        </div>
                                        <div className="result-text">
                                            <h4 className="result-title-celebration">🎉 New Sites Discovered!</h4>
                                            <p className="result-msg-celebration">
                                                <strong>+{updateResult.newSitesCount}</strong> brand new historical site{updateResult.newSitesCount > 1 ? 's have' : ' has'} been added to your app!
                                            </p>
                                            <div className="result-pill-badge">
                                                <MapPin size={13} />
                                                <span>Archive updated to <strong>{updateResult.totalSites}</strong> sites</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="result-badge-icon badge-current">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div className="result-text">
                                            <h4 className="result-title-uptodate">✨ Fully Synchronized!</h4>
                                            <p className="result-msg">
                                                Your archive is 100% up to date with all the latest sites, battlefields, monuments, and maps.
                                            </p>
                                            <span className="result-sub-bold">All <strong>{totalSitesCount}</strong> historical sites are loaded</span>
                                        </div>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="result-badge-icon badge-error">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="result-text">
                                        <h4 className="result-title-error">Sync Error</h4>
                                        <p className="result-msg">
                                            Could not reach the database. Please verify your connection.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="update-intro-section">
                            <div className="update-badge">
                                <Sparkles size={13} style={{ marginRight: '4px' }} />
                                <span>Cloud Synchronization</span>
                            </div>
                            <p className="update-description">
                                Sync with the cloud repository to instantly download the latest Napoleonic battlefields, monuments, artworks, and research updates.
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
                                        <RefreshCw size={19} className="spin-icon" />
                                        <span>Syncing with Cloud...</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudDownload size={20} />
                                        <span>Check & Update Sites Now</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="update-post-actions">
                                {updateResult.newSitesCount > 0 && (
                                    <button
                                        className="btn-primary update-btn update-btn-glow"
                                        onClick={handleExploreNewSites}
                                    >
                                        <Sparkles size={18} />
                                        <span>Explore new sites</span>
                                        <ArrowRight size={18} />
                                    </button>
                                )}
                                <button
                                    className="btn-outline update-recheck-btn"
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    style={updateResult.newSitesCount <= 0 ? { width: '100%', padding: '10px 14px' } : {}}
                                >
                                    <RefreshCw size={15} className={isUpdating ? 'spin-icon' : ''} />
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

