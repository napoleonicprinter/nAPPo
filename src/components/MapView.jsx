import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
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
                className={`leaflet-control-center ${isMobileLike ? "leaflet-bottom leaflet-right" : "leaflet-top leaflet-right"}`}
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
        const shadowColor = theme === 'dark' ? 'rgba(200, 200, 200, 0.4)' : 'rgba(0, 0, 0, 0.45)';
        const shadowDeep = theme === 'dark' ? 'rgba(180, 180, 180, 0.2)' : 'rgba(0, 0, 0, 0.3)';

        style.innerHTML = `
            .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; border: none !important; }
            .leaflet-popup-content { margin: 0 !important; width: auto !important; overflow: visible !important; border: none !important; }

            .new-site-badge {
                position: absolute !important;
                top: 5px !important;
                left: 5px !important;
                width: 70px !important; /* Fixed typo from 170px to 70px */
                height: auto !important;
                background-color: transparent !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                padding: 0 !important;
                z-index: 20 !important;
                pointer-events: none !important;
            }
            .site-card {
                box-shadow: 0 30px 60px -12px ${shadowColor}, 0 18px 36px -18px ${shadowDeep} !important;
                border: none !important; border-radius: 12px !important; background: var(--bg-color, white) !important;
                transform: none !important; transition: none !important;
                position: relative !important;
            }

            /* --- RESTORED RED CLOSE BUTTON --- */
            .close-details-btn {
                background: #ff4444 !important;
                color: white !important;
                border-radius: 50% !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border: 2px solid white !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                z-index: 100001 !important;
                cursor: pointer !important;
                padding: 0 !important;
            }
            .close-details-btn span {
                color: white !important;
                font-size: 24px !important;
                font-weight: bold !important;
                line-height: 1 !important;
                margin-top: -2px !important;
            }

            .leaflet-popup-tip-container { margin-top: -1px; }
            .leaflet-popup-tip { background: white !important; box-shadow: none !important; border: none !important; }
            .detail-view-active .leaflet-control-container { visibility: hidden !important; opacity: 0 !important; }
            .custom-div-icon { background: none !important; border: none !important; }

            ${theme === 'dark' ? `
                .category-filter-item span, .year-filter-item span, .commander-filter-item span, .filter-item span, .filter-count, .count-badge, [class*="count"], [class*="item"] span:last-child {
                    color: white !important; opacity: 1 !important; -webkit-text-fill-color: white !important;
                }
            ` : ''}

            .clear-filters-floating {
                display: flex !important; position: fixed !important; bottom: 25px !important; left: 20px !important; z-index: 9999 !important;
                background: rgba(255, 255, 255, 0.8) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
                color: #ff4444 !important; border: 1.5px solid #ff4444 !important; padding: 8px 16px !important; border-radius: 20px !important;
                font-weight: 700 !important; font-size: 12px !important; align-items: center !important; justify-content: center !important;
                gap: 6px !important; cursor: pointer !important; pointer-events: auto !important; text-transform: uppercase !important;
            }
        `;
        document.head.appendChild(style);
        return () => { if (document.head.contains(style)) document.head.removeChild(style); };
    }, [theme]);

    const defaultCenter = [48.8566, 2.3522];

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }} className={`animate-fade-in ${selectedSite ? 'detail-view-active' : ''}`}>
            <MapContainer
                center={defaultCenter}
                zoom={5}
                zoomSnap={0.5}
                zoomDelta={0.5}
                style={{ height: '100%', width: '100%', minHeight: '100vh' }}
                zoomControl={false}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
            >
                <TileLayer key={mapStyle} url={TILE_LAYERS[mapStyle]?.url} attribution={TILE_LAYERS[mapStyle]?.attribution} noWrap={true} />
                <ZoomControl position="topright" />
                <LocationMarker />
                <CenterControl />
                <FitFilteredSites />
                <MapEventsHandler />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />

                <MarkerClusterGroup
                    ref={setClusterInstance}
                    key={`cluster-${clusterRadius}`}
                    maxClusterRadius={clusterRadius}
                    eventHandlers={{
                        clusterclick: () => {
                            if (selectedSite) setSelectedSite(null);
                        }
                    }}
                >
                    {sites.map(site => (
                        <Marker
                            key={site.id}
                            position={[site.latitude, site.longitude]}
                            icon={getSiteIcon(site)}
                            eventHandlers={{
                                click: (e) => {
                                    if (e.originalEvent) e.originalEvent.stopPropagation();
                                    if (selectedSite) setSelectedSite(null);
                                    const map = e.target._map;
                                    const latlng = e.target.getLatLng();
                                    const targetPoint = map.project(latlng, map.getZoom());
                                    targetPoint.y -= 150;
                                    const targetLatLng = map.unproject(targetPoint, map.getZoom());
                                    map.panTo(targetLatLng, { animate: true, duration: 0.5 });
                                    e.target.openPopup();
                                }
                            }}
                            ref={(r) => { if (r) markerRefs.current.set(site.id, r); else markerRefs.current.delete(site.id); }}
                        >
                            <Popup autoPan={false} autoPanPadding={[50, 50]} closeButton={false} onClose={() => setSelectedSite(null)}>
                                <div style={{ width: '300px', position: 'relative' }}>
                                    <SiteCard site={site} isCompact={true} hideMapLink={true} onClose={() => {
                                        const marker = markerRefs.current.get(site.id);
                                        if (marker) marker.closePopup();
                                    }} />
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* MODAL DE DETALLE - Improved Pointer Events to allow clicking pins around it */}
            {selectedSite && (
                <div style={{
                    position: 'fixed',
                    top: isMobileLike ? '145px' : '135px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '92%',
                    maxWidth: '400px', // Matches card exactly to reduce click blockage
                    zIndex: 2147483647,
                    pointerEvents: 'none' // Passes all clicks to map by default
                }}>
                    <div
                        className="animate-fade-in"
                        style={{
                            pointerEvents: 'auto', // Re-enables clicks ONLY for the card
                            maxHeight: isMobileLike ? 'calc(100dvh - 180px)' : '75vh',
                            overflowY: 'auto',
                            borderRadius: '12px',
                            scrollbarWidth: 'none'
                        }}
                    >
                        <SiteCard
                            site={selectedSite}
                            onClose={() => setSelectedSite(null)}
                            isCompact={false}
                        />
                    </div>
                </div>
                const liveSite = sites.find(s => s.id === selectedSite.id) || selectedSite;

                return (
                    <div style={{
                        position: 'fixed',
                        top: isMobileLike ? '145px' : '135px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '92%',
                        maxWidth: '400px',
                        zIndex: 2147483647,
                        pointerEvents: 'none'
                    }}>
                        <div
                            className="animate-fade-in"
                            style={{
                                pointerEvents: 'auto',
                                padding: '10px 20px 80px 20px',
                                maxHeight: isMobileLike ? 'calc(100dvh - 160px)' : '80vh',
                                overflowY: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                        >
                            <SiteCard
                                // FIX: Pass the liveSite instead of the stale selectedSite
                                site={liveSite}
                                onClose={() => setSelectedSite(null)}
                                isCompact={false}
                            />
                        </div>
                    </div>
                );
            )}

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