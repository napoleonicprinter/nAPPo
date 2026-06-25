import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Map, List, Navigation, MapPin, Settings, Calendar, Filter, Ticket, ShoppingCart, ShoppingBag, Monitor, UserCircle, Menu, X, Search, Smartphone, Sun, Moon, LogOut, Newspaper } from 'lucide-react';
import { App } from '@capacitor/app';
import { useAppContext, EUROPEAN_CAPITALS } from '../context/AppContext';
import CustomCategorySelect from './CustomCategorySelect';
import CustomSimpleSelect from './CustomSimpleSelect';
import AuthModal from './AuthModal';
import EventsModal from './EventsModal';
import FiltersModal from './FiltersModal';
import SignificanceFilter from './SignificanceFilter';
import YearFilter from './YearFilter';
import CommanderFilter from './CommanderFilter';
import NewsModal from './NewsModal';
import ArcFilter from './ArcFilter';
import FloatingViewToggle from './FloatingViewToggle';
import CalendarView from './CalendarView';
import ShoppingView from './ShoppingView';
import './Header.css';

const CATEGORY_ORDER = [
    'Battle site',
    'Battle landmark',
    'Naval battle',
    'Museum',
    'Artwork',
    'Monument',
    'Building',
    'Landmark',
    'Movie tip',
    'Store'
];

const Header = () => {
    const {
        view, setView,
        geolocationEnabled, requestGeolocation, disableGeolocation,
        filterCategory, setFilterCategory,
        filterSignificance, setFilterSignificance,
        filterVisited, setFilterVisited,
        filterRadius, setFilterRadius,
        locationMode, handleLocationSelect,
        currentUser, logout, deleteCurrentUser,
        newSitesDays, setNewSitesDays,
        clusterRadius, setClusterRadius,
        showOnlyNew, setShowOnlyNew,
        developerMode, setDeveloperMode,
        previewDevice, setPreviewDevice,
        filterSearch, setFilterSearch,
        allSites, sites,
        theme, toggleTheme,
        syncStatus, lastSyncTime,
        categoryCounts,
        isFiltered, clearAllFilters,
        activeBattleSiteIds, setActiveBattleSiteIds
    } = useAppContext();
    // Activate preview mode automatically when Developer Mode is enabled
    useEffect(() => {
        if (developerMode) {
            setView('preview');
            setPreviewDevice('desktop');
        }
    }, [developerMode]);
    const [showAuth, setShowAuth] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShoppingView, setShowShoppingView] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);

    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                toggleRef.current &&
                !toggleRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMenuOpen]);

    const { newsData } = useAppContext();
    const recentNewsCount = useMemo(() => {
        if (!newsData) return 0;
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6); // Last 7 days including today means today and 6 days before.
        sevenDaysAgo.setHours(0, 0, 0, 0);

        return newsData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= sevenDaysAgo && itemDate <= now;
        }).length;
    }, [newsData]);

    // Derive and sort categories for the header filters
    const categories = [
        "Today's Battle",
        ...Array.from(new Set(allSites.map(s => s.category))).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        })
    ];

    const significances = Array.from(new Set(allSites.map(s => s.significance)));

    const handleViewChange = (newView) => {
        if (newView === 'calendar') {
            setShowCalendarView(true);
        } else if (newView === 'shopping') {
            setShowShoppingView(true);
        } else {
            setView(newView);
        }
        setIsMenuOpen(false);
    };

    const handleEventsClick = () => {
        setShowEvents(true);
        setIsMenuOpen(false);
    };

    const handleNewsClick = () => {
        setShowNews(true);
        setIsMenuOpen(false);
    };

    return (
        <header className="app-header glass-header">
            <div className="header-brand">
                <img src="/assets/NT_logo.png" alt="nAPPo Trails Logo" className="header-logo" />
                <div className="sites-count-badge glass-panel">
                    <span className="count-number" style={{ color: isFiltered ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>{sites.length}</span>
                    <span className="count-label">sites</span>
                </div>
            </div>

            <div className="mobile-header-actions">
                <FloatingViewToggle className="mobile-header-btn" />
                <button
                    className="mobile-header-btn glass-panel"
                    onClick={handleEventsClick}
                    title="Today in nAPPo history"
                >
                    <Calendar size={20} />
                </button>
                <button
                    ref={toggleRef}
                    className={`mobile-menu-toggle glass-panel ${showSettings ? 'menu-open' : ''}`}
                    onClick={() => setShowSettings(!showSettings)}
                >
                    {showSettings ? <X size={24} /> : <Settings size={24} />}
                </button>
            </div>

            <div className="filters-group">
                <div className="filters-line">
                    <div className="location-toggle-group">
                        <CustomSimpleSelect
                            options={[
                                { value: 'none', label: 'Location...' },
                                { value: 'geo', label: '⮞ My Location' },
                                ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))
                            ]}
                            value={locationMode}
                            onChange={handleLocationSelect}
                            searchable={true}
                            persistentValues={['none', 'geo']}
                            title="Set Search Location"
                            placeholder="Search Location..."
                        />
                        <FloatingViewToggle className="desktop-only" />
                    </div>

                    <div className="desktop-filters custom-desktop-layout">
                        {locationMode !== 'none' && (
                            <CustomSimpleSelect
                                options={[
                                    { value: 'all', label: 'All Areas' },
                                    { value: '1', label: '1 km' },
                                    { value: '5', label: '5 km' },
                                    { value: '10', label: '10 km' },
                                    { value: '25', label: '25 km' },
                                    { value: '50', label: '50 km' },
                                    { value: '100', label: '100 km' },
                                    { value: '500', label: '500 km' },
                                ]}
                                value={filterRadius}
                                onChange={setFilterRadius}
                                title={'Filter by Distance'}
                            />
                        )}

                        <div className="category-filters-wrapper">
                            <CustomCategorySelect
                                categories={categories}
                                value={filterCategory}
                                onChange={setFilterCategory}
                                categoryCounts={categoryCounts}
                            />

                            <SignificanceFilter />
                        </div>
                        <YearFilter className="desktop-year-filter" />
                        <CommanderFilter className="desktop-commander-filter" />
                        <ArcFilter className="desktop-arc-filter" />
                        {activeBattleSiteIds.length > 0 && (
                            <button
                                className="desktop-close-units filter-select glass-panel"
                                onClick={() => setActiveBattleSiteIds([])}
                                title="Close all battle units"
                            >
                                Close Units
                            </button>
                        )}
                        {isFiltered && (
                            <button
                                className="desktop-clear-filters filter-select glass-panel"
                                onClick={clearAllFilters}
                                title="Clear all filters"
                            >
                                Clear Filters
                            </button>
                        )}
                        <button
                            className="desktop-header-btn glass-panel desktop-events-btn"
                            onClick={handleEventsClick}
                            title="Today in nAPPo history"
                        >
                            <Calendar size={20} />
                        </button>
                    </div>
                </div>

                <div className="mobile-overlay-filters">
                    <YearFilter className="mobile-tag-filter year-filter-mobile" />
                    <CommanderFilter className="mobile-tag-filter mobile-commander-filter" />
                    <ArcFilter className="mobile-tag-filter mobile-arc-filter" />

                    <button className="mobile-tag-filter mobile-icon-btn" onClick={handleNewsClick}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Newspaper size={16} />
                            {recentNewsCount > 0 && (
                                <span className="news-badge">{recentNewsCount}</span>
                            )}
                        </div>
                        <span>News</span>
                    </button>
                    <button className={`mobile-tag-filter mobile-icon-btn ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')}>
                        <ShoppingCart size={16} />
                        <span>Market</span>
                    </button>
                    <button className={`mobile-tag-filter mobile-icon-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')}>
                        <Ticket size={16} />
                        <span>Shows</span>
                    </button>
                    <button className={`mobile-tag-filter mobile-icon-btn ${showFilters ? 'active' : ''}`} onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}>
                        <Filter size={16} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div ref={menuRef} className={`header-controls ${isMenuOpen ? 'mobile-open' : ''}`}>
                <div className="header-actions">
                    <div className="settings-wrapper" style={{ position: 'relative' }}>
                        <button
                            className={`settings-btn glass-panel ${showSettings ? 'active' : ''}`}
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <Settings size={20} style={{ color: showSettings ? 'var(--accent-danger)' : 'inherit' }} />
                            <span className="mobile-only-label">Settings</span>
                        </button>

                        {showSettings && (
                            <div className="settings-dropdown animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>

                                <div className="settings-section">
                                    <a
                                        href="https://www.patreon.com/c/nAPPoTrails"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-outline patreon-btn"
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
                                    >
                                        <svg className="patreon-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                            <path d="M0 .48v23.04h4.22V.48H0zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.636 8.641 8.636 4.75 0 8.615-3.881 8.615-8.636 0-4.77-3.865-8.65-8.615-8.65z" />
                                        </svg>
                                        Support at Patreon
                                    </a>

                                    {!currentUser ? (
                                        <button
                                            className="btn-outline"
                                            onClick={() => { setShowAuth(true); setIsMenuOpen(false); setShowSettings(false); }}
                                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '10px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                                        >
                                            <UserCircle size={16} />
                                            Sign In
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentUser.username}</span>
                                            <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0 }}>Show only NEW sites</h3>
                                        <label className="switch" style={{ width: '40px', height: '20px', position: 'relative', display: 'inline-block' }}>
                                            <input
                                                type="checkbox"
                                                checked={showOnlyNew}
                                                onChange={(e) => setShowOnlyNew(e.target.checked)}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: showOnlyNew ? 'var(--accent-primary)' : 'var(--bg-acrylic)',
                                                transition: '.4s', borderRadius: '20px',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                <span style={{
                                                    position: 'absolute', content: '""', height: '14px', width: '14px', left: showOnlyNew ? '23px' : '3px', bottom: '2px',
                                                    backgroundColor: showOnlyNew ? '#000' : 'var(--text-secondary)', transition: '.4s', borderRadius: '50%'
                                                }}></span>
                                            </span>
                                        </label>
                                    </div>
                                    <p style={{ marginTop: '4px', fontSize: '0.8rem', opacity: 0.8 }}>Only display sites added within your specified time frame.</p>
                                </div>

                                <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '8px' }}>"New" Sites Display</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.3', maxWidth: '75%' }}>
                                            Select the number of days a site is labeled as NEW:
                                        </p>
                                        <input
                                            type="number"
                                            className="glass-panel settings-input"
                                            value={newSitesDays}
                                            onChange={(e) => setNewSitesDays(e.target.value === '' ? '' : Number(e.target.value))}
                                            min="1"
                                            style={{
                                                width: '65px',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-primary)',
                                                background: 'rgba(255,255,255,0.05)',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '8px' }}>Map Clustering</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.3', maxWidth: '75%' }}>
                                            Adjust the sensitivity for markers clustering:
                                        </p>
                                        <select
                                            className="glass-panel settings-input"
                                            value={clusterRadius}
                                            onChange={(e) => setClusterRadius(Number(e.target.value))}
                                            style={{
                                                width: '65px',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-primary)',
                                                background: 'rgba(255,255,255,0.05)',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {[5, 10, 15, 20, 25, 30, 35].map(radius => (
                                                <option
                                                    key={radius}
                                                    value={radius}
                                                    style={{ fontWeight: radius === 25 ? 'bold' : 'normal', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
                                                >
                                                    {radius}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0 }}>Theme Preference</h3>
                                        <button
                                            onClick={toggleTheme}
                                            style={{
                                                background: 'var(--bg-acrylic)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '20px',
                                                padding: '4px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                cursor: 'pointer',
                                                color: theme === 'dark' ? '#fde047' : '#58a6ff'
                                            }}
                                        >
                                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
                                            </span>
                                        </button>
                                    </div>
                                    <p style={{ marginTop: '4px', fontSize: '0.8rem', opacity: 0.8 }}>Switch between light and dark display modes.</p>
                                </div>


                                {import.meta.env.DEV && (
                                    <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h3 style={{ margin: 0 }}>Developer Mode</h3>
                                            <label className="switch" style={{ width: '40px', height: '20px', position: 'relative', display: 'inline-block' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={developerMode}
                                                    onChange={(e) => setDeveloperMode(e.target.checked)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{
                                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                    backgroundColor: developerMode ? 'var(--accent-primary)' : 'var(--bg-acrylic)',
                                                    transition: '.4s', borderRadius: '20px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute', content: '""', height: '14px', width: '14px', left: developerMode ? '23px' : '3px', bottom: '2px',
                                                        backgroundColor: developerMode ? '#000' : 'var(--text-secondary)', transition: '.4s', borderRadius: '50%'
                                                    }}></span>
                                                </span>
                                            </label>
                                        </div>
                                        <p style={{ marginTop: '4px', fontSize: '0.8rem', opacity: 0.8 }}>Enable specialized tools for testing and previewing.</p>
                                        {developerMode && (
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                                <button className="btn-primary" onClick={() => { setPreviewDevice('phone'); setView('preview'); }}>
                                                    Mobile
                                                </button>
                                                <button className="btn-primary" onClick={() => { setPreviewDevice('tablet'); setView('preview'); }}>
                                                    Tablet
                                                </button>
                                                <button className="btn-primary" onClick={() => { setPreviewDevice('desktop'); setView('preview'); }}>
                                                    PC
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentUser && (
                                    <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                        <h3 style={{ color: 'var(--accent-danger)', marginBottom: '8px' }}>Account Management</h3>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Permanently delete your account and all associated data.</p>

                                        {!showDeleteConfirm ? (
                                            <button
                                                className="btn-outline"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                style={{
                                                    width: '100%',
                                                    borderColor: 'var(--accent-danger)',
                                                    color: 'var(--accent-danger)',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                Delete My Account
                                            </button>
                                        ) : (
                                            <div className="delete-confirmation animate-fade-in" style={{
                                                background: 'rgba(248, 81, 73, 0.1)',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--accent-danger)',
                                                marginTop: '8px'
                                            }}>
                                                <p style={{ color: 'var(--accent-danger)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px' }}>
                                                    Your user name and data will be deleted. Do you want to proceed?
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => {
                                                            deleteCurrentUser();
                                                            setShowSettings(false);
                                                            setShowDeleteConfirm(false);
                                                        }}
                                                        style={{ flex: 1, backgroundColor: 'var(--accent-danger)', color: '#fff', fontSize: '0.8rem', padding: '6px' }}
                                                    >
                                                        Yes, Delete
                                                    </button>
                                                    <button
                                                        className="btn-outline"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                <div className="view-toggle glass-panel">
                    <button
                        key="view-news"
                        className="toggle-btn desktop-only"
                        onClick={handleNewsClick}
                        title="News"
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Newspaper size={20} />
                            {recentNewsCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-8px',
                                    backgroundColor: 'var(--accent-danger)',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    fontSize: '0.65rem',
                                    padding: '1px 5px',
                                    fontWeight: 'bold',
                                    lineHeight: 1
                                }}>
                                    {recentNewsCount}
                                </span>
                            )}
                        </div>
                        <span className="mobile-only-label">News</span>
                    </button>

                    <button
                        key="view-shopping"
                        className={`toggle-btn desktop-only ${view === 'shopping' ? 'active' : ''}`}
                        onClick={() => handleViewChange('shopping')}
                        title="Marketplace"
                    >
                        <ShoppingBag size={20} />
                        <span className="mobile-only-label">Market</span>
                    </button>

                    <button
                        className={`toggle-btn desktop-only ${view === 'preview' ? 'active' : ''}`}
                        onClick={() => setView('preview')}
                        title="Developer Preview"
                    >
                        <Monitor size={20} />
                        <span className="mobile-only-label">Preview</span>
                    </button>

                    <button
                        key="view-calendar"
                        className={`toggle-btn desktop-only ${view === 'calendar' ? 'active' : ''}`}
                        onClick={() => handleViewChange('calendar')}
                        title="Shows Calendar"
                    >
                        <Ticket size={20} />
                        <span className="mobile-only-label">Shows</span>
                    </button>

                    <button
                        key="view-filters"
                        className={`toggle-btn desktop-only ${showFilters ? 'active' : ''}`}
                        onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}
                        title="Filters"
                    >
                        <Filter size={20} />
                        <span className="mobile-only-label">Filters</span>
                    </button>

                    {/* Search feature was moved to MapView */}

                </div>
            </div>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            {showEvents && <EventsModal onClose={() => setShowEvents(false)} />}
            {showNews && <NewsModal onClose={() => setShowNews(false)} />}
            {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
            {showShoppingView && <ShoppingView onClose={() => setShowShoppingView(false)} />}
            {showCalendarView && <CalendarView onClose={() => setShowCalendarView(false)} />}
        </header>
    );
};

export default Header;
