import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, User, Info, ExternalLink, Filter, Tag, ChevronDown, Globe, X, CalendarDays } from 'lucide-react';
import ShowsCalendarModal from './ShowsCalendarModal';
import './CalendarView.css';

const SHOW_CATEGORIES = ['Categories', 'Reenactment', 'Ball', 'Lecture', 'Exhibition', 'Book release'];
const SHOW_MONTHS = ['Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

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
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isShowsCalendarOpen, setIsShowsCalendarOpen] = useState(false);

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
        return ['Countries', ...Array.from(uniqueCountries).sort()];
    }, [showsToCome]);

    const [selectedCountry, setSelectedCountry] = useState('');

    const filteredShows = useMemo(() => {
        return showsToCome
            .filter(show => {
                const categoryMatch = selectedCategory === '' || show.category === selectedCategory;
                const monthMatch = selectedMonth === '' || show.month === selectedMonth;
                const countryMatch = selectedCountry === '' || show.country === selectedCountry;

                return categoryMatch && monthMatch && countryMatch;
            })
            .filter(show => {
                if (!selectedDate) return true;
                return show.date === selectedDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [showsToCome, selectedCategory, selectedMonth, selectedCountry, selectedDate]);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
        setIsMonthDropdownOpen(false);
    };

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ display: isShowsCalendarOpen ? 'none' : 'flex' }}>
                <div className="calendar-modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon-container">
                            <Calendar size={24} />
                        </div>
                        <div className="modal-title-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <h2>Upcoming Events</h2>
                                {selectedDate && (
                                    <span 
                                        className="badge" 
                                        style={{ backgroundColor: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#000' }} 
                                        onClick={() => setSelectedDate(null)}
                                        title="Clear date filter"
                                    >
                                        {selectedDate} <X size={12} style={{ marginLeft: '4px' }} />
                                    </span>
                                )}
                            </div>
                            <p>Discover Napoleonic events and reenactments worlwide</p>
                        </div>
                        <img src="/assets/images/NT_logo.webp" alt="NT Logo" style={{ height: '32px', marginLeft: 'auto' }} />
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
                                <span className="selected-text">{selectedCategory || 'Categories'}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCategoryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {SHOW_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            className={`dropdown-option ${selectedCategory === cat ? 'selected' : ''} ${cat !== 'Categories' && activeStats.categories[cat] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {cat}
                                            {cat !== 'Categories' && activeStats.categories[cat] > 0 && (
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
                                <span className="selected-text">{selectedCountry || 'Countries'}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCountryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCountryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {countries.map(country => (
                                        <button
                                            key={country}
                                            className={`dropdown-option ${selectedCountry === country ? 'selected' : ''} ${country !== 'Countries' && activeStats.countries[country] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCountry(country);
                                                setIsCountryDropdownOpen(false);
                                            }}
                                        >
                                            {country}
                                            {country !== 'Countries' && activeStats.countries[country] > 0 && (
                                                <span className="item-count-indicator">{activeStats.countries[country]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Month Dropdown & Calendar View */}
                        <div style={{ display: 'flex', gap: '0.8rem', flex: 1, minWidth: '260px' }}>
                            <div className="custom-dropdown-container" style={{ flex: 1 }}>
                                <button
                                    className="category-filter-wrapper glass-panel dropdown-trigger"
                                    onClick={() => {
                                        setIsMonthDropdownOpen(!isMonthDropdownOpen);
                                        setIsCategoryDropdownOpen(false);
                                        setIsCountryDropdownOpen(false);
                                    }}
                                    style={{ width: '100%', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
                                >
                                    <Calendar size={16} className="filter-icon" />
                                    <span className="selected-text" style={{ fontSize: '0.85rem' }}>{selectedMonth || 'Months'}</span>
                                    <ChevronDown size={14} className={`chevron-icon ${isMonthDropdownOpen ? 'rotated' : ''}`} />
                                </button>

                                {isMonthDropdownOpen && (
                                    <div className="dropdown-menu glass-panel animate-fade-in">
                                        {SHOW_MONTHS.map(month => (
                                            <button
                                                key={month}
                                                className={`dropdown-option ${selectedMonth === month ? 'selected' : ''} ${month !== 'Months' && activeStats.months[month] ? 'has-items' : ''}`}
                                                onClick={() => {
                                                    handleMonthChange(month);
                                                }}
                                            >
                                                {month}
                                                {month !== 'Months' && activeStats.months[month] > 0 && (
                                                    <span className="item-count-indicator">{activeStats.months[month]}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                className="category-filter-wrapper glass-panel"
                                onClick={() => setIsShowsCalendarOpen(true)}
                                style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
                            >
                                <CalendarDays size={16} className="filter-icon" />
                                <span className="selected-text" style={{ fontSize: '0.85rem' }}>Calendar View</span>
                            </button>
                        </div>
                    </div>

                </div>

                <div className="calendar-modal-body">

                    <div className="shows-grid">
                        {filteredShows.length > 0 ? (
                            filteredShows.map(show => (
                                <div key={show.id} className="show-card glass-panel">
                                    <div className="show-content" style={{ flexDirection: 'row-reverse' }}>
                                        <div className="show-image-container">
                                            <img src={show.image} alt={show.name} className="show-image" />
                                            {show.category && (
                                                <span 
                                                    className="badge category-badge" 
                                                    style={{ 
                                                        backgroundColor: getEventCategoryColor(show.category),
                                                        position: 'absolute',
                                                        bottom: '12px',
                                                        right: '12px',
                                                        zIndex: 10,
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    <Tag size={12} />
                                                    {show.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="show-info">
                                            <div className="show-header-row">
                                                <h2 className="show-title">{show.name}</h2>
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
            
            {isShowsCalendarOpen && (
                <ShowsCalendarModal 
                    showsData={filteredShows} 
                    onClose={() => setIsShowsCalendarOpen(false)} 
                    onDayClick={(date) => {
                        setIsShowsCalendarOpen(false);
                        setSelectedDate(date);
                    }}
                />
            )}
        </div>,
        document.body
    );
};

export default CalendarView;
