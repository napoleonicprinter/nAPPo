import React, { useMemo, useState, useEffect } from 'react';
import { Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import battleUnitsData from '../data/battleUnits.json';

// ─── Color by side ───────────────────────────────────────────────────────────
const SIDE_COLORS = {
    french:    { fill: '#1565c0', border: '#0d3f7a', text: '#1565c0' },
    coalition: { fill: '#c62828', border: '#7b1010', text: '#c62828' },
    other:     { fill: '#5d4037', border: '#3e2723', text: '#5d4037' },
};

const getColors = (unit) =>
    unit.color
        ? { fill: unit.color, border: unit.color, text: unit.color }
        : (SIDE_COLORS[unit.side] || SIDE_COLORS.other);

// ─── Geometry: rotated rectangle corners ─────────────────────────────────────
// Returns 4 [lat, lng] pairs for a rectangle centred at (lat, lng),
// widthM × heightM metres, rotated angleDeg degrees clockwise from north.
function rotatedRectCorners(lat, lng, widthM, heightM, angleDeg) {
    const θ = (angleDeg * Math.PI) / 180;
    const hw = widthM  / 2;
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

    return local.map(([x, y]) => {
        // Rotate clockwise by θ
        const rx =  x * Math.cos(θ) + y * Math.sin(θ);
        const ry = -x * Math.sin(θ) + y * Math.cos(θ);
        return [lat + ry / mPerLat, lng + rx / mPerLng];
    });
}

// ─── Label divIcon ────────────────────────────────────────────────────────────
// fontSize scales with the map zoom so labels stay readable at any detail level.
function makeLabelIcon(label, textColor, fontSize) {
    return L.divIcon({
        className: '',
        html: `<span style="
            color: ${textColor};
            font-size: ${fontSize}px;
            font-weight: 700;
            white-space: nowrap;
            text-shadow: 0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7);
            pointer-events: none;
            font-family: Arial, Helvetica, sans-serif;
            letter-spacing: 0.4px;
        ">${label}</span>`,
        iconSize:   [0, 0],
        iconAnchor: [0, fontSize + 2], // keep label just above unit center
    });
}

// ─── BattleUnitsLayer ─────────────────────────────────────────────────────────
// Renders unit rectangles + labels for every battle whose center falls within
// the current map bounds. Label font size scales with zoom level.
const BattleUnitsLayer = ({ visible }) => {
    const map = useMap();

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
        if (!visible) return [];

        const bounds = map.getBounds();
        const result = [];

        battleUnitsData.forEach(battle => {
            const { lat, lng } = battle.battleCenter;
            // Only render battles whose center is in (or near) the viewport
            if (!bounds.pad(0.5).contains([lat, lng])) return;

            battle.units.forEach(unit => {
                const colors  = getColors(unit);
                const corners = rotatedRectCorners(
                    unit.lat, unit.lng,
                    unit.widthM, unit.heightM,
                    unit.angleDeg
                );
                const labelIcon = makeLabelIcon(unit.label, colors.text, fontSize);

                result.push(
                    <Polygon
                        key={unit.id}
                        positions={corners}
                        pathOptions={{
                            color:       colors.border,
                            fillColor:   colors.fill,
                            fillOpacity: 0.55,
                            weight:      1.5,
                        }}
                    />
                );
                result.push(
                    <Marker
                        key={`${unit.id}-lbl`}
                        position={[unit.lat, unit.lng]}
                        icon={labelIcon}
                        interactive={false}
                        zIndexOffset={1000}
                    />
                );
            });
        });

        return result;
    // zoom is the key dependency — it drives label size and re-filters bounds
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, map, zoom, fontSize]);

    return <>{elements}</>;
};

export default BattleUnitsLayer;
