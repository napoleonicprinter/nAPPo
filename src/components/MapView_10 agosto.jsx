import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { LocateFixed } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SiteCard, { getCategoryColor } from './SiteCard';
import { createPortal } from 'react-dom';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// --- TILE LAYERS (Restored to Light Blue Water) ---
const TILE_LAYERS = {
    // Standard OpenStreetMap has the light blue water surfaces
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors'
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; CartoDB'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
    }
};

const getSiteIcon = (site) => {
    const color = getCategoryColor?.(site.category) || '#58a6ff';
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

// --- MAP STABILIZER COMPONENT ---
const MapStabilizer = () => {
    const map = useMap();
    useEffect(() => {
        // Fixes the "broken map" tiles issue by forcing a recalculation
        setTimeout(() => {
            map.invalidateSize();
        }, 250);
    }, [map]);
    return null;
};

const PopupOpener = ({ markerRefs, clusterInstance }) => {
    const { siteToOpenPopup } = useAppContext();
    const map = useMap();
    const lastOpenedId = useRef(null);

    useEffect(() => {
        if (!siteToOpenPopup) {
            lastOpenedId.current = null;
            return;
        }
        if (!clusterInstance || lastOpenedId.current === siteToOpenPopup.id) return;

        const marker = markerRefs.current.get(siteToOpenPopup.id);
        if (marker) {
            lastOpenedId.current = siteToOpenPopup.id;
            const latlng = marker.getLatLng();
            const currentZoom = map.getZoom();
            const targetPoint = map.project(latlng, currentZoom);
            targetPoint.y -= 150;
            const targetLatLng = map.unproject(targetPoint, currentZoom);

            map.flyTo(targetLatLng, currentZoom, { duration: 0.8 });
            setTimeout(() => marker.openPopup(), 800);
        }
    }, [siteToOpenPopup, map, clusterInstance, markerRefs]);
    return null;
};

const MapView = () => {
    const context = useAppContext();
    if (!context) return <div style={{ height: '100vh', background: '#f0f0f0' }} />;

    const {
        sites = [], theme, mapStyle = 'light', clusterRadius = 50,
        selectedSite, setSelectedSite, siteToOpenPopup, setSiteToOpenPopup,
        userCoords, isFiltered, previewDevice, clearAllFilters,
        callerSite, setCallerSite
    } = context;

    const markerRefs = useRef(new Map());
    const [clusterInstance, setClusterInstance] = useState(null);
    const isMobileLike = previewDevice === 'mobile' || previewDevice === 'tablet';

    const validSites = useMemo(() =>
        (sites || []).filter(s => s.latitude != null && s.longitude != null),
    [sites]);

    useEffect(() => {
        const styleId = 'map-view-styles';
        let style = document.getElementById(styleId) || document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
        style.innerHTML = `
            .leaflet-container { height: 100vh !important; width: 100% !important; background: #aad3df !important; }
            .detail-view-active .leaflet-popup-pane { display: none !important; }
            .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        `;
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }} className={selectedSite ? 'detail-view-active' : ''}>
            <MapContainer
                center={[48.8566, 2.3522]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer url={TILE_LAYERS[mapStyle]?.url || TILE_LAYERS.light.url} attribution={TILE_LAYERS[mapStyle]?.attribution} />
                <ZoomControl position="topright" />
                <MapStabilizer />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />

                <MarkerClusterGroup ref={setClusterInstance} key={`cluster-${clusterRadius}`} maxClusterRadius={clusterRadius}>
                    {validSites.map(site => (
                        <Marker
                            key={site.id}
                            position={[site.latitude, site.longitude]}
                            icon={getSiteIcon(site)}
                            ref={(r) => r ? markerRefs.current.set(site.id, r) : markerRefs.current.delete(site.id)}
                            eventHandlers={{ click: (e) => e.target.openPopup() }}
                        >
                            <Popup closeButton={false} onClose={() => { setSiteToOpenPopup(null); setSelectedSite(null); }}>
                                <div style={{ width: '300px' }}>
                                    <SiteCard site={site} isCompact={true} hideMapLink={true} />
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* DETAIL OVERLAY */}
            {selectedSite && createPortal(
                <div style={{ position: 'fixed', top: isMobileLike ? '145px' : '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '92%', maxWidth: '400px', zIndex: 2147483640 }}>
                    <div className="animate-fade-in" style={{ padding: '10px 20px 80px 20px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <SiteCard
                            site={selectedSite}
                            onClose={() => { setSelectedSite(null); setCallerSite(null); }}
                            isCompact={false}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MapView;