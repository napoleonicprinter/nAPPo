import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import sitesData from '../data/sites.json';
import showsData from '../data/shows.json';
import shoppingData from '../data/shopping.json';
import eventsDataFallback from '../data/events.json';
import newsDataFallback from '../data/news.json';
import messagesDataFallback from '../data/messages.json';
import dealsDataFallback from '../data/deals.json';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { HELP_ITEMS } from '../data/helpData';

// Constants for remote data
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const useBackHandler = (id, isActive, handler, priority = 10) => {
    const { registerBackHandler, unregisterBackHandler } = useAppContext();

    useEffect(() => {
        if (isActive && handler) {
            registerBackHandler(id, handler, priority);
            return () => {
                unregisterBackHandler(id);
            };
        } else {
            unregisterBackHandler(id);
        }
    }, [id, isActive, handler, priority, registerBackHandler, unregisterBackHandler]);
};

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
    { name: "Belgrade", lat: 44.7866, lon: 20.4489 },
    { name: "Berlin", lat: 52.522514, lon: 13.412396 },
    { name: "Bern", lat: 46.9480, lon: 7.4474 },
    { name: "Bratislava", lat: 48.1486, lon: 17.1077 },
    { name: "Brussels", lat: 50.8503, lon: 4.3517 },
    { name: "Bucharest", lat: 44.4268, lon: 26.1025 },
    { name: "Budapest", lat: 47.4979, lon: 19.0402 },
    { name: "Cairo", lat: 30.0444, lon: 31.2357 },
    { name: "Copenhagen", lat: 55.6761, lon: 12.5683 },
    { name: "Dublin", lat: 53.3498, lon: -6.2603 },
    { name: "Helsinki", lat: 60.1695, lon: 24.9354 },
    { name: "Lisbon", lat: 38.7223, lon: -9.1393 },
    { name: "Ljubljana", lat: 46.0569, lon: 14.5058 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Luxembourg", lat: 49.8153, lon: 6.1296 },
    { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    { name: "Minsk", lat: 53.9006, lon: 27.5590 },
    { name: "Monaco", lat: 43.7384, lon: 7.4246 },
    { name: "Moscow", lat: 55.7558, lon: 37.6173 },
    { name: "Oslo", lat: 59.9139, lon: 10.7522 },
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Prague", lat: 50.0755, lon: 14.4378 },
    { name: "Riga", lat: 56.9496, lon: 24.1052 },
    { name: "Rome", lat: 41.9028, lon: 12.4964 },
    { name: "San Marino", lat: 43.9424, lon: 12.4578 },
    { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
    { name: "Tallinn", lat: 59.4370, lon: 24.7536 },
    { name: "Vaduz", lat: 47.1410, lon: 9.5209 },
    { name: "Valletta", lat: 35.8989, lon: 14.5146 },
    { name: "Vatican City", lat: 41.9029, lon: 12.4534 },
    { name: "Vienna", lat: 48.2082, lon: 16.3738 },
    { name: "Vilnius", lat: 54.6872, lon: 25.2797 },
    { name: "Warsaw", lat: 52.2297, lon: 21.0122 },
    { name: "Zagreb", lat: 45.8150, lon: 15.9819 }
];
export const AppProvider = ({ children, storeUrl }) => {
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
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= sitesData.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return sitesData;
    });

    const [showsBaseData, setShowsBaseData] = useState(() => {
        if (isDevelopment) return showsData;
        const saved = localStorage.getItem('showsData');
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= showsData.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return showsData;
    });

    const [shoppingBaseData, setShoppingBaseData] = useState(() => {
        if (isDevelopment) return shoppingData;
        const saved = localStorage.getItem('shoppingData');
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= shoppingData.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return shoppingData;
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
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= eventsDataFallback.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return eventsDataFallback;
    });

    const [newsBaseData, setNewsBaseData] = useState(() => {
        if (isDevelopment) return newsDataFallback;
        const saved = localStorage.getItem('newsData');
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= newsDataFallback.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return newsDataFallback;
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
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= messagesDataFallback.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return messagesDataFallback;
    });

    const [dealsBaseData, setDealsBaseData] = useState(() => {
        if (isDevelopment) return dealsDataFallback;
        const saved = localStorage.getItem('dealsData');
        if (saved && saved !== "undefined") {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= dealsDataFallback.length) {
                    return parsed;
                }
            } catch (e) { }
        }
        return dealsDataFallback;
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
                const fetchRequests = [
                    fetch(`${GITHUB_RAW_BASE_URL}/sites.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/shows.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/shopping.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/events.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/news.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/messages.json?t=${t}`),
                    fetch(`${GITHUB_RAW_BASE_URL}/deals.json?t=${t}`)
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

        const timer = setTimeout(syncData, 2000);
        return () => clearTimeout(timer);
    }, []);

    const [view, setView] = useState('map');
    const [innerView, setInnerView] = useState('map');
    const [mapBounds, setMapBounds] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [siteToOpenPopup, setSiteToOpenPopup] = useState(null);
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('appUsers');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        if (saved && saved !== "undefined") {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    });

    const [filterCategory, setFilterCategory] = useState(() => {
        const saved = localStorage.getItem('filterCategory');
        if (saved && saved !== "undefined") {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });
    const [filterSignificance, setFilterSignificance] = useState(() => localStorage.getItem('filterSignificance') || '');
    const [filterVisited, setFilterVisited] = useState(() => localStorage.getItem('filterVisited') || 'all');
    const [filterRadius, setFilterRadius] = useState(() => localStorage.getItem('filterRadius') || 'all');
    const [filterSearch, setFilterSearch] = useState(() => localStorage.getItem('filterSearch') || '');
    const [filterYear, setFilterYear] = useState(() => localStorage.getItem('filterYear') || 'all');
    const [filterCommander, setFilterCommander] = useState(() => localStorage.getItem('filterCommander') || 'all');
    const [filterCountry, setFilterCountry] = useState(() => localStorage.getItem('filterCountry') || 'all');
    const [filterCoalition, setFilterCoalition] = useState(() => localStorage.getItem('filterCoalition') || 'all');
    const [filterCampaign, setFilterCampaign] = useState(() => localStorage.getItem('filterCampaign') || 'all');
    const [showArcOnly, setShowArcOnly] = useState(() => localStorage.getItem('showArcOnly') === 'true');
    const [filterWithMaps, setFilterWithMaps] = useState(() => localStorage.getItem('filterWithMaps') === 'true');
    const [selectedHelpItem, setSelectedHelpItem] = useState(null);
    const [visitedSites, setVisitedSites] = useState(() => {
        if (!currentUser) return [];
        const saved = localStorage.getItem(`visitedSites_${currentUser.username}`);
        if (saved && saved !== "undefined") {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });

    const [newSitesDays, setNewSitesDays] = useState(() => {
        const saved = localStorage.getItem('newSitesDays');
        return saved ? parseInt(saved, 10) : 7;
    });

    const [clusterRadius, setClusterRadius] = useState(() => {
        const saved = localStorage.getItem('clusterRadius');
        return saved ? parseInt(saved, 10) : 25;
    });

    const derivedSites = useMemo(() => {
        return (sitesBaseData || []).map(site => {
            const isNew = (() => {
                if (!site.createDate || !newSitesDays) return false;
                const createDate = new Date(site.createDate);
                const today = new Date();
                const diffTime = Math.abs(today - createDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= newSitesDays;
            })();

            const rawSpecial = site.special || site.Special;
            return {
                ...site,
                visited: visitedSites.includes(site.id),
                isNew,
                special: rawSpecial ? (Array.isArray(rawSpecial) ? rawSpecial : [String(rawSpecial)]) : []
            };
        });
    }, [sitesBaseData, visitedSites, newSitesDays]);

    const [geolocationEnabled, setGeolocationEnabled] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [locationMode, setLocationMode] = useState('none');

    const [showOnlyNew, setShowOnlyNew] = useState(() => {
        const saved = localStorage.getItem('showOnlyNew');
        return saved === 'true';
    });

    const [mapStyle, setMapStyle] = useState(() => {
        const saved = localStorage.getItem('mapStyle');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('appTheme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        if (mapStyle === 'dark' || mapStyle === 'light') {
            setMapStyle(newTheme);
        }
    };

    const sitesFilteredBase = useMemo(() => {
        return derivedSites.map(site => {
            if (userCoords) {
                return {
                    ...site,
                    distance: calculateDistance(userCoords.lat, userCoords.lon, site.latitude, site.longitude)
                };
            }
            return site;
        }).filter(site => {
            if (showOnlyNew && !site.isNew) return false;
            if (filterSignificance && site.significance !== filterSignificance) return false;
            if (filterVisited === 'visited' && !site.visited) return false;
            if (filterVisited === 'unvisited' && site.visited) return false;
            if (filterSearch && (!site.name || !site.name.toLowerCase().includes(filterSearch.toLowerCase()))) return false;
            if (filterCountry !== 'all' && site.country !== filterCountry) return false;
            if (filterCoalition !== 'all' && !site.special.includes(String(filterCoalition))) return false;
            if (filterCampaign !== 'all' && !site.special.includes(filterCampaign)) return false;
            if (showArcOnly && !site.special.includes('arc')) return false;
            if (filterWithMaps && (!site.maps || site.maps.length === 0)) return false;

            if (userCoords && filterRadius !== 'all' && site.distance !== undefined) {
                if (site.distance > parseInt(filterRadius, 10)) return false;
            }
            return true;
        });
    }, [derivedSites, userCoords, showOnlyNew, filterSignificance, filterVisited, filterSearch, filterCountry, filterCoalition, filterCampaign, showArcOnly, filterRadius, filterWithMaps]);

    const passYear = useCallback((site) => {
        const siteYearStr = site.year ? String(site.year).trim() : '';
        return filterYear === 'all' || siteYearStr === filterYear;
    }, [filterYear]);

    const passCmd = useCallback((site) => {
        return filterCommander === 'all' || (site.commanders && site.commanders.includes(filterCommander));
    }, [filterCommander]);

    const passCat = useCallback((site) => {
        if (filterCategory.length === 0) return true;
        const hasTodaysBattle = filterCategory.includes("Today's Battle");
        const otherCategories = filterCategory.filter(c => c !== "Today's Battle");

        let matchesToday = false;
        if (hasTodaysBattle) {
            if ((site.category === 'Battle site' || site.category === 'Naval battle') && site.date) {
                const today = new Date();
                const parts = site.date.split('-');
                if (parts.length >= 3) {
                    const month = parseInt(parts[1], 10);
                    const day = parseInt(parts[2], 10);
                    if (month === today.getMonth() + 1 && day === today.getDate()) matchesToday = true;
                }
            }
        }
        if (otherCategories.length > 0 && otherCategories.includes(site.category)) return true;
        if (hasTodaysBattle && matchesToday) return true;
        return false;
    }, [filterCategory]);

    const passesAllFiltersExcept = (site, excludeFacet) => {
        if (showOnlyNew && !site.isNew) return false;
        if (filterSignificance && site.significance !== filterSignificance) return false;
        if (filterSearch && (!site.name || !site.name.toLowerCase().includes(filterSearch.toLowerCase()))) return false;
        if (showArcOnly && !site.special.includes('arc')) return false;
        if (filterWithMaps && (!site.maps || site.maps.length === 0)) return false;
        if (userCoords && filterRadius !== 'all' && site.distance !== undefined) {
            if (site.distance > parseInt(filterRadius, 10)) return false;
        }

        if (excludeFacet !== 'visited') {
            if (filterVisited === 'visited' && !site.visited) return false;
            if (filterVisited === 'unvisited' && site.visited) return false;
        }
        if (excludeFacet !== 'country') {
            if (filterCountry !== 'all' && site.country !== filterCountry) return false;
        }
        if (excludeFacet !== 'coalition') {
            if (filterCoalition !== 'all' && !site.special.includes(String(filterCoalition))) return false;
        }
        if (excludeFacet !== 'campaign') {
            if (filterCampaign !== 'all' && !site.special.includes(filterCampaign)) return false;
        }
        if (excludeFacet !== 'category' && !passCat(site)) return false;
        if (excludeFacet !== 'year' && !passYear(site)) return false;
        if (excludeFacet !== 'commander' && !passCmd(site)) return false;

        return true;
    };

    // --- DYNAMIC FILTER OPTIONS ---

    // --- DYNAMIC YEARS WITH COUNTS ---
    const availableYears = useMemo(() => {
        const relevantSites = sitesFilteredBase.filter(site => passCmd(site) && passCat(site));
        const counts = {};
        relevantSites.forEach(s => {
            const y = s.year ? String(s.year).trim() : '';
            if (y) counts[y] = (counts[y] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([year, count]) => ({
                value: year,
                // We pass the raw name and the count separately in the label
                name: year,
                count: count,
                label: year // Fallback
            }))
            .sort((a, b) => a.value - b.value);
    }, [sitesFilteredBase, filterCommander, filterCategory, showArcOnly]);

    const availableCommanders = useMemo(() => {
        const relevantSites = sitesFilteredBase.filter(site => passYear(site) && passCat(site));
        const counts = {};
        relevantSites.forEach(s => {
            const cmds = Array.isArray(s.commanders) ? s.commanders : [s.commander].filter(Boolean);
            cmds.forEach(c => {
                counts[c] = (counts[c] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .map(([name, count]) => ({
                value: name,
                name: name,
                count: count,
                label: name // Fallback
            }))
            .sort((a, b) => a.value.localeCompare(b.value));
    }, [sitesFilteredBase, filterYear, filterCategory, showArcOnly]);
    const sitesForCategoryCounts = useMemo(() => sitesFilteredBase.filter(site => passYear(site) && passCmd(site)), [sitesFilteredBase, passYear, passCmd]);

    const categoryCounts = useMemo(() => {
        const counts = sitesForCategoryCounts.reduce((acc, site) => {
            acc[site.category] = (acc[site.category] || 0) + 1;
            return acc;
        }, {});
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        counts["Today's Battle"] = sitesForCategoryCounts.filter(site => {
            if ((site.category === 'Battle site' || site.category === 'Naval battle') && site.date) {
                const parts = site.date.split('-');
                if (parts.length >= 3) return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
            }
            return false;
        }).length;
        return counts;
    }, [sitesForCategoryCounts]);

    const countryCounts = useMemo(() => {
        const counts = {};
        derivedSites.forEach(site => {
            if (passesAllFiltersExcept(site, 'country') && site.country) {
                counts[site.country] = (counts[site.country] || 0) + 1;
            }
        });
        return counts;
    }, [derivedSites, showOnlyNew, filterSignificance, filterSearch, showArcOnly, filterWithMaps, userCoords, filterRadius, filterVisited, filterCoalition, filterCampaign, filterCategory, filterYear, filterCommander]);

    const campaignCounts = useMemo(() => {
        const counts = {};
        derivedSites.forEach(site => {
            if (passesAllFiltersExcept(site, 'campaign')) {
                site.special.forEach(sp => {
                    if (!sp || sp === 'arc' || sp === 'false' || sp === false) return;
                    const num = parseInt(sp, 10);
                    if (!isNaN(num) && num >= 1 && num <= 7) return;
                    if (typeof sp === 'string') counts[sp] = (counts[sp] || 0) + 1;
                });
            }
        });
        return counts;
    }, [derivedSites, showOnlyNew, filterSignificance, filterSearch, showArcOnly, filterWithMaps, userCoords, filterRadius, filterVisited, filterCountry, filterCoalition, filterCategory, filterYear, filterCommander]);

    const coalitionCounts = useMemo(() => {
        const counts = {};
        derivedSites.forEach(site => {
            if (passesAllFiltersExcept(site, 'coalition')) {
                site.special.forEach(sp => {
                    const num = parseInt(sp, 10);
                    if (!isNaN(num) && num >= 1 && num <= 7) {
                        counts[sp] = (counts[sp] || 0) + 1;
                    }
                });
            }
        });
        return counts;
    }, [derivedSites, showOnlyNew, filterSignificance, filterSearch, showArcOnly, filterWithMaps, userCoords, filterRadius, filterVisited, filterCountry, filterCampaign, filterCategory, filterYear, filterCommander]);

    const visitedCounts = useMemo(() => {
        const counts = { visited: 0, unvisited: 0 };
        derivedSites.forEach(site => {
            if (passesAllFiltersExcept(site, 'visited')) {
                if (site.visited) counts.visited++;
                else counts.unvisited++;
            }
        });
        return counts;
    }, [derivedSites, showOnlyNew, filterSignificance, filterSearch, showArcOnly, filterWithMaps, userCoords, filterRadius, filterCountry, filterCoalition, filterCampaign, filterCategory, filterYear, filterCommander]);



    const filteredSites = useMemo(() => sitesForCategoryCounts.filter(site => passCat(site)), [sitesForCategoryCounts, passCat]);

    // 1. Master Filter: Controls if the "Clear" button appears
    const isFiltered =
        // locationMode !== 'none' ||
        filterRadius !== 'all' ||
        filterCategory.length > 0 ||
        filterSignificance !== '' ||
        filterSearch !== '' ||
        filterCountry !== 'all' ||
        filterCoalition !== 'all' ||
        filterCampaign !== 'all' ||
        filterVisited !== 'all' ||
        showOnlyNew || // <--- Checkbox 2
        filterWithMaps;  // <--- Checkbox 3


    // 2. Modal Filter: Specifically turns the "Filters" button RED

    const isModalFiltered = useMemo(() => {
        return filterSearch !== '' ||
            filterCountry !== 'all' ||
            filterCoalition !== 'all' ||
            filterCampaign !== 'all' ||
            filterVisited !== 'all' ||
            filterYear !== 'all' ||
            filterCommander !== 'all' ||
            showOnlyNew ||      // <-- Add this
            filterWithMaps;     // <-- Add this
    }, [filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited, filterYear, filterCommander, showOnlyNew, filterWithMaps]);

    // 3. Clear Function: Ensure it resets the boxes to false

    const clearAllFilters = () => {
        setFilterCategory([]);
        setFilterSignificance('');
        setFilterVisited('all');
        setFilterRadius('all');
        setFilterSearch('');
        setFilterYear('all');
        setFilterCommander('all');
        setFilterCountry('all');
        setFilterCoalition('all');
        setFilterCampaign('all');
        setShowArcOnly(false);
        setShowOnlyNew(false);
        setFilterWithMaps(false);
    };

    useEffect(() => {
        const allowedCategories = ['Battle site', 'Naval battle', 'Battle landmark'];
        const showFilter = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));
        if (!showFilter) {
            setFilterCommander('all');
            setFilterYear('all');
        }
        const isBattleSiteAlone = filterCategory.length === 1 && filterCategory[0] === 'Battle site';
        if (!isBattleSiteAlone) setShowArcOnly(false);
    }, [filterCategory]);

    useEffect(() => {
        if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
        else {
            localStorage.removeItem('currentUser');
            setVisitedSites([]);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) localStorage.setItem(`visitedSites_${currentUser.username}`, JSON.stringify(visitedSites));
    }, [visitedSites, currentUser]);

    useEffect(() => { localStorage.setItem('appUsers', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('newSitesDays', (newSitesDays || 30).toString()); }, [newSitesDays]);
    useEffect(() => { localStorage.setItem('clusterRadius', (clusterRadius || 25).toString()); }, [clusterRadius]);
    useEffect(() => { localStorage.setItem('showOnlyNew', showOnlyNew.toString()); }, [showOnlyNew]);
    useEffect(() => { localStorage.setItem('developerMode', developerMode.toString()); }, [developerMode]);
    useEffect(() => { localStorage.setItem('mapStyle', mapStyle); }, [mapStyle]);
    useEffect(() => { localStorage.setItem('filterCategory', JSON.stringify(filterCategory)); }, [filterCategory]);
    useEffect(() => { localStorage.setItem('filterSignificance', filterSignificance || ''); }, [filterSignificance]);
    useEffect(() => { localStorage.setItem('filterVisited', filterVisited || 'all'); }, [filterVisited]);
    useEffect(() => { localStorage.setItem('filterRadius', filterRadius || 'all'); }, [filterRadius]);
    useEffect(() => { localStorage.setItem('filterSearch', filterSearch || ''); }, [filterSearch]);
    useEffect(() => { localStorage.setItem('filterYear', filterYear || 'all'); }, [filterYear]);
    useEffect(() => { localStorage.setItem('filterCommander', filterCommander || 'all'); }, [filterCommander]);
    useEffect(() => { localStorage.setItem('filterCountry', filterCountry || 'all'); }, [filterCountry]);
    useEffect(() => { localStorage.setItem('filterCoalition', filterCoalition || 'all'); }, [filterCoalition]);
    useEffect(() => { localStorage.setItem('filterCampaign', filterCampaign || 'all'); }, [filterCampaign]);
    useEffect(() => { localStorage.setItem('showArcOnly', showArcOnly.toString()); }, [showArcOnly]);
    useEffect(() => { localStorage.setItem('filterWithMaps', filterWithMaps.toString()); }, [filterWithMaps]);

    useEffect(() => {
        localStorage.setItem('appTheme', theme);
        document.body.className = theme === 'light' ? 'light-mode' : '';
    }, [theme]);

    const [showAuth, setShowAuth] = useState(false);
    const [authMessage, setAuthMessage] = useState(null);

    const toggleVisited = (id) => {
        if (!currentUser) {
            setAuthMessage("Please log in to mark sites as visited.");
            setShowAuth(true);
            return;
        }
        setVisitedSites(prev => prev.includes(id) ? prev.filter(siteId => siteId !== id) : [...prev, id]);
    };

    const login = (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser({ username: user.username });
            return true;
        }
        return false;
    };

    const signup = (username, password) => {
        if (users.find(u => u.username === username)) return false;
        setUsers([...users, { username, password }]);
        setCurrentUser({ username });
        return true;
    };

    const logout = () => setCurrentUser(null);

    const deleteCurrentUser = () => {
        if (!currentUser) return;
        const usernameToDelete = currentUser.username;
        setUsers(prev => prev.filter(u => u.username !== usernameToDelete));
        localStorage.removeItem(`visitedSites_${usernameToDelete}`);
        setCurrentUser(null);
    };

    const exportUserData = () => {
        const data = {
            appName: 'nAPPo Trails',
            version: '1.0',
            exportDate: new Date().toISOString(),
            username: currentUser ? currentUser.username : 'guest',
            visitedSites: visitedSites || [],
            users: users || []
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const nameStr = currentUser ? currentUser.username : 'visited';
        link.download = `nappo_visited_sites_${nameStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importUserData = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (!data || !Array.isArray(data.visitedSites)) {
                return { success: false, message: 'Invalid backup file format.' };
            }

            const importedVisited = data.visitedSites.map(id => String(id));
            const mergedVisited = Array.from(new Set([...visitedSites, ...importedVisited]));
            setVisitedSites(mergedVisited);

            if (Array.isArray(data.users) && data.users.length > 0) {
                setUsers(prev => {
                    const mergedUsers = [...prev];
                    data.users.forEach(u => {
                        if (u.username && !mergedUsers.find(existing => existing.username === u.username)) {
                            mergedUsers.push(u);
                        }
                    });
                    return mergedUsers;
                });
            }

            if (currentUser) {
                localStorage.setItem(`visitedSites_${currentUser.username}`, JSON.stringify(mergedVisited));
            }

            const addedCount = mergedVisited.length - visitedSites.length;
            return {
                success: true,
                totalCount: mergedVisited.length,
                addedCount,
                message: `Successfully imported ${importedVisited.length} site(s)! (${mergedVisited.length} total visited sites saved)`
            };
        } catch (e) {
            return { success: false, message: 'Failed to parse JSON backup file. Please ensure it is a valid backup file.' };
        }
    };

    const requestGeolocation = async () => {
        if (isDevelopment) {
            try {
                const testLocationModule = await import('../data/testLocation.json');
                const testLocation = testLocationModule.default;
                if (testLocation && testLocation.enabled) {
                    setUserCoords({ lat: testLocation.lat, lon: testLocation.lon });
                    setGeolocationEnabled(true);
                    setLocationMode('geo');
                    return;
                }
            } catch (err) {
                console.log("No testLocation.json found or invalid");
            }
        }
        try {
            const permissions = await Geolocation.checkPermissions();
            if (permissions.location !== 'granted') await Geolocation.requestPermissions();
            const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
            setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
            setGeolocationEnabled(true);
            setLocationMode('geo');
        } catch (error) {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your device/browser");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
                    setGeolocationEnabled(true);
                    setLocationMode('geo');
                },
                (err) => alert("Failed to get location. Please ensure location services are enabled."),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
    };
    // Add these near your other useState calls in AppContext.jsx

    const [isMobileLike, setIsMobileLike] = useState(window.innerWidth <= 1024);

    // Add this useEffect to update isMobileLike on resize
    useEffect(() => {
        const handleResize = () => setIsMobileLike(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const disableGeolocation = () => handleLocationSelect('none');

    const handleLocationSelect = (mode) => {
        if (mode === 'none') {
            setGeolocationEnabled(false);
            setUserCoords(null);
            setLocationMode('none');
        } else if (mode === 'geo') {
            requestGeolocation();
        } else {
            const capital = EUROPEAN_CAPITALS.find(c => c.name === mode);
            if (capital) {
                setUserCoords({ lat: capital.lat, lon: capital.lon });
                setGeolocationEnabled(false);
                setLocationMode(mode);
            }
        }
    };
    // Dentro de AppContext.jsx
    const [callerSite, setCallerSite] = useState(null);

    // Global back-handlers registry
    const backHandlersRef = useRef([]);

    const registerBackHandler = useCallback((id, handler, priority = 10) => {
        backHandlersRef.current = [
            ...backHandlersRef.current.filter(h => h.id !== id),
            { id, handler, priority, timestamp: Date.now() }
        ];
    }, []);

    const unregisterBackHandler = useCallback((id) => {
        backHandlersRef.current = backHandlersRef.current.filter(h => h.id !== id);
    }, []);

    // Selection & Navigation History Stack for Step-by-Step Undo
    const historyStackRef = useRef([]);
    const isUndoingRef = useRef(false);
    const lastExitPressRef = useRef(0);

    const restoreSnapshot = useCallback((target) => {
        if (!target) return;
        isUndoingRef.current = true;

        if (target.selectedSiteId) {
            const site = (sitesBaseData || []).find(s => s.id === target.selectedSiteId);
            setSelectedSite(site || null);
        } else {
            setSelectedSite(null);
            if (setCallerSite) setCallerSite(null);
        }

        if (target.selectedHelpItemId) {
            const item = HELP_ITEMS.find(i => i.id === target.selectedHelpItemId);
            setSelectedHelpItem(item || null);
        } else {
            setSelectedHelpItem(null);
        }

        setFilterCategory(target.filterCategory || []);
        setFilterSignificance(target.filterSignificance || '');
        setFilterVisited(target.filterVisited || 'all');
        setFilterRadius(target.filterRadius || 'all');
        setFilterSearch(target.filterSearch || '');
        setFilterYear(target.filterYear || 'all');
        setFilterCommander(target.filterCommander || 'all');
        setFilterCountry(target.filterCountry || 'all');
        setFilterCoalition(target.filterCoalition || 'all');
        setFilterCampaign(target.filterCampaign || 'all');
        setShowArcOnly(target.showArcOnly || false);
        setFilterWithMaps(target.filterWithMaps || false);
        setShowOnlyNew(target.showOnlyNew || false);
        setLocationMode(target.locationMode || 'none');
        setUserCoords(target.userCoords || null);
        setActiveMapOverlays(target.activeMapOverlays || []);
        setView(target.view || 'map');
        setPreviewDevice(target.previewDevice || 'desktop');
    }, [sitesBaseData, setCallerSite]);

    // Record user selections into history stack
    useEffect(() => {
        if (isUndoingRef.current) {
            isUndoingRef.current = false;
            return;
        }

        const snapshot = {
            selectedSiteId: selectedSite?.id || null,
            selectedHelpItemId: selectedHelpItem?.id || null,
            filterCategory: Array.isArray(filterCategory) ? [...filterCategory] : [],
            filterSignificance: filterSignificance || '',
            filterVisited: filterVisited || 'all',
            filterRadius: filterRadius || 'all',
            filterSearch: filterSearch || '',
            filterYear: filterYear || 'all',
            filterCommander: filterCommander || 'all',
            filterCountry: filterCountry || 'all',
            filterCoalition: filterCoalition || 'all',
            filterCampaign: filterCampaign || 'all',
            showArcOnly: !!showArcOnly,
            filterWithMaps: !!filterWithMaps,
            showOnlyNew: !!showOnlyNew,
            locationMode: locationMode || 'none',
            userCoords: userCoords ? { lat: userCoords.lat, lon: userCoords.lon } : null,
            activeMapOverlays: Array.isArray(activeMapOverlays) ? [...activeMapOverlays] : [],
            view: view || 'map',
            previewDevice: previewDevice || 'desktop'
        };

        const stack = historyStackRef.current;
        if (stack.length === 0) {
            historyStackRef.current = [snapshot];
            return;
        }

        const last = stack[stack.length - 1];
        const isSame = (
            last.selectedSiteId === snapshot.selectedSiteId &&
            last.selectedHelpItemId === snapshot.selectedHelpItemId &&
            JSON.stringify(last.filterCategory) === JSON.stringify(snapshot.filterCategory) &&
            last.filterSignificance === snapshot.filterSignificance &&
            last.filterVisited === snapshot.filterVisited &&
            last.filterRadius === snapshot.filterRadius &&
            last.filterSearch === snapshot.filterSearch &&
            last.filterYear === snapshot.filterYear &&
            last.filterCommander === snapshot.filterCommander &&
            last.filterCountry === snapshot.filterCountry &&
            last.filterCoalition === snapshot.filterCoalition &&
            last.filterCampaign === snapshot.filterCampaign &&
            last.showArcOnly === snapshot.showArcOnly &&
            last.filterWithMaps === snapshot.filterWithMaps &&
            last.showOnlyNew === snapshot.showOnlyNew &&
            last.locationMode === snapshot.locationMode &&
            JSON.stringify(last.userCoords) === JSON.stringify(snapshot.userCoords) &&
            JSON.stringify(last.activeMapOverlays) === JSON.stringify(snapshot.activeMapOverlays) &&
            last.view === snapshot.view &&
            last.previewDevice === snapshot.previewDevice
        );

        if (!isSame) {
            historyStackRef.current = [...stack.slice(-49), snapshot];
        }
    }, [
        selectedSite, selectedHelpItem, filterCategory, filterSignificance,
        filterVisited, filterRadius, filterSearch, filterYear, filterCommander,
        filterCountry, filterCoalition, filterCampaign, showArcOnly, filterWithMaps,
        showOnlyNew, locationMode, userCoords, activeMapOverlays, view, previewDevice
    ]);

    // Global Back Action Executor (Undo Last Selection / Close Modal)
    const handleBackAction = useCallback(() => {
        // 1. Run top-priority active registered modal/drawer handler (e.g. Settings, Filters, Menus)
        if (backHandlersRef.current.length > 0) {
            const sorted = [...backHandlersRef.current].sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return b.timestamp - a.timestamp;
            });

            for (const item of sorted) {
                try {
                    const result = item.handler();
                    if (result !== false) {
                        return true;
                    }
                } catch (err) {
                    console.error(`[BackHandler] Error executing handler for ${item.id}:`, err);
                }
            }
        }

        // 2. Undo last selection from selection history stack
        const stack = historyStackRef.current;
        if (stack.length > 1) {
            stack.pop(); // Pop current state
            const prevSnapshot = stack[stack.length - 1];
            if (prevSnapshot) {
                restoreSnapshot(prevSnapshot);
                return true;
            }
        }

        // 3. Fallback: If anything is still selected or filtered, reset it
        if (selectedSite) {
            setSelectedSite(null);
            if (setCallerSite) setCallerSite(null);
            return true;
        }
        if (selectedHelpItem) {
            setSelectedHelpItem(null);
            return true;
        }
        if (activeMapOverlays && activeMapOverlays.length > 0) {
            clearMapOverlays();
            return true;
        }
        if (view !== 'map') {
            setView('map');
            return true;
        }
        if (previewDevice && previewDevice !== 'desktop') {
            setPreviewDevice('desktop');
            return true;
        }
        if (isFiltered) {
            clearAllFilters();
            return true;
        }

        // 4. If user is at pristine baseline with nothing left to undo:
        // Require double-press within 2s to exit app on Android
        const now = Date.now();
        if (lastExitPressRef.current && (now - lastExitPressRef.current) < 2000) {
            if (Capacitor.isNativePlatform()) {
                App.exitApp();
                return true;
            }
        } else {
            lastExitPressRef.current = now;
            return true; // Consume the first back press at root so it doesn't abruptly quit!
        }

        return false;
    }, [restoreSnapshot, selectedSite, selectedHelpItem, activeMapOverlays, clearMapOverlays, view, setView, previewDevice, setPreviewDevice, isFiltered, clearAllFilters, setCallerSite]);

    // Native Capacitor Back Button & Web Popstate listener
    useEffect(() => {
        let backListenerHandle = null;

        if (Capacitor.isNativePlatform()) {
            App.addListener('backButton', () => {
                handleBackAction();
            }).then(handle => {
                backListenerHandle = handle;
            });
        }

        const handlePopState = () => {
            const handled = handleBackAction();
            if (handled) {
                try {
                    window.history.pushState({ nappoApp: true }, '');
                } catch (e) { }
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            if (backListenerHandle) {
                backListenerHandle.remove();
            }
            window.removeEventListener('popstate', handlePopState);
        };
    }, [handleBackAction]);

    // Context-level back handlers
    useEffect(() => {
        if (showAuth) {
            registerBackHandler('showAuth', () => {
                setShowAuth(false);
                setAuthMessage(null);
            }, 30);
            return () => unregisterBackHandler('showAuth');
        }
    }, [showAuth, registerBackHandler, unregisterBackHandler, setAuthMessage]);

    return (
        <AppContext.Provider value={{
            storeUrl,
            registerBackHandler,
            unregisterBackHandler,
            handleBackAction,
            sites: filteredSites,
            allSites: derivedSites,
            view, setView, innerView, setInnerView,
            selectedSite, setSelectedSite,
            siteToOpenPopup, setSiteToOpenPopup,
            toggleVisited,
            showAuth, setShowAuth,
            authMessage, setAuthMessage,
            geolocationEnabled,
            requestGeolocation,
            disableGeolocation,
            userCoords,
            locationMode,
            handleLocationSelect,
            filterSearch, setFilterSearch,
            filterCategory, setFilterCategory,
            filterCountry, setFilterCountry,
            filterCoalition, setFilterCoalition,
            filterCampaign, setFilterCampaign,
            isFiltered,
            clearAllFilters,
            filterSignificance, setFilterSignificance,
            filterVisited, setFilterVisited,
            filterRadius, setFilterRadius,
            filterYear, setFilterYear, availableYears,
            filterCommander, setFilterCommander, availableCommanders,
            showArcOnly, setShowArcOnly,
            isMobileLike,// <--- Add this
            filterWithMaps, setFilterWithMaps,
            visitedSites,
            currentUser,
            login, signup, logout, deleteCurrentUser,
            exportUserData, importUserData,
            newSitesDays, setNewSitesDays,
            clusterRadius, setClusterRadius,
            showOnlyNew, setShowOnlyNew,
            developerMode, setDeveloperMode,
            previewDevice, setPreviewDevice,
            portalContainerRef, getPortalContainer,
            mapStyle, setMapStyle,
            theme, toggleTheme,
            categoryCounts,
            countryCounts,
            campaignCounts,
            coalitionCounts,
            visitedCounts,
            syncStatus, lastSyncTime,
            mapBounds, setMapBounds,
            showsToCome: showsBaseData,
            shoppingItems: activeShoppingItems,
            eventsData: eventsBaseData,
            newsData: newsBaseData,
            messagesData: messagesBaseData,
            activeDeals,
            activeMapOverlays,
            toggleMapOverlay,
            clearMapOverlays,
            callerSite,
            setCallerSite,
            selectedHelpItem,
            setSelectedHelpItem,
        }}>
            {children}
        </AppContext.Provider>
    );
};
