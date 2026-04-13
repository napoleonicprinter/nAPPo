import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Newspaper, Calendar as CalendarIcon, ExternalLink, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './CalendarView.css';

const NewsModal = ({ onClose }) => {
    const { newsData } = useAppContext();

    const sortedNews = useMemo(() => {
        return (newsData || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [newsData]);

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="shopping-modal-header" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="modal-title-row">
                        <div className="modal-icon-container" style={{ background: 'var(--accent-primary)', color: '#000' }}>
                            <Newspaper size={24} />
                        </div>
                        <div className="modal-title-info">
                            <h2>Latest nAPPo Trails News</h2>
                            <p>Discover latest nAPPO Trails updates</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="calendar-modal-body" style={{ padding: '2rem' }}>
                    {sortedNews.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                            <Newspaper size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No news available.</p>
                        </div>
                    ) : (
                        <div className="shows-grid">
                            {sortedNews.map(item => (
                                <div key={item.id} className="show-card glass-panel news-card">
                                    <div className="show-content">
                                        {item.image && (
                                            <div className="news-image-container">
                                                <img src={item.image} alt={item.title} className="show-image" />
                                            </div>
                                        )}
                                        <div className="show-info" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.title}</h3>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                                <CalendarIcon size={14} />
                                                <span>{new Date(item.date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>

                                            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)', flex: 1 }}>
                                                {item.description}
                                            </p>

                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="more-info-link"
                                                    style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                                                >
                                                    <Info size={16} />
                                                    <span>Read More</span>
                                                    <ExternalLink size={14} className="ext-icon" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NewsModal;
