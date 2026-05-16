import React, { useMemo, useState, useEffect } from 'react';
import { Polygon, Marker, useMap, Circle, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
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
    napolitan: { fill: '#FFE419', border: '#313506ff', text: '#000000ff' },
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

// ─── Arrow Geometry ──────────────────────────────────────────────────────────
function generateArrowPoints(type, w, l) {
    const normalizedType = type ? type.toLowerCase().replace(/\s+/g, '-') : 'straight';
    const stemWidth = w * 0.45;
    const headWidth = w;
    const headLength = Math.min(l * 0.35, w * 0.8);
    const stemLength = l - headLength;

    const path = [];
    if (normalizedType === 'straight') {
        path.push([0, 0], [0, stemLength]);
    } else {
        const p0 = [0, 0];
        const p1 = [0, stemLength * 0.6];

        let targetX, targetY;
        if (normalizedType === 'left') {
            targetX = -stemLength * 0.3;
            targetY = stemLength * 0.9;
        } else if (normalizedType === 'left-sharp') {
            targetX = -stemLength * 0.6;
            targetY = stemLength * 0.6;
        } else if (normalizedType === 'right') {
            targetX = stemLength * 0.3;
            targetY = stemLength * 0.9;
        } else if (normalizedType === 'right-sharp') {
            targetX = stemLength * 0.6;
            targetY = stemLength * 0.6;
        } else {
            targetX = 0;
            targetY = stemLength;
        }
        const p2 = [targetX, targetY];

        // Quadratic Bezier for smoothness
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
            const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
            path.push([x, y]);
        }
    }

    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < path.length; i++) {
        const p = path[i];
        let dx, dy;
        if (i < path.length - 1) {
            const next = path[i + 1];
            const mag = Math.sqrt((next[0] - p[0]) ** 2 + (next[1] - p[1]) ** 2) || 1;
            dx = (next[0] - p[0]) / mag;
            dy = (next[1] - p[1]) / mag;
        } else {
            const prev = path[i - 1];
            const mag = Math.sqrt((p[0] - prev[0]) ** 2 + (p[1] - prev[1]) ** 2) || 1;
            dx = (p[0] - prev[0]) / mag;
            dy = (p[1] - prev[1]) / mag;
        }

        const nx = -dy;
        const ny = dx;

        leftSide.push([p[0] + nx * stemWidth / 2, p[1] + ny * stemWidth / 2]);
        rightSide.unshift([p[0] - nx * stemWidth / 2, p[1] - ny * stemWidth / 2]);
    }

    const lastP = path[path.length - 1];
    const prevP = path[path.length - 2] || [lastP[0], lastP[1] - 1];
    const mag = Math.sqrt((lastP[0] - prevP[0]) ** 2 + (lastP[1] - prevP[1]) ** 2) || 1;
    const dirX = (lastP[0] - prevP[0]) / mag;
    const dirY = (lastP[1] - prevP[1]) / mag;
    const normX = -dirY;
    const normY = dirX;

    const headBaseLeft = [lastP[0] + normX * headWidth / 2, lastP[1] + normY * headWidth / 2];
    const headBaseRight = [lastP[0] - normX * headWidth / 2, lastP[1] - normY * headWidth / 2];
    const headTip = [lastP[0] + dirX * headLength, lastP[1] + dirY * headLength];

    return [...leftSide, headBaseLeft, headTip, headBaseRight, ...rightSide];
}

function rotatedArrowPoints(lat, lng, type, widthM, heightM, angleDeg) {
    const points = generateArrowPoints(type, widthM, heightM);

    const mPerLat = 111320;
    const mPerLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const θ = (angleDeg * Math.PI) / 180;

    return points.map(([x, y]) => {
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
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            transform-origin: center center;
            color: ${textColor};
            font-size: ${fontSize}px;
            font-weight: bold;
            white-space: nowrap;
            text-align: center;
            text-shadow: 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff;
            pointer-events: none;
        ">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });
}


const BattleUnitsLayer = () => {
    const map = useMap();
    const { activeBattleSiteIds, battleUnitsData } = useAppContext();
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
        // Dynamic base sizes based on zoom - using a slightly more aggressive scaling
        // to keep labels readable as units grow in pixel size
        const getBaseFontSize = (zoomLevel) => {
            const base = 14;
            if (zoomLevel <= 13) return Math.max(10, zoomLevel - 3);
            // Above 13, scale more significantly
            return Math.round(base * Math.pow(1.15, zoomLevel - 14));
        };

        battleUnitsData.forEach(battle => {
            // A battle is active if its specific ID is active, or if it doesn't have an ID and its site ID is active
            const isBattleActive = activeBattleSiteIds.includes(battle.id) || (!battle.id && activeBattleSiteIds.includes(battle.siteId));

            battle.units.forEach(unit => {
                // Check if the unit is explicitly shared with any of the currently active phases
                const isUnitActiveInOtherPhase = Boolean(unit.phases && Array.isArray(unit.phases) && unit.phases.some(p => activeBattleSiteIds.includes(p)));
                
                // If the unit's parent battle is not active, AND the unit is not explicitly shared with an active phase, skip it.
                if (!isBattleActive && !isUnitActiveInOtherPhase) {
                    return;
                }
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
                    if (unit.category === 'army') {
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-army-bg`}
                                positions={corners}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: colors.fill,
                                    fillOpacity: 0.7,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                        result.push(
                            <Polyline
                                key={`${battle.id}-${unit.id}-army-x1`}
                                positions={[corners[0], corners[2]]}
                                pathOptions={{
                                    color: colors.border,
                                    weight: 1.5,
                                }}
                                interactive={false}
                            />
                        );
                        result.push(
                            <Polyline
                                key={`${battle.id}-${unit.id}-army-x2`}
                                positions={[corners[1], corners[3]]}
                                pathOptions={{
                                    color: colors.border,
                                    weight: 1.5,
                                }}
                                interactive={false}
                            />
                        );
                    } else if (unit.category === 'arrow') {
                        const aWidth = unit.widthM || unit.width || 100;
                        const aLength = unit.longitud || unit.heightM || 200;
                        const arrowCoords = rotatedArrowPoints(
                            unit.lat, unit.lng,
                            unit.type || 'straight',
                            aWidth, aLength,
                            unit.angleDeg || 0
                        );
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-arrow`}
                                positions={arrowCoords}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: colors.fill,
                                    fillOpacity: 0.8,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                    } else if (unit.category === 'cavalry') {
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-tri1`}
                                positions={[corners[0], corners[3], corners[2]]}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: colors.fill,
                                    fillOpacity: 0.7,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-tri2`}
                                positions={[corners[0], corners[1], corners[2]]}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: '#ffffff',
                                    fillOpacity: 0.4,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                    } else if (unit.category === 'artillery') {
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-art-bg`}
                                positions={corners}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: colors.fill,
                                    fillOpacity: 0.8,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                        const innerRadius = Math.min(uWidth, uHeight) * 0.35;
                        result.push(
                            <Circle
                                key={`${battle.id}-${unit.id}-art-circle`}
                                center={[unit.lat, unit.lng]}
                                radius={innerRadius}
                                pathOptions={{
                                    color: 'transparent',
                                    fillColor: '#ffffff',
                                    fillOpacity: 1.0,
                                    weight: 0
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Circle>
                        );
                    } else {
                        result.push(
                            <Polygon
                                key={`${battle.id}-${unit.id}-rect`}
                                positions={corners}
                                pathOptions={{
                                    color: colors.border,
                                    fillColor: colors.fill,
                                    fillOpacity: 0.7,
                                    weight: 1.5,
                                }}
                            >
                                <Tooltip sticky>{unit.id}</Tooltip>
                            </Polygon>
                        );
                    }
                }

            if (labelIcon) {
                result.push(
                    <Marker
                        key={`${battle.id}-${unit.id}-label`}
                        position={[lLat, lLng]}
                        icon={labelIcon}
                        interactive={false}
                    />
                );
            }
        });
    });

    return result;
}, [activeBattleSiteIds, zoom, map, battleUnitsData]);

return <>{elements}</>;
};

export default BattleUnitsLayer;
