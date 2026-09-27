import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CloudDownload, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useAppContext, useBackHandler } from '../context/AppContext';
import './UpdateSitesModal.css';

const UpdateSitesModal = ({ isOpen, onClose }) => {
    const { getPortalContainer, checkForDataUpdates, lastSyncTime, sites } = useAppContext();
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

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className="view-modal-content glass-panel update-sites-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="update-modal-header">
                    <div className="update-modal-title-row">
                        <img src="/assets/NT_logo.png" alt="nAPPo Trails" className="update-modal-logo" />
                        <div className="update-modal-title-info">
                            <h2>Database Update</h2>
                            <p>Napoleonic historical sites</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} title="Close">
                        <X size={20} strokeWidth={2.5} color="white" />
                    </button>
                </div>

                {/* Body */}
                <div className="update-modal-body">
                    <div className="update-intro-section">
                        <div className="update-badge">
                            <span>Cloud Synchronization</span>
                        </div>
                        <p className="update-description">
                            Check for newly added historical sites, battlefields, monuments, and events directly from the cloud repository.
                        </p>
                    </div>

                    {/* Result Banner */}
                    {updateResult && (
                        <div className={`update-result-card animate-fade-in ${updateResult.success ? (updateResult.newSitesCount > 0 ? 'success-new' : 'success-current') : 'error'}`}>
                            {updateResult.success ? (
                                updateResult.newSitesCount > 0 ? (
                                    <>
                                        <CheckCircle2 size={28} className="result-icon result-icon-success" />
                                        <div className="result-text">
                                            <h4 className="result-title">New Sites Updated!</h4>
                                            <p className="result-msg">
                                                <strong>{updateResult.newSitesCount}</strong> new site{updateResult.newSitesCount > 1 ? 's have' : ' has'} been added to your app.
                                            </p>
                                            <span className="result-sub">Total database sites: {updateResult.totalSites}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={28} className="result-icon result-icon-info" />
                                        <div className="result-text">
                                            <h4 className="result-title">App is Up to Date</h4>
                                            <p className="result-msg">
                                                You already have all the latest sites and data.
                                            </p>
                                            <span className="result-sub">Total sites: {updateResult.totalSites || sites.length}</span>
                                        </div>
                                    </>
                                )
                            ) : (
                                <>
                                    <AlertCircle size={28} className="result-icon result-icon-error" />
                                    <div className="result-text">
                                        <h4 className="result-title">Update Failed</h4>
                                        <p className="result-msg">
                                            Could not reach the server. Please verify your internet connection.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="update-actions">
                        {!updateResult || !updateResult.success ? (
                            <button
                                className="btn-primary update-btn"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <RefreshCw size={18} className="spin-icon" />
                                        <span>Checking for New Sites...</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudDownload size={18} />
                                        <span>Check & Update Sites</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="update-post-actions">
                                <button
                                    className="btn-primary update-btn"
                                    onClick={onClose}
                                >
                                    <span>Explore Map</span>
                                    <ArrowRight size={18} />
                                </button>
                                <button
                                    className="btn-outline update-recheck-btn"
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                >
                                    <RefreshCw size={15} className={isUpdating ? 'spin-icon' : ''} />
                                    <span>Check Again</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Timestamp info */}
                    <div className="update-footer-info">
                        <span>Current sites: <strong>{sites.length}</strong></span>
                        {lastSyncTime && (
                            <span className="update-last-time">Last sync: {lastSyncTime}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default UpdateSitesModal;
