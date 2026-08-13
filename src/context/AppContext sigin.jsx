import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import sitesData from '../data/sites.json';
import showsData from '../data/shows.json';
import shoppingData from '../data/shopping.json';
import eventsDataFallback from '../data/events.json';
import newsDataFallback from '../data/news.json';
import messagesDataFallback from '../data/messages.json';
import dealsDataFallback from '../data/deals.json';
import { Geolocation } from '@capacitor/geolocation';

// Constants for remote data
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);
    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return undefined;

    const R = 6371; // Radius of the earth in km
    const dLat = (l2 - l1) * Math.PI / 180;
    const dLon = (ln2 - ln1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(l1 * Math.PI / 180) * Math.cos(l2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
};

export const EUROPEAN_CAPITALS = [
    { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
    { name: "Andorra Vella", lat: 42.5063, lon: 1.5218 },
    { name: "Athens", lat: 37.9838, lon: 23.7275 },
    { name: "Belgrade", lat: 44.7866, lon: 20.4489 },
    { name: "Berlin", lat: 52.522514, lon: 13.412396 },
    { name: "Bern", lat: 46.9480, lon: 7.4474 },
    { name: "Bratislava", lat: 48.1486, lon: 17.1077 },
    { name: "Brussels", lat: 50.8503, lon: 4.3517 },
    { name: "Bucharest", lat: 44.4268, lon: 26.1025 },
    { name: "Budapest", lat: 47.4979, lon: 19.0402 },
    { name: "Chisinau", lat: 47.0105, lon: 28.8638 },
    { name: "Copenhagen", lat: 55.6761, lon: 12.5683 },
    { name: "Dublin", lat: 53.3498, lon: -6.2603 },
    { name: "Helsinki", lat: 60.1695, lon: 24.9354 },
    { name: "Kyiv", lat: 50.4501, lon: 30.5234 },
    { name: "Lisbon", lat: 38.7223, lon: -9.1393 },
    { name: "Ljubljana", lat: 46.0569, lon: 14.5058 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Luxembourg", lat: 49.8153, lon: 6.1296 },
    { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    { name: "Minsk", lat: 53.9006, lon: 27.5590 },
    { name: "Monaco", lat: 43.7384, lon: 7.4246 },
    { name: "Moscow", lat: 55.7558, lon: 37.6173 },
    { name: "Nicosia", lat: 35.1856, lon: 33.3823 },
    { name: "Oslo", lat: 59.9139, lon: 10.7522 },
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Podgorica", lat: 42.4411, lon: 19.2636 },
    { name: "Prague", lat: 50.0755, lon: 14.4378 },
    { name: "Reykjavik", lat: 64.1466, lon: -21.9426 },
    { name: "Riga", lat: 56.9496, lon: 24.1052 },
    { name: "Rome", lat: 41.9028, lon: 12.4964 },
    { name: "San Marino", lat: 43.9424, lon: 12.4578 },
    { name: "Sarajevo", lat: 43.8563, lon: 18.4131 },
    { name: "Skopje", lat: 42.0024, lon: 21.4285 },
    { name: "Sofia", lat: 42.6977, lon: 23.3219 },
    { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
    { name: "Tallinn", lat: 59.4370, lon: 24.7536 },
    { name: "Tirana", lat: 41.3275, lon: 19.8187 },
    { name: "Vaduz", lat: 47.1410, lon: 9.5209 },
    { name: "Valletta", lat: 35.8989, lon: 14.5146 },
    { name: "Vatican City", lat: 41.9029, lon: 12.4534 },
    { name: "Vienna", lat: 48.2082, lon: 16.3738 },
    { name: "Vilnius", lat: 54.6872, lon: 25.2797 },
    { name: "Warsaw", lat: 52.2297, lon: 21.0122 },
    { name: "Zagreb", lat: 45.8150, lon: 15.9819 }
];

export const AppProvider = ({ children }) => {
    const isDevelopment = import.meta.env.DEV;

    // 1. Initial State for Developer Mode toggles
    const [developerMode, setDeveloperMode] = useState(() => {
        const saved = localStorage.getItem('developerMode');
        return saved === 'true';
    });

    const [previewDevice, setPreviewDevice] = useState('desktop');

    // Portal container ref — when inside DevicePreviewer, portals render into device-screen
    const portalContainerRef = useRef(null);
    const getPortalContainer = useCallback(() => portalContainerRef.current || document.body, []);

    // 2. Updated Effect: This applies the classes to the body so your CSS 
    // can react to 'mobile', 'tablet', or 'pc'/'desktop' selections.
    useEffect(() => {
        // Clear existing emulation classes
        document.body.classList.remove('pc', 'tablet', 'mobile', 'desktop');

        // Add the selected device class
        if (previewDevice) {
            document.body.classList.add(previewDevice);
        }
    }, [previewDevice]);

    // Data states initialized from localStorage or bundled fallbacks
    const [sitesBaseData, setSitesBaseData] = useState(() => {
        if (isDevelopment) return sitesData;
        const saved = localStorage.getItem('sitesData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : sitesData;
    });

    const [showsBaseData, setShowsBaseData] = useState(() => {
        if (isDevelopment) return showsData;
        const saved = localStorage.getItem('showsData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : showsData;
    });

    const [shoppingBaseData, setShoppingBaseData] = useState(() => {
        if (isDevelopment) return shoppingData;
        const saved = localStorage.getItem('shoppingData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : shoppingData;
    });

    const activeShoppingItems = useMemo(() => {
        if (!shoppingBaseData) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return shoppingBaseData
            .filter(item => {
                if (!item.startDate || !item.endDate) return true; // Show if dates are missing
                const start = new Date(item.startDate + 'T00:00:00');
                const end = new Date(item.endDate + 'T23:59:59');
                return today >= start && today <= end;
            })
            .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
    }, [shoppingBaseData]);

    const [eventsBaseData, setEventsBaseData] = useState(() => {
        if (isDevelopment) return eventsDataFallback;
        const saved = localStorage.getItem('eventsData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : eventsDataFallback;
    });

    const [newsBaseData, setNewsBaseData] = useState(() => {
        if (isDevelopment) return newsDataFallback;
        const saved = localStorage.getItem('newsData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : newsDataFallback;
    });

    const [activeMapOverlays, setActiveMapOverlays] = useState([]);

    const toggleMapOverlay = (mapId) => {
        setActiveMapOverlays(prev =>
            prev.includes(mapId)
                ? []
                : [mapId]
        );
    };

    const clearMapOverlays = () => setActiveMapOverlays([]);

    const [messagesBaseData, setMessagesBaseData] = useState(() => {
        if (isDevelopment) return messagesDataFallback;
        const saved = localStorage.getItem('messagesData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : messagesDataFallback;
    });

    const [dealsBaseData, setDealsBaseData] = useState(() => {
        if (isDevelopment) return dealsDataFallback;
        const saved = localStorage.getItem('dealsData');
        return (saved && saved !== "undefined") ? JSON.parse(saved) : dealsDataFallback;
    });

    const activeDeals = useMemo(() => {
        if (!dealsBaseData) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return dealsBaseData
            .filter(deal => {
                const start = new Date(deal.startDate + 'T00:00:00');
                const end = new Date(deal.endDate + 'T23:59:59');
                return today >= start && today <= end;
            })
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }, [dealsBaseData]);

    const [syncStatus, setSyncStatus] = useState('idle');
    const [lastSyncTime, setLastSyncTime] = useState(() => {
        return localStorage.getItem('lastSyncTime') || null;
    });

    // Update check from GitHub
    useEffect(() => {
        const syncData = async () => {
            setSyncStatus('syncing');
            try {
                const t = new Date().getTime();
                const fetchOpts = { cache: 'no-store', pragma: 'no-cache' };

                const fetchRequests = [
                    fetch(`${GITHUB_RAW_BASE_URL}/sites.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/shows.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/shopping.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/events.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/news.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/messages.json?t=${t}`, fetchOpts),
                    fetch(`${GITHUB_RAW_BASE_URL}/deals.json?t=${t}`, fetchOpts)
                ];

                const fetchRes = await Promise.all(fetchRequests);
                const [resSites, resShows, resShopping, resEvents, resNews, resMessages, resDeals] = fetchRes;

                if (resSites.ok) {
                    const data = await resSites.json();
                    if (!isDevelopment) setSitesBaseData(data);
                    localStorage.setItem('sitesData', JSON.stringify(data));
                }
                if (resShows.ok) {
                    const data = await resShows.json();
                    if (!isDevelopment) setShowsBaseData(data);
                    localStorage.setItem('showsData', JSON.stringify(data));
                }
                if (resShopping.ok) {
                    const data = await resShopping.json();
                    if (!isDevelopment) setShoppingBaseData(data);
                    localStorage.setItem('shoppingData', JSON.stringify(data));
                }
                if (resEvents.ok) {
                    const data = await resEvents.json();
                    if (!isDevelopment) setEventsBaseData(data);
                    localStorage.setItem('eventsData', JSON.stringify(data));
                }
                if (resNews && resNews.ok) {
                    const data = await resNews.json();
                    if (!isDevelopment) setNewsBaseData(data);
                    localStorage.setItem('newsData', JSON.stringify(data));
                }
                if (resMessages && resMessages.ok) {
                    const data = await resMessages.json();
                    if (!isDevelopment) setMessagesBaseData(data);
                    localStorage.setItem('messagesData', JSON.stringify(data));
                }
                if (resDeals && resDeals.ok) {
                    const data = await resDeals.json();
                    if (!isDevelopment) setDealsBaseData(data);
                    localStorage.setItem('dealsData', JSON.stringify(data));
                }

                const now = new Date().toLocaleString();
                setLastSyncTime(now);
                localStorage.setItem('lastSyncTime', now);
                setSyncStatus('success');
            } catch (error) {
                console.warn("Failed to sync data with GitHub. Using local/cached version.", error);
                setSyncStatus('error');
            }

        };
        syncData();
    }, [isDevelopment]);

    // --- 3. FILTER & NAVIGATION STATES ---
    const [view, setView] = useState('map');
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedHelpItem, setSelectedHelpItem] = useState(null); // HELP STATE
    const [callerSite, setCallerSite] = useState(null); // NAVIGATION MEMORY
    const [showAuth, setShowAuth] = useState(false); // AUTH MODAL STATE
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterCountry, setFilterCountry] = useState('all');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterRadius, setFilterRadius] = useState('all');
    const [userCoords, setUserCoords] = useState(null);
    const [locationMode, setLocationMode] = useState('none');
    const [showArcOnly, setShowArcOnly] = useState(false);

    const isFiltered = filterCategory.length > 0 || filterCountry !== 'all' || filterSearch !== '' || showArcOnly;

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

    // --- 4. THE PROVIDER RETURN ---
    return (
        <AppContext.Provider value={{
            sites: sitesBaseData,
            allSites: sitesBaseData,
            view, setView,
            previewDevice, setPreviewDevice,
            selectedSite, setSelectedSite,
            selectedHelpItem, setSelectedHelpItem,
            callerSite, setCallerSite,
            showAuth, setShowAuth,
            filterCategory, setFilterCategory,
            filterCountry, setFilterCountry,
            filterSearch, setFilterSearch,
            filterRadius, setFilterRadius,
            isFiltered, clearAllFilters,
            locationMode, handleLocationSelect,
            userCoords,
            activeMapOverlays, toggleMapOverlay, clearMapOverlays,
            getPortalContainer
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;