import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Map, List, Navigation, MapPin, Settings, Calendar, Filter, Ticket,
    ShoppingCart, UserCircle, Menu, X, Search, Smartphone, Sun, Moon,
    LogOut, Newspaper, Tablet, Monitor
} from 'lucide-react';
import { useAppContext, EUROPEAN_CAPITALS } from '../context/AppContext';
import { CATEGORY_ORDER } from '../constants/categoryOrder';
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



const Header = () => {
    const {
        view, setView,
        filterCategory, setFilterCategory,
        locationMode, handleLocationSelect,
        filterRadius, setFilterRadius,
        currentUser, logout, deleteCurrentUser,
        newSitesDays, setNewSitesDays,
        clusterRadius, setClusterRadius,
        showOnlyNew, setShowOnlyNew,
        developerMode, setDeveloperMode,
        allSites, sites,
        theme, toggleTheme,
        mapStyle, setMapStyle,
        categoryCounts,
        isFiltered, clearAllFilters,
        activeBattleSiteIds, setActiveBattleSiteIds,
        // Emulation states from Context
        previewDevice, setPreviewDevice,
        getPortalContainer
    } = useAppContext();

    // --- FIX: Ensure these local states are defined ---
    const [showSettings, setShowSettings] = useState(false);
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

    // Logic to handle Device Emulation
    const handleDeviceToggle = (deviceType) => {
        setPreviewDevice(deviceType);
        if (deviceType === 'desktop') {
            setView('map'); // Return to normal map
        } else {
            setView('preview'); // Switch to DevicePreviewer component
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target) &&
                toggleRef.current && !toggleRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const { newsData } = useAppContext();
    const recentNewsCount = useMemo(() => {
        if (!newsData) return 0;
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        return newsData.filter(item => new Date(item.date) >= sevenDaysAgo).length;
    }, [newsData]);

    const categories = useMemo(() => {
        const uniqCategories = Array.from(new Set(allSites.map(s => s.category)));
        const ordered = CATEGORY_ORDER.filter(c => uniqCategories.includes(c));
        const remaining = uniqCategories.filter(c => !CATEGORY_ORDER.includes(c));
        return ["Today's Battle", ...ordered, ...remaining];
    }, [allSites]);

    const handleViewChange = (newView) => {
        if (newView === 'calendar') setShowCalendarView(true);
        else if (newView === 'shopping') setShowShoppingView(true);
        else setView(newView);
        setIsMenuOpen(false);
    };

    // Helper for Dev Button Styling
    const devBtnStyle = (active) => ({
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#000' : 'var(--text-primary)',
        cursor: 'pointer',
        transition: '0.2s'
    });

    return (
        <header className="app-header glass-header">
            <div className="header-brand">
                <div className="header-brand-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/assets/NT_logo.png" alt="Logo" className="header-logo" />
                    <div className="sites-count-badge glass-panel">
                        <span className="count-number" style={{ color: isFiltered ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>{sites.length}</span>
                        <span className="count-label">sites</span>
                    </div>
                </div>

                {/* Mobile Header Actions */}
                <div className="mobile-header-actions hide-on-desktop">
                    <button className="mobile-header-btn glass-panel" onClick={() => setShowEvents(true)} title="Today in History">
                        <Calendar size={20} />
                    </button>
                    <FloatingViewToggle className="mobile-header-btn" />
                    <button
                        ref={toggleRef}
                        className={`mobile-menu-toggle glass-panel ${showSettings ? 'menu-open' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        {showSettings ? <X size={20} /> : <Settings size={20} />}
                    </button>
                </div>
            </div>



            <div className="filters-group">
                <div className="filters-line desktop-only hide-in-mobile-tablet">
                    <div className="location-toggle-group">
                        <CustomSimpleSelect
                            options={[{ value: 'none', label: 'Location...' }, { value: 'geo', label: '⮞ My Location' }, ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))]}
                            value={locationMode}
                            onChange={handleLocationSelect}
                            searchable={true}
                        />
                    </div>
                    <div className="desktop-filters custom-desktop-layout">
                        {locationMode !== 'none' && (
                            <div className="desktop-only">
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
                                />
                            </div>
                        )}
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                            <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                        </div>
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                            <SignificanceFilter />
                        </div>
                        <YearFilter className="desktop-year-filter" />
                        <CommanderFilter className="desktop-commander-filter" />
                        <ArcFilter className="desktop-arc-filter" />
                        {isFiltered && <button className="desktop-clear-filters glass-panel" onClick={clearAllFilters}>Clear</button>}
                        
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button className={`custom-select-trigger filter-select glass-panel ${showFilters ? 'active' : ''}`} onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <Filter size={16} />
                                    <span>Filters</span>
                                </div>
                            </button>

                            <button className="custom-select-trigger filter-select glass-panel" onClick={() => { setShowNews(true); }} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Newspaper size={16} />
                                        {recentNewsCount > 0 && (
                                            <span className="news-badge">{recentNewsCount}</span>
                                        )}
                                    </div>
                                    <span>News</span>
                                </div>
                            </button>

                            <button className={`custom-select-trigger filter-select glass-panel ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <ShoppingCart size={16} />
                                    <span>Market</span>
                                </div>
                            </button>

                            <button className={`custom-select-trigger filter-select glass-panel ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <Ticket size={16} />
                                    <span>Events</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mobile-overlay-filters">
                    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                        <CustomSimpleSelect
                            options={[{ value: 'none', label: 'Location...' }, { value: 'geo', label: '⮞ My Location' }, ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))]}
                            value={locationMode}
                            onChange={handleLocationSelect}
                            searchable={true}
                        />
                    </div>
                    {locationMode !== 'none' && (
                        <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
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
                            />
                        </div>
                    )}
                    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>
                    <SignificanceFilter className="mobile-tag-filter" />
                    <YearFilter className="mobile-tag-filter year-filter-mobile" />
                    <CommanderFilter className="mobile-tag-filter mobile-commander-filter" />
                    <ArcFilter className="mobile-tag-filter mobile-arc-filter" />

                    <div className="mobile-tag-filter">
                        <div className="custom-select-container">
                            <button className={`custom-select-trigger mobile-icon-btn glass-panel ${showFilters ? 'active' : ''}`} onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }} style={{ justifyContent: 'center' }}>
                                <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Filter size={16} />
                                    <span>Filters</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="mobile-tag-filter">
                        <div className="custom-select-container">
                            <button className="custom-select-trigger mobile-icon-btn glass-panel" onClick={() => { setShowNews(true); }} style={{ justifyContent: 'center' }}>
                                <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Newspaper size={16} />
                                        {recentNewsCount > 0 && (
                                            <span className="news-badge">{recentNewsCount}</span>
                                        )}
                                    </div>
                                    <span>News</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="mobile-tag-filter">
                        <div className="custom-select-container">
                            <button className={`custom-select-trigger mobile-icon-btn glass-panel ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')} style={{ justifyContent: 'center' }}>
                                <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ShoppingCart size={16} />
                                    <span>Market</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="mobile-tag-filter">
                        <div className="custom-select-container">
                            <button className={`custom-select-trigger mobile-icon-btn glass-panel ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')} style={{ justifyContent: 'center' }}>
                                <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Ticket size={16} />
                                    <span>Events</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Dropdown */}
            <div ref={menuRef} className={`header-controls ${showSettings ? 'mobile-open' : ''}`}>
                <div className="header-actions">
                    <button className="mobile-header-btn glass-panel" onClick={() => setShowEvents(true)}><Calendar size={20} /></button>
                    <FloatingViewToggle className="mobile-header-btn" />
                    <button
                        ref={toggleRef}
                        className={`desktop-header-btn glass-panel ${showSettings ? 'menu-open' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        {showSettings ? <X size={24} /> : <Settings size={24} />}
                    </button>
                </div>
                <div className="settings-wrapper">
                    {/* The trigger button is already outside, so we just portal the drawer */}
                    {typeof document !== 'undefined' && createPortal(
                        <>
                            {/* Dimmed Backdrop */}
                            <div
                                className={`settings-drawer-backdrop ${showSettings ? 'open' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettings(false);
                                }}
                            />

                            {/* Slide-out Drawer */}
                            <div className={`settings-drawer ${showSettings ? 'open' : ''}`}>
                                <div className="settings-drawer-header">
                                    <h3>
                                        <Settings size={20} />
                                        Settings
                                    </h3>
                                    <button
                                        className="settings-drawer-close"
                                        onClick={() => setShowSettings(false)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="settings-drawer-content">
                                    <div className="settings-section" style={{ marginBottom: '1.5rem' }}>
                                        {currentUser ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <UserCircle size={20} style={{ color: 'var(--accent-primary)' }} />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{currentUser.displayName || currentUser.email}</span>
                                                </div>
                                                <button
                                                    onClick={() => { logout(); }}
                                                    className="glass-panel"
                                                    style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    <LogOut size={14} /> Sign Out
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setShowAuth(true); setShowSettings(false); }}
                                                className="btn-outline"
                                                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
                                            >
                                                <UserCircle size={18} />
                                                Sign In
                                            </button>
                                        )}
                                    </div>
                                    <div className="settings-section" style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '10px' }}>Support us</h3>
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
                                            Patreon
                                        </a>
                                    </div>

                                    <div className="settings-section">
                                        <h3 style={{ marginBottom: '10px' }}>Theme</h3>
                                        <button onClick={toggleTheme} className="glass-panel" style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                            {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
                                        </button>
                                    </div>

                                    <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                        <h3 style={{ marginBottom: '10px' }}>Map Style</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {[
                                                { key: 'dark', label: 'Night', icon: '🌙' },
                                                { key: 'light', label: 'Day', icon: '☀️' },
                                                { key: 'satellite', label: 'Satellite', icon: '🛰️' }
                                            ].map((style) => (
                                                <button
                                                    key={style.key}
                                                    onClick={() => setMapStyle(style.key)}
                                                    className={`glass-panel ${mapStyle === style.key ? 'active' : ''}`}
                                                    style={{
                                                        padding: '10px 5px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        border: mapStyle === style.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                        background: mapStyle === style.key ? 'rgba(88, 166, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
                                                    <span>{style.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
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
                                                {[0, 5, 10, 15, 20, 25, 30, 35].map(radius => (
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



                                    {/* DEVELOPER MODE TOGGLE */}
                                    {import.meta.env.DEV && (
                                        <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <h3 style={{ margin: 0 }}>Developer Mode</h3>
                                                <label className="switch">
                                                    <input type="checkbox" checked={developerMode} onChange={(e) => setDeveloperMode(e.target.checked)} style={{ display: 'none' }} />
                                                    <div style={{ width: 40, height: 20, background: developerMode ? 'var(--accent-primary)' : '#444', borderRadius: 20, position: 'relative', cursor: 'pointer' }}>
                                                        <div style={{ width: 14, height: 14, background: '#000', borderRadius: '50%', position: 'absolute', top: 3, left: developerMode ? 23 : 3, transition: '0.3s' }} />
                                                    </div>
                                                </label>
                                            </div>

                                            {/* DEVICE EMULATION BUTTONS */}
                                            {developerMode && (
                                                <div style={{ marginTop: '15px' }}>
                                                    <p style={{ fontSize: '0.7rem', marginBottom: '8px', opacity: 0.7 }}>EMULATE DEVICE</p>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleDeviceToggle('mobile')} style={devBtnStyle(previewDevice === 'mobile')}><Smartphone size={16} /></button>
                                                        <button onClick={() => handleDeviceToggle('tablet')} style={devBtnStyle(previewDevice === 'tablet')}><Tablet size={16} /></button>
                                                        <button onClick={() => handleDeviceToggle('desktop')} style={devBtnStyle(previewDevice === 'desktop')}><Monitor size={16} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>,
                        getPortalContainer()
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