import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, User, Info, ExternalLink, Filter, Tag, ChevronDown, Globe, X, CalendarDays } from 'lucide-react';
import ShowsCalendarModal from './ShowsCalendarModal';
import './CalendarView.css';

const SHOW_CATEGORIES = ['Reenactment', 'Ball', 'Lecture', 'Exhibition', 'Book release'];
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
    const { showsToCome, getPortalContainer } = useAppContext();
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
        return ['Country', ...Array.from(uniqueCountries).sort()];
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
            <style>{`
                    @media (max-width: 768px) {
                        .shows-mobile-fix-content {
                            flex-direction: column !important;
                            height: auto !important;
                            min-height: 0 !important;
                        }
                        .shows-mobile-fix-image {
                            width: 100% !important;
                            height: 180px !important;
                            flex: 0 0 auto !important;
                        }
                        .shows-mobile-fix-info {
                            display: flex !important;
                            flex: 1 1 auto !important;
                            padding: 1.2rem !important;
                            height: auto !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                    }
                    /* DevicePreviewer Emulator Support */
                    @media (orientation: portrait) {
                        .device-mobile .shows-mobile-fix-content {
                            flex-direction: column !important;
                            height: auto !important;
                            min-height: 0 !important;
                        }
                        .device-mobile .shows-mobile-fix-image {
                            width: 100% !important;
                            height: 180px !important;
                            flex: 0 0 auto !important;
                        }
                        .device-mobile .shows-mobile-fix-info {
                            display: flex !important;
                            flex: 1 1 auto !important;
                            padding: 1.2rem !important;
                            height: auto !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        .device-mobile .calendar-controls {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                        .device-mobile .category-filter-wrapper {
                            padding: 0.8rem !important;
                            justify-content: center !important;
                        }
                        .device-mobile .selected-text {
                            color: var(--text-primary) !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            display: block !important;
                        }
                    }
                `}</style>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ display: isShowsCalendarOpen ? 'none' : 'flex' }}>
                <div className="calendar-modal-header">
                    <div className="modal-title-row">
                        <img src="/assets/NT_logo.png" alt="NT Logo" className="modal-logo" />
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
                                <span className="selected-text">{selectedCategory || 'Category'}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCategoryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    <button
                                        key="all"
                                        className={`dropdown-option ${selectedCategory === '' ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setIsCategoryDropdownOpen(false);
                                        }}
                                    >
                                        Category
                                    </button>
                                    {SHOW_CATEGORIES.filter(cat => activeStats.categories[cat] > 0).map(cat => (
                                        <button
                                            key={cat}
                                            className={`dropdown-option ${selectedCategory === cat ? 'selected' : ''} ${activeStats.categories[cat] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {cat}
                                            <span className="item-count-indicator">{activeStats.categories[cat]}</span>
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
                                <span className="selected-text">{selectedCountry || 'Country'}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCountryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCountryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    <button
                                        key="all"
                                        className={`dropdown-option ${selectedCountry === '' ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedCountry('');
                                            setIsCountryDropdownOpen(false);
                                        }}
                                    >
                                        Country
                                    </button>
                                    {countries.map(country => (
                                        <button
                                            key={country}
                                            className={`dropdown-option ${selectedCountry === country ? 'selected' : ''} ${activeStats.countries[country] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCountry(country);
                                                setIsCountryDropdownOpen(false);
                                            }}
                                        >
                                            {country}
                                            {activeStats.countries[country] > 0 && (
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

                        {/* Calendar View Button */}
                        <div className="custom-dropdown-container">
                            <button
                                className="category-filter-wrapper glass-panel"
                                onClick={() => setIsShowsCalendarOpen(true)}
                                style={{ justifyContent: 'center', cursor: 'pointer' }}
                                title="Calendar View"
                            >
                                <CalendarDays size={16} className="filter-icon" style={{ margin: 0 }} />
                                <span className="hide-on-mobile selected-text" style={{ fontSize: '0.85rem', marginLeft: '6px' }}>Calendar View</span>
                            </button>
                        </div>
                    </div>

                </div>

                <div className="calendar-modal-body">

                    <div className="shows-grid">
                        {filteredShows.length > 0 ? (
                            filteredShows.map(show => (
                                <div key={show.id} className="show-card glass-panel">
                                    <div className="show-content shows-mobile-fix-content">
                                        <div className="show-image-container shows-mobile-fix-image">
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
                                        <div className="show-info shows-mobile-fix-info">
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
        getPortalContainer()
    );
};

export default CalendarView;
