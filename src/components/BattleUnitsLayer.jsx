import React, { useMemo, useState, useEffect, useContext } from 'react';
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
    // If a specific color is provided (e.g. dark red/maroon for coalition), 
    // use it for fill, border, AND text.

    if (unit.color) {
        return {
            fill: unit.color,
            border: unit.color,
            text: unit.color
        };
    }
    // Otherwise, fallback to the SIDE_COLORS map
    return SIDE_COLORS[unit.side] || SIDE_COLORS.other;
};


// ─── Geometry: rotated rectangle corners ─────────────────────────────────────
// Returns 4 [lat, lng] pairs for a rectangle centred at (lat, lng),
// widthM × heightM metres, rotated angleDeg degrees clockwise from north.
function rotatedRectCorners(lat, lng, widthM, heightM, angleDeg = 0) {
    const hw = widthM / 2;
    const hh = heightM / 2;

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
        // Rotate clockwise by θ
        const rx = x * Math.cos(θ) + y * Math.sin(θ);
        const ry = -x * Math.sin(θ) + y * Math.cos(θ);
        return [lat + ry / mPerLat, lng + rx / mPerLng];
    });
}

// ─── Label divIcon ────────────────────────────────────────────────────────────
// fontSize scales with the map zoom so labels stay readable at any detail level.
function makeLabelIcon(label, textColor, fontSize, rotation = 0) {
    return L.divIcon({
        className: '',
        html: `<div style="
            position: absolute;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            white-space: nowrap;
            pointer-events: none;
        ">
            <span style="
                color: ${textColor};
                font-size: ${fontSize}px;
                font-weight: 100;
                text-shadow: 0 0 2px rgba(255, 255, 255, 1), 0 0 4px rgba(255,255,255,1);
                font-family: Arial, Helvetica, sans-serif;
                letter-spacing: 0.4px;
            ">${label}</span>
        </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
}

// ─── BattleUnitsLayer ─────────────────────────────────────────────────────────
// Renders unit rectangles + labels for every battle whose center falls within
// the current map bounds. Label font size scales with zoom level.
const BattleUnitsLayer = () => {
    const map = useMap();
    const { activeBattleSiteIds } = useAppContext();

    // Track zoom so labels re-render at the right size on every zoom step
    const [zoom, setZoom] = useState(() => map.getZoom());
    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoom', onZoom);
        return () => map.off('zoom', onZoom);
    }, [map]);

    // Font size: 14px at z12, ~18px at z14, ~24px at z16
    const fontSize = Math.max(14, Math.round((zoom - 8) * 3));

    const elements = useMemo(() => {
        if (!activeBattleSiteIds || activeBattleSiteIds.length === 0) return [];

        const bounds = map.getBounds();
        const result = [];

        battleUnitsData.forEach(battle => {
            if (!activeBattleSiteIds.includes(battle.siteId)) return;
            
            const { lat, lng } = battle.battleCenter;
            // Only render battles whose center is in (or near) the viewport
            if (!bounds.pad(0.5).contains([lat, lng])) return;

            battle.units.forEach(unit => {
                const colors = getColors(unit);
                const corners = rotatedRectCorners(
                    unit.lat, unit.lng,
                    unit.widthM, unit.heightM,
                    unit.angleDeg
                );

                // Label handling
                const lLat = unit.labelLat !== undefined ? unit.labelLat : unit.lat;
                const lLng = unit.labelLng !== undefined ? unit.labelLng : unit.lng;
                // If labelLat is provided but labelAngleDeg is not, default to 0 rotation.
                // Otherwise default to unit rotation.
                const lRot = unit.labelAngleDeg !== undefined 
                    ? unit.labelAngleDeg 
                    : (unit.labelLat !== undefined ? 0 : unit.angleDeg);
                
                const labelIcon = unit.label ? makeLabelIcon(unit.label, colors.text, fontSize, lRot) : null;

                // Render based on category
                if (unit.category === 'cavalry') {
                    // Rectangle divided into two triangles
                    // Triangle 1 (Colored): SW(0), NW(3), NE(2)
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
                    // Triangle 2 (White): SW(0), SE(1), NE(2)
                    result.push(
                        <Polygon
                            key={`${unit.id}-tri2`}
                            positions={[corners[0], corners[1], corners[2]]}
                            pathOptions={{
                                color: colors.border,
                                fillColor: '#ffffff',
                                fillOpacity: 0.7,
                                weight: 1.5,
                            }}
                        />
                    );
                } else if (unit.category === 'artillery') {
                    // Square with white circle inside
                    result.push(
                        <Polygon
                            key={`${unit.id}-sq`}
                            positions={corners}
                            pathOptions={{
                                color: colors.border,
                                fillColor: colors.fill,
                                fillOpacity: 0.7,
                                weight: 1.5,
                            }}
                        />
                    );
                    const radiusM = Math.min(unit.widthM, unit.heightM) * 0.35;
                    result.push(
                        <Circle
                            key={`${unit.id}-circ`}
                            center={[unit.lat, unit.lng]}
                            radius={radiusM}
                            pathOptions={{
                                stroke: false,
                                fillColor: '#ffffff',
                                fillOpacity: 0.9,
                            }}
                        />
                    );
                } else {
                    // Infantry (default): Color rectangle
                    result.push(
                        <Polygon
                            key={unit.id}
                            positions={corners}
                            pathOptions={{
                                color: colors.border,
                                fillColor: colors.fill,
                                fillOpacity: 0.55,
                                weight: 1.5,
                            }}
                        />
                    );
                }

                if (labelIcon) {
                    result.push(
                        <Marker
                            key={`${unit.id}-lbl`}
                            position={[lLat, lLng]}
                            icon={labelIcon}
                            interactive={false}
                            zIndexOffset={1000}
                        />
                    );
                }
            });
        });

        return result;
        // zoom is the key dependency — it drives label size and re-filters bounds
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, map, zoom, fontSize]);

    return <>{elements}</>;
};

export default BattleUnitsLayer;
