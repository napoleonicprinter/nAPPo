const Header = () => {
    const {
        view, setView,
        filterCategory, setFilterCategory,
        locationMode, handleLocationSelect,
        filterRadius, setFilterRadius,
        currentUser, logout,
        sites,
        isFiltered, clearAllFilters,
        filterSearch, filterCountry, filterCoalition, filterCampaign, filterVisited,
        showOnlyNew, filterWithMaps,
        previewDevice, setPreviewDevice,
        // ENSURE THESE ARE ALL HERE:
        showAuth, setShowAuth, 
        showFilters, setShowFilters,
        setSelectedHelpItem,
        recentNewsCount // <--- Add this to prevent the news badge crash
    } = useAppContext();

    // Local states for Header only
    const [showSettings, setShowSettings] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showHelpDropdown, setShowHelpDropdown] = useState(false);
    
    // ... rest of your logic