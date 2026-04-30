import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, BookOpen, ExternalLink, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import './HistoryCalendarModal.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['All years', ...Array.from({length: 1815 - 1793 + 1}, (_, i) => 1793 + i)];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HistoryCalendarModal = ({ onClose, eventsData }) => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState('All years');
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

    // Use selected year to align weekdays, or 2024 (leap year) for 'All years' to ensure all days fit
    const gridYear = selectedYear === 'All years' ? 2024 : selectedYear;

    const currentYearEvents = useMemo(() => {
        // Find all events for the currently viewed month
        const monthEvents = {};
        (eventsData || []).forEach(event => {
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
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
                <span className="day-number">{day}</span>
                {hasEvents && (
                    <span className="day-count" style={{ fontSize: '0.75em', marginTop: '2px', opacity: 0.8 }}>({currentYearEvents[day].length})</span>
                )}
            </div>
        );
    }

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div 
                className="view-modal-content glass-panel" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '800px' }}
            >
                <div className="calendar-modal-header">
                    {/* Year dropdown row — centered */}
                    <div className="history-year-row">
                        <div className="custom-dropdown-container history-year-dropdown">
                            <button
                                className="category-filter-wrapper glass-panel dropdown-trigger"
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            >
                                <CalendarIcon size={18} className="filter-icon" />
                                <span className="selected-text">{selectedYear}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isYearDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isYearDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                    {YEARS.map(y => (
                                        <button
                                            key={y}
                                            className={`dropdown-option ${selectedYear === y ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedYear(y === 'All years' ? 'All years' : parseInt(y));
                                                setIsYearDropdownOpen(false);
                                            }}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="modal-close-btn" onClick={onClose} title="Close">
                        <X size={24} />
                    </button>

                    {/* Month navigation row */}
                    <div className="calendar-header-bottom">
                        <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
                            <ChevronLeft size={22} />
                        </button>
                        <h2 className="calendar-title">{MONTHS[month]}</h2>
                        <button className="calendar-nav-btn" onClick={nextMonth} title="Next Month">
                            <ChevronRight size={22} />
                        </button>
                    </div>
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
                                <button className="modal-close-btn" onClick={() => setSelectedDateEvents(null)}>
                                    <X size={24} />
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
