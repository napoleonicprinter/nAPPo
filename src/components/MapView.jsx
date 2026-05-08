import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Navigation, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useAppContext } from '../context/AppContext';
import SiteCard from './SiteCard';
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

const CATEGORY_ORDER = [
    'Battle site',
    'Battle landmark',
    'Naval battle',
    'Museum',
    'Monument',
    'Building',
    'Artwork',
    'Event site',
    'Landmark',
    'Store'
];

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

    useEffect(() => {
        if (userCoords) {
            map.flyTo([userCoords.lat, userCoords.lon], map.getZoom(), {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [userCoords, map]);

    return userCoords === null ? null : (
        <Marker
            position={[userCoords.lat, userCoords.lon]}
            icon={new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })}
        >
            <Popup>You are here</Popup>
        </Marker>
    );
};

// Helper component to center map manually on user location via control button
// Dynamic clustering radius was removed because it forces MarkerClusterGroup to remount
// on every zoom, which breaks popup animations and zoomToShowLayer.
// A fixed maxClusterRadius of 45 provides the requested high sensitivity.

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

// Helper component to provide a search input directly from the map
const SearchControl = () => {
    const { filterSearch, setFilterSearch } = useAppContext();
    const map = useMap();
    const filterSearchRef = useRef(filterSearch);

    useEffect(() => {
        filterSearchRef.current = filterSearch;
    }, [filterSearch]);

    useEffect(() => {
        if (!map) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
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

    useEffect(() => {
        if (!map) return;

        const layer = TILE_LAYERS[mapStyle];

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
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
        container.title = `Map style: ${layer.label} — click to switch to ${TILE_LAYERS[layer.next].label}`;
        container.innerHTML = layer.icon;

        container.onmouseover = () => { container.style.backgroundColor = '#f4f4f4'; };
        container.onmouseout = () => { container.style.backgroundColor = 'white'; };

        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            setMapStyle(layer.next);
        };

        const control = L.control({ position: 'topright' });
        control.onAdd = () => container;
        control.addTo(map);

        return () => { control.remove(); };
    }, [map, mapStyle, setMapStyle]);

    return null;
};

const CenterControl = () => {
    const { userCoords } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!map || !userCoords) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
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

        container.onmouseover = () => { container.style.backgroundColor = '#f4f4f4'; };
        container.onmouseout = () => { container.style.backgroundColor = 'white'; };

        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            map.flyTo([userCoords.lat, userCoords.lon], 12);
        };

        const control = L.control({ position: 'topright' });
        control.onAdd = function () {
            return container;
        };

        control.addTo(map);

        return () => {
            control.remove();
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
            map.flyTo([selectedSite.latitude, selectedSite.longitude], 12, { duration: 1 });
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
                    
                    // Temporarily block unspiderfy to survive the auto-pan 'moveend' event
                    const origUnspiderfy = clusterGroup._unspiderfy;
                    let blockUnspiderfy = true;
                    clusterGroup._unspiderfy = function() {
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
                        
                        const visibleParent = clusterGroup.getVisibleParent(marker);
                        if (visibleParent && visibleParent.spiderfy) {
                            console.log("PopupOpener: Forcing spiderfy on parent");
                            visibleParent.spiderfy();
                        }
                        
                        activeTimeout = setTimeout(() => {
                            if (!isCancelled) {
                                console.log(`PopupOpener: Opening popup for site ${siteToOpenPopup.id}`);
                                marker.openPopup();
                                
                                // Allow unspiderfy again after autoPan animation finishes (approx 1s)
                                setTimeout(() => {
                                    blockUnspiderfy = false;
                                    clusterGroup._unspiderfy = origUnspiderfy;
                                }, 1500);

                                // We intentionally DO NOT call setSiteToOpenPopup(null) here.
                                // Resetting AppContext triggers a full re-render of MapView, 
                                // which causes react-leaflet-cluster to lose its spiderfied state.
                            } else {
                                blockUnspiderfy = false;
                                clusterGroup._unspiderfy = origUnspiderfy;
                            }
                        }, 800); // Give enough time for spiderfy animation
                    });
                } else {
                    map.flyTo(marker.getLatLng(), 18);
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
        selectedSite, setSelectedSite,
        siteToOpenPopup, setSiteToOpenPopup
    } = useAppContext();
    const [navigatingSite, setNavigatingSite] = useState(null);
    const iconsCache = useRef({});
    const markerRefs = useRef(new Map());
    const [clusterInstance, setClusterInstance] = useState(null);



    // Derive unique categories from allSites and sort them
    const categories = [
        "Today's Battle",
        ...Array.from(new Set(allSites.map(s => s.category))).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        })
    ];

    // Default center (Europe)
    const defaultCenter = [48.8566, 2.3522]; // Paris

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className="animate-fade-in">


            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <RemoveDefaultZoom />
                <TileLayer
                    key={mapStyle}
                    attribution={TILE_LAYERS[mapStyle].attribution}
                    url={TILE_LAYERS[mapStyle].url}
                />

                <LocationMarker />
                <CenterOnSelectedSite />
                <SearchControl />
                <ZoomControl position="topright" />
                <MapStyleControl />
                <CenterControl />
                <BoundsTracker />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />

                <MarkerClusterGroup
                    ref={setClusterInstance}

                    chunkedLoading
                    maxClusterRadius={45}
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
                                    autoPanPadding={[50, 50]} 
                                    autoPanOptions={{ duration: 0.5, easeLinearity: 0.25 }}
                                >
                                    <div style={{ padding: '0px', minWidth: '200px', maxWidth: '240px' }}>
                                        {site.image && (
                                            <div style={{ position: 'relative', width: '100%', height: '120px', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img src={site.image} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                                <img src="/assets/Arc.png" alt="Listed at the Arch de Triomphe - Paris" title="Listed at the Arch de Triomphe - Paris" style={{ height: '1.2em', width: 'auto' }} />
                                            )}
                                            {site.name}
                                        </h3>
                                        <div style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                                            <span>{site.category}{site.year && String(site.year).trim() !== '' ? ` \u2022 ${site.year}` : ''}</span>
                                            {renderSignificanceStars(site.significance)}
                                        </div>
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

            {isFiltered && (
                <button
                    className="mobile-clear-filters glass-panel"
                    onClick={clearAllFilters}
                    title="Clear All Filters"
                >
                    Clear Filters
                </button>
            )}

        </div>
    );
};

export default MapView;
