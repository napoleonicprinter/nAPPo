import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import sitesData from '../data/sites.json';
import showsData from '../data/shows.json';
import shoppingData from '../data/shopping.json';
import eventsDataFallback from '../data/events.json';
import newsDataFallback from '../data/news.json';
import messagesDataFallback from '../data/messages.json';
import dealsDataFallback from '../data/deals.json';

const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const EUROPEAN_CAPITALS = [
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Vienna", lat: 48.2082, lon: 16.3738 },
    { name: "Berlin", lat: 52.5225, lon: 13.4124 },
    { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    { name: "Rome", lat: 41.9028, lon: 12.4964 }
];

export const AppProvider = ({ children }) => {
    const isDevelopment = import.meta.env.DEV;

    // --- 1. CORE UI STATES ---
    const [view, setView] = useState('map');
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [theme, setTheme] = useState('light');
    const [showAuth, setShowAuth] = useState(false);
    const [selectedHelpItem, setSelectedHelpItem] = useState(null);

    // --- 2. MAP & NAVIGATION STATES ---
    const [selectedSite, setSelectedSite] = useState(null);
    const [callerSite, setCallerSite] = useState(null);
    const [siteToOpenPopup, setSiteToOpenPopup] = useState(null);
    const [mapStyle, setMapStyle] = useState('light');
    const [clusterRadius, setClusterRadius] = useState(50);
    const [userCoords, setUserCoords] = useState(null);
    const [locationMode, setLocationMode] = useState('none');

    // --- 3. DATA STATES ---
    const [sitesBaseData, setSitesBaseData] = useState(sitesData);
    const [activeMapOverlays, setActiveMapOverlays] = useState([]);
    const [newsBaseData, setNewsBaseData] = useState(newsDataFallback);

    // --- 4. FILTER STATES ---
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterCountry, setFilterCountry] = useState('all');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterRadius, setFilterRadius] = useState('all');
    const [showArcOnly, setShowArcOnly] = useState(false);

    const isFiltered = filterCategory.length > 0 || filterCountry !== 'all' || filterSearch !== '' || showArcOnly;

    // --- 5. EFFECTS ---
    useEffect(() => {
        document.body.classList.remove('pc', 'tablet', 'mobile', 'desktop');
        if (previewDevice) document.body.classList.add(previewDevice);
    }, [previewDevice]);

    // GitHub Sync Logic
    useEffect(() => {
        const syncData = async () => {
            try {
                const t = new Date().getTime();
                const res = await fetch(`${GITHUB_RAW_BASE_URL}/sites.json?t=${t}`);
                if (res.ok) {
                    const data = await res.json();
                    if (!isDevelopment) setSitesBaseData(data);
                    localStorage.setItem('sitesData', JSON.stringify(data));
                }
            } catch (e) { console.warn("Sync failed", e); }
        };
        syncData();
    }, [isDevelopment]);

    // --- 6. HANDLERS ---
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const clearAllFilters = () => {
        setFilterCategory([]);
        setFilterCountry('all');
        setFilterSearch('');
        setShowArcOnly(false);
        setLocationMode('none');
        setUserCoords(null);
    };

    const handleLocationSelect = (mode) => {
        if (mode === 'none') {
            setUserCoords(null);
            setLocationMode('none');
        } else {
            const capital = EUROPEAN_CAPITALS.find(c => c.name === mode);
            if (capital) {
                setUserCoords({ lat: capital.lat, lon: capital.lon });
                setLocationMode(mode);
            }
        }
    };

    const toggleMapOverlay = (mapId) => setActiveMapOverlays(prev => prev.includes(mapId) ? [] : [mapId]);
    const clearMapOverlays = () => setActiveMapOverlays([]);

    return (
        <AppContext.Provider value={{
            // Data
            sites: sitesBaseData,
            allSites: sitesBaseData,
            newsData: newsBaseData,
            // UI
            view, setView,
            previewDevice, setPreviewDevice,
            theme, toggleTheme,
            showAuth, setShowAuth,
            selectedHelpItem, setSelectedHelpItem,
            // Map
            mapStyle, setMapStyle,
            clusterRadius, setClusterRadius,
            siteToOpenPopup, setSiteToOpenPopup,
            userCoords, locationMode, handleLocationSelect,
            activeMapOverlays, toggleMapOverlay, clearMapOverlays,
            // Detail Cards & Navigation
            selectedSite, setSelectedSite,
            callerSite, setCallerSite,
            // Filters
            filterCategory, setFilterCategory,
            filterCountry, setFilterCountry,
            filterSearch, setFilterSearch,
            filterRadius, setFilterRadius,
            showArcOnly, setShowArcOnly,
            isFiltered, clearAllFilters
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;