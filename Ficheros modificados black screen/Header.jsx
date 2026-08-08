import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { registerPlugin, Capacitor } from '@capacitor/core';
import {
    Map, List, Navigation, MapPin, Settings, Calendar, Filter, Ticket,
    ShoppingCart, UserCircle, Menu, X, Search, Smartphone, Sun, Moon,
    LogOut, Newspaper, Tablet, Monitor, Star
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
// import SettingsDrawer from './SettingsDrawer'; // COMMENTED OUT TO FIX CRASH
import './Header.css';

const Review = registerPlugin('Review');

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
        showArcOnly, setShowArcOnly,
        filterWithMaps, setFilterWithMaps,
        filterYear, filterCommander,
        developerMode, setDeveloperMode,
        allSites, sites,
        theme, toggleTheme,
        mapStyle, setMapStyle,
        categoryCounts,
        isFiltered, clearAllFilters,
        filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited,
        previewDevice, setPreviewDevice,
        showAuth, setShowAuth, setAuthMessage,
        newsData
    } = useAppContext();

    const [showSettings, setShowSettings] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showShoppingView, setShowShoppingView] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);

    // FIX: The logic that turns the "Filters" button RED
    const isModalFiltered = useMemo(() => {
        return filterSearch !== '' ||
            filterCountry !== 'all' ||
            filterCoalition !== 'all' ||
            filterCampaign !== 'all' ||
            filterVisited !== 'all' ||
            filterYear !== 'all' ||
            filterCommander !== 'all' ||
            showArcOnly === true ||   // Checkbox trigger
            showOnlyNew === true ||   // Checkbox trigger
            filterWithMaps === true;  // Checkbox trigger
    }, [filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited, filterYear, filterCommander, showArcOnly, showOnlyNew, filterWithMaps]);

    const menuRef = useRef(null);
    const toggleRef = useRef(null);

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

                <div className="mobile-header-actions hide-on-desktop">
                    <button className="mobile-header-btn glass-panel" onClick={() => setShowEvents(true)} title="Today in History">
                        <Calendar size={26} />
                    </button>
                    <FloatingViewToggle className="mobile-header-btn" iconSize={26} />
                    <button
                        ref={toggleRef}
                        className={`mobile-menu-toggle glass-panel ${showSettings ? 'menu-open' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        {showSettings ? <X size={28} /> : <Settings size={28} />}
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
                            menuClassName="location-dropdown-menu"
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
                            <button
                                className={`custom-select-trigger filter-select glass-panel
                                    ${showFilters ? 'active' : ''}
                                    ${isModalFiltered ? 'filters-active-red' : ''}`
                                }
                                onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}
                                style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}
                            >
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <Filter size={16} />
                                    <span>Filters</span>
                                </div>
                            </button>

                            {/* ... Rest of the buttons (News, Market, Events) ... */}
                            <button className="custom-select-trigger filter-select glass-panel" onClick={() => setShowNews(true)} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <Newspaper size={16} />
                                        {recentNewsCount > 0 && <span className="news-badge">{recentNewsCount}</span>}
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
            </div>

            {/* MODALS */}
            {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
            {showNews && <NewsModal onClose={() => setShowNews(false)} />}
            {showEvents && <EventsModal onClose={() => setShowEvents(false)} />}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            {showShoppingView && <ShoppingView onClose={() => setShowShoppingView(false)} />}
            {showCalendarView && <CalendarView onClose={() => setShowCalendarView(false)} />}

            {/* FIX: If SettingsDrawer is missing, we don't call it here */}
            {/* {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} />} */}
        </header>
    );
};

export default Header;