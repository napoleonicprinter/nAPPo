import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Navigation } from 'lucide-react';
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

// Map categories to dynamic colors
const getCategoryColor = (category) => {
    switch (category) {
        case 'Battle site': return '#f85149'; // Red
        case 'Sea Battle': return '#38bdf8'; // Light Blue
        case 'Battle landmark': return '#d29922'; // Orange/Gold
        case 'Museum': return '#a371f7'; // Purple
        case 'Monument': return '#10b981'; // Emerald Green
        case 'Building': return '#ff7b72'; // Light Coral
        case 'Artwork': return '#d2a8ff'; // Light Purple
        case 'Event site': return '#fde047'; // Light Yellow
        case 'Landmark': return '#7b5a25ff'; // Brown
        default: return '#8b949e'; // Grey
    }
};

const CATEGORY_ORDER = [
    'Battle site',
    'Sea Battle',
    'Battle landmark',
    'Museum',
    'Monument',
    'Building',
    'Artwork',
    'Event site',
    'Landmark'
];

// Create a custom styled HTML icon depending on visited status and category
const createCustomIcon = (site) => {
    const bgColor = getCategoryColor(site.category);
    // Green outer rim if visited, else white
    const borderColor = site.visited ? '#3fb950' : '#ffffff';
    const borderWidth = site.visited ? '3px' : '2px';

    return new L.divIcon({
        className: 'custom-map-icon',
        html: `
            <div style="
                box-sizing: border-box;
                background-color: ${bgColor};
                width: 20px;
                height: 20px;
                border-radius: 50% 50% 50% 0;
                border: ${borderWidth} solid ${borderColor};
                box-shadow: ${site.visited ? '0 0 10px rgba(63, 185, 80, 0.8)' : '2px 2px 4px rgba(0,0,0,0.4)'};
                transform: rotate(-45deg);
                margin: 0;
            "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 29],
        popupAnchor: [0, -32]
    });
};

// Helper component to center map on user location if available
const LocationMarker = () => {
    const { userCoords } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (userCoords) {
            map.flyTo([userCoords.lat, userCoords.lon], map.getZoom());
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
// Helper component to calculate and update clustering radius based on zoom
const ClusteringController = ({ setMaxClusterRadius }) => {
    const map = useMap();

    const updateRadius = () => {
        const zoom = map.getZoom();
        const center = map.getCenter();

        // At zoom Level z, 1 pixel = (40075 * cos(lat)) / (256 * 2^z) km
        // So pixels for 10 km = 10 / ((40075 * cos(lat)) / (256 * 2^z))
        const kmPerPixel = (40075 * Math.cos(center.lat * Math.PI / 180)) / (256 * Math.pow(2, zoom));
        const pixelsFor10Km = 10 / kmPerPixel;

        // We set a minimum of 20px and a maximum of 200px to keep it usable
        const radius = Math.min(Math.max(Math.round(pixelsFor10Km), 20), 200);
        setMaxClusterRadius(radius);
    };

    useEffect(() => {
        updateRadius(); // Initial calculation
        map.on('zoomend', updateRadius);
        return () => {
            map.off('zoomend', updateRadius);
        };
    }, [map]);

    return null;
};

// Helper component to toggle geolocation directly from the map
const GeolocationControl = () => {
    const { geolocationEnabled, requestGeolocation, disableGeolocation } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = geolocationEnabled ? 'var(--accent-primary)' : 'white';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.color = geolocationEnabled ? '#000' : '#333';
        container.title = geolocationEnabled ? 'Disable Location Services' : 'Enable Location Services';
        container.style.transition = 'all 0.2s';

        container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

        container.onmouseover = () => {
            if (!geolocationEnabled) container.style.backgroundColor = '#f4f4f4';
        };
        container.onmouseout = () => {
            container.style.backgroundColor = geolocationEnabled ? 'var(--accent-primary)' : 'white';
        };

        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            e.preventDefault();
            if (geolocationEnabled) {
                disableGeolocation();
            } else {
                requestGeolocation();
            }
        };

        const control = L.control({ position: 'topright' });
        control.onAdd = function () {
            return container;
        };

        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, geolocationEnabled, requestGeolocation, disableGeolocation]);

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



const MapView = () => {
    const {
        sites, allSites, toggleVisited, userCoords,
        filterCategory, setFilterCategory,
        filterRadius, setFilterRadius,
        geolocationEnabled
    } = useAppContext();
    const [selectedSite, setSelectedSite] = useState(null);
    const [navigatingSite, setNavigatingSite] = useState(null);
    const [maxClusterRadius, setMaxClusterRadius] = useState(80);

    // Derive unique categories from allSites and sort them
    const categories = Array.from(new Set(allSites.map(s => s.category))).sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a);
        const indexB = CATEGORY_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

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
                <ZoomControl position="topright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <LocationMarker />
                <GeolocationControl />
                <CenterControl />
                <ClusteringController setMaxClusterRadius={setMaxClusterRadius} />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={maxClusterRadius}
                    key={`cluster-group-${maxClusterRadius}`} // Re-mount when radius changes significantly to force clustering update
                >
                    {sites.map(site => (
                        <Marker
                            key={site.id}
                            position={[site.latitude, site.longitude]}
                            icon={createCustomIcon(site)}
                        >
                            <Popup>
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
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {site.special === 'arc' && (
                                            <img src="/assets/Arc.png" alt="Arc" style={{ height: '1.2em', width: 'auto' }} />
                                        )}
                                        {site.name}
                                    </h3>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#8b949e' }}>
                                        {site.category} &bull; {site.year}
                                    </p>
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
                                                color: '#c9d1d9',
                                                border: '1px solid #30363d',
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
                    ))}
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
                    zIndex: 1000,
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

        </div>
    );
};

export default MapView;
