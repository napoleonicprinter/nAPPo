import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Info, Tag, X } from 'lucide-react';
import './ShoppingView.css';

const DealsView = ({ onClose }) => {
    const { activeDeals, getPortalContainer } = useAppContext();
    const { t } = useTranslation();

    const sortedDeals = useMemo(() => {
        return [...activeDeals].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }, [activeDeals]);

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <div
                className="view-modal-content glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'fit-content',
                    maxWidth: '95%',
                    minWidth: 'min(350px, 90%)',
                    height: 'auto',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    margin: 'auto',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }}
            >
                {/* Header */}
                <div className="shopping-modal-header" style={{ padding: '1.2rem 1.5rem', flexShrink: 0, background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="modal-title-row" style={{ marginBottom: 0, gap: '12px' }}>
                        <img src="/assets/NT_logo.png" alt="NT Logo" className="modal-logo" style={{ height: '42px', width: 'auto' }} />
                        <div className="modal-title-info" style={{ maxWidth: '280px' }}>
                            <h2 style={{ fontSize: '1.15rem', lineHeight: 1.1 }}>{t('ui.deals_title', 'Exclusive Deals')}</h2>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2px' }}>{t('ui.deals_subtitle', 'Special offers for the community.')}</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="shopping-modal-body" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    overflowY: 'auto'
                }}>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            justifyContent: 'center',
                            width: '100%',
                            maxWidth: sortedDeals.length > 1 ? '850px' : '380px'
                        }}
                    >
                        {sortedDeals.length > 0 ? (
                            sortedDeals.map(deal => (
                                <div key={deal.id} className="shopping-card glass-panel" style={{
                                    width: '100%',
                                    maxWidth: '380px',
                                    minWidth: '280px',
                                    flex: '0 1 auto',
                                    margin: 0
                                }}>
                                    <div className="shopping-card-content">
                                        <div className="shopping-image-container" style={{ height: '180px' }}>
                                            <img src={deal.image} alt={deal.title} className="shopping-image" />
                                            <span
                                                className="badge category-badge"
                                                style={{
                                                    backgroundColor: 'var(--accent-warning)',
                                                    position: 'absolute',
                                                    bottom: '10px',
                                                    right: '10px',
                                                    zIndex: 10,
                                                    color: '#000',
                                                    fontWeight: '800'
                                                }}
                                            >
                                                <Tag size={12} />
                                                DEAL
                                            </span>
                                        </div>
                                        <div className="shopping-content" style={{ padding: '1.25rem' }}>
                                            <div className="shopping-header-row">
                                                <h2 className="shopping-title" style={{ fontSize: '1.1rem', fontWeight: '700' }}>{deal.title}</h2>
                                            </div>

                                            <p className="shopping-description" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{deal.description}</p>

                                            <div className="shopping-action-row" style={{ marginTop: '1rem' }}>
                                                {deal.link && (
                                                    <a
                                                        href={deal.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shop-link-btn"
                                                        style={{
                                                            background: 'var(--accent-warning)',
                                                            color: '#000',
                                                            padding: '0.7rem',
                                                            borderRadius: '10px',
                                                            width: '100%',
                                                            border: 'none',
                                                            boxShadow: '0 4px 10px rgba(210, 153, 34, 0.2)'
                                                        }}
                                                    >
                                                        <Info size={16} />
                                                        <span style={{ fontWeight: 'bold' }}>{t('ui.view_deal', 'Claim Deal')}</span>
                                                        <ExternalLink size={14} className="ext-icon" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-items-found">
                                <p>No active deals found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default DealsView;
