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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} className="animate-fade-in" onClick={onClose}>
            <div
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        background: 'var(--accent-primary)',
                        color: '#000',
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Newspaper size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                            Latest News
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    {sortedNews.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                            <Newspaper size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No news available.</p>
                        </div>
                    ) : (
                        <div className="shows-grid" style={{ gridTemplateColumns: '1fr', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                                            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5', color: '#c9d1d9', flex: 1 }}>
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
