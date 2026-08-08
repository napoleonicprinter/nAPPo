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

const Review = registerPlugin('Review');

const Header = () => {
    const context = useAppContext();

    // Destructure with default values to prevent "Empty Screen" crashes
    const {
        view = 'map', setView,
        filterCategory = [], setFilterCategory,
        locationMode = 'none', handleLocationSelect,
        filterRadius = 'all', setFilterRadius,
        currentUser, logout,
        showOnlyNew = false, setShowOnlyNew,
        showArcOnly = false, setShowArcOnly,
        filterWithMaps = false, setFilterWithMaps,
        filterYear = 'all', filterCommander = 'all',
        allSites = [], sites = [],
        theme = 'light', toggleTheme,
        categoryCounts = {},
        isFiltered = false, clearAllFilters,
        filterSearch = '', filterCountry = 'all', filterCoalition = 'all', filterCampaign = 'all', filterVisited = 'all',
        showAuth, setShowAuth,
        newsData = []
    } = context || {};

    const [showSettings, setShowSettings] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showShoppingView, setShowShoppingView] = useState(false);
    const [showCalendarView, setShowCalendarView] = useState(false);

    // This turns the "Filters" tag RED for checkboxes and dropdowns
    const isModalFiltered = useMemo(() => {
        return filterSearch !== '' ||
            filterCountry !== 'all' ||
            filterCoalition !== 'all' ||
            filterCampaign !== 'all' ||
            filterVisited !== 'all' ||
            filterYear !== 'all' ||
            filterCommander !== 'all' ||
            showOnlyNew === true ||
            filterWithMaps === true;
            // showArcOnly is excluded here so it only turns its own tag red
    }, [filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited, filterYear, filterCommander, showOnlyNew, filterWithMaps]);

    const recentNewsCount = useMemo(() => {
        if (!newsData || newsData.length === 0) return 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
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
    };

    if (!context) return null; // Safety check

    return (
        <header className="app-header glass-header">
            <div className="header-brand">
                <div className="header-brand-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/assets/NT_logo.png" alt="Logo" className="header-logo" />
                    <div className="sites-count-badge glass-panel">
                        {/* Safety check: uses (sites || []).length to prevent crash */}
                        <span className="count-number" style={{ color: isFiltered ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
                            {(sites || []).length}
                        </span>
                        <span className="count-label">sites</span>
                    </div>
                </div>

                <div className="mobile-header-actions hide-on-desktop">
                    <button className="mobile-header-btn glass-panel" onClick={() => setShowEvents(true)}>
                        <Calendar size={26} />
                    </button>
                    <FloatingViewToggle className="mobile-header-btn" iconSize={26} />
                    <button className="mobile-menu-toggle glass-panel" onClick={() => setShowSettings(!showSettings)}>
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
                        />
                    </div>

                    <div className="desktop-filters custom-desktop-layout">
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                            <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                        </div>
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                            <SignificanceFilter />
                        </div>

                        <YearFilter className="desktop-year-filter" />
                        <CommanderFilter className="desktop-commander-filter" />

                        {/* ARC TAG turns red independently */}
                        <ArcFilter className={`desktop-arc-filter ${showArcOnly ? 'filters-active-red' : ''}`} />

                        {isFiltered && <button className="desktop-clear-filters glass-panel" onClick={clearAllFilters}>Clear</button>}

                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {/* FILTERS TAG turns red for everything EXCEPT Arc */}
                            <button
                                className={`custom-select-trigger filter-select glass-panel
                                    ${showFilters ? 'active' : ''}
                                    ${isModalFiltered
                                        ? (showFilters ? 'filters-active-solid' : 'filters-active-red')
                                        : ''
                                    }`
                                }
                                onClick={() => setShowFilters(!showFilters)}
                                style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}
                            >
                                <div className="custom-select-value" style={{ gap: '4px' }}>
                                    <Filter size={16} />
                                    <span>Filters</span>
                                </div>
                            </button>

                            <button className="custom-select-trigger filter-select glass-panel" onClick={() => setShowNews(true)}>
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <Newspaper size={16} />
                                    {recentNewsCount > 0 && <span className="news-badge">{recentNewsCount}</span>}
                                </div>
                                <span>News</span>
                            </button>

                            <button className={`custom-select-trigger filter-select glass-panel ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')}>
                                <ShoppingCart size={16} />
                                <span>Market</span>
                            </button>

                            <button className={`custom-select-trigger filter-select glass-panel ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')}>
                                <Ticket size={16} />
                                <span>Events</span>
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
        </header>
    );
};

export default Header;