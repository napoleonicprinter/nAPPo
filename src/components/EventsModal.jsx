import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, MapPin, ExternalLink, BookOpen, CalendarDays, Megaphone, ChevronRight, Map, ChevronUp } from 'lucide-react';
import { useAppContext, useBackHandler } from '../context/AppContext';
import HistoryCalendarModal from './HistoryCalendarModal';
import AnnouncementModal from './AnnouncementModal';
import './AnnouncementModal.css';
import './CardView.css';

const EventsModal = ({ onClose }) => {
    const { eventsData, messagesData, getPortalContainer, allSites, setView, setSelectedSite, setSiteToOpenPopup } = useAppContext();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(null);
    const [showTopBtn, setShowTopBtn] = useState(false);
    const containerRef = useRef(null);

    const handleScroll = () => {
        if (containerRef.current) {
            setShowTopBtn(containerRef.current.scrollTop > 180);
        }
    };

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useBackHandler('eventsHistoryCalendar', isCalendarOpen, () => setIsCalendarOpen(false), 35);
    useBackHandler('eventsAnnouncement', !!showAnnouncement, () => setShowAnnouncement(null), 35);

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

    const upcomingEvents = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentDay = today.getDate(); // 1-31
        const currentMmDd = currentMonth * 100 + currentDay;

        const all = (eventsData || []).filter(event => event && event.date);

        const withIndices = all.map(event => {
            const parts = event.date.split('-');
            const year = parseInt(parts[0], 10) || 0;
            const month = parseInt(parts[1], 10) || 1;
            const day = parseInt(parts[2], 10) || 1;
            const mmDd = month * 100 + day;
            let diff = mmDd - currentMmDd;
            if (diff < 0) {
                diff += 1232; // Wrap around for full annual cycle
            }
            const isToday = (month === currentMonth && day === currentDay);
            return { event, year, month, day, mmDd, diff, isToday };
        });

        withIndices.sort((a, b) => {
            if (a.diff !== b.diff) return a.diff - b.diff;
            return a.year - b.year;
        });

        return withIndices;
    }, [eventsData]);

    const handleOpenOnMap = (siteId) => {
        const site = allSites.find(s => String(s.id) === String(siteId));
        if (site) {
            setSelectedSite(null);
            setSiteToOpenPopup(null);
            setTimeout(() => {
                setSiteToOpenPopup(site);
                setView('map');
                onClose();
            }, 100);
        }
    };

    const todayString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="calendar-modal-header" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="modal-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
                            <img src="/assets/NT_logo.png" alt="NT Logo" className="modal-logo" />
                            <div className="modal-title-info" style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                                <h2 style={{ letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                                    Upcoming <span className="title-break">Events</span>
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                                    <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-primary)', fontWeight: '600', opacity: 1, whiteSpace: 'nowrap' }}>
                                        From {todayString}
                                    </p>
                                    <button
                                        onClick={() => {
                                            document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                            setIsCalendarOpen(true);
                                        }}
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
                        </div>

                        <button className="modal-close-btn" style={{ marginLeft: 'auto' }} onClick={onClose} title="Close">
                            <X size={18} strokeWidth={2.5} color="white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="calendar-modal-body" ref={containerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
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

                    {upcomingEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                            <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No historic events recorded.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {upcomingEvents.map(item => {
                                const { event, year, month, day, isToday } = item;
                                const targetSiteId = event.siteId || event.siteid;
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const formattedDate = `${day} ${monthNames[month - 1]}`;

                                return (
                                    <div key={event.id} style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderLeft: isToday ? '4px solid #ef5350' : '4px solid var(--accent-primary)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                                    {year}
                                                </span>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isToday && (
                                                    <span style={{
                                                        backgroundColor: '#ef5350',
                                                        color: '#fff',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '700',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        TODAY
                                                    </span>
                                                )}
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                            <MapPin size={14} /> {event.location}
                                        </div>

                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                            {event.description}
                                        </p>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {targetSiteId && (
                                                <button
                                                    onClick={() => handleOpenOnMap(targetSiteId)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--accent-primary)',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit'
                                                    }}
                                                    title="View on Map"
                                                >
                                                    <Map size={14} /> Map
                                                </button>
                                            )}
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

            {/* FLOATING TOP BUTTON AT BOTTOM RIGHT */}
            {showTopBtn && (
                <button
                    type="button"
                    className="scroll-to-top-btn glass-panel animate-fade-in"
                    onClick={scrollToTop}
                    title="Scroll to top"
                >
                    <ChevronUp size={16} style={{ marginRight: '4px' }} />
                    Top
                </button>
            )}
            {isCalendarOpen && (
                <HistoryCalendarModal
                    eventsData={eventsData}
                    onClose={() => setIsCalendarOpen(false)}
                    onCloseParent={onClose}
                />
            )}
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
