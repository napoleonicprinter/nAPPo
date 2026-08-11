import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import sitesData from '../data/sites.json';
import { Geolocation } from '@capacitor/geolocation';

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
    // --- 1. CORE STATES ---
    const [view, setView] = useState('map');
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [theme, setTheme] = useState('light');
    // --- 2. DETAIL CARD STATES (Stacked Logic) ---
    const [selectedSite, setSelectedSite] = useState(null);    // Layer 1: Battle Site
    const [selectedArtwork, setSelectedArtwork] = useState(null); // Layer 2: Artwork (Stacked)

    // --- 3. FILTER STATES ---
    const [sitesBaseData] = useState(sitesData);
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterCountry, setFilterCountry] = useState('all');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterRadius, setFilterRadius] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [filterCommander, setFilterCommander] = useState('all');
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    const [filterWithMaps, setFilterWithMaps] = useState(false);
    const [showArcOnly, setShowArcOnly] = useState(false);
    // --- 4. LOCATION STATES ---
    const [locationMode, setLocationMode] = useState('none');
    const [userCoords, setUserCoords] = useState(null); // CRITICAL: Fixed black screen
    const [clusterRadius, setClusterRadius] = useState(50); // CRITICAL: Fixed black screen

    // --- 5. FILTER LOGIC ---
    const isModalFiltered = useMemo(() => {
        return filterSearch !== '' || filterCountry !== 'all' ||
               filterYear !== 'all' || filterCommander !== 'all' ||
               showOnlyNew === true || filterWithMaps === true;
    }, [filterSearch, filterCountry, filterYear, filterCommander, showOnlyNew, filterWithMaps]);

    const isFiltered = useMemo(() => {
        return filterCategory.length > 0 || isModalFiltered || showArcOnly;
    }, [filterCategory, isModalFiltered, showArcOnly]);

    const clearAllFilters = () => {
        setFilterCategory([]);
        setFilterSearch('');
        setFilterCountry('all');
        setFilterYear('all');
        setFilterCommander('all');
        setFilterRadius('all');
        setShowOnlyNew(false);
        setFilterWithMaps(false);
        setShowArcOnly(false);
        setLocationMode('none');
    };

    const handleLocationSelect = (mode) => {
        if (mode === 'none') {
            setUserCoords(null);
            setLocationMode('none');
        } else if (mode === 'geo') {
            // Geolocation logic here
            setLocationMode('geo');
        } else {
            const capital = EUROPEAN_CAPITALS.find(c => c.name === mode);
            if (capital) {
                setUserCoords({ lat: capital.lat, lon: capital.lon });
                setLocationMode(mode);
            }
        }
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <AppContext.Provider value={{
            // Data
            sites: sitesBaseData,
            allSites: sitesBaseData,
            // View & UI
            view, setView,
            theme, toggleTheme,
            previewDevice, setPreviewDevice,
            // Stacking Detail Cards
            selectedSite, setSelectedSite,
            selectedArtwork, setSelectedArtwork,
            // Filters
            filterCategory, setFilterCategory,
            filterCountry, setFilterCountry,
            filterSearch, setFilterSearch,
            filterRadius, setFilterRadius,
            filterYear, setFilterYear,
            filterCommander, setFilterCommander,
            showOnlyNew, setShowOnlyNew,
            filterWithMaps, setFilterWithMaps,
            showArcOnly, setShowArcOnly,
            isFiltered, isModalFiltered, clearAllFilters,
            // Location
            locationMode, setLocationMode, handleLocationSelect,
            userCoords, setUserCoords,
            clusterRadius, setClusterRadius
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;