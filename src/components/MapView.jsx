import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Marker, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppContext } from '../context/AppContext';
import SiteCard from './SiteCard';
import SiteDetails from './SiteDetails';
import DealsView from './DealsView';
import {
    RemoveDefaultZoom,
    LocationMarker,
    CenterOnSelectedSite,
    SearchControl,
    MapStyleControl,
    DealsControl,
    CenterControl,
    BoundsTracker,
    FitFilteredSites,
    MapOverlaysLayer,
    getSiteIcon,
    TILE_LAYERS,
    CATEGORY_ORDER
} from './MapHelpers'; // Ensure these are imported from your helpers file

const PopupOpener = ({ markerRefs, clusterInstance }) => {
    const { siteToOpenPopup, setSiteToOpenPopup } = useAppContext();
    const map = useMap();

    useEffect(() => {
        if (!siteToOpenPopup || !clusterInstance) return;

        let isCancelled = false;
        let activeTimeout;
        const clusterGroup = clusterInstance;

        const tryOpenPopup = (attempts = 0) => {
            if (isCancelled) return;

            const marker = markerRefs.current.get(siteToOpenPopup.id);
            const isReady = marker && clusterGroup && clusterGroup._map;

            if (!isReady) {
                if (attempts < 150) {
                    activeTimeout = setTimeout(() => tryOpenPopup(attempts + 1), 100);
                } else {
                    setSiteToOpenPopup(null);
                }
                return;
            }

            try {
                if (typeof clusterGroup.zoomToShowLayer === 'function') {
                    // FIX: Push site card well below the menu when flying to it
                    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), {
                        duration: 0.8,
                        paddingTopLeft: [0, 180]
                    });

                    clusterGroup.zoomToShowLayer(marker, () => {
                        if (isCancelled) return;

                        activeTimeout = setTimeout(() => {
                            if (!isCancelled) marker.openPopup();
                        }, 500);
                    });
                } else {
                    map.flyTo(marker.getLatLng(), 16, {
                        duration: 0.8,
                        paddingTopLeft: [0, 180]
                    });
                    activeTimeout = setTimeout(() => {
                        if (!isCancelled) marker.openPopup();
                    }, 500);
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
        sites, allSites, theme, isFiltered, clearAllFilters,
        mapStyle, clusterRadius, activeMapOverlays, clearMapOverlays,
        selectedSite, setSelectedSite, siteToOpenPopup, setSiteToOpenPopup
    } = useAppContext();

    const [showDeals, setShowDeals] = useState(false);
    const markerRefs = useRef(new Map());
    const [clusterInstance, setClusterInstance] = useState(null);

    // FIX: Style Red Button and Foreground Priority
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* 1. Force Popups above menus */
            .leaflet-popup-pane { z-index: 100000 !important; }

            /* 2. Global Red Close Button Style (Applies to both Map and App Modals) */
            a.leaflet-popup-close-button,
            .close-details-btn,
            .site-card-close {
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
                top: 10px !important;
                right: 10px !important;
                z-index: 100001 !important;
                text-decoration: none !important;
            }

            a.leaflet-popup-close-button span {
                color: white !important;
                font-size: 22px !important;
                font-weight: bold !important;
            }

            /* 3. Push UI Menus behind popups */
            .app-header, .filters-group, .mobile-overlay-filters, .category-filters-wrapper {
                z-index: 1000 !important;
            }

            .leaflet-popup-content-wrapper {
                border-radius: 12px !important;
                overflow: hidden !important;
                padding: 0 !important;
            }
        `;
        document.head.appendChild(style);
        return () => { if (document.head.contains(style)) document.head.removeChild(style); };
    }, []);

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
                <TileLayer key={mapStyle} url={TILE_LAYERS[mapStyle].url} attribution={TILE_LAYERS[mapStyle].attribution} />
                <ZoomControl position="topright" />
                <PopupOpener markerRefs={markerRefs} clusterInstance={clusterInstance} />

                <MarkerClusterGroup
                    ref={setClusterInstance}
                    key={`cluster-${clusterRadius}`}
                    maxClusterRadius={clusterRadius}
                >
                    {sites.map(site => {
                        const icon = getSiteIcon(site, theme);
                        return (
                            <Marker
                                key={site.id}
                                position={[site.latitude, site.longitude]}
                                icon={icon}
                                ref={(r) => r ? markerRefs.current.set(site.id, r) : markerRefs.current.delete(site.id)}
                            >
                                <Popup
                                    autoPan={true}
                                    autoPanPadding={[20, 160]}
                                    autoPanOptions={{ duration: 0.5 }}
                                >
                                    <div className="popup-container">
                                        <SiteCard site={site} />
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>

            {/* FULL DETAILS VIEW (The App Modal) */}
            {selectedSite && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 100005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={() => setSelectedSite(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                        {/* SiteDetails component will now inherit the red button style via CSS */}
                        <SiteDetails site={selectedSite} onClose={() => setSelectedSite(null)} />
                    </div>
                </div>
            )}

            {showDeals && <DealsView onClose={() => setShowDeals(false)} />}
        </div>
    );
};

export default MapView;