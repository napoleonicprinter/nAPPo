import React, { useMemo, useState, useEffect } from 'react';
import { Polygon, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import battleUnitsData from '../data/battleUnits.json';
import { useAppContext } from '../context/AppContext';

// ─── Color by side ───────────────────────────────────────────────────────────
const SIDE_COLORS = {
    french: { fill: '#1565c0', border: '#0d3f7a', text: '#000000ff' },
    austrian: { fill: '#ffffffff', border: '#595a5aff', text: '#000000ff' },
    russian: { fill: '#2fbb5eff', border: '#0c3118ff', text: '#000000ff' },
    british: { fill: '#c62828', border: '#7b1010', text: '#000000ff' },
    prussian: { fill: '#1e1d1dff', border: '#000000ff', text: '#000000ff' },
    spaniard: { fill: '#0c3b8cff', border: '#062882ff', text: '#000000ff' },
    portuguese: { fill: '#5d4037', border: '#3e2723', text: '#000000ff' },
    napolitan: { fill: '#b5c412ff', border: '#313506ff', text: '#000000ff' },
    other: { fill: '#8b949e', border: '#484f58', text: '#000000ff' }
};

const getColors = (unit) => {
    if (unit.color) {
        return {
            fill: unit.color,
            border: unit.color,
            text: unit.color
        };
    }
    return SIDE_COLORS[unit.side] || SIDE_COLORS.other;
};


// ─── Geometry: rotated rectangle corners ─────────────────────────────────────
function rotatedRectCorners(lat, lng, widthM = 0, heightM = 0, angleDeg = 0) {
    const hw = (widthM || 0) / 2;
    const hh = (heightM || 0) / 2;

    // Unrotated local corners  (x = east, y = north)
    const local = [
        [-hw, -hh],
        [+hw, -hh],
        [+hw, +hh],
        [-hw, +hh],
    ];

    const mPerLat = 111320;
    const mPerLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const θ = (angleDeg * Math.PI) / 180;

    return local.map(([x, y]) => {
        const rx = x * Math.cos(θ) + y * Math.sin(θ);
        const ry = -x * Math.sin(θ) + y * Math.cos(θ);
        return [lat + ry / mPerLat, lng + rx / mPerLng];
    });
}

// ─── Label divIcon ────────────────────────────────────────────────────────────
function makeLabelIcon(label, textColor, fontSize, rotation = 0) {
    return L.divIcon({
        className: '',
        html: `<div style="
            position: absolute;
            transform: translateY(-50%) rotate(${rotation}deg);
            transform-origin: left center;
            color: ${textColor};
            font-size: ${fontSize}px;
            font-weight: bold;
            white-space: nowrap;
            text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff;
            padding-left: 4px;
            pointer-events: none;
        ">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });
}


const BattleUnitsLayer = () => {
    const map = useMap();
    const { activeBattleSiteIds } = useAppContext();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoomend', onZoom);
        return () => map.off('zoomend', onZoom);
    }, [map]);

    const elements = useMemo(() => {
        if (!activeBattleSiteIds || activeBattleSiteIds.length === 0) return [];

        const result = [];

        // Dynamic base sizes based on zoom
        const getBaseFontSize = (zoomLevel) => Math.max(10, Math.round((zoomLevel - 8) * 2.2));

        battleUnitsData.forEach(battle => {
            if (!activeBattleSiteIds.includes(battle.id || battle.siteId)) return;
            
            battle.units.forEach(unit => {
                const colors = getColors(unit);
                const uWidth = unit.widthM || 0;
                const uHeight = unit.heightM || 0;
                
                const corners = rotatedRectCorners(
                    unit.lat, unit.lng,
                    uWidth, uHeight,
                    unit.angleDeg || 0
                );

                // Label handling
                const lLat = unit.labelLat !== undefined ? unit.labelLat : unit.lat;
                const lLng = unit.labelLng !== undefined ? unit.labelLng : unit.lng;
                const lRot = unit.labelAngleDeg !== undefined 
                    ? unit.labelAngleDeg 
                    : (unit.labelLat !== undefined ? 0 : (unit.angleDeg || 0));
                
                // Calculate font size based on labelCategory or individual fontSize
                let unitFontSize;
                const category = (unit.labelCategory || 'unit').toLowerCase();
                const maxZoom = map.getMaxZoom() || 18;

                // Visibility logic based on category and zoom levels relative to max zoom
                let isLabelVisible = true;
                if (category === 'unit') {
                    isLabelVisible = zoom >= (maxZoom - 3); // Top 4 levels (e.g. 15, 16, 17, 18)
                } else if (category === 'division') {
                    isLabelVisible = zoom >= (maxZoom - 5); // Top 6 levels (e.g. 13, 14, 15, 16, 17, 18)
                }
                // Army is always visible

                if (unit.fontSize) {
                    // If individual fontSize is provided, we can still make it somewhat dynamic 
                    // by treating it as a base at zoom 15
                    unitFontSize = Math.round(unit.fontSize * (zoom / 15));
                } else {
                    const base = getBaseFontSize(zoom);
                    
                    if (category === 'army') {
                        unitFontSize = Math.round(base * 1.6);
                    } else if (category === 'division') {
                        unitFontSize = Math.round(base * 1.3);
                    } else {
                        // 'unit' or default
                        unitFontSize = base;
                    }
                }
                
                const labelIcon = (unit.label && isLabelVisible) 
                    ? makeLabelIcon(unit.label, colors.text, unitFontSize, lRot) 
                    : null;

                // Only render the shape if width or height is greater than 0
                if (uWidth > 0 || uHeight > 0) {

                if (unit.category === 'cavalry') {
                    result.push(
                        <Polygon
                            key={`${unit.id}-tri1`}
                            positions={[corners[0], corners[3], corners[2]]}
                            pathOptions={{
                                color: colors.border,
                                fillColor: colors.fill,
                                fillOpacity: 0.7,
                                weight: 1.5,
                            }}
                        />
                    );
                    result.push(
                        <Polygon
                            key={`${unit.id}-tri2`}
                            positions={[corners[0], corners[1], corners[2]]}
                            pathOptions={{
                                color: colors.border,
                                fillColor: '#ffffff',
                                fillOpacity: 0.4,
                                weight: 1.5,
                            }}
                        />
                    );
                } else if (unit.category === 'artillery') {
                    result.push(
                        <Polygon
                            key={`${unit.id}-art-bg`}
                            positions={corners}
                            pathOptions={{
                                color: colors.border,
                                fillColor: colors.fill,
                                fillOpacity: 0.8,
                                weight: 1.5,
                            }}
                        />
                    );
                    const innerRadius = Math.min(uWidth, uHeight) * 0.35;
                    result.push(
                        <Circle
                            key={`${unit.id}-art-circle`}
                            center={[unit.lat, unit.lng]}
                            radius={innerRadius}
                            pathOptions={{
                                color: 'transparent',
                                fillColor: '#ffffff',
                                fillOpacity: 1.0,
                                weight: 0
                            }}
                        />
                    );
                } else {
                    result.push(
                        <Polygon
                            key={`${unit.id}-rect`}
                            positions={corners}
                            pathOptions={{
                                color: colors.border,
                                fillColor: colors.fill,
                                fillOpacity: 0.7,
                                weight: 1.5,
                            }}
                        />
                    );
                }
            }

            if (labelIcon) {
                    result.push(
                        <Marker
                            key={`${unit.id}-label`}
                            position={[lLat, lLng]}
                            icon={labelIcon}
                            interactive={false}
                        />
                    );
                }
            });
        });

        return result;
    }, [activeBattleSiteIds, zoom, map]);

    return <>{elements}</>;
};

export default BattleUnitsLayer;
