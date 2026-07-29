import React, { useState, useRef, useEffect } from 'react';import { MapContainer, TileLayer, Popup, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppContext } from '../context/AppContext';
import SiteCard, { getCategoryColor } from './SiteCard';
import DealsView from './DealsView';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// --- CONSTANTS ---
const TILE_LAYERS = {
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
    }
};

const getSiteIcon = (site) => {
    const color = getCategoryColor(site.category);
    const rate = Number(site.significance) || 1;
    const size = rate >= 3 ? 30 : rate === 2 ? 25 : 20;

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color} !important; width: ${size}px !important; height: ${size}px !important; border-radius: 50% 50% 50% 0 !important; transform: rotate(-45deg) !important; border: 2px solid white !important; box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size - 5]
    });
};

const PopupOpener = ({ markerRefs, clusterInstance }) => {
    const { siteToOpenPopup, setSiteToOpenPopup } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!siteToOpenPopup || !clusterInstance) return;
        let isCancelled = false;
        let activeTimeout;
        const marker = markerRefs.current.get(siteToOpenPopup.id);

        if (marker) {
            const latlng = marker.getLatLng();
            const zoom = 16;
            const targetPoint = map.project(latlng, zoom);
            targetPoint.y -= 150;
            const targetLatLng = map.unproject(targetPoint, zoom);

            map.flyTo(targetLatLng, zoom, { duration: 0.8 });
            activeTimeout = setTimeout(() => {
                if (!isCancelled) marker.openPopup();
            }, 800);
        }
        return () => { isCancelled = true; if (activeTimeout) clearTimeout(activeTimeout); };
    }, [siteToOpenPopup, map, clusterInstance, markerRefs]);
    return null;
};

// --- MAIN COMPONENT ---
const MapView = () => {
    const {
        sites, theme, mapStyle, clusterRadius,
        selectedSite, setSelectedSite, siteToOpenPopup, setSiteToOpenPopup,
        userCoords, isFiltered, previewDevice, clearAllFilters
    } = useAppContext();

    const [showDeals, setShowDeals] = useState(false);
    const markerRefs = useRef(new Map());
    const [clusterInstance, setClusterInstance] = useState(null);
    const isMobileLike = previewDevice === 'mobile' || previewDevice === 'tablet';

    // --- INTERNAL HELPERS ---

    const MapEventsHandler = () => {
        useMapEvents({
            click: () => setSelectedSite(null),
        });
        return null;
    };

    const CenterControl = () => {
        const map = useMap();
        if (!userCoords) return null;
        return (
            <div
                className={isMobileLike ? "leaflet-bottom leaflet-right" : "leaflet-top leaflet-right"}
                style={{
                    marginTop: isMobileLike ? '0' : '74px',
                    marginBottom: isMobileLike ? '82px' : '0',
                    marginRight: '10px',
                    pointerEvents: 'auto',
                    zIndex: 5000
                }}
            >
                <div className="leaflet-control leaflet-bar" style={{ border: 'none', boxShadow: 'none', margin: 0 }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            map.flyTo([userCoords.lat, userCoords.lon], 14, { duration: 1.5 });
                        }}
                        style={{ backgroundColor: 'white', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid rgba(0,0,0,0.2)', borderRadius: '4px', boxShadow: '0 1px 5px rgba(0,0,0,0.3)' }}
                    >
                        <LocateFixed size={18} strokeWidth={2.5} color="#444" />
                    </button>
                </div>
            </div>
        );
    };

    const FitFilteredSites = () => {
        const map = useMap();
        useEffect(() => {
            if (isFiltered && sites.length > 0) {
                const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude]));
                map.fitBounds(bounds, { padding: [70, 70], maxZoom: 12, duration: 1.5 });
            }
        }, [sites, isFiltered, map]);
        return null;
    };

    const LocationMarker = () => {
        if (!userCoords) return null;
        const blueIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        return <Marker position={[userCoords.lat, userCoords.lon]} icon={blueIcon} zIndexOffset={1000} />;
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* 1. Eliminar marco y bordes de la burbuja Leaflet */
            .leaflet-popup-content-wrapper {
                background: transparent !important;
                box-shadow: none !important;
                padding: 0 !important;
                border-radius: 0 !important;
                border: none !important; /* Elimina la línea gris */
            }

            .leaflet-popup-content {
                margin: 0 !important;
                width: auto !important;
                overflow: visible !important;
                border: none !important;
            }

            /* 2. Estilo de las Tarjetas con Sombra Proyectada (Shade) */
            .site-card {
                box-shadow:
                    0 30px 60px -12px rgba(0, 0, 0, 0.45),
                    0 18px 36px -18px rgba(0, 0, 0, 0.5) !important;
                border: none !important;
                border-radius: 12px !important;
                background: var(--bg-color, white) !important;
                transform: none !important;
                transition: none !important;
            }

            /* 3. Puntero (tip) blanco sin bordes ni sombras que parezcan líneas */
            .leaflet-popup-tip-container {
                margin-top: -1px; /* Pegar a la tarjeta */
            }
            .leaflet-popup-tip {
                background: white !important;
                box-shadow: none !important;
                border: none !important;
            }

            /* Ocultar botones cuando el detalle está activo */
            .detail-view-active .leaflet-control-container {
                visibility: hidden !important;
                opacity: 0 !important;
            }

            /* Estilo del botón flotante */
            .clear-filters-floating {
                display: flex !important;
                position: fixed !important;
                bottom: 25px !important;
                left: 20px !important;
                z-index: 9999 !important;
                background: rgba(255, 255, 255, 0.8) !important;
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                color: #ff4444 !important;
                border: 1.5px solid #ff4444 !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                font-weight: 700 !important;
                font-size: 12px !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
                cursor: pointer !important;
                pointer-events: auto !important;
                text-transform: uppercase !important;
            }
           `;

        document.head.appendChild(style);
        return () => { if (document.head.contains(style)) document.head.removeChild(style); };
    }, []);

    const defaultCenter = [48.8566, 2.3522];

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className={`animate-fade-in ${selectedSite ? 'detail-view-active' : ''}`}>
            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ height: '100%', width: '100%', minHeight: '100vh' }}
                zoomControl={false}
            >
                <TileLayer key={mapStyle} url={TILE_LAYERS[mapStyle]?.url} attribution={TILE_LAYERS[mapStyle]?.attribution} />
                <ZoomControl position="topright" />
                <LocationMarker />
                <CenterControl />
                <FitFilteredSites />
                <MapEventsHandler />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />

                <MarkerClusterGroup ref={setClusterInstance} key={`cluster-${clusterRadius}`} maxClusterRadius={clusterRadius}>
                    {sites.map(site => (
                        <Marker
                            key={site.id}
                            position={[site.latitude, site.longitude]}
                            icon={getSiteIcon(site)}
                            eventHandlers={{
                                click: (e) => {
                                    if (e.originalEvent) e.originalEvent.stopPropagation();

                                    // --- FIX: CLOSE DETAIL CARD ON PIN CLICK ---
                                    if (selectedSite) {
                                        setSelectedSite(null);
                                    }
                                    // --------------------------------------------
                                    const map = e.target._map;
                                    const latlng = e.target.getLatLng();
                                    const targetPoint = map.project(latlng, map.getZoom());

                                    // Centering logic for the small bubble
                                    targetPoint.y -= 150;
                                    const targetLatLng = map.unproject(targetPoint, map.getZoom());
                                    map.panTo(targetLatLng, { animate: true, duration: 0.5 });

                                    e.target.openPopup();
                                }
                            }}
                            ref={(r) => {
                                if (r) markerRefs.current.set(site.id, r);
                                else markerRefs.current.delete(site.id);
                            }}
                        >
                            <Popup autoPan={false} autoPanPadding={[50, 50]}>
                                <div style={{ width: '300px', position: 'relative' }}>
                                    <SiteCard
                                        site={site}
                                        isCompact={true}
                                        hideMapLink={true}
                                        onClose={() => {
                                            const marker = markerRefs.current.get(site.id);
                                            if (marker) marker.closePopup();
                                        }}
                                    />
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>


            {/* MODAL DE DETALLE - Sombra proyectada sobre el mapa y leaflet */}
            {selectedSite && (
                <div
                    style={{
                        position: 'fixed',
                        top: isMobileLike ? '165px' : '135px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '92%',
                        maxWidth: '440px',
                        zIndex: 2147483647,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        className="animate-fade-in"
                        style={{
                            pointerEvents: 'auto',
                            /* Este padding es vital para que la sombra borrosa sea visible sobre el mapa */
                            padding: '10px 20px 60px 20px',
                            maxHeight: isMobileLike ? 'calc(100dvh - 160px)' : '80vh',
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <SiteCard
                            site={selectedSite}
                            onClose={() => setSelectedSite(null)}
                            isCompact={false}
                        />
                    </div>
                </div>
            )}
            )}

            {/* BOTÓN FLOTANTE CLEAR ALL */}
            {isMobileLike && isFiltered && (
                <button className="clear-filters-floating animate-fade-in" onClick={() => clearAllFilters()}>
                    <span>✕</span> CLEAR ALL
                </button>
            )}

            {showDeals && <DealsView onClose={() => setShowDeals(false)} />}
        </div>
    );
};

export default MapView;