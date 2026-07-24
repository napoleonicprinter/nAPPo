import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Navigation, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useAppContext } from '../context/AppContext';
import { CATEGORY_ORDER } from '../constants/categoryOrder';
import SiteCard from './SiteCard';
import MapOverlaysLayer from './MapOverlaysLayer';
import DealsView from './DealsView';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Map Tile Layers ─────────────────────────────────────────────────────────
const TILE_LAYERS = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        label: 'Night',
        icon: '🌙',
        next: 'light',
    },
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        label: 'Day',
        icon: '☀️',
        next: 'satellite',
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
        label: 'Satellite',
        icon: '🛰️',
        next: 'dark',
    },
};

// Map categories to dynamic colors
const getCategoryColor = (category) => {
    switch (category) {
        case 'Battle site': return '#f85149'; // Red
        case 'Naval battle': return '#38bdf8'; // Light Blue
        case 'Battle landmark': return '#ff6092'; // Pink
        case 'Museum': return '#a371f7'; // Purple
        case 'Monument': return '#10b981'; // Emerald Green
        case 'Building': return '#ff7b72'; // Light Coral
        case 'Artwork': return '#d2a8ff'; // Light Purple
        case 'Event site': return '#fde047'; // Light Yellow
        case 'Landmark': return '#99f000'; // Neon Green
        case 'Store': return '#ffffff'; // White
        default: return '#8b949e'; // Grey
    }
};



// Get size based on significance
const getSignificanceSize = (sig) => {
    switch (sig) {
        case 'Major': return 30;
        case 'Medium': return 25;
        case 'Minor':
        default: return 20;
    }
};

// Create a custom styled HTML icon depending on visited status and category
const createCustomIcon = (site) => {
    const size = getSignificanceSize(site.significance);
    const k = size / 20; // scale factor based on 20px base size

    const iconW = Math.round(24 * k);
    const iconH = Math.round(24 * k);
    const anchorX = Math.round(12 * k);
    const anchorY = Math.round(29 * k);
    const popupY = Math.round(-32 * k);

    const bgColor = getCategoryColor(site.category);
    // Green outer rim if visited, else white/grey depending on theme
    const borderColor = site.visited ? '#3fb950' : (document.body.classList.contains('light-mode') ? '#a0a0a0' : '#ffffff');
    const borderWidth = site.visited ? `${Math.round(3 * k)}px` : `${Math.round(2 * k)}px`;

    return new L.divIcon({
        className: 'custom-map-icon',
        html: `
            <div style="
                box-sizing: border-box;
                background-color: ${bgColor};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50% 50% 50% 0;
                border: ${borderWidth} solid ${borderColor};
                box-shadow: ${site.visited ? `0 0 ${Math.round(10 * k)}px rgba(63, 185, 80, 0.8)` : `${Math.round(2 * k)}px ${Math.round(2 * k)}px ${Math.round(4 * k)}px rgba(0,0,0,0.4)`};
                transform: rotate(-45deg);
                margin: 0;
            "></div>
        `,
        iconSize: [iconW, iconH],
        iconAnchor: [anchorX, anchorY],
        popupAnchor: [0, popupY]
    });
};

const renderSignificanceStars = (sig) => {
    const numStars = sig === 'Major' ? 3 : sig === 'Medium' ? 2 : sig === 'Minor' ? 1 : 0;
    if (numStars === 0) return null;
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginLeft: '6px' }} title={`${sig} Significance`}>
            {[...Array(numStars)].map((_, i) => (
                <Star key={i} size={14} fill="var(--accent-warning)" stroke="var(--accent-warning)" strokeWidth={1.5} />
            ))}
        </div>
    );
};

// Helper component to center map on user location if available
const LocationMarker = () => {
    const { userCoords } = useAppContext();
    const map = useMap();
    
    const isValidCoords = userCoords && !isNaN(Number(userCoords.lat)) && !isNaN(Number(userCoords.lon));

    useEffect(() => {
        if (isValidCoords) {
            try {
                const currentZoom = map.getZoom() || 12;
                map.flyTo([Number(userCoords.lat), Number(userCoords.lon)], currentZoom, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            } catch (e) {
                console.warn("flyTo failed:", e);
            }
        }
    }, [userCoords, map, isValidCoords]);

    return !isValidCoords ? null : (
        <Marker
            position={[Number(userCoords.lat), Number(userCoords.lon)]}
            zIndexOffset={1000}
            icon={new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })}
        >
            <Popup autoPan={false}>You are here</Popup>
        </Marker>
    );
};

// Helper component to track map bounds
const BoundsTracker = () => {
    const { setMapBounds } = useAppContext();
    const map = useMap();

    useEffect(() => {
        const updateBounds = () => {
            setMapBounds(map.getBounds());
        };
        updateBounds(); // Initial calculation
        map.on('moveend', updateBounds);
        map.on('zoomend', updateBounds);
        return () => {
            map.off('moveend', updateBounds);
            map.off('zoomend', updateBounds);
        };
    }, [map, setMapBounds]);

    return null;
};

// Helper component to fit map to filtered sites
const FitFilteredSites = () => {
    const { sites, isFiltered } = useAppContext();
    const map = useMap();
    const prevSiteIds = useRef(null);

    useEffect(() => {
        const currentSiteIds = sites.map(s => s.id).sort().join(',');
        
        // Don't run on initial mount
        if (prevSiteIds.current === null) {
            prevSiteIds.current = currentSiteIds;
            return;
        }

        if (currentSiteIds !== prevSiteIds.current) {
            prevSiteIds.current = currentSiteIds;
            
            if (isFiltered && sites.length > 0) {
                const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude]));
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1.0 });
                }
            } else if (!isFiltered) {
                // When filters are cleared, center map approximately to Europe
                map.flyTo([49.0, 10.0], 5, { duration: 1.0 });
            }
        }
    }, [sites, isFiltered, map]);

    return null;
};

// Helper component to provide a search input directly from the map
const SearchControl = () => {
    const { filterSearch, setFilterSearch } = useAppContext();
    const map = useMap();
    const filterSearchRef = useRef(filterSearch);

    // Fix for Leaflet tile loading under CSS transform: scale()
    useEffect(() => {
        if (!map) return;
        map.getSize = function () {
            if (!this._size || this._sizeChanged) {
                this._size = new L.Point(
                    this._container.clientWidth,
                    this._container.clientHeight
                );
                this._sizeChanged = false;
            }
            return this._size.clone();
        };
        map.invalidateSize();
    }, [map]);

    useEffect(() => {
        filterSearchRef.current = filterSearch;
        const input = document.getElementById('map-search-input');
        if (input && input.value !== (filterSearch || '')) {
            input.value = filterSearch || '';
        }
    }, [filterSearch]);

    useEffect(() => {
        if (!map) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom desktop-only');
        container.style.backgroundColor = 'white';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.cursor = 'pointer';
        container.style.transition = 'all 0.2s';
        container.style.height = '34px';
        container.title = 'Search Sites';

        let isExpanded = false;

        const getIconHtml = (color = '#333') => `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        const renderClosed = () => {
            container.innerHTML = `<div style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">${getIconHtml('#333')}</div>`;
            container.style.width = '34px';
        };

        const renderExpanded = () => {
            container.innerHTML = `
                 <div style="display: flex; align-items: center; padding: 0 5px; height: 100%;">
                     ${getIconHtml('red')}
                     <input type="text" id="map-search-input" placeholder="Search sites…" style="border: none; background: transparent; outline: none; width: 140px; margin-left: 5px; font-size: 14px; color: #333;" />
                     <button id="map-search-clear" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; padding: 2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                 </div>
             `;
            container.style.width = 'auto';
            const input = container.querySelector('#map-search-input');
            input.value = filterSearchRef.current || '';
            input.focus();

            input.oninput = (e) => {
                setFilterSearch(e.target.value);
            };

            container.querySelector('#map-search-clear').onclick = (e) => {
                e.stopPropagation();
                setFilterSearch('');
                input.value = '';
                input.focus();
            };
        };

        renderClosed();

        if (filterSearchRef.current) {
            isExpanded = true;
            renderExpanded();
        }

        container.onclick = (e) => {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            if (!isExpanded) {
                isExpanded = true;
                renderExpanded();
            } else if (!filterSearchRef.current) {
                if (e.target === container || e.target.tagName.toLowerCase() === 'div' || e.target.tagName.toLowerCase() === 'svg' || e.target.tagName.toLowerCase() === 'circle' || e.target.tagName.toLowerCase() === 'line') {
                    isExpanded = false;
                    renderClosed();
                }
            }
        };

        container.onmouseover = () => { if (!isExpanded) container.style.backgroundColor = '#f4f4f4'; };
        container.onmouseout = () => { if (!isExpanded) container.style.backgroundColor = 'white'; };

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const control = L.control({ position: 'topright' });
        control.onAdd = () => container;
        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, setFilterSearch]);

    return null;
};

// ─── Map Style Toggle Control (Day / Night / Satellite) ───────────────────────
const MapStyleControl = () => {
    const { mapStyle, setMapStyle } = useAppContext();
    const map = useMap();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom desktop-only');
        container.style.cssText = [
            'background-color: white',
            'width: 34px',
            'height: 34px',
            'cursor: pointer',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'font-size: 16px',
            'line-height: 1',
            'transition: background-color 0.2s',
            'user-select: none',
        ].join(';');

        containerRef.current = container;

        container.onmouseover = () => { container.style.backgroundColor = '#f4f4f4'; };
        container.onmouseout = () => { container.style.backgroundColor = 'white'; };

        const control = L.control({ position: 'topright' });
        control.onAdd = () => container;
        control.addTo(map);

        return () => {
            control.remove();
            containerRef.current = null;
        };
    }, [map]);

    useEffect(() => {
        if (!containerRef.current) return;
        const layer = TILE_LAYERS[mapStyle];
        containerRef.current.title = `Map style: ${layer.label} — click to switch to ${TILE_LAYERS[layer.next].label}`;
        containerRef.current.innerHTML = layer.icon;

        containerRef.current.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            setMapStyle(layer.next);
        };
    }, [mapStyle, setMapStyle]);

    return null;
};

// ─── Deals Control ───────────────────────────────────────────────────────────
const DealsControl = ({ onOpen }) => {
    const { activeDeals } = useAppContext();
    const map = useMap();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!map || !activeDeals || activeDeals.length === 0) {
            if (containerRef.current) {
                L.DomUtil.remove(containerRef.current);
                containerRef.current = null;
            }
            return;
        }

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.cssText = [
            'background-color: #ffd700',
            'width: 34px',
            'height: 34px',
            'cursor: pointer',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'color: #000',
            'transition: background-color 0.2s',
            'user-select: none',
            'box-shadow: 0 0 10px rgba(255, 215, 0, 0.5)',
            'border: 2px solid #000'
        ].join(';');

        container.title = 'Exclusive Deals & Offers';

        // Use public/assets/Chest.png image for the deals button
        container.innerHTML = `<img src="/assets/Chest.png" alt="Deals" style="width: 34px; height: 34px; object-fit: contain;" />`;

        containerRef.current = container;

        container.onmouseover = () => { container.style.backgroundColor = '#ffc800'; };
        container.onmouseout = () => { container.style.backgroundColor = '#ffd700'; };

        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            onOpen();
        };

        const control = L.control({ position: 'topright' });
        control.onAdd = () => container;
        control.addTo(map);

        return () => {
            if (control && control._map) {
                control.remove();
            }
            containerRef.current = null;
        };
    }, [map, activeDeals, onOpen]);

    return null;
};

const CenterControl = () => {
    const { userCoords } = useAppContext();
    const map = useMap();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!map || !userCoords) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom leaflet-control-center');
        container.style.backgroundColor = 'white';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.color = '#333';
        container.title = 'Center map on my location';
        container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><circle cx="12" cy="12" r="7"></circle></svg>`;

        containerRef.current = container;

        container.onmouseover = () => { container.style.backgroundColor = '#f4f4f4'; };
        container.onmouseout = () => { container.style.backgroundColor = 'white'; };

        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            // Note: map.flyTo depends on current coords from context
        };

        const control = L.control({ position: 'topright' });
        control.onAdd = function () {
            return container;
        };

        control.addTo(map);

        return () => {
            control.remove();
            containerRef.current = null;
        };
    }, [map, !!userCoords]); // Only re-add if userCoords existence changes

    useEffect(() => {
        if (!containerRef.current || !userCoords) return;
        const isValidCoords = userCoords && !isNaN(Number(userCoords.lat)) && !isNaN(Number(userCoords.lon));
        if (!isValidCoords) return;

        containerRef.current.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            try {
                map.flyTo([Number(userCoords.lat), Number(userCoords.lon)], map.getZoom());
            } catch (err) {
                console.warn("Center map failed:", err);
            }
        };
    }, [map, userCoords]);

    return null;
};

const RemoveDefaultZoom = () => {
    const map = useMap();
    useEffect(() => {
        if (map.zoomControl) {
            map.removeControl(map.zoomControl);
        }
    }, [map]);
    return null;
};

const CenterOnSelectedSite = () => {
    const { selectedSite } = useAppContext();
    const map = useMap();
    useEffect(() => {
        if (selectedSite && map) {
            map.flyTo([selectedSite.latitude, selectedSite.longitude], map.getZoom(), { duration: 1 });
        }
    }, [selectedSite, map]);
    return null;
};

// Helper component to handle programmatic popup opening
const PopupOpener = ({ markerRefs, clusterInstance }) => {
    const { siteToOpenPopup, setSiteToOpenPopup } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!siteToOpenPopup) return;

        console.log(`PopupOpener: Request to open site ${siteToOpenPopup.id}. ClusterInstance ready: ${!!clusterInstance}`);

        if (!clusterInstance) return;

        let isCancelled = false;
        let activeTimeout;
        const clusterGroup = clusterInstance;

        // Force close any existing popups on the map
        map.closePopup();

        // Fix for centering logic: ensure map knows its current container size
        map.invalidateSize();

        const tryOpenPopup = (attempts = 0) => {
            if (isCancelled) return;

            // A marker is ready if it's found in our refs
            const marker = markerRefs.current.get(siteToOpenPopup.id);
            const isReady = marker && clusterGroup && clusterGroup._map;

            if (!isReady) {
                if (attempts % 10 === 0) {
                    console.log(`PopupOpener (attempt ${attempts}): marker=${!!marker}, clusterGroup=${!!clusterGroup}, clusterMap=${!!(clusterGroup && clusterGroup._map)}`);
                }
                if (attempts < 150) {
                    activeTimeout = setTimeout(() => tryOpenPopup(attempts + 1), 100);
                } else {
                    console.warn(`PopupOpener: Timeout waiting for site ${siteToOpenPopup.id} to be ready on map.`);
                    setSiteToOpenPopup(null);
                }
                return;
            }

            try {
                if (typeof clusterGroup.zoomToShowLayer === 'function') {
                    console.log(`PopupOpener: Calling zoomToShowLayer for site ${siteToOpenPopup.id}`);


                    // FIX: Always center with padding to leave room for the top menus
                    const targetLatLng = marker.getLatLng();
                    map.flyTo(targetLatLng, Math.max(map.getZoom(), 16), {
                        duration: 0.8,
                        paddingTopLeft: [0, 180] // Increase to 180 to push site card well below the menu
                    });

                    const visibleParent = clusterGroup.getVisibleParent(marker);

                    // Temporarily block unspiderfy to survive the auto-pan 'moveend' event
                    const origUnspiderfy = clusterGroup._unspiderfy;
                    let blockUnspiderfy = true;
                    clusterGroup._unspiderfy = function () {
                        if (blockUnspiderfy) return;
                        return origUnspiderfy.apply(this, arguments);
                    };

                    clusterGroup.zoomToShowLayer(marker, () => {
                        if (isCancelled) {
                            blockUnspiderfy = false;
                            clusterGroup._unspiderfy = origUnspiderfy;
                            return;
                        }

                        console.log(`PopupOpener: zoomToShowLayer callback for site ${siteToOpenPopup.id}`);

                        // Centering logic refined: Always center the screen on the marker's location once triggered
                        map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), {
                            duration: 0.8
                        });

                        const visibleParent = clusterGroup.getVisibleParent(marker);
                        if (visibleParent && visibleParent.spiderfy) {
                            console.log("PopupOpener: Forcing spiderfy on parent");
                            visibleParent.spiderfy();
                        }

                        activeTimeout = setTimeout(() => {
                            if (!isCancelled) {
                                console.log(`PopupOpener: Opening popup for site ${siteToOpenPopup.id}`);

                                const popup = marker.getPopup();

                                // Suppress adjustPan so our manual flyTo handles the centering
                                const origAdjustPan = popup && popup._adjustPan;
                                if (popup && origAdjustPan) {
                                    popup._adjustPan = function () { /* suppressed */ };
                                }

                                const origCloseOnClick = map.options.closePopupOnClick;
                                map.options.closePopupOnClick = false;

                                marker.openPopup();

                                const restoreTimer = setTimeout(() => {
                                    if (popup && origAdjustPan) popup._adjustPan = origAdjustPan;
                                    map.options.closePopupOnClick = origCloseOnClick;
                                }, 2000);

                                // Release _unspiderfy block only when THIS marker's popup closes.
                                const releaseBlock = () => {
                                    blockUnspiderfy = false;
                                    clusterGroup._unspiderfy = origUnspiderfy;
                                    marker.off('popupclose', onPopupClose);
                                    clearTimeout(fallbackRelease);
                                    clearTimeout(restoreTimer);
                                    if (popup && origAdjustPan) popup._adjustPan = origAdjustPan;
                                    map.options.closePopupOnClick = origCloseOnClick;
                                };
                                const onPopupClose = () => releaseBlock();
                                const fallbackRelease = setTimeout(releaseBlock, 30000);
                                marker.on('popupclose', onPopupClose);
                            } else {
                                blockUnspiderfy = false;
                                clusterGroup._unspiderfy = origUnspiderfy;
                            }
                        }, 800);
                    });
                } else {
                    // Fallback centering for non-clustered markers
                    map.flyTo(marker.getLatLng(), 16, {
                        duration: 0.8,
                        paddingTopLeft: [0, 180] // Pushes the center down 180px
                    });

                    activeTimeout = setTimeout(() => {
                        if (!isCancelled) {
                           marker.openPopup();
                        }
                                    }, 1000);
                                }
            } catch (err) {
                console.error("PopupOpener error:", err);
            }
        };

        tryOpenPopup();

        return () => {
            isCancelled = true;
            if (activeTimeout) clearTimeout(activeTimeout);
        };
    }, [siteToOpenPopup, setSiteToOpenPopup, map, clusterInstance, markerRefs]);

    return null;
};

const MapView = () => {
    const {
        sites, allSites, toggleVisited, userCoords,
        filterCategory, setFilterCategory,
        filterRadius, setFilterRadius,
        mapStyle,
        theme,
        isFiltered, clearAllFilters,
        locationMode, handleLocationSelect,
        selectedSite, setSelectedSite,
        siteToOpenPopup, setSiteToOpenPopup,
        clusterRadius, activeMapOverlays, toggleMapOverlay, clearMapOverlays
    } = useAppContext();

    const [navigatingSite, setNavigatingSite] = useState(null);
    const [showDeals, setShowDeals] = useState(false);
    const iconsCache = useRef({});
    const markerRefs = useRef(new Map());
    const [clusterInstance, setClusterInstance] = useState(null);

    // FIX: Ensure popups are always in the foreground and style the close button
        useEffect(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                /* 1. Force the entire Popup Pane to the absolute front */
                .leaflet-popup-pane {
                    z-index: 100000 !important;
                }

                /* 2. Custom Red Close Button Style */
                .leaflet-popup-close-button {
                    background-color: #ff4444 !important;
                    color: white !important;
                    border-radius: 50% !important;
                    width: 28px !important;
                    height: 28px !important;
                    line-height: 28px !important;
                    text-align: center !important;
                    font-size: 20px !important;
                    font-weight: bold !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
                    border: 2px solid white !important;

                    /* Position it slightly overlapping the top-right corner */
                    top: 8px !important;
                    right: 8px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: transform 0.2s ease;
                }

                .leaflet-popup-close-button:hover {
                    background-color: #e63939 !important;
                    transform: scale(1.1);
                }

                /* Remove the default 'x' styling to ensure our custom look works */
                .leaflet-popup-close-button span {
                    color: white !important;
                    font-family: Arial, sans-serif !important;
                }

                /* 3. Popup Container Styling */
                .leaflet-popup-content-wrapper {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                    border: 1px solid rgba(255,255,255,0.15) !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    border-radius: 12px !important;
                }

                .leaflet-popup-tip {
                    background: white !important;
                }

                /* 4. Lower the Z-Index of UI menus to ensure they stay BEHIND the popup */
                .app-header,
                .filters-group,
                .mobile-overlay-filters,
                .filters-line,
                .header-controls {
                    z-index: 1000 !important; /* Standard UI layer */
                }
            `;
            document.head.appendChild(style);
            return () => {
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            };
        }, [])

    // Derive and sort categories
    const categories = useMemo(() => [
        "Today's Battle",
        ...Array.from(new Set(allSites.map(s => s.category))).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        })
    ], [allSites]);

    const defaultCenter = [48.8566, 2.3522]; // Paris

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className="animate-fade-in">

            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: '100%', width: '100%', minHeight: '100vh' }}
                zoomControl={false}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
                minZoom={2}
            >
                <RemoveDefaultZoom />
                <TileLayer
                    key={mapStyle}
                    attribution={TILE_LAYERS[mapStyle].attribution}
                    url={TILE_LAYERS[mapStyle].url}
                    noWrap={true}
                />

                <LocationMarker />
                <CenterOnSelectedSite />
                <SearchControl />
                <ZoomControl position="topright" />
                <MapStyleControl />
                <DealsControl onOpen={() => setShowDeals(true)} />
                <CenterControl />
                <BoundsTracker />
                <FitFilteredSites />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />
                <MapOverlaysLayer />

                <MarkerClusterGroup
                    ref={setClusterInstance}
                    key={`cluster-${clusterRadius}`}
                    chunkedLoading
                    maxClusterRadius={clusterRadius}
                >
                    {useMemo(() => sites.map(site => {
                        const iconKey = `${site.category}-${site.significance}-${site.visited}-${theme}`;
                        if (!iconsCache.current[iconKey]) {
                            iconsCache.current[iconKey] = createCustomIcon(site);
                        }
                        const icon = iconsCache.current[iconKey];

                        return (
                            <Marker
                                key={site.id}
                                position={[site.latitude, site.longitude]}
                                icon={icon}
                                siteId={site.id}
                                ref={(r) => {
                                    if (r) {
                                        markerRefs.current.set(site.id, r);
                                    } else {
                                        markerRefs.current.delete(site.id);
                                    }
                                }}
                            >


                                <Popup
                                    autoPan={true}
                                    autoPanPadding={[20, 160]} // 160px ensures the "X" stays clear of the scroll menu
                                    autoPanOptions={{ duration: 0.5, easeLinearity: 0.25 }}
                                >
                                    <div style={{ padding: '0px', minWidth: '200px', maxWidth: '240px' }}>
                                        {site.image && (
                                            <div style={{ position: 'relative', width: '100%', height: '120px', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img src={site.image} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {site.isNew && (
                                                    <div className="new-site-badge">NEW</div>
                                                )}
                                                {site.distance !== undefined && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '6px',
                                                        left: '6px',
                                                        zIndex: 15,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            background: 'rgba(0, 0, 0, 0.65)',
                                                            backdropFilter: 'blur(4px)',
                                                            borderRadius: '6px',
                                                            color: '#f0f6fc',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                                                        }}>
                                                            <strong>{site.distance} km</strong> away
                                                        </div>

                                                        {userCoords && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${site.latitude},${site.longitude}`;
                                                                    window.open(url, '_blank', 'noopener,noreferrer,width=1000,height=800,left=100,top=100');
                                                                }}
                                                                title="Navigate to site via Google Maps"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: 'var(--accent-primary)',
                                                                    color: '#000',
                                                                    border: 'none',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '50%',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                                                                    transition: 'transform 0.2s',
                                                                }}
                                                                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                            >
                                                                <Navigation size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {site.special?.includes('arc') && (
                                                <img src="/assets/Arc.png" alt="Listed at the Arch de Triomphe - Paris" className="arc-icon-invert" title="Listed at the Arch de Triomphe - Paris" style={{ height: '1.2em', width: 'auto', transition: 'all 0.2s' }} />
                                            )}
                                            {site.name}
                                        </h3>
                                        <div style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                                            <span>{site.category}{site.year && String(site.year).trim() !== '' ? ` \u2022 ${site.year}` : ''}</span>
                                            {renderSignificanceStars(site.significance)}
                                        </div>


                                        {import.meta.env.VITE_ENABLE_BATTLE_MAPS === 'true' && site.maps && site.maps.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                                {site.maps.map((map, index) => {
                                                    const isActive = activeMapOverlays.includes(map.id);
                                                    const isOdd = site.maps.length % 2 !== 0;
                                                    const isFullWidth = isOdd && index === 0;
                                                    const width = isFullWidth ? '100%' : 'calc(50% - 3px)';

                                                    return (
                                                        <button
                                                            key={map.id}
                                                            onClick={() => toggleMapOverlay(map.id)}
                                                            style={{
                                                                width: width,
                                                                padding: '8px 4px',
                                                                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                                                border: `1px solid ${isActive ? '#38bdf8' : 'var(--border-color)'}`,
                                                                color: isActive ? '#38bdf8' : 'var(--text-primary)',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {isActive ? `Hide ${map.name}` : `Show ${map.name}`}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <button
                                                onClick={() => toggleVisited(site.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: site.visited ? 'rgba(46, 160, 67, 0.2)' : 'var(--accent-primary)',
                                                    color: site.visited ? '#2ea043' : '#000',
                                                    border: site.visited ? '1px solid #2ea043' : 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {site.visited ? '✓ Visited' : 'Mark Visited'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedSite(site)}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: 'rgba(240, 246, 252, 0.1)',
                                                    color: 'var(--text-primary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }), [sites, theme, userCoords])}
                </MarkerClusterGroup>
            </MapContainer>

            {selectedSite && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 7000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} className="animate-fade-in" onClick={() => setSelectedSite(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px' }}>
                        <SiteCard site={selectedSite} onClose={() => setSelectedSite(null)} />
                    </div>
                </div>
            )}

            {showDeals && <DealsView onClose={() => setShowDeals(false)} />}

            <div className="mobile-action-buttons">
                {isFiltered && (
                    <button
                        className="mobile-clear-filters glass-panel"
                        onClick={clearAllFilters}
                        title="Clear All Filters"
                    >
                        Clear Filters
                    </button>
                )}
                {activeMapOverlays && activeMapOverlays.length > 0 && (
                    <button
                        className="mobile-clear-filters glass-panel"
                        onClick={clearMapOverlays}
                        title="Clear Maps"
                    >
                        Clear Maps
                    </button>
                )}
            </div>

        </div>
    );
};

export default MapView;
