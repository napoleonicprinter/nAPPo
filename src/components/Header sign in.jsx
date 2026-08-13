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
import './Header.css';
import { HELP_ITEMS } from '../data/helpData';

// Register the custom native plugin we created in MainActivity.java
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
        filterWithMaps,
        developerMode, setDeveloperMode,
        allSites, sites,
        theme, toggleTheme,
        mapStyle, setMapStyle,
        categoryCounts,
        isFiltered, clearAllFilters,
        filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited,
        // Emulation states from Context
        previewDevice, setPreviewDevice,
        getPortalContainer,
        activeMapOverlays, clearMapOverlays,
        showAuth, setShowAuth, setAuthMessage,
        selectedHelpItem, setSelectedHelpItem
    } = useAppContext();

    // --- FIX: Ensure these local states are defined ---
    const [showSettings, setShowSettings] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShoppingView, setShowShoppingView] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);
    const [showHelpDropdown, setShowHelpDropdown] = useState(false);

    const isModalFiltered = filterSearch !== '' || filterCountry !== 'all' || filterCoalition !== 'all' || filterCampaign !== 'all' || filterVisited !== 'all' || showOnlyNew || filterWithMaps;

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

    const handleRateApp = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Review.requestReview();
            } catch (error) {
                console.error('In-App Review failed', error);
            }
        } else {
            // Fallback for web/PWA
            window.open('https://play.google.com/store/apps/details?id=com.nappo.trails.app', '_blank');
        }
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

                {/* Mobile Header Actions (Same row as logo & counter) */}
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
                {/*
                   This container handles the horizontal scroll row.
                   We put Help + Location first so they are at the far left.
                */}
                <div className="mobile-overlay-filters">

                    {/* HELP + LOCATION GROUP - Grouped in a div to eliminate the gap */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* SMALL HELP TAG (?) */}
                        <div className="custom-select-container help-select" style={{ position: 'relative' }}>
                            <button
                                className={`custom-select-trigger glass-panel ${showHelpDropdown ? 'active' : ''}`}
                                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    minWidth: '40px',
                                    padding: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '12px'
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>?</span>
                            </button>

                            {showHelpDropdown && (
                                <div className="custom-select-dropdown glass-panel animate-fade-in"
                                     style={{ position: 'absolute', top: '110%', left: 0, zIndex: 1000, minWidth: '160px' }}>
                                    {HELP_ITEMS.map((item) => (
                                        <div
                                            key={item.id}
                                            className="custom-select-option"
                                            onClick={() => {
                                                setSelectedHelpItem(item);
                                                setShowHelpDropdown(false);
                                            }}
                                        >
                                            {item.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* LOCATION SELECTOR */}
                        <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                            <CustomSimpleSelect
                                options={[
                                    { value: 'none', label: 'Location...' },
                                    { value: 'geo', label: '⮞ My Location' },
                                    ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))
                                ]}
                                value={locationMode}
                                onChange={handleLocationSelect}
                                searchable={true}
                                menuClassName="location-dropdown-menu"
                            />
                        </div>
                    </div>

                    {/* OTHER FILTERS (Categories, Stars, etc.) */}
                    <div className="mobile-tag-filter">
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>

                    <div className="mobile-tag-filter">
                        <SignificanceFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <YearFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <CommanderFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <ArcFilter />
                    </div>

                    {/* FILTER MODAL BUTTON */}
                    <button
                        className={`custom-select-trigger filter-select glass-panel ${isModalFiltered ? 'filters-active-red' : ''}`}
                        onClick={() => setShowFilters(true)}
                        style={{ height: '40px', padding: '0 12px', minWidth: 'auto', borderRadius: '12px' }}
                    >
                        <Filter size={18} />
                        <span style={{ marginLeft: '6px' }}>Filters</span>
                    </button>

                    {/* NEWS BUTTON */}
                    <button
                        className="custom-select-trigger filter-select glass-panel"
                        onClick={() => setShowNews(true)}
                        style={{ height: '40px', padding: '0 12px', minWidth: 'auto', borderRadius: '12px' }}
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Newspaper size={18} />
                            {recentNewsCount > 0 && <span className="news-badge">{recentNewsCount}</span>}
                        </div>
                        <span style={{ marginLeft: '6px' }}>News</span>
                    </button>

                </div> {/* End mobile-overlay-filters */}
            </div> {/* End filters-group */}

            {/* Modals Rendering */}
            <NewsModal isOpen={showNews} onClose={() => setShowNews(false)} />
            <FiltersModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
            <EventsModal isOpen={showEvents} onClose={() => setShowEvents(false)} />
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

            {showCalendarView && <CalendarView onClose={() => setShowCalendarView(false)} />}
            {showShoppingView && <ShoppingView onClose={() => setShowShoppingView(false)} />}

        </header>
    );
};

export default Header;