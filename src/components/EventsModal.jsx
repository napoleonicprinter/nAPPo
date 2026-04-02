import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, MapPin, ExternalLink, BookOpen, CalendarDays } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import HistoryCalendarModal from './HistoryCalendarModal';
import './CardView.css';

const EventsModal = ({ onClose }) => {
    const { eventsData } = useAppContext();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    }, []);

    const todayString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 10002, // above standard modals
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
                    maxWidth: '600px',
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
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                            Today in nAPPo History
                        </h2>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{todayString}</span>
                    </div>

                    <div style={{ marginLeft: 'auto', marginRight: '40px' }}>
                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'var(--text-primary)',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'var(--accent-primary)';
                                e.currentTarget.style.color = '#000';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                        >
                            <CalendarDays size={16} />
                            View Calendar
                        </button>
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                            <MapPin size={14} /> {event.location}
                                        </div>

                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5', color: '#c9d1d9' }}>
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
        </div>,
        document.body
    );
};

export default EventsModal;
