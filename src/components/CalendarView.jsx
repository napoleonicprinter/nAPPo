import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, User, Info, ExternalLink, Filter, Tag, ChevronDown, Globe } from 'lucide-react';
import './CalendarView.css';

const SHOW_CATEGORIES = ['All Categories', 'Reenactment', 'Conference', 'Exhibition', 'Book release'];
const SHOW_MONTHS = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const getEventCategoryColor = (category) => {
    switch (category) {
        case 'Reenactment': return '#f85149'; // Direct Action/Battle feel
        case 'Conference': return '#58a6ff'; // Information/Logic feel
        case 'Exhibition': return '#a371f7'; // Arts/Culture feel
        case 'Book release': return '#d29922'; // Educational/Warning feel
        default: return '#8b949e';
    }
};

const CalendarView = () => {
    const { showsToCome } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

    // Identify months that have at least one show and count them
    const activeMonths = useMemo(() => {
        const counts = {};
        showsToCome.forEach(show => {
            if (show.month) {
                counts[show.month] = (counts[show.month] || 0) + 1;
            }
        });
        return counts;
    }, [showsToCome]);

    const countries = useMemo(() => {
        const uniqueCountries = new Set(showsToCome.map(show => show.country).filter(Boolean));
        return ['All Countries', ...Array.from(uniqueCountries).sort()];
    }, [showsToCome]);

    const [selectedCountry, setSelectedCountry] = useState('All Countries');

    const filteredShows = useMemo(() => {
        return showsToCome.filter(show => {
            const categoryMatch = selectedCategory === 'All Categories' || show.category === selectedCategory;
            const monthMatch = selectedMonth === 'All Months' || show.month === selectedMonth;
            const countryMatch = selectedCountry === 'All Countries' || show.country === selectedCountry;

            return categoryMatch && monthMatch && countryMatch;
        });
    }, [showsToCome, selectedCategory, selectedMonth, selectedCountry]);

    if (!showsToCome || showsToCome.length === 0) {
        return (
            <div className="calendar-empty animate-fade-in">
                <Calendar size={48} />
                <p>No upcoming events found.</p>
            </div>
        );
    }

    return (
        <div className="calendar-container animate-fade-in">
            <div className="calendar-header">
                <h1>Upcoming Events</h1>
                <p>Discover heritage events and historic reenactments across the world.</p>

                <div className="calendar-controls">
                    <div className="category-filter-wrapper glass-panel">
                        <Tag size={18} className="filter-icon" />
                        <select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {SHOW_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="category-filter-wrapper glass-panel">
                        <Globe size={18} className="filter-icon" />
                        <select
                            className="category-select"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div className="custom-month-select-container">
                        <button
                            className="category-filter-wrapper glass-panel month-dropdown-trigger"
                            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                        >
                            <Calendar size={18} className="filter-icon" />
                            <span className="selected-month-text">{selectedMonth}</span>
                            <ChevronDown size={16} className={`chevron-icon ${isMonthDropdownOpen ? 'rotated' : ''}`} />
                        </button>

                        {isMonthDropdownOpen && (
                            <div className="month-dropdown-menu glass-panel animate-fade-in">
                                {SHOW_MONTHS.map(month => (
                                    <button
                                        key={month}
                                        className={`month-option ${selectedMonth === month ? 'selected' : ''} ${month !== 'All Months' && activeMonths[month] ? 'has-shows' : ''}`}
                                        onClick={() => {
                                            setSelectedMonth(month);
                                            setIsMonthDropdownOpen(false);
                                        }}
                                    >
                                        {month}
                                        {month !== 'All Months' && activeMonths[month] > 0 && (
                                            <span className="show-count-indicator">{activeMonths[month]}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
    );
};

export default CalendarView;
