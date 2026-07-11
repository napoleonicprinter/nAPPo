import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, MapPin, ExternalLink, BookOpen, CalendarDays, Megaphone, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import HistoryCalendarModal from './HistoryCalendarModal';
import AnnouncementModal from './AnnouncementModal';
import './AnnouncementModal.css';
import './CardView.css';

const EventsModal = ({ onClose }) => {
    const { eventsData, messagesData, getPortalContainer } = useAppContext();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(null);

    // Find active announcements within date range
    const activeMessages = useMemo(() => {
        if (!messagesData || messagesData.length === 0) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return messagesData.filter(msg => {
            const from = new Date(msg.from + 'T00:00:00');
            const until = new Date(msg.until + 'T23:59:59');
            return today >= from && today <= until;
        });
    }, [messagesData]);

    const todaysEvents = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentDay = today.getDate(); // 1-31

        return (eventsData || []).filter(event => {
            if (!event.date) return false;
            const parts = event.date.split('-');
            if (parts.length >= 3) {
                const eventMonth = parseInt(parts[1], 10);
                const eventDay = parseInt(parts[2], 10);
                return eventMonth === currentMonth && eventDay === currentDay;
            }
            return false;
        }).sort((a, b) => {
            const yearA = parseInt(a.date.split('-')[0], 10) || 0;
            const yearB = parseInt(b.date.split('-')[0], 10) || 0;
            return yearA - yearB;
        });
    }, [eventsData]);

    const todayString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="calendar-modal-header" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="modal-title-row" style={{ gap: '12px' }}>
                        <img src="/assets/NT_logo.png" alt="NT Logo" className="modal-logo" />
                        <div className="modal-title-info" style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                            <h2 style={{ letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                                Today in <span className="title-break">History</span>
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                                <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-primary)', fontWeight: '600', opacity: 1, whiteSpace: 'nowrap' }}>
                                    {todayString}
                                </p>
                                <button
                                    onClick={() => setIsCalendarOpen(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'var(--text-primary)',
                                        padding: '4px 10px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <CalendarDays size={16} />
                                    <span style={{ whiteSpace: 'nowrap' }} className="hide-on-mobile">Cal</span>
                                </button>
                            </div>
                        </div>

                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="calendar-modal-body" style={{ padding: '2rem' }}>
                    {/* Announcement retrieval cards */}
                    {activeMessages.map(msg => (
                        <div
                            key={msg.id}
                            className="announcement-retrieval-card"
                            onClick={() => setShowAnnouncement(msg)}
                        >
                            <div className="announcement-retrieval-icon">
                                <Megaphone size={20} />
                            </div>
                            <div className="announcement-retrieval-info">
                                <h4>{msg.title}</h4>
                                <p>Tap to view announcement</p>
                            </div>
                            <ChevronRight size={20} className="announcement-retrieval-arrow" />
                        </div>
                    ))}

                    {todaysEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                            <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No major historic events recorded for today.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {todaysEvents.map(event => {
                                const year = parseInt(event.date.split('-')[0], 10);
                                return (
                                    <div key={event.id} style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderLeft: '4px solid var(--accent-primary)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                                {year}
                                            </span>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                                {event.title}
                                            </h3>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                            <MapPin size={14} /> {event.location}
                                        </div>

                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                            {event.description}
                                        </p>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {event.wikipedia_link && (
                                                <a href={event.wikipedia_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                                    <BookOpen size={14} /> Wikipedia
                                                </a>
                                            )}
                                            {event.more_info_link && (
                                                <a href={event.more_info_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                                    <ExternalLink size={14} /> More Info
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {isCalendarOpen && <HistoryCalendarModal eventsData={eventsData} onClose={() => setIsCalendarOpen(false)} />}
            {showAnnouncement && (
                <AnnouncementModal
                    message={showAnnouncement}
                    onClose={() => setShowAnnouncement(null)}
                />
            )}
        </div>,
        getPortalContainer()
    );
};

export default EventsModal;
