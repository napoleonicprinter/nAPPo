import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, BookOpen, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './HistoryCalendarModal.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ShowsCalendarModal = ({ onClose, showsData, onDayClick }) => {
    const [month, setMonth] = useState(new Date().getMonth());

    const gridYear = 2026; // Shows are mainly in 2026

    const currentYearEvents = useMemo(() => {
        // Find all events for the currently viewed month
        const monthEvents = {};
        (showsData || []).forEach(show => {
            if (!show.date) return;
            const eventDate = new Date(show.date);
            const eventYear = eventDate.getFullYear();
            const eventMonth = eventDate.getMonth();
            const eventDay = eventDate.getDate();
            
            if (eventMonth === month && eventYear === gridYear) {
                if (!monthEvents[eventDay]) {
                    monthEvents[eventDay] = [];
                }
                monthEvents[eventDay].push(show);
            }
        });
        
        // Sort events in each day
        Object.keys(monthEvents).forEach(day => {
            monthEvents[day].sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        return monthEvents;
    }, [month, showsData]);

    const prevMonth = () => {
        setMonth(prev => (prev === 0 ? 11 : prev - 1));
        setSelectedDateEvents(null);
    };

    const nextMonth = () => {
        setMonth(prev => (prev === 11 ? 0 : prev + 1));
        setSelectedDateEvents(null);
    };

    const handleDayClick = (day) => {
        if (currentYearEvents[day]) {
            if (onDayClick) {
                // Return a date string YYYY-MM-DD
                const d = new Date(gridYear, month, day);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                onDayClick(dateStr);
            }
        }
    };

    // Calculate calendar grid
    const daysInMonth = new Date(gridYear, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(gridYear, month, 1).getDay();
    
    const today = new Date();
    const isCurrentMonthIndicator = today.getFullYear() === gridYear && today.getMonth() === month;

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

    return (
        <div 
            className="view-modal-content glass-panel animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column' }}
        >
            <div className="calendar-modal-header">
                <button className="modal-close-btn" onClick={onClose} title="Close" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}>
                    <X size={24} />
                </button>

                {/* Month navigation row */}
                <div className="calendar-header-bottom" style={{ marginTop: '2rem' }}>
                    <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
                        <ChevronLeft size={22} />
                    </button>
                    <h2 className="calendar-title">{MONTHS[month]} 2026</h2>
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

        </div>
    );
};

export default ShowsCalendarModal;
