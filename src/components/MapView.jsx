import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Marker, Tooltip, ZoomControl, useMap, useMapEvents, Polyline, CircleMarker } from 'react-leaflet';
import { useAppContext, useBackHandler, getAvailableSiteMaps } from '../context/AppContext';
import SiteCard, { getCategoryColor } from './SiteCard';
import DealsView from './DealsView';
import MapOverlaysLayer from './MapOverlaysLayer';
import L from 'leaflet';
import { LocateFixed, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- CONSTANTS ---
const TILE_LAYERS = {
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxNativeZoom: 19
    },
    dark: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        subdomains: 'abcd',
        maxNativeZoom: 16
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        subdomains: 'abcd',
        maxNativeZoom: 18
    }
};

const getSiteIcon = (site) => {
    const color = getCategoryColor(site.category);
    const rate = Number(site.significance) || 1;
    const size = rate >= 3 ? 22 : rate === 2 ? 18 : 15;

    const isArc = site?.special
        ? (Array.isArray(site.special) ? site.special.includes('arc') : String(site.special).toLowerCase().includes('arc'))
        : false;
    const borderColor = isArc ? '#FFD700' : 'white';
    const borderWidth = isArc ? 2.5 : 2;
    const boxShadow = isArc ? '0 2px 8px rgba(0,0,0,0.6)' : '0 2px 6px rgba(0,0,0,0.4)';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color} !important; width: ${size}px !important; height: ${size}px !important; border-radius: 50% 50% 50% 0 !important; transform: rotate(-45deg) !important; border: ${borderWidth}px solid ${borderColor} !important; box-shadow: ${boxShadow} !important;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size - 5]
    });
};

const TodaysBattlePopupOpener = ({ todaysBattleSites, markerRefs, isTodaysBattleActive }) => {
    const map = useMap();
    const openedKeyRef = useRef("");

    useEffect(() => {
        if (!isTodaysBattleActive || !todaysBattleSites || todaysBattleSites.length === 0) {
            openedKeyRef.current = "";
            return;
        }

        const sitesKey = todaysBattleSites.map(s => String(s.id).trim()).sort().join(',');
        if (openedKeyRef.current === sitesKey) return;

        let attempts = 0;
        const maxAttempts = 10;
        let timer = null;

        const tryOpen = () => {
            attempts++;
            let allOpened = true;

            todaysBattleSites.forEach(site => {
                const siteIdStr = String(site.id).trim();
                const marker = markerRefs.current.get(siteIdStr);
                if (marker) {
                    try {
                        if (!marker.isPopupOpen()) {
                            marker.openPopup();
                        }
                    } catch (err) {
                        allOpened = false;
                    }
                } else {
                    allOpened = false;
                }
            });

            if (allOpened) {
                openedKeyRef.current = sitesKey;
            } else if (attempts < maxAttempts) {
                timer = setTimeout(tryOpen, 200);
            } else {
                openedKeyRef.current = sitesKey;
            }
        };

        const validCoords = todaysBattleSites
            .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude))
            .map(s => [s.latitude, s.longitude]);

        if (validCoords.length === 1) {
            map.setView(validCoords[0], Math.min(Math.max(map.getZoom(), 6), 7));
        } else if (validCoords.length > 1) {
            map.fitBounds(validCoords, { padding: [120, 120], maxZoom: 7 });
        }

        timer = setTimeout(tryOpen, 250);
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isTodaysBattleActive, todaysBattleSites, map, markerRefs]);

    return null;
};

const PopupOpener = ({ markerRefs, isMobileLike, activePopupSiteIdRef, isNavigatingRef }) => {
    const map = useMap();
    const { siteToOpenPopup, setSiteToOpenPopup, selectedSite, setSelectedSite, activeMapOverlays } = useAppContext();

    useEffect(() => {
        if (!siteToOpenPopup) return;

        const targetSite = siteToOpenPopup;
        const targetIdStr = String(targetSite.id).trim();

        // Ensure selectedSite modal is closed so the map popup is visible
        if (selectedSite) {
            setSelectedSite(null);
        }

        // Mark navigation active and track the active site ID
        isNavigatingRef.current = true;
        activePopupSiteIdRef.current = targetIdStr;

        // Close any other currently open popups first
        markerRefs.current.forEach((marker, idStr) => {
            if (idStr !== targetIdStr) {
                try {
                    marker.closePopup();
                } catch (e) { }
            }
        });

        let cancelled = false;
        let retryTimer = null;
        let pollAttempts = 0;
        const maxPollAttempts = 40;

        const executeOpen = () => {
            if (cancelled) return;

            const marker = markerRefs.current.get(targetIdStr);
            if (!marker) {
                pollAttempts++;
                if (pollAttempts < maxPollAttempts) {
                    retryTimer = setTimeout(executeOpen, 60);
                } else {
                    isNavigatingRef.current = false;
                    setSiteToOpenPopup(null);
                }
                return;
            }

            const siteMaps = getAvailableSiteMaps(targetSite);
            const activeMap = (siteMaps || []).find(m => activeMapOverlays?.includes(m.id));
            const rawBounds = targetSite.targetMapBounds || (activeMap && activeMap.bounds ? activeMap.bounds : null);

            if (rawBounds && Array.isArray(rawBounds) && rawBounds.length === 2) {
                const mapBounds = L.latLngBounds(rawBounds);
                const padding = isMobileLike ? [25, 25] : [50, 50];
                const calculatedZoom = map.getBoundsZoom(mapBounds, false, padding);
                const minZoom = map.getMinZoom() ?? 2.5;
                const maxZoom = map.getMaxZoom() ?? 18;
                const targetZoom = Math.min(maxZoom, Math.max(minZoom, calculatedZoom));
                const centerLatLng = mapBounds.getCenter();

                map.flyTo(centerLatLng, targetZoom, { duration: 0.8 });

                setTimeout(() => {
                    if (cancelled) return;
                    const m = markerRefs.current.get(targetIdStr);
                    if (m) {
                        try {
                            m.openPopup();
                        } catch (e) { }
                    }
                    isNavigatingRef.current = false;
                    setSiteToOpenPopup(null);
                }, 500);
            } else {
                const targetLatLng = marker.getLatLng ? marker.getLatLng() : L.latLng(targetSite.latitude, targetSite.longitude);
                const currentZoom = map.getZoom();
                const targetZoom = currentZoom;
                const yOffset = isMobileLike ? 150 : 120;
                const targetPoint = map.project(targetLatLng, targetZoom);
                targetPoint.y -= yOffset;
                const centerLatLng = map.unproject(targetPoint, targetZoom);

                map.flyTo(centerLatLng, targetZoom, { duration: 0.4 });

                setTimeout(() => {
                    if (cancelled) return;
                    const m = markerRefs.current.get(targetIdStr);
                    if (m) {
                        try {
                            m.openPopup();
                        } catch (e) { }
                    }
                    isNavigatingRef.current = false;
                    setSiteToOpenPopup(null);
                }, 300);
            }
        };

        // Start opening process
        executeOpen();

        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
            isNavigatingRef.current = false;
        };
    }, [siteToOpenPopup, map, markerRefs, isMobileLike, setSiteToOpenPopup, setSelectedSite, selectedSite, activePopupSiteIdRef, isNavigatingRef, activeMapOverlays]);

    return null;
};

const ZoomPopupPreserver = ({ markerRefs, activePopupSiteIdRef, isNavigatingRef }) => {
    const map = useMap();

    useMapEvents({
        zoomend: () => {
            if (isNavigatingRef.current) return;
            const activeId = activePopupSiteIdRef.current;
            if (!activeId) return;

            const marker = markerRefs.current.get(String(activeId).trim());
            if (!marker) return;

            // If marker icon exists (unclustered or spiderfied), keep popup open
            if (marker._icon) {
                try {
                    if (!marker.isPopupOpen()) {
                        marker.openPopup();
                    }
                } catch (e) { }
            }
        }
    });

    return null;
};

const SinglePopupEnforcer = ({ markerRefs, activePopupSiteIdRef, isNavigatingRef, setCallerSite, setSelectedSite }) => {
    const map = useMap();

    useEffect(() => {
        const handlePopupOpen = (e) => {
            if (isNavigatingRef.current) return;
            const openedPopup = e.popup;
            if (!openedPopup) return;

            let openedSiteId = null;
            markerRefs.current.forEach((marker, siteId) => {
                if (marker.getPopup && marker.getPopup() === openedPopup) {
                    openedSiteId = siteId;
                }
            });

            if (openedSiteId) {
                activePopupSiteIdRef.current = openedSiteId;
                if (setSelectedSite) setSelectedSite(null);
                // Close any other open marker popups so only one leaflet is open at any time
                markerRefs.current.forEach((marker, siteId) => {
                    if (siteId !== openedSiteId) {
                        try {
                            marker.closePopup();
                        } catch (err) { }
                    }
                });
            }
        };

        const handlePopupClose = (e) => {
            if (isNavigatingRef.current) return;
            const closedPopup = e.popup;
            if (!closedPopup) return;

            const activeId = activePopupSiteIdRef.current;
            if (activeId) {
                const activeMarker = markerRefs.current.get(activeId);
                if (activeMarker && activeMarker.getPopup && activeMarker.getPopup() === closedPopup) {
                    activePopupSiteIdRef.current = null;
                    if (setCallerSite) setCallerSite(null);
                }
            }
        };

        map.on('popupopen', handlePopupOpen);
        map.on('popupclose', handlePopupClose);

        return () => {
            map.off('popupopen', handlePopupOpen);
            map.off('popupclose', handlePopupClose);
        };
    }, [map, markerRefs, activePopupSiteIdRef, isNavigatingRef, setCallerSite, setSelectedSite]);

    return null;
};



const LocationMarker = () => {
    const { userCoords, locationMode, setSelectedSite, setCallerSite } = useAppContext();

    if (!userCoords || !locationMode || locationMode === 'none') return null;

    const blueIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const locationLabel = locationMode === 'geo'
        ? 'My GPS Location'
        : locationMode === 'manual'
            ? 'Manual Entry'
            : locationMode;

    return (
        <Marker
            position={[userCoords.lat, userCoords.lon]}
            icon={blueIcon}
            zIndexOffset={1000}
            title={`Your Location (${locationLabel})`}
            eventHandlers={{
                click: () => {
                    if (setSelectedSite) setSelectedSite(null);
                    if (setCallerSite) setCallerSite(null);
                }
            }}
        >
            <Popup autoPan={false}>
                <div style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#222' }}>
                    📍 Your Location ({locationLabel})
                </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
                Your Location ({locationLabel})
            </Tooltip>
        </Marker>
    );
};

const MapEventsHandler = ({ onMapClick }) => {
    useMapEvents({ click: onMapClick });
    return null;
};

const MapResizeHandler = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        map.invalidateSize();

        const t1 = setTimeout(() => map.invalidateSize(), 200);
        const t2 = setTimeout(() => map.invalidateSize(), 500);

        const handleResize = () => {
            map.invalidateSize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', handleResize);
        };
    }, [map]);

    return null;
};

const LocationCenteringHandler = () => {
    const { userCoords, locationMode, filterRadius, siteToOpenPopup, activeMapOverlays, previewDevice } = useAppContext();
    const map = useMap();
    const lastCenteredKeyRef = useRef(null);
    const isMobileLike = previewDevice === 'mobile' || previewDevice === 'tablet';

    useEffect(() => {
        if (!userCoords?.lat || !userCoords?.lon) {
            lastCenteredKeyRef.current = null;
            return;
        }

        // Include filterRadius in the key so changing Area triggers centering & zoom adjustment
        const currentKey = locationMode === 'geo'
            ? `${locationMode}-${filterRadius || 'all'}`
            : `${locationMode}-${userCoords.lat}-${userCoords.lon}-${filterRadius || 'all'}`;

        const hasOverlays = Array.isArray(activeMapOverlays) && activeMapOverlays.length > 0;

        if (siteToOpenPopup || hasOverlays) {
            // When opening a site card on map or displaying active battle overlays,
            // mark current location key as handled so clearing siteToOpenPopup won't trigger flyTo.
            lastCenteredKeyRef.current = currentKey;
            return;
        }

        if (lastCenteredKeyRef.current === currentKey) return;

        if (locationMode && locationMode !== 'none') {
            lastCenteredKeyRef.current = currentKey;

            const radiusKm = filterRadius && filterRadius !== 'all' ? parseInt(filterRadius, 10) : null;
            if (radiusKm && !isNaN(radiusKm) && radiusKm > 0) {
                try {
                    // Calculate bounds for the selected radius around the user coordinates (diameter = radius * 2000m)
                    const bounds = L.latLng(userCoords.lat, userCoords.lon).toBounds(radiusKm * 2000);
                    const padding = isMobileLike ? [40, 40] : [60, 60];
                    const calculatedZoom = map.getBoundsZoom(bounds, false, padding);
                    const minZoom = map.getMinZoom() ?? 2.5;
                    const maxZoom = 16;
                    const finalZoom = Math.max(minZoom, Math.min(calculatedZoom, maxZoom));
                    map.flyTo([userCoords.lat, userCoords.lon], finalZoom, { duration: 1.2 });
                } catch (err) {
                    console.error('Error calculating area zoom bounds:', err);
                    map.flyTo([userCoords.lat, userCoords.lon], 10, { duration: 1.2 });
                }
            } else {
                // 'all' areas selected
                const minZoom = map.getMinZoom() ?? 2.5;
                const targetZoom = minZoom + 7.5; // default 10
                map.flyTo([userCoords.lat, userCoords.lon], targetZoom, { duration: 1.2 });
            }
        }
    }, [locationMode, filterRadius, userCoords?.lat, userCoords?.lon, map, siteToOpenPopup, activeMapOverlays, isMobileLike]);

    return null;
};

const CenterControl = ({ userCoords, isMobileLike }) => {
    const map = useMap();
    if (!userCoords || !isMobileLike) return null; // Rendered in zoom stack on desktop

    return (
        <div
            className="leaflet-bottom leaflet-right"
            style={{
                marginBottom: '82px',
                marginRight: '10px',
                pointerEvents: 'auto',
                zIndex: 5000
            }}
        >
            <div className="leaflet-control" style={{ margin: 0 }}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        map.flyTo([userCoords.lat, userCoords.lon], map.getZoom(), { duration: 1.5 });
                    }}
                    title="Center on my location"
                    style={{
                        backgroundColor: 'white',
                        width: '32px',
                        height: '32px',
                        minWidth: '32px',
                        minHeight: '32px',
                        maxWidth: '32px',
                        maxHeight: '32px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
                        padding: 0
                    }}
                >
                    <LocateFixed size={18} strokeWidth={2.5} color="#111" />
                </button>
            </div>
        </div>
    );
};

const CustomZoomControl = ({ isMobileLike }) => {
    const map = useMap();
    const { userCoords } = useAppContext();

    const handleFastZoomIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentZoom = map.getZoom();
        const maxZoom = map.getMaxZoom() ?? 18;
        map.setZoom(Math.min(maxZoom, currentZoom + 2), { animate: true });
    };

    const handleZoomIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        map.zoomIn(0.5);
    };

    const handleZoomOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        map.zoomOut(0.5);
    };

    const handleFastZoomOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentZoom = map.getZoom();
        const minZoom = map.getMinZoom() ?? 2.5;
        map.setZoom(Math.max(minZoom, currentZoom - 2), { animate: true });
    };

    const handleCenterLocate = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (userCoords) {
            map.flyTo([userCoords.lat, userCoords.lon], map.getZoom(), { duration: 1.5 });
        }
    };

    const sqBtnStyle = {
        backgroundColor: 'white',
        width: '32px',
        height: '32px',
        minWidth: '32px',
        minHeight: '32px',
        maxWidth: '32px',
        maxHeight: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
        padding: 0,
        margin: 0
    };

    return (
        <div
            className="leaflet-top leaflet-right"
            style={{
                marginTop: '10px',
                marginRight: '10px',
                pointerEvents: 'auto',
                zIndex: 5000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px'
            }}
        >
            {/* FAST ZOOM IN (+++) */}
            <div className="leaflet-control" style={{ margin: 0 }}>
                <button
                    onClick={handleFastZoomIn}
                    title="Fast Zoom In (+2 levels)"
                    style={sqBtnStyle}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h4M5 4v4" />
                        <path d="M10 12h4M12 10v4" />
                        <path d="M17 18h4M19 16v4" />
                    </svg>
                </button>
            </div>

            {/* STANDARD ZOOM (+ / -) */}
            <div
                className="leaflet-control"
                style={{
                    margin: 0,
                    backgroundColor: 'white',
                    width: '32px',
                    height: '62px',
                    minWidth: '32px',
                    minHeight: '62px',
                    maxWidth: '32px',
                    maxHeight: '62px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                }}
            >
                <button
                    onClick={handleZoomIn}
                    title="Zoom In (+0.5 level)"
                    style={{
                        width: '100%',
                        height: '29px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#111',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: 'none',
                        borderBottom: '1px solid rgba(0,0,0,0.15)',
                        background: 'none',
                        padding: 0
                    }}
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    title="Zoom Out (-0.5 level)"
                    style={{
                        width: '100%',
                        height: '29px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#111',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: 'none',
                        background: 'none',
                        padding: 0
                    }}
                >
                    &minus;
                </button>
            </div>

            {/* FAST ZOOM OUT (---) */}
            <div className="leaflet-control" style={{ margin: 0 }}>
                <button
                    onClick={handleFastZoomOut}
                    title="Fast Zoom Out (-2 levels)"
                    style={sqBtnStyle}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h5" />
                        <path d="M9.5 12h5" />
                        <path d="M16 18h5" />
                    </svg>
                </button>
            </div>

            {/* DESKTOP CENTER / LOCATE BUTTON (Stacks directly in column) */}
            {userCoords && !isMobileLike && (
                <div className="leaflet-control" style={{ margin: 0 }}>
                    <button
                        onClick={handleCenterLocate}
                        title="Center on my location"
                        style={sqBtnStyle}
                    >
                        <LocateFixed size={18} strokeWidth={2.5} color="#111" />
                    </button>
                </div>
            )}
        </div>
    );
};

const ClusterZoomBackControl = ({ zoomBackView, setZoomBackView, isMobileLike, theme }) => {
    const map = useMap();
    const { siteToOpenPopup, activeMapOverlays } = useAppContext();

    // Clear previous view if active overlays change or explicit site popup navigation is triggered
    useEffect(() => {
        if (siteToOpenPopup || (activeMapOverlays && activeMapOverlays.length > 0)) {
            setZoomBackView(null);
        }
    }, [siteToOpenPopup, activeMapOverlays, setZoomBackView]);

    useMapEvents({
        zoomend: () => {
            if (!zoomBackView) return;
            const currentZoom = map.getZoom();
            if (zoomBackView.targetZoom === null) {
                if (currentZoom > zoomBackView.originZoom) {
                    setZoomBackView(prev => prev ? { ...prev, targetZoom: currentZoom } : null);
                } else {
                    setZoomBackView(null);
                }
            } else {
                if (Math.abs(currentZoom - zoomBackView.targetZoom) > 0.1 &&
                    Math.abs(currentZoom - zoomBackView.originZoom) > 0.1) {
                    setZoomBackView(null);
                }
            }
        }
    });

    if (!zoomBackView) return null;

    const handleZoomBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { originZoom, originCenter } = zoomBackView;
        setZoomBackView(null);
        map.flyTo(originCenter, originZoom, { duration: 0.6 });
    };

    return (
        <div
            className="leaflet-top cluster-zoom-back-wrapper"
            style={{
                left: '50%',
                transform: 'translateX(-50%)',
                top: isMobileLike ? '60px' : '16px',
                pointerEvents: 'auto',
                zIndex: 5000,
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <div className="leaflet-control" style={{ margin: 0 }}>
                <button
                    onClick={handleZoomBack}
                    className="cluster-zoom-back-btn glass-panel animate-scale-up"
                    title="Return to zoom before opening cluster"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '20px',
                        backgroundColor: theme === 'dark' ? 'rgba(22, 27, 34, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                        color: theme === 'dark' ? '#f0f6fc' : '#1f2328',
                        border: '1.5px solid var(--accent-primary, #58a6ff)',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                        fontSize: '0.84rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <ZoomOut size={16} strokeWidth={2.4} color="var(--accent-primary, #58a6ff)" />
                    <span>Zoom Back</span>
                </button>
            </div>
        </div>
    );
};

const FitFilteredSites = ({ sites, isFiltered, selectedSite, siteToOpenPopup, activeMapOverlays, activePopupSiteIdRef }) => {
    const map = useMap();
    const {
        filterSearch,
        filterCountry,
        filterCampaign,
        filterCoalition,
        filterVisited,
        showOnlyNew,
        newSitesDays,
        filterWithMaps
    } = useAppContext();

    const drawerFiltersKey = `${(filterSearch || '').trim()}|${filterCountry || 'all'}|${filterCampaign || 'all'}|${filterCoalition || 'all'}|${filterVisited || 'all'}|${showOnlyNew ? String(newSitesDays) : 'false'}|${Boolean(filterWithMaps)}`;

    const lastDrawerFiltersKeyRef = useRef(drawerFiltersKey);
    const lastSitesRef = useRef("");

    useEffect(() => {
        const currentSitesKey = (sites || []).map(s => s.id).join(',');
        const currentSearch = (filterSearch || "").trim();
        const hasOverlays = Array.isArray(activeMapOverlays) && activeMapOverlays.length > 0;
        const hasActivePopup = activePopupSiteIdRef && activePopupSiteIdRef.current;

        const isDrawerFiltered = Boolean(
            currentSearch !== '' ||
            (filterCountry && filterCountry !== 'all') ||
            (filterCampaign && filterCampaign !== 'all') ||
            (filterCoalition && filterCoalition !== 'all') ||
            (filterVisited && filterVisited !== 'all') ||
            showOnlyNew ||
            filterWithMaps
        );

        if (selectedSite || siteToOpenPopup || hasActivePopup || hasOverlays) {
            lastDrawerFiltersKeyRef.current = drawerFiltersKey;
            lastSitesRef.current = currentSitesKey;
            return;
        }

        const drawerFiltersChanged = drawerFiltersKey !== lastDrawerFiltersKeyRef.current;

        // ONLY zoom in/adjust map view when filters from the Filters drawer are modified and active.
        // Horizontal scroll menu filters (Categories, Significance, Year, Commander, Arc, etc.) maintain current zoom level.
        if (!drawerFiltersChanged || !isDrawerFiltered || !sites || sites.length === 0) {
            lastDrawerFiltersKeyRef.current = drawerFiltersKey;
            lastSitesRef.current = currentSitesKey;
            return;
        }

        const isSearching = Boolean(currentSearch !== '');

        if (isSearching) {
            const timer = setTimeout(() => {
                lastDrawerFiltersKeyRef.current = drawerFiltersKey;
                lastSitesRef.current = currentSitesKey;

                const validSites = sites.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude));
                if (validSites.length === 0) return;

                if (validSites.length === 1) {
                    const targetLat = validSites[0].latitude;
                    const targetLon = validSites[0].longitude;
                    const targetZoom = 10.5;
                    map.flyTo([targetLat, targetLon], targetZoom, { duration: 1.2 });
                } else {
                    const bounds = L.latLngBounds(validSites.map(s => [s.latitude, s.longitude]));
                    const padding = [80, 80];
                    const calculatedZoom = map.getBoundsZoom(bounds, false, padding);
                    const zoomReduction = 1.0;
                    const minMapZoom = map.getMinZoom() ?? 2.5;
                    const maxAllowedZoom = 12;
                    const finalZoom = Math.max(minMapZoom, Math.min(calculatedZoom - zoomReduction, maxAllowedZoom));
                    const center = bounds.getCenter();

                    map.flyTo(center, finalZoom, { duration: 1.2 });
                }
            }, 2000);

            return () => clearTimeout(timer);
        } else {
            lastDrawerFiltersKeyRef.current = drawerFiltersKey;
            lastSitesRef.current = currentSitesKey;

            const validSites = sites.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude));
            if (validSites.length === 0) return;

            if (validSites.length === 1) {
                const targetLat = validSites[0].latitude;
                const targetLon = validSites[0].longitude;
                const targetZoom = 11.5;
                map.flyTo([targetLat, targetLon], targetZoom, { duration: 1.2 });
            } else {
                const bounds = L.latLngBounds(validSites.map(s => [s.latitude, s.longitude]));
                const padding = [60, 60];
                const calculatedZoom = map.getBoundsZoom(bounds, false, padding);
                const zoomReduction = 0.5;
                const minMapZoom = map.getMinZoom() ?? 2.5;
                const maxAllowedZoom = 13;
                const finalZoom = Math.max(minMapZoom, Math.min(calculatedZoom - zoomReduction, maxAllowedZoom));
                const center = bounds.getCenter();

                map.flyTo(center, finalZoom, { duration: 1.2 });
            }
        }
    }, [
        sites, isFiltered, map, selectedSite, siteToOpenPopup, activeMapOverlays, activePopupSiteIdRef,
        drawerFiltersKey, filterSearch, filterCountry, filterCampaign, filterCoalition, filterVisited, showOnlyNew, newSitesDays, filterWithMaps
    ]);

    return null;
};

const createClusterIcon = (count) => {
    const sizeClass = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
    const size = count < 10 ? 30 : count < 50 ? 36 : 42;
    return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: `marker-cluster marker-cluster-${sizeClass}`,
        iconSize: L.point(size, size)
    });
};

const ClusteredSiteMarkers = ({
    sites,
    clusterRadius,
    markerRefs,
    activePopupSiteIdRef,
    isNavigatingRef,
    setSelectedSite,
    setCallerSite,
    isMobileLike,
    siteToOpenPopup,
    hasActiveOverlays,
    isTodaysBattleActive,
    setZoomBackView
}) => {
    const map = useMap();
    const [currentZoom, setCurrentZoom] = useState(map.getZoom());
    const [expandedSiteIds, setExpandedSiteIds] = useState(() => new Set());

    useMapEvents({
        zoomend: () => {
            setCurrentZoom(map.getZoom());
            if (!isNavigatingRef?.current && !activePopupSiteIdRef?.current) {
                setExpandedSiteIds(new Set());
            }
        },
        moveend: () => setCurrentZoom(map.getZoom()),
        resize: () => setCurrentZoom(map.getZoom()),
        click: () => {
            setSelectedSite(null);
            if (setCallerSite) setCallerSite(null);
            setExpandedSiteIds(new Set());
        }
    });

    const effectiveRadius = (!clusterRadius || Number(clusterRadius) <= 0 || hasActiveOverlays || isTodaysBattleActive)
        ? 0
        : Number(clusterRadius);

    const clusterGroups = useMemo(() => {
        const valid = (sites || []).filter(
            s => s && typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude)
        );

        if (effectiveRadius <= 0) {
            // Group solely by identical coordinates
            const groups = new Map();
            valid.forEach(site => {
                const coordKey = `${site.latitude.toFixed(6)},${site.longitude.toFixed(6)}`;
                if (!groups.has(coordKey)) {
                    groups.set(coordKey, {
                        coordKey,
                        sites: [],
                        lat: site.latitude,
                        lng: site.longitude,
                        firstLat: site.latitude,
                        firstLng: site.longitude,
                        isSingleCoord: true
                    });
                }
                groups.get(coordKey).sites.push(site);
            });
            return Array.from(groups.values()).map(g => ({
                ...g,
                key: g.sites.map(s => String(s.id).trim()).sort().join('_')
            }));
        }

        // Project all valid sites to current zoom screen pixel space
        const projectedSites = valid.map(site => ({
            site,
            pt: map.project([site.latitude, site.longitude], currentZoom)
        }));

        const clusters = [];
        const maxDistSq = effectiveRadius * effectiveRadius;

        projectedSites.forEach(({ site, pt }) => {
            let matchedCluster = null;
            let minDistSq = maxDistSq;

            for (let i = 0; i < clusters.length; i++) {
                const c = clusters[i];
                const dx = pt.x - c.pt.x;
                const dy = pt.y - c.pt.y;
                const distToCenterSq = dx * dx + dy * dy;
                if (distToCenterSq <= minDistSq) {
                    minDistSq = distToCenterSq;
                    matchedCluster = c;
                } else {
                    for (let j = 0; j < c.pts.length; j++) {
                        const sx = pt.x - c.pts[j].x;
                        const sy = pt.y - c.pts[j].y;
                        const sDistSq = sx * sx + sy * sy;
                        if (sDistSq <= maxDistSq && sDistSq < minDistSq) {
                            minDistSq = sDistSq;
                            matchedCluster = c;
                            break;
                        }
                    }
                }
            }

            if (matchedCluster) {
                matchedCluster.sites.push(site);
                matchedCluster.pts.push(pt);
                if (matchedCluster.isSingleCoord &&
                    (Math.abs(matchedCluster.firstLat - site.latitude) > 0.00001 ||
                     Math.abs(matchedCluster.firstLng - site.longitude) > 0.00001)) {
                    matchedCluster.isSingleCoord = false;
                }
                const n = matchedCluster.sites.length;
                matchedCluster.lat = (matchedCluster.lat * (n - 1) + site.latitude) / n;
                matchedCluster.lng = (matchedCluster.lng * (n - 1) + site.longitude) / n;
                matchedCluster.pt = map.project([matchedCluster.lat, matchedCluster.lng], currentZoom);
            } else {
                clusters.push({
                    firstLat: site.latitude,
                    firstLng: site.longitude,
                    lat: site.latitude,
                    lng: site.longitude,
                    pt,
                    pts: [pt],
                    sites: [site],
                    isSingleCoord: true
                });
            }
        });

        return clusters.map(c => ({
            ...c,
            key: c.sites.map(s => String(s.id).trim()).sort().join('_')
        }));
    }, [sites, effectiveRadius, currentZoom, map]);

    // Automatically expand cluster if a site inside it is targeted for popup opening
    useEffect(() => {
        if (siteToOpenPopup) {
            const targetIdStr = String(siteToOpenPopup.id).trim();
            setExpandedSiteIds(new Set([targetIdStr]));
        }
    }, [siteToOpenPopup]);

    const renderSiteMarker = (site, position, isSpiderfied = false) => {
        const rate = Number(site.significance) || 1;
        const zIndexOffset = rate === 1 ? 300 : rate === 2 ? 200 : 100;

        return (
            <Marker
                key={site.id}
                position={position}
                icon={getSiteIcon(site)}
                zIndexOffset={zIndexOffset}
                riseOnHover={true}
                eventHandlers={{
                    click: (e) => {
                        if (e.originalEvent) e.originalEvent.stopPropagation();
                        window.history.pushState({ siteId: site.id }, "");
                        const clickedIdStr = String(site.id).trim();
                        activePopupSiteIdRef.current = clickedIdStr;
                        setSelectedSite(null);
                        if (setCallerSite) setCallerSite(null);

                        markerRefs.current.forEach((marker, idStr) => {
                            if (idStr !== clickedIdStr) {
                                try {
                                    marker.closePopup();
                                } catch (err) {}
                            }
                        });

                        if (isMobileLike && !isSpiderfied) {
                            const m = e.target._map;
                            const latlng = e.target.getLatLng();
                            const zoom = m.getZoom();
                            const targetPoint = m.project(latlng, zoom);
                            targetPoint.y -= 150;
                            const targetLatLng = m.unproject(targetPoint, zoom);
                            m.panTo(targetLatLng, { animate: true, duration: 0.5 });
                        }
                        e.target.openPopup();
                    }
                }}
                ref={(r) => {
                    const sId = String(site.id).trim();
                    if (r) markerRefs.current.set(sId, r);
                    else markerRefs.current.delete(sId);
                }}
            >
                <Popup
                    autoPan={false}
                    autoPanPadding={[50, 50]}
                    closeButton={false}
                    autoClose={false}
                    closeOnClick={false}
                >
                    <div style={{ width: '300px', position: 'relative' }}>
                        <SiteCard
                            site={site}
                            isCompact={true}
                            hideMapLink={true}
                            onClose={() => {
                                activePopupSiteIdRef.current = null;
                                const marker = markerRefs.current.get(String(site.id).trim());
                                if (marker) marker.closePopup();
                                if (setCallerSite) setCallerSite(null);
                            }}
                        />
                    </div>
                </Popup>
            </Marker>
        );
    };

    return (
        <>
            {clusterGroups.map((group) => {
                const groupKey = group.key;
                const groupSites = group.sites;

                if (groupSites.length === 1) {
                    const site = groupSites[0];
                    return renderSiteMarker(site, [site.latitude, site.longitude], false);
                }

                const centerLat = group.lat;
                const centerLng = group.lng;
                const isExpanded = groupSites.some(s => expandedSiteIds.has(String(s.id).trim()));

                // If not expanded, render cluster badge
                if (!isExpanded) {
                    return (
                        <Marker
                            key={`cluster-icon-${groupKey}-${groupSites.length}-${currentZoom}`}
                            position={[centerLat, centerLng]}
                            icon={createClusterIcon(groupSites.length)}
                            zIndexOffset={400}
                            eventHandlers={{
                                click: (e) => {
                                    if (e.originalEvent) e.originalEvent.stopPropagation();
                                    setSelectedSite(null);
                                    if (setCallerSite) setCallerSite(null);

                                    if (group.isSingleCoord || currentZoom >= 18) {
                                        // Expand as spiderfy
                                        setExpandedSiteIds(new Set(groupSites.map(s => String(s.id).trim())));
                                    } else {
                                        // Zoom in to cluster bounds
                                        const bounds = L.latLngBounds(groupSites.map(s => [s.latitude, s.longitude]));
                                        const padding = isMobileLike ? [75, 75] : [55, 55];
                                        const calculatedZoom = map.getBoundsZoom(bounds, false, padding);
                                        const minZoom = map.getMinZoom() ?? 2.5;
                                        const maxZoom = map.getMaxZoom() ?? 18;
                                        const zoomReduction = isMobileLike ? 1.0 : 0.5;
                                        const targetZoom = Math.min(
                                            maxZoom,
                                            Math.max(currentZoom + 1, Math.max(minZoom, calculatedZoom - zoomReduction))
                                        );

                                        if (setZoomBackView) {
                                            setZoomBackView({
                                                originZoom: currentZoom,
                                                originCenter: map.getCenter(),
                                                targetZoom: null
                                            });
                                        }
                                        map.flyTo(bounds.getCenter(), targetZoom, { duration: 0.8 });
                                    }
                                }
                            }}
                        />
                    );
                }

                // If expanded, render spiderfy legs and pins
                const centerLatLng = L.latLng(centerLat, centerLng);
                const centerPt = map.latLngToLayerPoint(centerLatLng);
                const count = groupSites.length;
                const sortedGroup = [...groupSites].sort((a, b) => (Number(b.significance) || 1) - (Number(a.significance) || 1));

                return (
                    <React.Fragment key={`spider-group-${groupKey}-${count}`}>
                        <CircleMarker
                            center={[centerLat, centerLng]}
                            radius={4.5}
                            pathOptions={{
                                color: '#ef5350',
                                fillColor: '#ef5350',
                                fillOpacity: 0.95,
                                weight: 2
                            }}
                            eventHandlers={{
                                click: (e) => {
                                    if (e.originalEvent) e.originalEvent.stopPropagation();
                                    setExpandedSiteIds(new Set());
                                }
                            }}
                        />
                        {sortedGroup.map((site, i) => {
                            let pt;
                            if (count <= 8) {
                                const legLength = Math.max(38, 25 + count * 4.5);
                                const angleStep = (2 * Math.PI) / count;
                                const angle = i * angleStep - Math.PI / 2;
                                pt = L.point(
                                    centerPt.x + legLength * Math.cos(angle),
                                    centerPt.y + legLength * Math.sin(angle)
                                );
                            } else {
                                const legLength = 30 + i * 4;
                                const angle = i * (Math.PI / 3);
                                pt = L.point(
                                    centerPt.x + legLength * Math.cos(angle),
                                    centerPt.y + legLength * Math.sin(angle)
                                );
                            }

                            const spiderLatLng = map.layerPointToLatLng(pt);

                            return (
                                <React.Fragment key={site.id}>
                                    <Polyline
                                        positions={[
                                            [centerLat, centerLng],
                                            [spiderLatLng.lat, spiderLatLng.lng]
                                        ]}
                                        pathOptions={{
                                            color: '#ef5350',
                                            weight: 1.5,
                                            opacity: 0.85
                                        }}
                                        interactive={false}
                                    />
                                    {renderSiteMarker(site, [spiderLatLng.lat, spiderLatLng.lng], true)}
                                </React.Fragment>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </>
    );
};

const MapView = () => {
    const {
        sites, theme, mapStyle, clusterRadius,
        selectedSite, setSelectedSite, siteToOpenPopup, setSiteToOpenPopup,
        userCoords, isFiltered, previewDevice, clearAllFilters,
        filterCategory, activeMapOverlays, setCallerSite
    } = useAppContext();

    const hasActiveOverlays = useMemo(() => {
        return Array.isArray(activeMapOverlays) && activeMapOverlays.length > 0;
    }, [activeMapOverlays]);

    const isTodaysBattleActive = useMemo(() => {
        return Array.isArray(filterCategory) && filterCategory.includes("Today's Battle");
    }, [filterCategory]);

    const todaysBattleSites = useMemo(() => {
        if (!isTodaysBattleActive) return [];
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        return (sites || []).filter(site => {
            if ((site.category === 'Battle site' || site.category === 'Naval battle') && site.date) {
                const parts = site.date.split('-');
                if (parts.length >= 3) {
                    return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
                }
            }
            return false;
        });
    }, [sites, isTodaysBattleActive]);

    const [showDeals, setShowDeals] = useState(false);
    const [zoomBackView, setZoomBackView] = useState(null);
    const markerRefs = useRef(new Map());
    const activePopupSiteIdRef = useRef(null);
    const isNavigatingRef = useRef(false);
    const isMobileLike = previewDevice === 'mobile' || previewDevice === 'tablet';

    useEffect(() => {
        const styleId = 'map-view-custom-styles';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.innerHTML = `
            .filters-active-red {
                background: rgba(255, 68, 68, 0.1) !important;
                color: #ff4444 !important;
                border: 1.5px solid #ff4444 !important;
                font-weight: bold !important;
            }
            /* Ensures the icon inside the tag also turns red */
            .filters-active-red svg,
            .filters-active-red span {
                color: #ff4444 !important;
            }
            .detail-view-active .leaflet-popup-pane { display: none !important; }
            .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; border: none !important; }
            .leaflet-popup-content { margin: 0 !important; width: auto !important; overflow: visible !important; border: none !important; }
            .site-card {
                box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4) !important;
                border: none !important; border-radius: 12px !important; background: var(--bg-color, white) !important;
                transform: none !important; transition: none !important;
                position: relative !important;
            }

            .close-details-btn {
                background: #ff4444 !important; color: white !important; border-radius: 50% !important;
                width: 32px !important; height: 32px !important; display: flex !important;
                align-items: center !important; justify-content: center !important;
                border: 2px solid white !important; box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
                position: absolute !important; top: 10px !important; right: 10px !important;
                z-index: 100001 !important; cursor: pointer !important; padding: 0 !important;
            }
            .close-details-btn span { color: white !important; font-size: 24px !important; font-weight: bold !important; line-height: 1 !important; margin-top: -2px !important; }
            .leaflet-popup-tip-container { margin-top: -1px; }
            .leaflet-popup-tip { background: white !important; box-shadow: none !important; border: none !important; }
            .detail-view-active .leaflet-control-container { visibility: hidden !important; opacity: 0 !important; }
            .custom-div-icon { background: none !important; border: none !important; }
            .leaflet-overlay-pane { z-index: 400 !important; }
            .leaflet-marker-pane { z-index: 600 !important; }
            .new-site-badge {
                position: absolute !important; top: 5px !important; left: 5px !important;
                width: 70px !important; height: auto !important; z-index: 20 !important;
                background-color: transparent !important; border: none !important;
                box-shadow: none !important; pointer-events: none !important;
            }
            .cluster-zoom-back-wrapper {
                top: 16px;
            }
            @media (max-width: 1024px) {
                .cluster-zoom-back-wrapper {
                    top: 60px !important;
                }
            }
            .cluster-zoom-back-btn {
                transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
            }
            .cluster-zoom-back-btn:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45) !important;
            }
            .cluster-zoom-back-btn:active {
                transform: scale(0.95) !important;
            }

            ${theme === 'dark' ? `
                [class*="count"], [class*="item"] span:last-child, .filter-count {
                    color: white !important; opacity: 1 !important; -webkit-text-fill-color: white !important;
                }
            ` : ''}

        `;
    }, [theme]);

    // Mobile back/undo button handler for deals modal
    useBackHandler('dealsModal', showDeals, () => setShowDeals(false), 30);

    const defaultCenter = [48.8566, 2.3522];

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className={`animate-fade-in ${selectedSite ? 'detail-view-active' : ''}`}>
            <MapContainer
                center={defaultCenter}
                zoom={5}
                minZoom={2.5}
                maxZoom={19}
                zoomSnap={0.5}
                zoomDelta={0.5}
                style={{ height: '100%', width: '100%', minHeight: '100vh' }}
                zoomControl={false}
                maxBounds={[[-85.05112878, -180], [85.05112878, 180]]}
                maxBoundsViscosity={0.8}
            >
                <TileLayer
                    key={mapStyle}
                    url={TILE_LAYERS[mapStyle]?.url}
                    attribution={TILE_LAYERS[mapStyle]?.attribution}
                    subdomains={TILE_LAYERS[mapStyle]?.subdomains || 'abcd'}
                    maxZoom={19}
                    maxNativeZoom={TILE_LAYERS[mapStyle]?.maxNativeZoom || 18}
                    keepBuffer={4}
                />
                <MapOverlaysLayer />
                <MapResizeHandler />
                <CustomZoomControl isMobileLike={isMobileLike} />
                <LocationMarker isFiltered={isFiltered} />
                <LocationCenteringHandler />
                <CenterControl userCoords={userCoords} isMobileLike={isMobileLike} />
                <ClusterZoomBackControl zoomBackView={zoomBackView} setZoomBackView={setZoomBackView} isMobileLike={isMobileLike} theme={theme} />
                <FitFilteredSites sites={sites} isFiltered={isFiltered} selectedSite={selectedSite} siteToOpenPopup={siteToOpenPopup} activeMapOverlays={activeMapOverlays} activePopupSiteIdRef={activePopupSiteIdRef} />
                <MapEventsHandler onMapClick={() => { setSelectedSite(null); if (setCallerSite) setCallerSite(null); }} />
                <PopupOpener markerRefs={markerRefs} isMobileLike={isMobileLike} activePopupSiteIdRef={activePopupSiteIdRef} isNavigatingRef={isNavigatingRef} />
                <ZoomPopupPreserver markerRefs={markerRefs} activePopupSiteIdRef={activePopupSiteIdRef} isNavigatingRef={isNavigatingRef} />
                <SinglePopupEnforcer markerRefs={markerRefs} activePopupSiteIdRef={activePopupSiteIdRef} isNavigatingRef={isNavigatingRef} setCallerSite={setCallerSite} setSelectedSite={setSelectedSite} />
                <TodaysBattlePopupOpener
                    todaysBattleSites={todaysBattleSites}
                    markerRefs={markerRefs}
                    isTodaysBattleActive={isTodaysBattleActive}
                />

                <ClusteredSiteMarkers
                    sites={sites}
                    clusterRadius={clusterRadius}
                    markerRefs={markerRefs}
                    activePopupSiteIdRef={activePopupSiteIdRef}
                    isNavigatingRef={isNavigatingRef}
                    setSelectedSite={setSelectedSite}
                    setCallerSite={setCallerSite}
                    isMobileLike={isMobileLike}
                    siteToOpenPopup={siteToOpenPopup}
                    hasActiveOverlays={hasActiveOverlays}
                    isTodaysBattleActive={isTodaysBattleActive}
                    setZoomBackView={setZoomBackView}
                />
            </MapContainer>

            {/* MODAL DE DETALLE */}
            {showDeals && <DealsView onClose={() => setShowDeals(false)} />}
            {selectedSite && (() => {
                const liveSite = sites.find(s => s.id === selectedSite.id) || selectedSite;
                const isStrictMobile = previewDevice === 'mobile';
                return (
                    <div style={{
                        position: 'fixed',
                        top: isStrictMobile ? '145px' : '50%',
                        left: '50%',
                        transform: isStrictMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                        width: '300px',
                        maxWidth: '92vw',
                        zIndex: 2147483640,
                        pointerEvents: 'none'
                    }}>
                        <div className="animate-fade-in" style={{
                            pointerEvents: 'none',
                            maxHeight: isStrictMobile ? 'calc(100dvh - 160px)' : '85vh',
                            overflow: 'visible'
                        }}>
                            <div style={{ pointerEvents: 'auto', width: '100%' }}>
                                <SiteCard
                                    site={liveSite}
                                    onClose={() => { setSelectedSite(null); if (setCallerSite) setCallerSite(null); }}
                                    isCompact={false}
                                />
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default MapView;