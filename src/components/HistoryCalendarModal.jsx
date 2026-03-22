import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, BookOpen, ExternalLink } from 'lucide-react';
import eventsData from '../data/events.json';
import './HistoryCalendarModal.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['All years', ...Array.from({length: 1815 - 1793 + 1}, (_, i) => 1793 + i)];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HistoryCalendarModal = ({ onClose }) => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState('All years');
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);

    // Use selected year to align weekdays, or 2024 (leap year) for 'All years' to ensure all days fit
    const gridYear = selectedYear === 'All years' ? 2024 : selectedYear;

    const currentYearEvents = useMemo(() => {
        // Find all events for the currently viewed month
        const monthEvents = {};
        eventsData.forEach(event => {
            if (!event.date) return;
            const parts = event.date.split('-');
            if (parts.length >= 3) {
                const eventYear = parseInt(parts[0], 10);
                const eventMonth = parseInt(parts[1], 10) - 1; // 0-indexed
                const eventDay = parseInt(parts[2], 10);
                
                if (eventMonth === month && (selectedYear === 'All years' || eventYear === selectedYear)) {
                    if (!monthEvents[eventDay]) {
                        monthEvents[eventDay] = [];
                    }
                    monthEvents[eventDay].push(event);
                }
            }
        });
        
        // Sort events in each day by year
        Object.keys(monthEvents).forEach(day => {
            monthEvents[day].sort((a, b) => {
                const yearA = parseInt(a.date.split('-')[0], 10) || 0;
                const yearB = parseInt(b.date.split('-')[0], 10) || 0;
                return yearA - yearB;
            });
        });

        return monthEvents;
    }, [month, selectedYear]);

    const prevMonth = () => {
        setMonth(prev => {
            if (prev === 0) {
                if (selectedYear !== 'All years' && selectedYear > 1793) {
                    setSelectedYear(selectedYear - 1);
                }
                return 11;
            }
            return prev - 1;
        });
        setSelectedDateEvents(null);
    };

    const nextMonth = () => {
        setMonth(prev => {
            if (prev === 11) {
                if (selectedYear !== 'All years' && selectedYear < 1815) {
                    setSelectedYear(selectedYear + 1);
                }
                return 0;
            }
            return prev + 1;
        });
        setSelectedDateEvents(null);
    };

    const handleDayClick = (day) => {
        if (currentYearEvents[day]) {
            setSelectedDateEvents({
                day,
                events: currentYearEvents[day]
            });
        }
    };

    // Calculate calendar grid
    const daysInMonth = new Date(gridYear, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(gridYear, month, 1).getDay();
    
    const today = new Date();
    const isCurrentMonthIndicator = (selectedYear === 'All years' || selectedYear === today.getFullYear()) && today.getMonth() === month;

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const hasEvents = !!currentYearEvents[day];
        const isToday = isCurrentMonthIndicator && today.getDate() === day;
        
        days.push(
            <div 
                key={`day-${day}`} 
                className={`calendar-day ${hasEvents ? 'has-events' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
            >
                <span className="day-number">{day}</span>
            </div>
        );
    }

    return createPortal(
        <div className="history-calendar-overlay animate-fade-in" onClick={onClose}>
            <div 
                className="history-calendar-panel glass-panel" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="history-calendar-header">
                    <div className="calendar-nav-controls">
                        <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="calendar-month-year">
                            <h2 className="calendar-title">{MONTHS[month]}</h2>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(e.target.value === 'All years' ? 'All years' : parseInt(e.target.value))}
                                className="glass-panel"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button className="calendar-nav-btn" onClick={nextMonth} title="Next Month">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    
                    <button className="calendar-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="history-calendar-body">
                    <div className="calendar-weekdays">
                        {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="calendar-grid">
                        {days}
                    </div>
                </div>

                {/* Popup for Selected Date's Events */}
                {selectedDateEvents && (
                    <div className="day-popup-overlay animate-fade-in" onClick={() => setSelectedDateEvents(null)}>
                        <div className="day-popup-content" onClick={(e) => e.stopPropagation()}>
                            <div className="day-popup-header">
                                <h3>{MONTHS[month]} {selectedDateEvents.day} in History</h3>
                                <button className="calendar-close-btn" style={{position: 'static'}} onClick={() => setSelectedDateEvents(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="day-popup-events">
                                {selectedDateEvents.events.map(event => {
                                    const eventYear = parseInt(event.date.split('-')[0], 10);
                                    return (
                                        <div key={event.id} className="history-event-item">
                                            <span className="year">{eventYear}</span>
                                            <h4>{event.title}</h4>
                                            
                                            {event.location && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                                                    <MapPin size={14} /> {event.location}
                                                </div>
                                            )}

                                            <p>{event.description}</p>
                                            
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
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
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default HistoryCalendarModal;
