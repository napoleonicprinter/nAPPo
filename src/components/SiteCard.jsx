import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import {
    MapPin, Calendar, Navigation, CheckCircle,
    BookOpen, Globe, Youtube, ExternalLink, Star,
    Palette, Swords, Link2, X, Layers, Map as MapIcon,
    Landmark, AlertTriangle
} from 'lucide-react';
import { useAppContext, getAvailableSiteMaps } from '../context/AppContext';
import { handleImageFallback } from '../utils/imageUtils';

const getOnlineReadings = (site) => {
    if (!site) return [];
    const raw = site.online_reading || site.online_readings || site.reading_links || site.reading_link;
    if (!raw) return [];

    let list = [];
    if (Array.isArray(raw)) {
        list = raw;
    } else {
        list = [raw];
    }

    return list.map((item, idx) => {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            if (!trimmed) return null;
            return {
                title: 'On-line reading',
                link: trimmed
            };
        } else if (item && typeof item === 'object') {
            const link = (item.link || item.url || '').trim();
            if (!link) return null;
            return {
                title: item.title || item.name || item.book_title || item.label || 'On-line reading',
                link: link
            };
        }
        return null;
    }).filter(Boolean);
};

export const getCategoryColor = (category) => {
    const colors = {
        "Today's Battle": '#ff4500',
        'Battle site': '#ef5350',
        'Battle landmark': '#ff9ebb',
        'Naval battle': '#26c6da',
        'Museum': '#9575cd',
        'Artwork': '#ce93d8',
        'Monument': '#26a69a',
        'Landmark': '#ccff00',
        'Restaurant': '#795548',
        'Store': '#001ECC',
        'Movie tip': '#2c0d55ff',
    };
    return colors[category] || '#8b949e';
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);
    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return undefined;

    const R = 6371; // Earth radius in km
    const dLat = (l2 - l1) * Math.PI / 180;
    const dLon = (ln2 - ln1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(l1 * Math.PI / 180) * Math.cos(l2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const formatDistanceTag = (dist) => {
    if (dist === undefined || dist === null || isNaN(dist)) return null;
    const d = Number(dist);
    return `${Math.round(d)} km`;
};

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const {
        theme,
        toggleVisited,
        userCoords,
        locationMode,
        filterRadius,
        setFilterRadius,
        filterCategory,
        setFilterCategory,
        filterYear,
        setFilterYear,
        filterCommander,
        setFilterCommander,
        filterCountry,
        setFilterCountry,
        filterCoalition,
        setFilterCoalition,
        filterCampaign,
        setFilterCampaign,
        filterSignificance,
        setFilterSignificance,
        filterVisited,
        setFilterVisited,
        showArcOnly,
        setShowArcOnly,
        filterWithMaps,
        setFilterWithMaps,
        showOnlyNew,
        setShowOnlyNew,
        filterSearch,
        setFilterSearch,
        clearAllFilters,
        geolocationEnabled,
        setView,
        setSiteToOpenPopup,
        allSites,
        setSelectedSite,
        callerSite,
        setCallerSite,
        activeMapOverlays,
        toggleMapOverlay,
        getPortalContainer
    } = useAppContext();

    const [navErrorModal, setNavErrorModal] = useState(null);

    const isCategorySelected = (targetSite) => {
        if (!filterCategory || !Array.isArray(filterCategory) || filterCategory.length === 0) return true;
        const hasTodaysBattle = filterCategory.includes("Today's Battle");
        const otherCategories = filterCategory.filter(c => c !== "Today's Battle");

        if (otherCategories.includes(targetSite.category)) return true;

        if (hasTodaysBattle && (targetSite.category === 'Battle site' || targetSite.category === 'Naval battle') && targetSite.date) {
            const today = new Date();
            const parts = targetSite.date.split('-');
            if (parts.length >= 3) {
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                if (month === today.getMonth() + 1 && day === today.getDate()) return true;
            }
        }

        return false;
    };

    const handleNavigateToSite = (targetSite) => {
        if (!targetSite) return;

        const locationLabel = locationMode === 'geo'
            ? 'My GPS Location'
            : locationMode === 'manual'
                ? 'Manual Location'
                : (locationMode || 'selected location');

        const failedFilters = [];

        // 1. Category Filter
        const catPass = isCategorySelected(targetSite);
        if (!catPass) {
            failedFilters.push({
                type: 'category',
                label: 'Category',
                message: `category "${targetSite.category}" is not selected`,
                reset: () => setFilterCategory([])
            });
        }

        // 2. Area / Radius Filter
        let dist = undefined;
        if (userCoords && filterRadius && filterRadius !== 'all' && targetSite.latitude !== undefined && targetSite.longitude !== undefined) {
            dist = calculateDistance(userCoords.lat, userCoords.lon, targetSite.latitude, targetSite.longitude);
            const radiusLimit = parseInt(filterRadius, 10);
            if (dist !== undefined && dist > radiusLimit) {
                failedFilters.push({
                    type: 'area',
                    label: 'Area',
                    message: `${filterRadius} km from ${locationLabel}`,
                    distance: Math.round(dist),
                    reset: () => setFilterRadius('all')
                });
            }
        }

        // 3. Year Filter
        if (filterYear && filterYear !== 'all') {
            const siteYearStr = targetSite.year ? String(targetSite.year).trim() : '';
            if (siteYearStr !== filterYear) {
                failedFilters.push({
                    type: 'year',
                    label: 'Year',
                    message: `year "${targetSite.year || 'N/A'}" is not selected`,
                    reset: () => setFilterYear('all')
                });
            }
        }

        // 4. Commander Filter
        if (filterCommander && filterCommander !== 'all') {
            const cmds = Array.isArray(targetSite.commanders) ? targetSite.commanders : [targetSite.commander].filter(Boolean);
            if (!cmds.includes(filterCommander)) {
                failedFilters.push({
                    type: 'commander',
                    label: 'Commander',
                    message: `commander "${filterCommander}" is not selected`,
                    reset: () => setFilterCommander('all')
                });
            }
        }

        // 5. Country Filter
        if (filterCountry && filterCountry !== 'all') {
            if (targetSite.country !== filterCountry) {
                failedFilters.push({
                    type: 'country',
                    label: 'Country',
                    message: `country "${targetSite.country || 'N/A'}" is not selected`,
                    reset: () => setFilterCountry('all')
                });
            }
        }

        // 6. Coalition Filter
        if (filterCoalition && filterCoalition !== 'all') {
            const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
            if (!specList.includes(String(filterCoalition))) {
                failedFilters.push({
                    type: 'coalition',
                    label: 'Coalition',
                    message: `coalition filter "${filterCoalition}" is active`,
                    reset: () => setFilterCoalition('all')
                });
            }
        }

        // 7. Campaign Filter
        if (filterCampaign && filterCampaign !== 'all') {
            const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
            if (!specList.includes(filterCampaign)) {
                failedFilters.push({
                    type: 'campaign',
                    label: 'Campaign',
                    message: `campaign filter "${filterCampaign}" is active`,
                    reset: () => setFilterCampaign('all')
                });
            }
        }

        // 8. Arc de Triomphe Filter
        if (showArcOnly) {
            const specList = targetSite.special ? (Array.isArray(targetSite.special) ? targetSite.special : [String(targetSite.special)]) : [];
            if (!specList.includes('arc')) {
                failedFilters.push({
                    type: 'arc',
                    label: 'Arc de Triomphe',
                    message: `site is not listed at the Arc de Triomphe`,
                    reset: () => setShowArcOnly(false)
                });
            }
        }

        // 9. Significance Filter
        if (filterSignificance && filterSignificance !== '') {
            if (String(targetSite.significance) !== String(filterSignificance)) {
                failedFilters.push({
                    type: 'significance',
                    label: 'Significance',
                    message: `significance rating does not match filter (${filterSignificance} star${filterSignificance > 1 ? 's' : ''})`,
                    reset: () => setFilterSignificance('')
                });
            }
        }

        // 10. Visited Filter
        if (filterVisited && filterVisited !== 'all') {
            if ((filterVisited === 'visited' && !targetSite.visited) || (filterVisited === 'unvisited' && targetSite.visited)) {
                failedFilters.push({
                    type: 'visited',
                    label: 'Visited Status',
                    message: `site is ${targetSite.visited ? 'visited' : 'unvisited'}, but filter is set to "${filterVisited}"`,
                    reset: () => setFilterVisited('all')
                });
            }
        }

        // 11. With Maps Filter
        if (filterWithMaps) {
            if (getAvailableSiteMaps(targetSite).length === 0) {
                failedFilters.push({
                    type: 'withMaps',
                    label: 'With Maps',
                    message: `site has no historical maps available`,
                    reset: () => setFilterWithMaps(false)
                });
            }
        }

        // 12. Only New Filter
        if (showOnlyNew) {
            if (!targetSite.isNew) {
                failedFilters.push({
                    type: 'onlyNew',
                    label: 'Only New',
                    message: `site is not marked as new`,
                    reset: () => setShowOnlyNew(false)
                });
            }
        }

        // 13. Search Filter
        if (filterSearch && filterSearch.trim() !== '') {
            if (!targetSite.name || !targetSite.name.toLowerCase().includes(filterSearch.toLowerCase().trim())) {
                failedFilters.push({
                    type: 'search',
                    label: 'Search',
                    message: `site name does not match search query "${filterSearch}"`,
                    reset: () => setFilterSearch('')
                });
            }
        }

        if (failedFilters.length > 0) {
            let title = '';
            let message = '';
            let resetButtonText = '';
            let areaDist = failedFilters.find(f => f.type === 'area')?.distance;

            if (failedFilters.length === 1) {
                const single = failedFilters[0];
                if (single.type === 'category') {
                    title = 'Site Category Not Selected';
                    message = `Site is out of the selected category, category "${targetSite.category}" is not selected`;
                    resetButtonText = 'Reset Category & View';
                } else if (single.type === 'area') {
                    title = 'Site Out of Selected Area';
                    message = `Site is out of the selected area, ${filterRadius} km from ${locationLabel}`;
                    resetButtonText = 'Reset Area & View';
                } else if (single.type === 'year') {
                    title = 'Site Out of Selected Year';
                    message = `Site is out of the selected year, year "${targetSite.year || 'N/A'}" is not selected`;
                    resetButtonText = 'Reset Year & View';
                } else if (single.type === 'commander') {
                    title = 'Site Out of Selected Commander';
                    message = `Site is out of the selected commander, commander "${filterCommander}" is not selected`;
                    resetButtonText = 'Reset Commander & View';
                } else if (single.type === 'country') {
                    title = 'Site Out of Selected Country';
                    message = `Site is out of the selected country, country "${targetSite.country || 'N/A'}" is not selected`;
                    resetButtonText = 'Reset Country & View';
                } else if (single.type === 'coalition') {
                    title = 'Site Out of Selected Coalition';
                    message = `Site is out of the selected coalition ("${filterCoalition}")`;
                    resetButtonText = 'Reset Coalition & View';
                } else if (single.type === 'campaign') {
                    title = 'Site Out of Selected Campaign';
                    message = `Site is out of the selected campaign ("${filterCampaign}")`;
                    resetButtonText = 'Reset Campaign & View';
                } else if (single.type === 'arc') {
                    title = 'Site Not at Arc de Triomphe';
                    message = `Site is not listed at the Arc de Triomphe`;
                    resetButtonText = 'Reset Arc Filter & View';
                } else if (single.type === 'significance') {
                    title = 'Site Out of Selected Significance';
                    message = `Site significance rating does not match selected filter (${filterSignificance} star${filterSignificance > 1 ? 's' : ''})`;
                    resetButtonText = 'Reset Significance & View';
                } else if (single.type === 'visited') {
                    title = 'Site Out of Selected Visited Status';
                    message = `Site is ${targetSite.visited ? 'visited' : 'unvisited'}, but filter is set to "${filterVisited}"`;
                    resetButtonText = 'Reset Visited & View';
                } else if (single.type === 'withMaps') {
                    title = 'Site Has No Maps';
                    message = `Site has no historical maps available, but "With Maps" filter is active`;
                    resetButtonText = 'Reset Maps Filter & View';
                } else if (single.type === 'onlyNew') {
                    title = 'Site Is Not New';
                    message = `Site is not marked as new, but "Only New" filter is active`;
                    resetButtonText = 'Reset New Filter & View';
                } else if (single.type === 'search') {
                    title = 'Site Filtered Out by Search';
                    message = `Site name does not match search query "${filterSearch}"`;
                    resetButtonText = 'Reset Search & View';
                } else {
                    title = `Site Out of Selected ${single.label}`;
                    message = `Site is hidden by ${single.label} filter: ${single.message}`;
                    resetButtonText = `Reset ${single.label} & View`;
                }
            } else if (failedFilters.length === 2 && failedFilters.some(f => f.type === 'category') && failedFilters.some(f => f.type === 'area')) {
                title = 'Site Out of Category & Selected Area';
                message = `Site is out of the selected category, category "${targetSite.category}" is not selected and site is ${Math.round(dist)} km from ${locationLabel}`;
                resetButtonText = 'Reset Filters & View';
            } else {
                title = 'Site Out of Selected Filters';
                const messagesList = failedFilters.map(f => f.message).join(', ');
                message = `Site is hidden by active filters: ${messagesList}`;
                resetButtonText = 'Reset Filters & View';
            }

            setNavErrorModal({
                type: 'custom',
                failedFilters: failedFilters,
                title: title,
                message: message,
                targetSite: targetSite,
                resetButtonText: resetButtonText,
                distance: areaDist
            });
            return;
        }

        setSelectedSite(null);
        setSiteToOpenPopup(null);
        setTimeout(() => {
            setSiteToOpenPopup(targetSite);
            setView('map');
        }, 10);
    };

    if (!site) return null;

    const availableMaps = getAvailableSiteMaps(site);

    const spec = site?.special || site?.Special;
    const isArc = spec
        ? (Array.isArray(spec) ? spec.includes('arc') : String(spec).toLowerCase().includes('arc'))
        : false;

    // Helper to render stars based on significance data
    const renderSignificanceStars = (sig) => {
        const numStars = Number(sig) === 3 ? 3 : Number(sig) === 2 ? 2 : Number(sig) === 1 ? 1 : 0;
        if (numStars === 0) return null;
        return (
            <div className="significance-stars" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[...Array(numStars)].map((_, i) => (
                    <Star key={i} size={14} fill="#ffc107" stroke="#ffc107" strokeWidth={1.5} />
                ))}
            </div>
        );
    };

    return (
        <>
            {navErrorModal && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2147483647,
                        padding: '20px'
                    }}
                    onClick={() => setNavErrorModal(null)}
                >
                    <div
                        className="glass-panel animate-pop-in"
                        style={{
                            width: '100%',
                            maxWidth: '420px',
                            backgroundColor: theme === 'dark' ? 'rgba(25, 27, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setNavErrorModal(null)}
                            style={{
                                position: 'absolute',
                                top: '14px',
                                right: '14px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239, 83, 80, 0.15)',
                                border: '1.5px solid rgba(239, 83, 80, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                color: '#ef5350'
                            }}
                        >
                            <AlertTriangle size={32} />
                        </div>

                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {navErrorModal.title}
                        </h3>

                        <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.45', fontWeight: 500 }}>
                            {navErrorModal.message}
                        </p>

                        {navErrorModal.distance !== undefined && (
                            <div style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                backgroundColor: 'rgba(0,0,0,0.06)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                Distance to site: <strong>{navErrorModal.distance} km</strong>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button
                                type="button"
                                onClick={() => setNavErrorModal(null)}
                                style={{
                                    flex: 1,
                                    padding: '11px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                OK
                            </button>
                            {navErrorModal.targetSite && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const target = navErrorModal.targetSite;
                                        if (navErrorModal.failedFilters && navErrorModal.failedFilters.length > 0) {
                                            navErrorModal.failedFilters.forEach(f => {
                                                if (typeof f.reset === 'function') f.reset();
                                            });
                                        } else {
                                            if (navErrorModal.type === 'category' || navErrorModal.type === 'both') {
                                                setFilterCategory([]);
                                            }
                                            if (navErrorModal.type === 'area' || navErrorModal.type === 'both') {
                                                setFilterRadius('all');
                                            }
                                        }
                                        setNavErrorModal(null);
                                        setSelectedSite(null);
                                        setSiteToOpenPopup(null);
                                        setTimeout(() => {
                                            setSiteToOpenPopup(target);
                                            setView('map');
                                        }, 20);
                                    }}
                                    style={{
                                        flex: 1.5,
                                        padding: '11px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: 'var(--accent-primary)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {navErrorModal.resetButtonText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                getPortalContainer ? getPortalContainer() : document.body
            )}

            <div className={`site-card ${site.visited ? 'visited' : ''}`} style={{ position: 'relative' }}>

                {/* --- RED CIRCLE CLOSE BUTTON WITH WHITE CROSS --- */}
                {onClose && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="modal-close-btn close-details-btn"
                        title="Close"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 100001
                        }}
                    >
                        <X size={18} strokeWidth={2.5} color="white" />
                    </button>
                )}

                <div className="card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={site.image}
                        alt={site.name}
                        className="card-image"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        onError={(e) => handleImageFallback(e, site.image)}
                    />

                    {/* NEW TAG (Upper Left) */}
                    {site.isNew && (
                        <img
                            src="/assets/new-tag.png"
                            alt="New Site"
                            className="new-site-badge"
                            style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                width: '70px',
                                height: 'auto',
                                zIndex: 20,
                                pointerEvents: 'none'
                            }}
                        />
                    )}

                    {/* --- MARK AS VISITED & NAVIGATION (Lower Left of Image) --- */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        zIndex: 25,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <button
                            className={`btn-visited ${site.visited ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleVisited(site.id);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.4)',
                                color: 'white',
                                backgroundColor: site.visited ? '#4caf50' : 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <CheckCircle size={14} />
                            {site.visited ? 'Visited' : 'Mark as Visited'}
                        </button>

                    </div>
                    {/* DISTANCE TAG & NAVIGATION BUTTON (Above Category Badge) */}
                    {userCoords && (site.distance !== undefined || (site.latitude && site.longitude)) && (() => {
                        const distVal = site.distance !== undefined
                            ? site.distance
                            : calculateDistance(userCoords.lat, userCoords.lon, site.latitude, site.longitude);
                        const formattedDist = formatDistanceTag(distVal);
                        if (!formattedDist) return null;

                        return (
                            <div style={{
                                position: 'absolute',
                                bottom: '38px',
                                right: '10px',
                                zIndex: 15,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    backdropFilter: 'blur(4px)',
                                    color: '#ffffff',
                                    padding: '3px 7px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {formattedDist}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${site.latitude},${site.longitude}`;
                                        window.open(url, '_blank');
                                    }}
                                    title="Navigate with Google Maps"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--accent-primary, #ef5350)',
                                        color: '#ffffff',
                                        border: 'none',
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        padding: 0
                                    }}
                                >
                                    <Navigation size={12} />
                                </button>
                            </div>
                        );
                    })()}

                    {/* CATEGORY BADGE (Lower Right) */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                        <span className="badge" style={{ backgroundColor: getCategoryColor(site.category), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {site.category}
                        </span>
                    </div>
                </div>

                <div className="card-content"
                    style={{
                        padding: '12px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
                    {callerSite && callerSite.id !== site.id && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const prev = callerSite;
                                    setCallerSite(null);
                                    setSelectedSite(prev);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'rgba(88, 166, 255, 0.15)',
                                    color: 'var(--accent-primary, #58a6ff)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                &larr; Back to {callerSite.name}
                            </button>
                        </div>
                    )}
                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>{site.name}</h2>

                    {/* --- STARS / DATE / DETAILS ROW --- */}
                    <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isArc && (
                                <img
                                    src="/assets/Arc.png"
                                    alt="Arc de Triomphe"
                                    title="Listed at the Arc de Triomphe"
                                    style={{
                                        height: '15px',
                                        width: 'auto',
                                        marginRight: '2px',
                                        filter: theme === 'dark' ? 'invert(1)' : 'none',
                                        verticalAlign: 'middle'
                                    }}
                                />
                            )}
                            {renderSignificanceStars(site.significance)}
                            {site.date && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center' }}>
                                    <Calendar size={13} style={{ marginLeft: '6px', marginRight: '3px' }} />
                                    {site.date}
                                </span>
                            )}
                        </div>

                        {isCompact && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {!hideMapLink && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSite(null);
                                            setSiteToOpenPopup(null);
                                            setTimeout(() => {
                                                setSiteToOpenPopup(site);
                                                setView('map');
                                            }, 10);
                                        }}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'gray', fontSize: '0.85rem', fontWeight: 'bold' }}
                                    >
                                        Map
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedSite(site); }}
                                    style={{ border: 'none', background: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Details &rarr;
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                        <MapPin size={13} style={{ marginRight: '4px' }} /> {site.location}, {site.country}
                    </div>

                    {isCompact && availableMaps && availableMaps.length > 0 && (
                        <div style={{
                            marginTop: '6px',
                            marginBottom: '8px',
                            display: 'grid',
                            gridTemplateColumns: availableMaps.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                            gap: '6px'
                        }}>
                            {availableMaps.map((map, index) => {
                                const isActive = activeMapOverlays?.includes(map.id);
                                const isOdd = availableMaps.length % 2 !== 0;
                                const isFirstOfOdd = isOdd && index === 0;
                                return (
                                    <button
                                        key={map.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (map.id) toggleMapOverlay(map.id);
                                        }}
                                        style={{
                                            width: '100%',
                                            gridColumn: isFirstOfOdd ? 'span 2' : 'auto',
                                            padding: '5px 8px',
                                            borderRadius: '8px',
                                            border: isActive ? '1.5px solid #ff4444' : '1px solid var(--border-color, rgba(255,255,255,0.2))',
                                            background: isActive ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                                            color: isActive ? '#ff4444' : 'var(--text-primary)',
                                            fontWeight: 'bold',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.2s ease',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden'
                                        }}
                                        title={isActive ? `Hide historical map: ${map.name || map.id}` : `Overlay historical map: ${map.name || map.id}`}
                                    >
                                        <Layers size={13} style={{ flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {isActive ? `Hide ${map.name || 'Map'}` : (map.name || 'View Map')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!isCompact && (
                        <>
                            <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '8px', color: 'var(--text-primary)' }}>
                                {site.description}
                            </div>

                            {/* --- EXTERNAL LINKS BLOCK --- */}
                            <div className="card-external-links" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                marginTop: '8px',
                                paddingTop: '6px',
                                borderTop: '1px solid rgba(0,0,0,0.1)'
                            }}>
                                {/* Standard Icons Row */}
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    {site.wikipedia_link && site.wikipedia_link.trim() !== '' && (
                                        <a href={site.wikipedia_link} target="_blank" rel="noreferrer" title="Wikipedia" style={{ color: '#666' }}>
                                            <BookOpen size={22} />
                                        </a>
                                    )}
                                    {site.site_link && site.site_link.trim() !== '' && (
                                        <a href={site.site_link} target="_blank" rel="noreferrer" title="Official Site" style={{ color: '#666' }}>
                                            <Globe size={22} />
                                        </a>
                                    )}
                                    {site.more_info_link && site.more_info_link.trim() !== '' && (
                                        <a href={site.more_info_link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                            <ExternalLink size={22} />
                                        </a>
                                    )}
                                    {site.moreInfo && site.moreInfo.trim() !== '' && site.moreInfo !== site.more_info_link && (
                                        <a href={site.moreInfo} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                            <ExternalLink size={22} />
                                        </a>
                                    )}
                                    {site.link && site.link.trim() !== '' && site.link !== site.site_link && site.link !== site.wikipedia_link && site.link !== site.more_info_link && site.link !== site.moreInfo && (
                                        <a href={site.link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                            <ExternalLink size={22} />
                                        </a>
                                    )}
                                    {site.youtube_link && site.youtube_link.trim() !== '' && (
                                        <a href={site.youtube_link} target="_blank" rel="noreferrer" title="YouTube Video" style={{ color: '#ff0000' }}>
                                            <Youtube size={22} />
                                        </a>
                                    )}
                                </div>

                                {/* --- BATTLE MAP OVERLAYS SECTION --- */}
                                {availableMaps && availableMaps.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        marginTop: '6px',
                                        paddingTop: '6px',
                                        borderTop: '1px solid rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                            <Layers size={18} style={{ color: '#ff4444' }} />
                                            <span>Historical Battle Maps:</span>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: availableMaps.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                                            gap: '6px'
                                        }}>
                                            {availableMaps.map((map, index) => {
                                                const isActive = activeMapOverlays?.includes(map.id);
                                                const isOdd = availableMaps.length % 2 !== 0;
                                                const isFirstOfOdd = isOdd && index === 0;
                                                return (
                                                    <button
                                                        key={map.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMapOverlay(map.id);
                                                            setSelectedSite(null);
                                                            setSiteToOpenPopup(site);
                                                            setView('map');
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            gridColumn: isFirstOfOdd ? 'span 2' : 'auto',
                                                            border: isActive ? '1.5px solid #ff4444' : '1px solid var(--border-color, rgba(255,255,255,0.2))',
                                                            background: isActive ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                            color: isActive ? '#ff4444' : 'var(--text-primary)',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            transition: 'all 0.2s ease',
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis',
                                                            overflow: 'hidden'
                                                        }}
                                                        title={isActive ? `Hide historical map: ${map.name || map.id}` : `Overlay historical map: ${map.name || map.id}`}
                                                    >
                                                        <Layers size={13} style={{ flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {isActive ? `Hide ${map.name || 'Map'}` : (map.name || 'View Map')}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* --- BATTLE SITE LINK (Crossed Sabres) --- */}
                                {site.battle_id && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        marginTop: '2px'
                                    }}>
                                        <Swords size={20} color="#666" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // We convert both to String and trim to prevent "Editor ID" vs "Record ID" mismatches
                                                const targetId = String(site.battle_id).trim();
                                                const battleSite = (allSites || []).find(s => String(s.id).trim() === targetId);

                                                if (battleSite) {
                                                    setCallerSite(site);      // Save the current card in memory
                                                    handleNavigateToSite(battleSite);
                                                } else {
                                                    console.warn("Battle site record not found for ID:", targetId);
                                                }
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: '#58a6ff',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            Go to Battle Site
                                        </button>
                                    </div>
                                )}

                                {/* --- ARTWORK LINKS SECTION --- */}
                                {site.artwork_ids && site.artwork_ids.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)',
                                        marginTop: '2px'
                                    }}>
                                        <Palette size={20} style={{ color: '#666' }} />

                                        {site.artwork_ids.length === 1 ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const artSite = allSites.find(s => s.id === site.artwork_ids[0]);
                                                    if (artSite) handleNavigateToSite(artSite);
                                                }}
                                                style={{ border: 'none', background: 'none', padding: 0, color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                                            >
                                                Artwork
                                            </button>
                                        ) : (
                                            <>
                                                <span style={{ fontWeight: '600' }}>Artwork:</span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {site.artwork_ids.map((id, index) => (
                                                        <button
                                                            key={id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const artSite = allSites.find(s => s.id === id);
                                                                if (artSite) handleNavigateToSite(artSite);
                                                            }}
                                                            style={{
                                                                border: '1px solid var(--accent-primary)',
                                                                background: 'rgba(88, 166, 255, 0.1)',
                                                                color: 'var(--accent-primary)',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {/* --- RELATED SITES SECTION --- */}
                                {(() => {
                                    const relatedList = Array.isArray(site.relatedSites)
                                        ? site.relatedSites
                                        : Array.isArray(site.related_sites)
                                            ? site.related_sites
                                            : Array.isArray(site.related)
                                                ? site.related
                                                : [];

                                    if (!relatedList || relatedList.length === 0) return null;

                                    return (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-primary)',
                                            marginTop: '0px'
                                        }}>
                                            <Link2 size={20} style={{ color: '#666', flexShrink: 0, marginTop: '2px' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: '600' }}>Related site:</span>
                                                {relatedList.map((relItem, idx) => {
                                                    const targetId = String(relItem.id || relItem.siteId || relItem).trim();
                                                    const targetSite = (allSites || []).find(s => String(s.id).trim() === targetId);
                                                    const label = relItem.title || relItem.description || relItem.name || relItem.label || targetSite?.name || `Site #${targetId}`;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (targetSite) {
                                                                    handleNavigateToSite(targetSite);
                                                                } else {
                                                                    console.warn("Related site record not found for ID:", targetId);
                                                                }
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'none',
                                                                padding: 0,
                                                                textAlign: 'left',
                                                                color: 'var(--accent-primary, #58a6ff)',
                                                                cursor: targetSite ? 'pointer' : 'default',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.85rem',
                                                                textDecoration: 'underline'
                                                            }}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* --- ON-LINE READING SECTION --- */}
                                {(() => {
                                    const readings = getOnlineReadings(site);
                                    if (readings.length === 0) return null;

                                    return (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-primary)',
                                            marginTop: '4px'
                                        }}>
                                            <img
                                                src="/assets/Library.png"
                                                alt="Library"
                                                style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0, marginTop: '2px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: '600' }}>On-line reading:</span>
                                                {readings.map((item, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            color: 'var(--accent-primary, #58a6ff)',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'underline',
                                                            lineHeight: '1.4'
                                                        }}
                                                    >
                                                        {item.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SiteCard;