import React, { useMemo, useEffect, useRef } from 'react';
import { ImageOverlay, useMap } from 'react-leaflet';
import { useAppContext, getAvailableSiteMaps } from '../context/AppContext';
import L from 'leaflet';

const OverlayFitter = ({ overlays, siteToOpenPopup, isMobileLike }) => {
    const map = useMap();
    const lastZoomedId = useRef(null);
    
    useEffect(() => {
        if (siteToOpenPopup) return; // Coordinated by PopupOpener
        if (overlays.length > 0) {
            const activeOverlay = overlays[overlays.length - 1];
            if (activeOverlay.bounds && lastZoomedId.current !== activeOverlay.id) {
                lastZoomedId.current = activeOverlay.id;
                const bounds = L.latLngBounds(activeOverlay.bounds);
                const padding = isMobileLike ? [25, 25] : [50, 50];
                const calculatedZoom = map.getBoundsZoom(bounds, false, padding);
                const minZoom = map.getMinZoom() ?? 2.5;
                const maxZoom = map.getMaxZoom() ?? 18;
                const targetZoom = Math.min(maxZoom, Math.max(minZoom, calculatedZoom));
                map.flyTo(bounds.getCenter(), targetZoom, { duration: 0.8 });
            }
        } else {
            lastZoomedId.current = null;
        }
    }, [overlays, map, siteToOpenPopup, isMobileLike]);

    return null;
};

const MapOverlaysLayer = () => {
    const { activeMapOverlays, allSites, siteToOpenPopup, previewDevice } = useAppContext();
    const isMobileLike = previewDevice === 'mobile' || previewDevice === 'tablet';

    const overlaysToRender = useMemo(() => {
        if (!activeMapOverlays || activeMapOverlays.length === 0) return [];
        
        const overlays = [];
        (allSites || []).forEach(site => {
            const maps = getAvailableSiteMaps(site);
            if (maps && maps.length > 0) {
                maps.forEach(map => {
                    if (activeMapOverlays.includes(map.id)) {
                        overlays.push(map);
                    }
                });
            }
        });
        
        return overlays;
    }, [activeMapOverlays, allSites]);

    return (
        <>
            <OverlayFitter overlays={overlaysToRender} siteToOpenPopup={siteToOpenPopup} isMobileLike={isMobileLike} />
            {overlaysToRender.map(map => (
                <ImageOverlay
                    key={map.id}
                    url={map.url}
                    bounds={map.bounds}
                    opacity={map.opacity !== undefined ? map.opacity : 1.0}
                    interactive={false} // Prevent intercepting clicks
                    className="crisp-overlay"
                    pane="overlayPane"
                />
            ))}
        </>
    );
};

export default MapOverlaysLayer;
