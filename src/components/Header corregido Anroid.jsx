import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Map, List, Settings, Calendar, Filter, X,
    Moon, Sun, LogOut, User, UserCircle, Info, Smartphone, Star
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
import './Header.css';

// --- CORRECTED SETTINGS DRAWER COMPONENT ---
const LocalSettingsDrawer = ({ onClose }) => {
    const {
        theme, toggleTheme,
        currentUser, logout,
        mapStyle, setMapStyle,
        clusterRadius, setClusterRadius,
        previewDevice, setPreviewDevice
    } = useAppContext();

    return createPortal(
        <>
            <div className="settings-drawer-backdrop open" onClick={onClose} style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000
            }} />
            <div className="settings-drawer open" style={{
                zIndex: 100001, position: 'fixed', right: 0, top: 0, bottom: 0, width: '300px',
                backgroundColor: 'var(--bg-color, white)', padding: '20px',
                boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={22} />
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>Settings</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
                </div>

                {/* Account Section */}
                <div className="glass-panel" style={{ padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', border: '1px solid #eee' }}>
                    <UserCircle size={32} color="#58a6ff" />
                    <button onClick={() => { logout(); onClose(); }} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px',
                        borderRadius: '20px', border: '1px solid #ddd', background: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'
                    }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                {/* Support Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Support us</h3>
                    <button className="glass-panel" style={{
                        width: '100%', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '10px', marginBottom: '10px', border: '1px solid #ddd', cursor: 'pointer'
                    }}>
                        <span style={{ color: '#052d49', fontWeight: '800', fontSize: '1.1rem' }}>Patreon</span>
                    </button>
                    <button className="glass-panel" style={{
                        width: '100%', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '10px', border: '1px solid #ddd', cursor: 'pointer'
                    }}>
                        <Star size={18} /> <span>Rate App</span>
                    </button>
                </div>

                {/* Theme Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Theme</h3>
                    <button onClick={toggleTheme} className="glass-panel" style={{
                        width: '100%', padding: '12px', borderRadius: '25px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '10px', border: '1px solid #ddd', cursor: 'pointer'
                    }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span style={{ fontWeight: '600' }}>{theme === 'dark' ? 'Light Mode' : 'Night Mode'}</span>
                    </button>
                </div>

                {/* Map Style Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Map Style</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {['dark', 'light', 'satellite'].map((style) => (
                            <button
                                key={style}
                                onClick={() => setMapStyle(style)}
                                style={{
                                    padding: '10px 5px', borderRadius: '10px', border: mapStyle === style ? '2px solid #58a6ff' : '1px solid #ddd',
                                    background: mapStyle === style ? 'rgba(88,166,255,0.1)' : 'white',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer'
                                }}
                            >
                                {style === 'dark' ? <Moon size={18} /> : style === 'light' ? <Sun size={18} /> : <Map size={18} />}
                                <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{style === 'light' ? 'Day' : style}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map Clustering Section */}
                <div className="settings-section" style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
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
            </div>
        </>,
        document.body
    );
};

const Header = () => {
    const context = useAppContext();

    const {
        view = 'map', setView,
        filterCategory = [], setFilterCategory,
        locationMode = 'none', handleLocationSelect,
        filterRadius = 'all', setFilterRadius,
        showArcOnly = false,
        allSites = [], sites = [],
        isFiltered = false,
        categoryCounts = {},
        isModalFiltered,
    } = context || {};

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

    if (!context) return null;

    return (
        <header className="app-header glass-header" style={{ borderBottom: '1px solid #eee' }}>
            <div className="header-brand" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/assets/NT_logo.png" alt="Logo" className="header-logo" style={{ height: '45px' }} />
                    <div className="sites-count-badge" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '2px 12px', minWidth: '60px', borderRadius: '10px',
                        border: '1px solid #eee', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ef5350', lineHeight: '1.1' }}>
                            {sites?.length || 0}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#666' }}>SITES</span>
                    </div>
                </div>

                <div className="mobile-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="header-icon-btn glass-panel" onClick={() => setShowEvents(true)} style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>
                        <Calendar size={24} />
                    </button>
                    <button className="header-icon-btn glass-panel" onClick={() => setView(view === 'map' ? 'list' : 'map')} style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>
                        {view === 'map' ? <List size={24} /> : <Map size={24} />}
                    </button>
                    <button className="header-icon-btn glass-panel" onClick={() => setShowSettings(true)} style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', border: 'none' }}>
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            <div className="filters-group" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                <div className="mobile-filters-scroll" style={{
                    display: 'flex', overflowX: 'auto', padding: '10px 12px',
                    gap: '10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
                }}>
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
                                options={[
                                    { value: 'all', label: 'All Areas' },
                                    { value: '1', label: '1 km' }, { value: '5', label: '5 km' },
                                    { value: '10', label: '10 km' }, { value: '25', label: '25 km' },
                                    { value: '50', label: '50 km' },
                                ]}
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
                        style={{ flexShrink: 0, padding: '0 15px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
            {showEvents && <EventsModal onClose={() => setShowEvents(false)} />}
            {showNews && <NewsModal onClose={() => setShowNews(false)} />}
            {showSettings && <LocalSettingsDrawer onClose={() => setShowSettings(false)} />}
        </header>
    );
};

export default Header;