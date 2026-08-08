import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { registerPlugin } from '@capacitor/core';
import {
    Map, List, Settings, Calendar, Filter, X,
    Moon, Sun, LogOut, UserCircle, Newspaper, ShoppingCart, Ticket
} from 'lucide-react';

import { useAppContext, EUROPEAN_CAPITALS } from '../context/AppContext';
import { CATEGORY_ORDER } from '../constants/categoryOrder';
import CustomCategorySelect from './CustomCategorySelect';
import CustomSimpleSelect from './CustomSimpleSelect';
import FiltersModal from './FiltersModal';
import EventsModal from './EventsModal';
import NewsModal from './NewsModal';
import ArcFilter from './ArcFilter';
import SignificanceFilter from './SignificanceFilter';
import YearFilter from './YearFilter';
import CommanderFilter from './CommanderFilter';
import './Header.css';

// --- LOCAL SETTINGS DRAWER (Internal to prevent import errors) ---
const LocalSettingsDrawer = ({ onClose }) => {
    const { theme, toggleTheme, logout, currentUser, mapStyle, setMapStyle, clusterRadius, setClusterRadius } = useAppContext();
    return createPortal(
        <>
            <div className="settings-drawer-backdrop open" onClick={onClose} style={{ zIndex: 100000, position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
            <div className="settings-drawer open" style={{ zIndex: 100001, position: 'fixed', right: 0, top: 0, bottom: 0, width: '300px', backgroundColor: 'var(--bg-color, white)', padding: '20px', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={22} />
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>Settings</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
                </div>
                <div className="glass-panel" style={{ padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', border: '1px solid #eee' }}>
                    <UserCircle size={32} color="#58a6ff" />
                    <button onClick={() => { logout(); onClose(); }} style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', background: 'white', fontWeight: '600' }}>Sign Out</button>
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Theme</h3>
                    <button onClick={toggleTheme} className="glass-panel" style={{ width: '100%', padding: '12px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #ddd' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Night Mode'}</span>
                    </button>
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Map Style</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {['dark', 'light', 'satellite'].map((s) => (
                            <button key={s} onClick={() => setMapStyle(s)} style={{ padding: '10px 5px', borderRadius: '10px', border: mapStyle === s ? '2px solid #58a6ff' : '1px solid #ddd', background: mapStyle === s ? 'rgba(88,166,255,0.1)' : 'white' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{s}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

const Header = () => {
    const {
        view, setView, sites, allSites, locationMode, handleLocationSelect,
        filterRadius, setFilterRadius, isFiltered, clearAllFilters,
        filterCategory, setFilterCategory, categoryCounts, isModalFiltered,
        showArcOnly, theme, filterSearch, newsData
    } = useAppContext();

    const [showSettings, setShowSettings] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showNews, setShowNews] = useState(false);

    const categories = useMemo(() => {
        const uniqCategories = Array.from(new Set(allSites.map(s => s.category)));
        const ordered = CATEGORY_ORDER.filter(c => uniqCategories.includes(c));
        const remaining = uniqCategories.filter(c => !CATEGORY_ORDER.includes(c));
        return ["Today's Battle", ...ordered, ...remaining];
    }, [allSites]);

    return (
        <header className="app-header glass-header">
            {/* --- TOP ROW: LOGO, COUNTER, AND ACTIONS --- */}
            <div className="header-brand" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/assets/NT_logo.png" alt="Logo" style={{ height: '45px' }} />
                    <div className="sites-count-badge glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 12px', minWidth: '60px', borderRadius: '10px', border: '1px solid #eee' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ef5350', lineHeight: '1.1' }}>{sites?.length || 0}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#666' }}>SITES</span>
                    </div>
                </div>

                <div className="mobile-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="header-icon-btn glass-panel" onClick={() => setShowEvents(true)}><Calendar size={24} /></button>
                    <button className="header-icon-btn glass-panel" onClick={() => setView(view === 'map' ? 'list' : 'map')}>
                        {view === 'map' ? <List size={24} /> : <Map size={24} />}
                    </button>
                    <button className="header-icon-btn glass-panel" onClick={() => setShowSettings(true)}><Settings size={24} /></button>
                </div>
            </div>

            {/* --- SECOND ROW: FILTERS (DESKTOP & SCROLLABLE MOBILE) --- */}
            <div className="filters-group" style={{ borderTop: '1px solid #eee' }}>
                <div className="mobile-filters-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '10px 12px', gap: '10px', scrollbarWidth: 'none' }}>
                    <div style={{ flexShrink: 0, minWidth: '130px' }}>
                        <CustomSimpleSelect
                            options={[{ value: 'none', label: 'Location...' }, { value: 'geo', label: '📍 My Location' }, ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))]}
                            value={locationMode}
                            onChange={handleLocationSelect}
                            searchable={true}
                        />
                    </div>

                    {locationMode !== 'none' && (
                        <div style={{ flexShrink: 0, minWidth: '110px' }}>
                            <CustomSimpleSelect
                                options={[{ value: 'all', label: 'All Areas' }, { value: '1', label: '1 km' }, { value: '5', label: '5 km' }, { value: '10', label: '10 km' }, { value: '25', label: '25 km' }, { value: '50', label: '50 km' }]}
                                value={filterRadius}
                                onChange={setFilterRadius}
                            />
                        </div>
                    )}

                    <div style={{ flexShrink: 0 }}>
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>

                    <div style={{ flexShrink: 0 }}><SignificanceFilter /></div>
                    <ArcFilter className={`mobile-tag-filter ${showArcOnly ? 'filters-active-red' : ''}`} />

                    <button
                        className={`glass-panel ${isModalFiltered ? 'filters-active-red' : ''}`}
                        onClick={() => setShowFilters(true)}
                        style={{ flexShrink: 0, padding: '0 15px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #ccc', fontWeight: '600' }}
                    >
                        <Filter size={16} /> Filters
                    </button>
                    {isFiltered && <button className="glass-panel" onClick={clearAllFilters} style={{ color: '#ff4444', fontWeight: 'bold', flexShrink: 0 }}>Clear</button>}
                </div>
            </div>

            {/* MODALS */}
            {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
            {showEvents && <EventsModal onClose={() => setShowEvents(false)} />}
            {showNews && <NewsModal onClose={() => setShowNews(false)} />}
            {showSettings && <LocalSettingsDrawer onClose={() => setShowSettings(false)} />}
        </header>
    );
};

export default Header;