import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Map, List, Navigation, MapPin, Settings, Calendar, Filter, Ticket, ShoppingCart, UserCircle, Menu, X, Search, Smartphone, Sun, Moon, LogOut, Newspaper } from 'lucide-react';
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
    'Sea Battle',
    'Battle landmark',
    'Museum',
    'Artwork',
    'Monument',
    'Building',
    'Landmark'
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
        showOnlyNew, setShowOnlyNew,
        developerMode, setDeveloperMode,
        filterSearch, setFilterSearch,
        allSites, sites,
        theme, toggleTheme,
        syncStatus, lastSyncTime
    } = useAppContext();
    const [showSettings, setShowSettings] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShoppingView, setShowShoppingView] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);
    const searchInputRef = useRef(null);

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
    const categories = Array.from(new Set(allSites.map(s => s.category))).sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a);
        const indexB = CATEGORY_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

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
                    <span className="count-number">{sites.length}</span>
                    <span className="count-label">sites</span>
                </div>
            </div>

            <div className="mobile-header-actions">
                <button
                    className="mobile-header-btn glass-panel"
                    onClick={handleEventsClick}
                    title="Today in nAPPo history"
                >
                    <Calendar size={20} />
                </button>
                <button
                    className="mobile-menu-toggle glass-panel"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                        <FloatingViewToggle />
                    </div>

                    <div className="desktop-filters custom-desktop-layout">
                        {locationMode !== 'none' && (
                            <CustomSimpleSelect
                                options={[
                                    { value: 'all', label: 'All Areas' },
                                    { value: '1', label: '1 km area' },
                                    { value: '5', label: '5 km area' },
                                    { value: '10', label: '10 km area' },
                                    { value: '25', label: '25 km area' },
                                    { value: '50', label: '50 km area' },
                                    { value: '100', label: '100 km area' },
                                    { value: '500', label: '500 km area' },
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
                            />

                            <SignificanceFilter />
                        </div>
                        <YearFilter className="desktop-year-filter" />
                        <CommanderFilter className="desktop-commander-filter" />
                        <ArcFilter className="desktop-arc-filter" />
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
                </div>
            </div>

            <div className={`header-controls ${isMenuOpen ? 'mobile-open' : ''}`}>
                <div className="header-actions">
                    {currentUser ? (
                        <div className="user-profile-btn glass-panel" style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentUser.username}</span>
                            <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            className="login-btn btn-primary"
                            onClick={() => { setShowAuth(true); setIsMenuOpen(false); }}
                            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Sign In"
                        >
                            <UserCircle size={24} />
                            <span className="mobile-only-label">Sign In</span>
                        </button>
                    )}

                    <div className="settings-wrapper" style={{ position: 'relative' }}>
                        <button
                            className="settings-btn glass-panel"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <Settings size={20} />
                            <span className="mobile-only-label">Settings</span>
                        </button>

                        {showSettings && (
                            <div className="settings-dropdown animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
                                <div className="settings-section">
                                    <h3>Location Services</h3>
                                    <p>Allow access to show nearby historic sites.</p>
                                    <div className="settings-actions">
                                        {geolocationEnabled ? (
                                            <button className="btn-outline" onClick={disableGeolocation} style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}>
                                                Disable Location
                                            </button>
                                        ) : (
                                            <button className="btn-primary" onClick={requestGeolocation}>
                                                <MapPin size={16} /> Enable Location
                                            </button>
                                        )}
                                    </div>
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
                                </div>

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
                    <a
                        key="view-patreon"
                        href="https://www.patreon.com/c/nAPPoTrails"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="toggle-btn patreon-btn"
                        title="Support this project at Patreon"
                    >
                        <svg className="patreon-icon" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M0 .48v23.04h4.22V.48H0zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.636 8.641 8.636 4.75 0 8.615-3.881 8.615-8.636 0-4.77-3.865-8.65-8.615-8.65z" />
                        </svg>
                        <span className="mobile-only-label">Support at Patreon</span>
                    </a>

                    <button
                        key="view-news"
                        className="toggle-btn"
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
                        className={`toggle-btn ${view === 'shopping' ? 'active' : ''}`}
                        onClick={() => handleViewChange('shopping')}
                        title="Marketplace"
                    >
                        <ShoppingCart size={20} />
                        <span className="mobile-only-label">Marketplace</span>
                    </button>

                    <button
                        key="view-calendar"
                        className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
                        onClick={() => handleViewChange('calendar')}
                        title="Shows Calendar"
                    >
                        <Ticket size={20} />
                        <span className="mobile-only-label">Shows</span>
                    </button>

                    <button
                        key="view-filters"
                        className={`toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}
                        title="Filters"
                    >
                        <Filter size={20} />
                        <span className="mobile-only-label">Filters</span>
                    </button>

                    {/* Search */}
                    <div key="view-search" className="search-toggle-wrapper">
                        <button
                            className={`toggle-btn ${showSearch || filterSearch ? 'active' : ''}`}
                            onClick={() => {
                                const next = !showSearch;
                                setShowSearch(next);
                                if (!next) setFilterSearch('');
                                else setTimeout(() => searchInputRef.current?.focus(), 50);
                            }}
                            title="Search Sites"
                        >
                            <Search size={20} />
                            <span className="mobile-only-label">Search</span>
                        </button>
                        {showSearch && (
                            <div className="search-input-wrapper animate-fade-in">
                                <Search size={14} className="search-input-icon" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="search-input"
                                    placeholder="Search sites…"
                                    value={filterSearch}
                                    onChange={(e) => setFilterSearch(e.target.value)}
                                />
                                {filterSearch && (
                                    <button
                                        className="search-clear-btn"
                                        onClick={() => setFilterSearch('')}
                                        title="Clear search"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        key="theme-toggle"
                        className="toggle-btn theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to Day Light' : 'Switch to Night Vision'}
                        style={{ color: theme === 'dark' ? '#fde047' : '#58a6ff' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="mobile-only-label">{theme === 'dark' ? 'Day Mode' : 'Night Mode'}</span>
                    </button>

                    <button
                        key="exit-app"
                        className="toggle-btn exit-app-btn"
                        onClick={async () => {
                            try {
                                // Primary: Capacitor App plugin
                                await App.exitApp();
                            } catch (e) {
                                console.warn("Capacitor App Exit failed", e);
                                // Secondary: Cordova legacy fallback if applicable
                                if (window.navigator && window.navigator['app'] && window.navigator['app'].exitApp) {
                                    window.navigator['app'].exitApp();
                                } else {
                                    // Final fallback attempt
                                    window.close();
                                }
                            }
                        }}
                        title="Close Application"
                        style={{ color: 'var(--accent-danger)', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '12px' }}
                    >
                        <LogOut size={20} />
                        <span className="mobile-only-label">Close App</span>
                    </button>

                    {developerMode && (
                        <button
                            key="view-preview"
                            className={`toggle-btn dev-preview-btn ${view === 'preview' ? 'active' : ''}`}
                            onClick={() => handleViewChange('preview')}
                            title="Device Previewer"
                            style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '4px', paddingLeft: '8px' }}
                        >
                            <Smartphone size={20} style={{ color: 'var(--accent-primary)' }} />
                            <span className="mobile-only-label">Preview</span>
                        </button>
                    )}
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
