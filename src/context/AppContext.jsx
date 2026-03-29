import React, { createContext, useContext, useState, useEffect } from 'react';
import sitesData from '../data/sites.json';
import showsData from '../data/shows.json';
import shoppingData from '../data/shopping.json';

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
};

export const EUROPEAN_CAPITALS = [
    { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
    { name: "Andorra la Vella", lat: 42.5063, lon: 1.5218 },
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

// Constants for remote data
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    // Data states initialized from localStorage or bundled fallbacks
    const [sitesBaseData, setSitesBaseData] = useState(() => {
        const saved = localStorage.getItem('sitesData');
        return saved ? JSON.parse(saved) : sitesData;
    });

    const [showsBaseData, setShowsBaseData] = useState(() => {
        const saved = localStorage.getItem('showsData');
        return saved ? JSON.parse(saved) : showsData;
    });

    const [shoppingBaseData, setShoppingBaseData] = useState(() => {
        const saved = localStorage.getItem('shoppingData');
        return saved ? JSON.parse(saved) : shoppingData;
    });

    // Update check from GitHub
    useEffect(() => {
        const syncData = async () => {
            try {
                // Fetching in parallel
                const fetchRes = await Promise.all([
                    fetch(`${GITHUB_RAW_BASE_URL}/sites.json`),
                    fetch(`${GITHUB_RAW_BASE_URL}/shows.json`),
                    fetch(`${GITHUB_RAW_BASE_URL}/shopping.json`)
                ]);

                const [resSites, resShows, resShopping] = fetchRes;

                if (resSites.ok) {
                    const data = await resSites.json();
                    setSitesBaseData(data);
                    localStorage.setItem('sitesData', JSON.stringify(data));
                }
                if (resShows.ok) {
                    const data = await resShows.json();
                    setShowsBaseData(data);
                    localStorage.setItem('showsData', JSON.stringify(data));
                }
                if (resShopping.ok) {
                    const data = await resShopping.json();
                    setShoppingBaseData(data);
                    localStorage.setItem('shoppingData', JSON.stringify(data));
                }

                console.log("Data sync with GitHub check complete.");
            } catch (error) {
                console.warn("Failed to sync data with GitHub. Using local/cached version.", error);
            }
        };
        
        // Give the app a second to settle before fetching to avoid blocking initial render
        const timer = setTimeout(syncData, 2000);
        return () => clearTimeout(timer);
    }, []);

    const [view, setView] = useState('map'); // 'map', 'card', 'calendar', or 'shopping'

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('appUsers');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // Handle legacy non-JSON strings left over from old state
                return null;
            }
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

    const [visitedSites, setVisitedSites] = useState(() => {
        if (!currentUser) return [];
        const saved = localStorage.getItem(`visitedSites_${currentUser.username}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    // Time frame for showing "NEW" tags (in days)
    const [newSitesDays, setNewSitesDays] = useState(() => {
        const saved = localStorage.getItem('newSitesDays');
        return saved ? parseInt(saved, 10) : 30; // default 30 days
    });

    // Derived sites ensuring visited status and "NEW" status is fresh
    const derivedSites = sitesBaseData.map(site => {
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
            isNew
        };
    });

    const [geolocationEnabled, setGeolocationEnabled] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [locationMode, setLocationMode] = useState('none'); // 'none', 'geo', or capital name

    const [showOnlyNew, setShowOnlyNew] = useState(() => {
        const saved = localStorage.getItem('showOnlyNew');
        return saved === 'true';
    });

    const [developerMode, setDeveloperMode] = useState(() => {
        const saved = localStorage.getItem('developerMode');
        return saved === 'true';
    });

    // Calculate distance and filter sites
    const filteredSites = derivedSites.map(site => {
        if (geolocationEnabled && userCoords) {
            return {
                ...site,
                distance: calculateDistance(userCoords.lat, userCoords.lon, site.latitude, site.longitude)
            };
        }
        return site;
    }).filter(site => {
        if (showOnlyNew && !site.isNew) return false;
        if (filterCategory.length > 0 && !filterCategory.includes(site.category)) return false;
        if (filterSignificance && site.significance !== filterSignificance) return false;
        if (filterVisited === 'visited' && !site.visited) return false;
        if (filterVisited === 'unvisited' && site.visited) return false;
        if (filterSearch && !site.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
        
        const siteYearStr = site.year ? String(site.year).trim() : '';
        if (filterYear !== 'all' && siteYearStr !== filterYear) return false;

        if (filterCommander !== 'all' && (!site.commanders || !site.commanders.includes(filterCommander))) return false;

        // Filter by radius if user has coordinates (geo or capital city)
        if (userCoords && filterRadius !== 'all' && site.distance !== undefined) {
            if (site.distance > parseInt(filterRadius, 10)) return false;
        }
        return true;
    });

    useEffect(() => {
        const allowedCategories = ['Battle site', 'Sea Battle', 'Battle landmark'];
        const showFilter = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));
        if (!showFilter) {
            setFilterCommander('all');
            setFilterYear('all');
        }
    }, [filterCategory]);

    // Sync user data on change
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            const saved = localStorage.getItem(`visitedSites_${currentUser.username}`);
            if (saved) {
                try { setVisitedSites(JSON.parse(saved)); } catch (e) { setVisitedSites([]); }
            } else {
                setVisitedSites([]);
            }
        } else {
            localStorage.removeItem('currentUser');
            setVisitedSites([]);
        }
    }, [currentUser]);

    // Persist visited sites whenever it changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`visitedSites_${currentUser.username}`, JSON.stringify(visitedSites));
        }
    }, [visitedSites, currentUser]);

    // Sync auth users
    useEffect(() => {
        localStorage.setItem('appUsers', JSON.stringify(users));
    }, [users]);

    // Persist newSitesDays whenever it changes
    useEffect(() => {
        localStorage.setItem('newSitesDays', newSitesDays.toString());
    }, [newSitesDays]);

    // Persist showOnlyNew whenever it changes
    useEffect(() => {
        localStorage.setItem('showOnlyNew', showOnlyNew.toString());
    }, [showOnlyNew]);

    // Persist developerMode whenever it changes
    useEffect(() => {
        localStorage.setItem('developerMode', developerMode.toString());
    }, [developerMode]);

    const toggleVisited = (id) => {
        if (!currentUser) {
            alert("Please log in to mark sites as visited.");
            return;
        }
        setVisitedSites(prev => {
            const isVisited = prev.includes(id);
            if (isVisited) {
                return prev.filter(siteId => siteId !== id);
            } else {
                return [...prev, id];
            }
        });
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
        if (users.find(u => u.username === username)) {
            return false; // Username exists
        }
        setUsers([...users, { username, password }]);
        setCurrentUser({ username });
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const deleteCurrentUser = () => {
        if (!currentUser) return;

        const usernameToDelete = currentUser.username;
        const timestamp = new Date().toLocaleString();

        // Log deletion (in console for now, and I'll also create a file-based log)
        console.log(`[USER DELETED] Username: ${usernameToDelete}, Date: ${timestamp}`);

        // Update users list
        setUsers(prev => prev.filter(u => u.username !== usernameToDelete));

        // Purge user-specific data from localStorage
        localStorage.removeItem(`visitedSites_${usernameToDelete}`);

        // Clear session
        setCurrentUser(null);
    };

    const requestGeolocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        // Check for secure context (HTTPS)
        if (!window.isSecureContext) {
             alert("Geolocation requires a secure context (HTTPS). If you are testing on mobile via a local IP, it may be blocked for security.");
             // Non-secure contexts will likely have navigator.geolocation undefined anyway, but this is a good secondary check.
        }

        // Options to improve mobile reliability
        const options = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 60000 // Allow a location up to 1 minute old
        };

        // Attempt to get location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoords({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setGeolocationEnabled(true);
                setLocationMode('geo');
            },
            (error) => {
                console.error("Error getting location:", error);
                setGeolocationEnabled(false);
                setLocationMode('none');
                setFilterRadius('all');
                
                let message = "Failed to get location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Location permission denied. Please ensure you have allowed location access in your browser and OS settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable. Your device might not have a clear view of satellites or a stable network.";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get your location timed out. Please try again (ideally outdoors or near a window).";
                        break;
                    default:
                        message = "An unknown error occurred while trying to get your location.";
                }
                alert(message);
            },
            options
        );
    };

    const disableGeolocation = () => {
        setGeolocationEnabled(false);
        setUserCoords(null);
        setLocationMode('none');
        setFilterRadius('all');
    };

    const handleLocationSelect = (mode) => {
        if (mode === 'none') {
            disableGeolocation();
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
            view,
            setView,
            toggleVisited,
            geolocationEnabled,
            userCoords,
            requestGeolocation,
            disableGeolocation,
            locationMode,
            handleLocationSelect,
            filterSearch,
            setFilterSearch,
            filterCategory,
            setFilterCategory,
            filterSignificance,
            setFilterSignificance,
            filterVisited,
            setFilterVisited,
            filterRadius,
            setFilterRadius,
            filterYear,
            setFilterYear,
            filterCommander,
            setFilterCommander,
            currentUser,
            login,
            signup,
            logout,
            deleteCurrentUser,
            newSitesDays,
            setNewSitesDays,
            showOnlyNew,
            setShowOnlyNew,
            developerMode,
            setDeveloperMode,
            showsToCome: showsBaseData,
            shoppingItems: shoppingBaseData
        }}>
            {children}
        </AppContext.Provider>
    );
};
