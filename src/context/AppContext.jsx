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
    { name: "Berlin", lat: 52.5200, lon: 13.4050 },
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

    const [filterCategory, setFilterCategory] = useState([]);
    const [filterSignificance, setFilterSignificance] = useState('');
    const [filterVisited, setFilterVisited] = useState('all');
    const [filterRadius, setFilterRadius] = useState('all');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterYear, setFilterYear] = useState('all');
    const [filterCommander, setFilterCommander] = useState('all');
    const [filterCountry, setFilterCountry] = useState('all');
    const [filterCoalition, setFilterCoalition] = useState('all');
    const [filterCampaign, setFilterCampaign] = useState('all');
    const [showArcOnly, setShowArcOnly] = useState(false);
    const [filterWithMaps, setFilterWithMaps] = useState(false);

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

            return {
                ...site,
                visited: visitedSites.includes(site.id),
                isNew,
                special: site.special ? (Array.isArray(site.special) ? site.special : [String(site.special)]) : []
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

    const passYear = (site) => {
        const siteYearStr = site.year ? String(site.year).trim() : '';
        return filterYear === 'all' || siteYearStr === filterYear;
    };
    
    const passCmd = (site) => {
        return filterCommander === 'all' || (site.commanders && site.commanders.includes(filterCommander));
    };

    const passCat = (site) => {
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
    };

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
    const availableYears = Array.from(new Set(sitesFilteredBase.filter(site => passCmd(site) && passCat(site)).map(s => s.year ? String(s.year).trim() : '').filter(y => y !== ''))).sort();
    const availableCommanders = Array.from(new Set(sitesFilteredBase.filter(site => passYear(site) && passCat(site)).flatMap(s => s.commanders || []))).sort();
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

    const isFiltered = filterCategory.length > 0 || filterSignificance !== '' || filterVisited !== 'all' || filterRadius !== 'all' || filterSearch !== '' || filterYear !== 'all' || filterCommander !== 'all' || filterCountry !== 'all' || filterCoalition !== 'all' || filterCampaign !== 'all' || showArcOnly || showOnlyNew || filterWithMaps;

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

    useEffect(() => {
        localStorage.setItem('appTheme', theme);
        document.body.className = theme === 'light' ? 'light-mode' : '';
    }, [theme]);

    const toggleVisited = (id) => {
        if (!currentUser) {
            alert("Please log in to mark sites as visited.");
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

    return (
        <AppContext.Provider value={{
            sites: filteredSites,
            allSites: derivedSites,
            view, setView, innerView, setInnerView,
            selectedSite, setSelectedSite,
            siteToOpenPopup, setSiteToOpenPopup,
            toggleVisited,
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
            filterWithMaps, setFilterWithMaps,
            visitedSites,
            currentUser,
            login, signup, logout, deleteCurrentUser,
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
            clearMapOverlays
        }}>
            {children}
        </AppContext.Provider>
    );
};
