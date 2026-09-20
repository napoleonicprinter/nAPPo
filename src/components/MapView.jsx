import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Marker, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppContext, useBackHandler, getAvailableSiteMaps } from '../context/AppContext';
import SiteCard, { getCategoryColor } from './SiteCard';
import DealsView from './DealsView';
import MapOverlaysLayer from './MapOverlaysLayer';
import L from 'leaflet';
import { LocateFixed, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

// --- STABILIZED INTERNAL COMPONENTS ---

// Look for this component near the top of your file
const PopupOpener = ({ markerRefs, clusterInstance, isMobileLike, activePopupSiteIdRef }) => {
    const { siteToOpenPopup, setSiteToOpenPopup, activeMapOverlays } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!siteToOpenPopup || typeof siteToOpenPopup.latitude !== 'number' || typeof siteToOpenPopup.longitude !== 'number') return;

        const targetSite = siteToOpenPopup;
        if (activePopupSiteIdRef) activePopupSiteIdRef.current = targetSite.id;
        let attempts = 0;
        const maxAttempts = 30;
        let timer = null;

        const attemptOpen = () => {
            attempts++;
            const marker = markerRefs.current.get(targetSite.id);

            if (marker) {
                map.invalidateSize();
                const currentZoom = map.getZoom();

                const siteMaps = getAvailableSiteMaps(targetSite);
                const hasMaps = siteMaps && siteMaps.length > 0;
                const activeOverlay = hasMaps ? siteMaps.find(m => activeMapOverlays?.includes(m.id)) : null;

                const minTargetZoom = activeOverlay ? 14 : hasMaps ? 13.5 : 12;
                const targetZoom = Math.max(currentZoom, minTargetZoom);

                const targetPoint = map.project([targetSite.latitude, targetSite.longitude], targetZoom);
                targetPoint.y -= isMobileLike ? 140 : 120;
                const targetLatLng = map.unproject(targetPoint, targetZoom);

                const visibleParent = clusterInstance && typeof clusterInstance.getVisibleParent === 'function'
                    ? clusterInstance.getVisibleParent(marker)
                    : null;

                const isClustered = visibleParent && visibleParent !== marker;

                if (activeOverlay && activeOverlay.bounds) {
                    map.flyToBounds(activeOverlay.bounds, { padding: [50, 50], duration: 0.8 });
                    setTimeout(() => {
                        const currentMarker = markerRefs.current.get(targetSite.id);
                        if (currentMarker) {
                            currentMarker.openPopup();
                        }
                        setSiteToOpenPopup(null);
                    }, 850);
                } else if (isClustered && clusterInstance && typeof clusterInstance.zoomToShowLayer === 'function') {
                    clusterInstance.zoomToShowLayer(marker, () => {
                        setTimeout(() => {
                            if (map.getZoom() < targetZoom) {
                                map.setZoom(targetZoom);
                            }
                            const currentMarker = markerRefs.current.get(targetSite.id);
                            if (currentMarker) {
                                currentMarker.openPopup();
                            }
                            setSiteToOpenPopup(null);
                        }, 150);
                    });
                } else {
                    map.flyTo(targetLatLng, targetZoom, { animate: true, duration: 0.6 });
                    setTimeout(() => {
                        const currentMarker = markerRefs.current.get(targetSite.id);
                        if (currentMarker) {
                            currentMarker.openPopup();
                        }
                        setSiteToOpenPopup(null);
                    }, 500);
                }
            } else if (attempts < maxAttempts) {
                timer = setTimeout(attemptOpen, 100);
            } else {
                setSiteToOpenPopup(null);
            }
        };

        timer = setTimeout(attemptOpen, 120);
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [siteToOpenPopup, clusterInstance, map, setSiteToOpenPopup, isMobileLike, markerRefs, activePopupSiteIdRef]);

    return null;
};

const ZoomPopupPreserver = ({ markerRefs, clusterInstance, activePopupSiteIdRef }) => {
    const map = useMap();

    useMapEvents({
        zoomend: () => {
            const siteId = activePopupSiteIdRef?.current;
            if (!siteId) return;

            const marker = markerRefs.current.get(siteId);
            if (!marker) return;

            setTimeout(() => {
                const visibleParent = clusterInstance && typeof clusterInstance.getVisibleParent === 'function'
                    ? clusterInstance.getVisibleParent(marker)
                    : null;

                const isClustered = visibleParent && visibleParent !== marker;

                if (isClustered && clusterInstance && typeof clusterInstance.zoomToShowLayer === 'function') {
                    clusterInstance.zoomToShowLayer(marker, () => {
                        setTimeout(() => {
                            const m = markerRefs.current.get(siteId);
                            if (m) m.openPopup();
                        }, 50);
                    });
                } else {
                    marker.openPopup();
                }
            }, 100);
        }
    });

    return null;
};

const SinglePopupEnforcer = ({ markerRefs, activePopupSiteIdRef }) => {
    useMapEvents({
        popupopen: (e) => {
            const newlyOpenedPopup = e.popup;
            if (!markerRefs.current) return;

            markerRefs.current.forEach((marker, siteId) => {
                if (!marker) return;
                const markerPopup = typeof marker.getPopup === 'function' ? marker.getPopup() : null;
                if (markerPopup === newlyOpenedPopup) {
                    if (activePopupSiteIdRef) activePopupSiteIdRef.current = siteId;
                } else if (markerPopup && typeof marker.isPopupOpen === 'function' && marker.isPopupOpen()) {
                    marker.closePopup();
                }
            });
        },
        popupclose: (e) => {
            const closedPopup = e.popup;
            if (!markerRefs.current) return;

            markerRefs.current.forEach((marker, siteId) => {
                if (!marker) return;
                const markerPopup = typeof marker.getPopup === 'function' ? marker.getPopup() : null;
                if (markerPopup === closedPopup) {
                    if (activePopupSiteIdRef && activePopupSiteIdRef.current === siteId) {
                        activePopupSiteIdRef.current = null;
                    }
                }
            });
        }
    });

    return null;
};

const SelectedSiteFlyer = ({ isMobileLike }) => {
    const { selectedSite } = useAppContext();
    const map = useMap();
    const lastFlewIdRef = useRef(null);

    useEffect(() => {
        if (!selectedSite || selectedSite.latitude === undefined || selectedSite.longitude === undefined) return;
        if (lastFlewIdRef.current === selectedSite.id) return;
        lastFlewIdRef.current = selectedSite.id;

        if (isMobileLike) {
            const currentZoom = map.getZoom();
            map.flyTo([selectedSite.latitude, selectedSite.longitude], currentZoom, {
                animate: true,
                duration: 0.8
            });
        }
    }, [selectedSite, map, isMobileLike]);

    return null;
};

const TodaysBattlePopupOpener = ({ todaysBattleSites, markerRefs, isTodaysBattleActive }) => {
    const map = useMap();
    const openedKeyRef = useRef("");

    useEffect(() => {
        if (!isTodaysBattleActive || !todaysBattleSites || todaysBattleSites.length === 0) {
            openedKeyRef.current = "";
            return;
        }

        const sitesKey = todaysBattleSites.map(s => s.id).sort().join(',');
        if (openedKeyRef.current === sitesKey) return;

        let attempts = 0;
        const maxAttempts = 10;
        let timer = null;

        const tryOpen = () => {
            attempts++;
            let allOpened = true;

            todaysBattleSites.forEach(site => {
                const marker = markerRefs.current.get(site.id);
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

        // Frame view to show all Today's Battle sites
        const validCoords = todaysBattleSites
            .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude) && !isNaN(s.longitude))
            .map(s => [s.latitude, s.longitude]);

        if (validCoords.length === 1) {
            map.setView(validCoords[0], Math.max(map.getZoom(), 8));
        } else if (validCoords.length > 1) {
            map.fitBounds(validCoords, { padding: [50, 50], maxZoom: 12 });
        }

        timer = setTimeout(tryOpen, 250);
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isTodaysBattleActive, todaysBattleSites, map, markerRefs]);

    return null;
};

const LocationMarker = () => {
    const { userCoords, locationMode } = useAppContext();

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
    const { userCoords, locationMode, siteToOpenPopup, activeMapOverlays } = useAppContext();
    const map = useMap();
    const lastCenteredKeyRef = useRef(null);

    useEffect(() => {
        if (!userCoords?.lat || !userCoords?.lon) {
            lastCenteredKeyRef.current = null;
            return;
        }

        // For GPS mode ('geo'), center ONCE per locationMode activation to avoid
        // re-zooming on continuous GPS watchPosition updates.
        // For manual/city modes, center when the mode or coords change.
        const currentKey = locationMode === 'geo'
            ? locationMode
            : `${locationMode}-${userCoords.lat}-${userCoords.lon}`;

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
            const minZoom = map.getMinZoom() ?? 2.5;
            const targetZoom = minZoom + 7.5; // 8 zoom levels in from minZoom starting point
            map.flyTo([userCoords.lat, userCoords.lon], targetZoom, { duration: 1.5 });
        }
    }, [locationMode, userCoords?.lat, userCoords?.lon, map, siteToOpenPopup, activeMapOverlays]);

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

const ClusterZoomBackControl = ({ clusterInstance, isMobileLike, theme, onClusterClickRef }) => {
    const map = useMap();
    const { siteToOpenPopup, activeMapOverlays } = useAppContext();
    const [zoomBackView, setZoomBackView] = useState(null);
    const clusterHistoryRef = useRef(null);
    const lastClickTimeRef = useRef(0);

    const handleClusterClick = (e) => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 250) return;
        lastClickTimeRef.current = now;

        const cluster = e && e.layer;
        const isCluster = cluster && typeof cluster.getChildCount === 'function';
        if (!isCluster && !e?.latlng) return;

        // The exact zoom level at which this cluster was rendered
        const originZoom = (cluster && typeof cluster._zoom === 'number')
            ? cluster._zoom
            : map.getZoom();
        const originCenter = map.getCenter();

        const view = {
            originZoom,
            originCenter,
            targetZoom: null
        };
        clusterHistoryRef.current = view;
        setZoomBackView(view);
    };

    // Keep ref updated so MarkerClusterGroup onClick can call it directly
    useEffect(() => {
        if (onClusterClickRef) {
            onClusterClickRef.current = handleClusterClick;
        }
    });

    // Also attach directly to clusterInstance
    useEffect(() => {
        if (!clusterInstance) return;

        clusterInstance.on('clusterclick', handleClusterClick);
        return () => {
            clusterInstance.off('clusterclick', handleClusterClick);
        };
    }, [clusterInstance, map]);

    // Clear previous view if active overlays change or explicit site popup navigation is triggered
    useEffect(() => {
        if (siteToOpenPopup || (activeMapOverlays && activeMapOverlays.length > 0)) {
            clusterHistoryRef.current = null;
            setZoomBackView(null);
        }
    }, [siteToOpenPopup, activeMapOverlays]);

    useMapEvents({
        zoomend: () => {
            const currentZoom = map.getZoom();
            const currentHistory = clusterHistoryRef.current;

            if (currentHistory) {
                if (currentHistory.targetZoom === null) {
                    // Cluster zoom-in completed
                    if (currentZoom > currentHistory.originZoom) {
                        currentHistory.targetZoom = currentZoom;
                    } else {
                        // Did not zoom in (e.g. spiderfy only)
                        clusterHistoryRef.current = null;
                        setZoomBackView(null);
                    }
                } else {
                    // Map was at targetZoom. If user manually zoomed to a different level:
                    if (Math.abs(currentZoom - currentHistory.targetZoom) > 0.1 &&
                        Math.abs(currentZoom - currentHistory.originZoom) > 0.1) {
                        clusterHistoryRef.current = null;
                        setZoomBackView(null);
                    }
                }
            }
        }
    });

    if (!zoomBackView) return null;

    const handleZoomBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentHistory = clusterHistoryRef.current || zoomBackView;
        if (currentHistory) {
            const { originZoom, originCenter } = currentHistory;
            clusterHistoryRef.current = null;
            setZoomBackView(null);
            map.flyTo(originCenter, originZoom, { duration: 0.6 });
        }
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

const FitFilteredSites = ({ sites, isFiltered, selectedSite, siteToOpenPopup, activeMapOverlays }) => {
    const map = useMap();
    const lastSitesRef = useRef("");

    useEffect(() => {
        const currentSitesKey = (sites || []).map(s => s.id).join(',');
        const hasOverlays = Array.isArray(activeMapOverlays) && activeMapOverlays.length > 0;

        if (selectedSite || siteToOpenPopup || hasOverlays) {
            lastSitesRef.current = currentSitesKey;
            return;
        }

        if (isFiltered && sites && sites.length > 0 && lastSitesRef.current !== currentSitesKey) {
            lastSitesRef.current = currentSitesKey;
            const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude]));

            map.fitBounds(bounds, {
                padding: [40, 40],
                minZoom: 2.5,
                maxZoom: 12,
                duration: 1.5
            });
        }
    }, [sites, isFiltered, map, selectedSite, siteToOpenPopup, activeMapOverlays]);

    return null;
};

const MapView = () => {
    const {
        sites, theme, mapStyle, clusterRadius,
        selectedSite, setSelectedSite, siteToOpenPopup, setSiteToOpenPopup,
        userCoords, isFiltered, previewDevice, clearAllFilters,
        filterCategory, activeMapOverlays
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
    const markerRefs = useRef(new Map());
    const activePopupSiteIdRef = useRef(null);
    const onClusterClickRef = useRef(null);
    const [clusterInstance, setClusterInstance] = useState(null);
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

    const renderedMarkers = [...sites]
        .filter(site => site && typeof site.latitude === 'number' && typeof site.longitude === 'number' && !isNaN(site.latitude) && !isNaN(site.longitude))
        .sort((a, b) => (Number(b.significance) || 1) - (Number(a.significance) || 1))
        .map(site => {
            const rate = Number(site.significance) || 1;
            // Smaller pins (rate 1) get higher zIndexOffset (300) so they render in front of larger pins (rate 3 = 100)
            const zIndexOffset = rate === 1 ? 300 : rate === 2 ? 200 : 100;
            return (
                <Marker
                    key={site.id}
                    position={[site.latitude, site.longitude]}
                    icon={getSiteIcon(site)}
                    zIndexOffset={zIndexOffset}
                    riseOnHover={true}
                    eventHandlers={{
                        click: (e) => {
                            if (e.originalEvent) e.originalEvent.stopPropagation();
                            window.history.pushState({ siteId: site.id }, "");
                            activePopupSiteIdRef.current = site.id;
                            if (selectedSite) setSelectedSite(null);
                            if (isMobileLike) {
                                const map = e.target._map;
                                const latlng = e.target.getLatLng();
                                const currentZoom = map.getZoom();
                                const targetPoint = map.project(latlng, currentZoom);
                                targetPoint.y -= 150;
                                const targetLatLng = map.unproject(targetPoint, currentZoom);
                                map.panTo(targetLatLng, { animate: true, duration: 0.5 });
                            }
                            e.target.openPopup();
                        }
                    }}
                    ref={(r) => {
                        if (r) markerRefs.current.set(site.id, r);
                        else markerRefs.current.delete(site.id);
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
                                    const marker = markerRefs.current.get(site.id);
                                    if (marker) marker.closePopup();
                                }}
                            />
                        </div>
                    </Popup>
                </Marker>
            );
        });

    const sitesKey = (sites || []).map(s => s.id).join(',');

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className={`animate-fade-in ${selectedSite ? 'detail-view-active' : ''}`}>
            <MapContainer
                center={defaultCenter}
                zoom={5}
                minZoom={2.5}
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
                <ClusterZoomBackControl clusterInstance={clusterInstance} isMobileLike={isMobileLike} theme={theme} onClusterClickRef={onClusterClickRef} />
                <FitFilteredSites sites={sites} isFiltered={isFiltered} selectedSite={selectedSite} siteToOpenPopup={siteToOpenPopup} activeMapOverlays={activeMapOverlays} />
                <MapEventsHandler onMapClick={() => setSelectedSite(null)} />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} isMobileLike={isMobileLike} activePopupSiteIdRef={activePopupSiteIdRef} />
                <ZoomPopupPreserver markerRefs={markerRefs} clusterInstance={clusterInstance} activePopupSiteIdRef={activePopupSiteIdRef} />
                <SinglePopupEnforcer markerRefs={markerRefs} activePopupSiteIdRef={activePopupSiteIdRef} />
                <SelectedSiteFlyer isMobileLike={isMobileLike} />
                <TodaysBattlePopupOpener
                    todaysBattleSites={todaysBattleSites}
                    markerRefs={markerRefs}
                    isTodaysBattleActive={isTodaysBattleActive}
                />

                <MarkerClusterGroup
                    ref={setClusterInstance}
                    onClick={(e) => {
                        if (onClusterClickRef.current) {
                            onClusterClickRef.current(e);
                        }
                    }}
                    key={`cluster-${clusterRadius}-${sitesKey}-${isTodaysBattleActive}-${hasActiveOverlays}`}
                    maxClusterRadius={(hasActiveOverlays || isTodaysBattleActive) ? 0 : clusterRadius}
                    zoomToBoundsOnClick={true}
                    spiderfyOnMaxZoom={true}
                    spiderfyDistanceMultiplier={1.8}
                    spiderLegPolylineOptions={{ weight: 1.5, color: '#ef5350', opacity: 0.8 }}
                    showCoverageOnHover={false}
                    chunkedLoading={false}
                    removeOutsideVisibleBounds={false}
                    animateAddingMarkers={false}
                >
                    {renderedMarkers}
                </MarkerClusterGroup>
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