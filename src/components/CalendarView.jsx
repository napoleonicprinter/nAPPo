import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, User, Info, ExternalLink, Filter, Tag, ChevronDown, Globe, X } from 'lucide-react';
import './CalendarView.css';

const SHOW_CATEGORIES = ['All Categories', 'Reenactment', 'Ball', 'Lecture', 'Exhibition', 'Book release'];
const SHOW_MONTHS = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const getEventCategoryColor = (category) => {
    switch (category) {
        case 'Reenactment': return '#f85149';
        case 'Ball': return '#151294';
        case 'Lecture': return '#58a6ff';
        case 'Exhibition': return '#a371f7';
        case 'Book release': return '#d29922';
        default: return '#8b949e';
    }
};

const CalendarView = ({ onClose }) => {
    const { showsToCome } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    // Identify months/categories/countries that have at least one show
    const activeStats = useMemo(() => {
        const stats = { months: {}, categories: {}, countries: {} };
        showsToCome.forEach(show => {
            if (show.month) stats.months[show.month] = (stats.months[show.month] || 0) + 1;
            if (show.category) stats.categories[show.category] = (stats.categories[show.category] || 0) + 1;
            if (show.country) stats.countries[show.country] = (stats.countries[show.country] || 0) + 1;
        });
        return stats;
    }, [showsToCome]);

    const countries = useMemo(() => {
        const uniqueCountries = new Set(showsToCome.map(show => show.country).filter(Boolean));
        return ['All Countries', ...Array.from(uniqueCountries).sort()];
    }, [showsToCome]);

    const [selectedCountry, setSelectedCountry] = useState('All Countries');

    const filteredShows = useMemo(() => {
        return showsToCome
            .filter(show => {
                const categoryMatch = selectedCategory === 'All Categories' || show.category === selectedCategory;
                const monthMatch = selectedMonth === 'All Months' || show.month === selectedMonth;
                const countryMatch = selectedCountry === 'All Countries' || show.country === selectedCountry;

                return categoryMatch && monthMatch && countryMatch;
            })
            .filter(show => {
                if (!selectedDay) return true;
                const showDay = new Date(show.date).getDate();
                return showDay === selectedDay;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [showsToCome, selectedCategory, selectedMonth, selectedCountry, selectedDay]);

    // Calendar generation logic
    const calendarDays = useMemo(() => {
        if (selectedMonth === 'All Months') return null;

        const monthIndex = SHOW_MONTHS.indexOf(selectedMonth) - 1; // 0-indexed
        const year = 2026; // Shows are mostly 2026
        
        const firstDay = new Date(year, monthIndex, 1).getDay();
        const lastDate = new Date(year, monthIndex + 1, 0).getDate();
        
        const days = [];
        // Empty slots
        for (let i = 0; i < firstDay; i++) days.push({ type: 'empty' });
        
        // Actual days
        for (let d = 1; d <= lastDate; d++) {
            const showsOnThisDay = filteredShows.filter(s => {
                const dateObj = new Date(s.date);
                return dateObj.getDate() === d && dateObj.getMonth() === monthIndex;
            });
            
            days.push({
                type: 'day',
                day: d,
                hasShows: showsOnThisDay.length > 0,
                showCount: showsOnThisDay.length
            });
        }
        
        return days;
    }, [selectedMonth, filteredShows]);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
        setSelectedDay(null);
        setIsMonthDropdownOpen(false);
    };

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon-container">
                            <Calendar size={24} />
                        </div>
                        <div className="modal-title-info">
                            <h2>Upcoming Events</h2>
                            <p>Discover Napoleonic events and reenactments worlwide</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="calendar-controls">
                        {/* Category Dropdown */}
                        <div className="custom-dropdown-container">
                            <button
                                className="category-filter-wrapper glass-panel dropdown-trigger"
                                onClick={() => {
                                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                                    setIsCountryDropdownOpen(false);
                                    setIsMonthDropdownOpen(false);
                                }}
                            >
                                <Tag size={18} className="filter-icon" />
                                <span className="selected-text">{selectedCategory}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCategoryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {SHOW_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            className={`dropdown-option ${selectedCategory === cat ? 'selected' : ''} ${cat !== 'All Categories' && activeStats.categories[cat] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {cat}
                                            {cat !== 'All Categories' && activeStats.categories[cat] > 0 && (
                                                <span className="item-count-indicator">{activeStats.categories[cat]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Country Dropdown */}
                        <div className="custom-dropdown-container">
                            <button
                                className="category-filter-wrapper glass-panel dropdown-trigger"
                                onClick={() => {
                                    setIsCountryDropdownOpen(!isCountryDropdownOpen);
                                    setIsCategoryDropdownOpen(false);
                                    setIsMonthDropdownOpen(false);
                                }}
                            >
                                <Globe size={18} className="filter-icon" />
                                <span className="selected-text">{selectedCountry}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCountryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCountryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {countries.map(country => (
                                        <button
                                            key={country}
                                            className={`dropdown-option ${selectedCountry === country ? 'selected' : ''} ${country !== 'All Countries' && activeStats.countries[country] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCountry(country);
                                                setIsCountryDropdownOpen(false);
                                            }}
                                        >
                                            {country}
                                            {country !== 'All Countries' && activeStats.countries[country] > 0 && (
                                                <span className="item-count-indicator">{activeStats.countries[country]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Month Dropdown */}
                        <div className="custom-dropdown-container">
                            <button
                                className="category-filter-wrapper glass-panel dropdown-trigger"
                                onClick={() => {
                                    setIsMonthDropdownOpen(!isMonthDropdownOpen);
                                    setIsCategoryDropdownOpen(false);
                                    setIsCountryDropdownOpen(false);
                                }}
                            >
                                <Calendar size={18} className="filter-icon" />
                                <span className="selected-text">{selectedMonth}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isMonthDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isMonthDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {SHOW_MONTHS.map(month => (
                                        <button
                                            key={month}
                                            className={`dropdown-option ${selectedMonth === month ? 'selected' : ''} ${month !== 'All Months' && activeStats.months[month] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                handleMonthChange(month);
                                            }}
                                        >
                                            {month}
                                            {month !== 'All Months' && activeStats.months[month] > 0 && (
                                                <span className="item-count-indicator">{activeStats.months[month]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="calendar-modal-body">
                    {selectedMonth !== 'All Months' && calendarDays && (
                        <div className="shows-calendar-container animate-fade-in">
                            <div className="calendar-grid-header">
                                <h3>{selectedMonth} 2026</h3>
                                {selectedDay && (
                                    <button 
                                        className="clear-day-btn"
                                        onClick={() => setSelectedDay(null)}
                                    >
                                        Show All Days
                                    </button>
                                )}
                            </div>
                            <div className="calendar-weekdays">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="calendar-grid">
                                {calendarDays.map((d, index) => (
                                    <div 
                                        key={index}
                                        className={`calendar-day ${d.type === 'empty' ? 'empty' : ''} ${d.hasShows ? 'has-shows' : ''} ${selectedDay === d.day ? 'selected' : ''}`}
                                        onClick={() => d.hasShows && setSelectedDay(d.day)}
                                    >
                                        {d.type === 'day' && (
                                            <>
                                                <span className="day-number">{d.day}</span>
                                                {d.showCount > 0 && <span className="show-count">({d.showCount})</span>}
                                            </>
                                        )}
                                        {d.hasShows && <div className="show-dot" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="shows-grid">
                        {filteredShows.length > 0 ? (
                            filteredShows.map(show => (
                                <div key={show.id} className="show-card glass-panel">
                                    <div className="show-content">
                                        <div className="show-image-container">
                                            <img src={show.image} alt={show.name} className="show-image" />
                                        </div>
                                        <div className="show-info">
                                            <div className="show-header-row">
                                                <h2 className="show-title">{show.name}</h2>
                                                {show.category && (
                                                    <span className="badge category-badge" style={{ backgroundColor: getEventCategoryColor(show.category) }}>
                                                        <Tag size={12} />
                                                        {show.category}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="show-meta">
                                                <div className="meta-item">
                                                    <Calendar size={16} />
                                                    <span>{new Date(show.date).toLocaleDateString(undefined, {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <MapPin size={16} />
                                                    <span>{show.venue}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <User size={16} />
                                                    <span>Organized by: {show.organizer}</span>
                                                </div>
                                            </div>

                                            <p className="show-description">{show.description}</p>

                                            <a
                                                href={show.moreInfo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="more-info-link"
                                            >
                                                <Info size={16} />
                                                <span>More Info</span>
                                                <ExternalLink size={14} className="ext-icon" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-shows-found">
                                <p>No shows found for the selected filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CalendarView;
