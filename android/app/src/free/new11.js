                }
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