import React, { useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import { useAppContext } from '../context/AppContext';

const MapOverlaysLayer = () => {
    const { activeMapOverlays, allSites } = useAppContext();

    const overlaysToRender = useMemo(() => {
        if (import.meta.env.VITE_ENABLE_BATTLE_MAPS !== 'true') return [];
        if (!activeMapOverlays || activeMapOverlays.length === 0) return [];
        
        const overlays = [];
        allSites.forEach(site => {
            if (site.maps && site.maps.length > 0) {
                site.maps.forEach(map => {
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
            {overlaysToRender.map(map => (
                <ImageOverlay
                    key={map.id}
                    url={map.url}
                    bounds={map.bounds}
                    opacity={map.opacity !== undefined ? map.opacity : 1.0}
                    interactive={false} // Prevent intercepting clicks
                    className="crisp-overlay"
                    pane="tooltipPane"
                />
            ))}
        </>
    );
};

export default MapOverlaysLayer;
