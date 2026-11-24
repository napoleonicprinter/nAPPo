import React, { useState } from 'react';
import {
    MapPin, Calendar, BookOpen, Globe, Youtube, ExternalLink,
    Swords, Link2, X, Layers, Flower2, User, Shield, Anchor,
    Users, Skull, AlertCircle, Crosshair, Landmark, FileText
} from 'lucide-react';
import { useAppContext, getAvailableSiteMaps } from '../context/AppContext';
import { handleImageFallback } from '../utils/imageUtils';
import { validateSiteFilters } from '../utils/filterValidation';
import NavErrorModal from './NavErrorModal';

export const normalizeServiceSheetType = (rawType) => {
    if (!rawType) return 'Service Sheet';
    const t = String(rawType).trim();
    const lower = t.toLowerCase();
    if (lower === 'ship' || lower === 'ships') return 'Ship';
    if (lower === 'regiment' || lower === 'regiments') return 'Regiment';
    if (lower === 'commander' || lower === 'commanders' || lower === 'captain' || lower === 'captains') return 'Commander';
    return t.charAt(0).toUpperCase() + t.slice(1);
};

export const getServiceSheetTypeColor = (rawType) => {
    const type = normalizeServiceSheetType(rawType);
    const colors = {
        'Ship': '#0288d1',
        'Regiment': '#d32f2f',
        'Commander': '#d97706',
    };
    return colors[type] || '#5c6bc0';
};

const getOnlineReadings = (sheet) => {
    if (!sheet) return [];
    const raw = sheet.online_reading || sheet.online_readings || sheet.reading_links || sheet.reading_link;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map((item) => {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            return trimmed ? { title: 'On-line reading', link: trimmed } : null;
        } else if (item && typeof item === 'object') {
            const link = (item.link || item.url || '').trim();
            if (!link) return null;
            return {
                title: item.title || item.name || item.book_title || item.label || 'On-line reading',
                link
            };
        }
        return null;
    }).filter(Boolean);
};

const formatCasualties = (marker) => {
    if (!marker) return null;
    const cas = marker.casualties;
    if (typeof cas === 'string' && cas.trim() !== '') {
        return cas.trim();
    }
    const dead = cas?.dead ?? cas?.killed ?? marker.dead ?? marker.killed;
    const wounded = cas?.wounded ?? marker.wounded;
    const missing = cas?.missing ?? marker.missing;
    const captured = cas?.captured ?? marker.captured;
    const total = cas?.total ?? marker.total_casualties;

    const parts = [];
    if (dead !== undefined && dead !== null && String(dead) !== '') parts.push(`Dead: ${dead}`);
    if (wounded !== undefined && wounded !== null && String(wounded) !== '') parts.push(`Wounded: ${wounded}`);
    if (missing !== undefined && missing !== null && String(missing) !== '') parts.push(`Missing: ${missing}`);
    if (captured !== undefined && captured !== null && String(captured) !== '') parts.push(`Captured: ${captured}`);
    if (parts.length === 0 && total !== undefined && total !== null && String(total) !== '') {
        parts.push(`Total: ${total}`);
    }
    return parts.length > 0 ? parts.join(' • ') : null;
};

const ServiceSheetCard = ({ sheet, marker = null, onClose, isCompact = false, showImage = true }) => {
    const {
        locationMode,
        userCoords,
        filterRadius, setFilterRadius,
        filterCategory, setFilterCategory,
        filterYear, setFilterYear,
        filterCommander, setFilterCommander,
        filterCountry, setFilterCountry,
        filterCoalition, setFilterCoalition,
        filterCampaign, setFilterCampaign,
        filterContributor, setFilterContributor,
        showArcOnly, setShowArcOnly,
        filterSignificance, setFilterSignificance,
        filterVisited, setFilterVisited,
        filterWithMaps, setFilterWithMaps,
        showOnlyNew, setShowOnlyNew,
        filterSearch, setFilterSearch,
        view, setView,
        setSiteToOpenPopup,
        allSites,
        setSelectedSite,
        setCallerSite,
        activeMapOverlays,
        enableMapOverlay,
        serviceSheets,
        setSelectedServiceSheet,
        setServiceSheetMarkerToOpen,
        callerServiceSheet,
        setCallerServiceSheet,
        setShowServiceSheetsModal
    } = useAppContext();

    const [navErrorModal, setNavErrorModal] = useState(null);

    if (!sheet) return null;

    const normalizedType = normalizeServiceSheetType(sheet.type || sheet.category);
    const typeColor = getServiceSheetTypeColor(normalizedType);
    const flowerLink = sheet.flower_link || sheet.flower_url || sheet.leave_a_flower;

    const filterContext = {
        locationMode, userCoords,
        filterRadius, setFilterRadius,
        filterCategory, setFilterCategory,
        filterYear, setFilterYear,
        filterCommander, setFilterCommander,
        filterCountry, setFilterCountry,
        filterCoalition, setFilterCoalition,
        filterCampaign, setFilterCampaign,
        filterContributor, setFilterContributor,
        showArcOnly, setShowArcOnly,
        filterSignificance, setFilterSignificance,
        filterVisited, setFilterVisited,
        filterWithMaps, setFilterWithMaps,
        showOnlyNew, setShowOnlyNew,
        filterSearch, setFilterSearch
    };

    const resolveLinkedServiceSheet = (targetId, targetName) => {
        if (!Array.isArray(serviceSheets)) return null;
        if (targetId) {
            const byId = serviceSheets.find(s => String(s.id).trim() === String(targetId).trim());
            if (byId) return byId;
        }
        if (targetName) {
            const clean = String(targetName).trim().toLowerCase();
            return serviceSheets.find(s => String(s.name || '').trim().toLowerCase() === clean) || null;
        }
        return null;
    };

    const resolveBattleName = (m) => {
        if (!m) return '';
        if (m.battle_name || m.battle) return m.battle_name || m.battle;
        if (m.battle_id && Array.isArray(allSites)) {
            const found = allSites.find(s => String(s.id).trim() === String(m.battle_id).trim());
            if (found) return found.name;
        }
        return 'Battle Location';
    };

    const handleNavigateToSite = (targetSite) => {
        if (!targetSite) return;
        const validation = validateSiteFilters(targetSite, filterContext);
        if (!validation.passed) {
            setNavErrorModal(validation.errorData);
            return;
        }
        setCallerSite({
            id: `service-sheet-${sheet.id}`,
            name: sheet.name,
            fromServiceSheet: sheet,
            fromView: view || 'map'
        });
        setSelectedServiceSheet(null);
        setSelectedSite(null);
        setSiteToOpenPopup(null);
        setTimeout(() => {
            setSiteToOpenPopup(targetSite);
            setView('map');
        }, 20);
    };

    const handleResetAndView = (targetSite) => {
        setNavErrorModal(null);
        setCallerSite({
            id: `service-sheet-${sheet.id}`,
            name: sheet.name,
            fromServiceSheet: sheet,
            fromView: view || 'map'
        });
        setSelectedServiceSheet(null);
        setSelectedSite(null);
        setSiteToOpenPopup(null);
        setTimeout(() => {
            setSiteToOpenPopup(targetSite);
            setView('map');
        }, 20);
    };

    const handleJumpToMarker = (targetMarker) => {
        if (!targetMarker) return;
        let mapId = targetMarker.map_id || targetMarker.mapId;
        let battleSite = null;
        if (targetMarker.battle_id && Array.isArray(allSites)) {
            battleSite = allSites.find(s => String(s.id).trim() === String(targetMarker.battle_id).trim());
            if (!mapId && battleSite) {
                const siteMaps = getAvailableSiteMaps(battleSite);
                if (siteMaps && siteMaps.length > 0) {
                    mapId = siteMaps[0].id;
                }
            }
        }
        if (!mapId && battleSite) {
            handleNavigateToSite(battleSite);
            return;
        }
        if (mapId && enableMapOverlay) {
            enableMapOverlay(mapId);
        }
        setSelectedServiceSheet(null);
        setSelectedSite(null);
        setSiteToOpenPopup(null);
        if (setShowServiceSheetsModal) setShowServiceSheetsModal(false);
        setTimeout(() => {
            setServiceSheetMarkerToOpen({
                sheetId: sheet.id,
                markerId: targetMarker.id,
                latitude: Number(targetMarker.latitude),
                longitude: Number(targetMarker.longitude),
                mapId: mapId || null
            });
            setView('map');
        }, 30);
    };

    const handleOpenLinkedServiceSheet = (targetSheet) => {
        if (!targetSheet) return;
        setCallerServiceSheet({
            sheet,
            marker,
            fromCompactPopup: isCompact
        });
        setSelectedSite(null);
        setSelectedServiceSheet(targetSheet);
    };

    const strengthText = marker ? (marker.strength || marker.strengh || '') : '';
    const casualtiesText = formatCasualties(marker);
    const damageText = marker?.damage || '';
    const roleText = marker?.role || marker?.position || '';
    const notesText = marker?.notes || marker?.description || '';

    const captainName = marker?.captain || marker?.captain_name || '';
    const captainSheet = resolveLinkedServiceSheet(marker?.captain_id, captainName);

    const commanderName = marker?.commander || marker?.commander_name || '';
    const commanderSheet = resolveLinkedServiceSheet(marker?.commander_id, commanderName);

    const brigadeText = marker?.brigade || sheet?.brigade || '';
    const brigadeSheet = resolveLinkedServiceSheet(marker?.brigade_id, brigadeText);

    const divisionText = marker?.division || sheet?.division || '';
    const divisionSheet = resolveLinkedServiceSheet(marker?.division_id, divisionText);

    const corpText = marker?.corp || marker?.corps || sheet?.corp || sheet?.corps || '';
    const corpSheet = resolveLinkedServiceSheet(marker?.corp_id || marker?.corps_id, corpText);

    const cincName = marker?.commander_in_chief || marker?.c_in_c || marker?.cinc || sheet?.commander_in_chief || sheet?.c_in_c || '';
    const cincSheet = resolveLinkedServiceSheet(marker?.commander_in_chief_id || marker?.c_in_c_id || marker?.cinc_id, cincName);

    const battleName = marker ? resolveBattleName(marker) : '';
    const battleDate = marker?.date || sheet.date || sheet.years || '';
    const displayImage = (marker && marker.image) ? marker.image : sheet.image;

    // Resolve Birthplace & Grave sites for Commanders (or any sheet specifying them)
    const resolveSiteRef = (rawRef) => {
        if (!rawRef || !Array.isArray(allSites)) return null;
        const targetId = typeof rawRef === 'object' ? (rawRef.id || rawRef.siteId) : rawRef;
        if (!targetId || String(targetId).trim() === '') return null;
        const siteObj = allSites.find(s => String(s.id).trim() === String(targetId).trim());
        const customTitle = typeof rawRef === 'object' ? (rawRef.title || rawRef.name || rawRef.label) : null;
        return siteObj ? { site: siteObj, label: customTitle || siteObj.name } : null;
    };

    const birthplaceRef = resolveSiteRef(sheet.birthplace_id || sheet.birthplace);
    const graveRef = resolveSiteRef(sheet.grave_id || sheet.grave || sheet.grave_site_id);

    const relatedList = Array.isArray(sheet.related_sites)
        ? sheet.related_sites
        : Array.isArray(sheet.relatedSites)
            ? sheet.relatedSites
            : Array.isArray(sheet.related)
                ? sheet.related
                : [];

    return (
        <>
            {navErrorModal && (
                <NavErrorModal
                    errorData={navErrorModal}
                    onClose={() => setNavErrorModal(null)}
                    onResetAndView={handleResetAndView}
                />
            )}

            <div className={`site-card ${!showImage || !displayImage ? 'no-image-card' : ''}`} style={{ position: 'relative' }}>
                {onClose && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCompact && setCallerServiceSheet) setCallerServiceSheet(null);
                            onClose();
                        }}
                        className="modal-close-btn close-details-btn"
                        title="Close"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 100001
                        }}
                    >
                        <X size={18} strokeWidth={2.5} color="white" />
                    </button>
                )}

                {showImage && displayImage ? (
                    <div className="card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                        <img
                            src={displayImage}
                            alt={sheet.name}
                            className="card-image"
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: isCompact ? '150px' : '210px', objectFit: 'cover' }}
                            onError={(e) => handleImageFallback(e, displayImage)}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            zIndex: 15,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.72)',
                                backdropFilter: 'blur(4px)',
                                color: '#fff',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase'
                            }}>
                                Service Sheet
                            </span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                            <span className="badge" style={{
                                backgroundColor: typeColor,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {normalizedType}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="card-no-image-header" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 44px 4px 12px',
                        gap: '8px'
                    }}>
                        <span style={{
                            backgroundColor: 'rgba(128, 128, 128, 0.18)',
                            color: 'var(--text-primary)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            Service Sheet
                        </span>
                        <span className="badge" style={{
                            backgroundColor: typeColor,
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {normalizedType}
                        </span>
                    </div>
                )}

                <div className="card-content" style={{
                    padding: '12px',
                    maxHeight: isCompact ? '320px' : '380px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {/* Back Button in Detail Window */}
                    {!isCompact && callerServiceSheet && (
                        <div style={{ marginBottom: '8px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const prev = callerServiceSheet;
                                    setCallerServiceSheet(null);
                                    if (prev.fromModal) {
                                        setSelectedServiceSheet(null);
                                        if (setShowServiceSheetsModal) setShowServiceSheetsModal(true);
                                    } else if (prev.fromCompactPopup) {
                                        setSelectedServiceSheet(null);
                                    } else if (prev.sheet) {
                                        setSelectedServiceSheet(prev.sheet);
                                    }
                                }}
                                style={{
                                    border: '1px solid var(--accent-primary, #58a6ff)',
                                    background: 'rgba(88, 166, 255, 0.15)',
                                    color: 'var(--accent-primary, #58a6ff)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {callerServiceSheet.fromModal
                                    ? '← Back to Service Sheets'
                                    : `← Back to ${callerServiceSheet.sheet?.name || 'Map Leaflet'}`}
                            </button>
                        </div>
                    )}

                    <h2 style={{ fontSize: '1.05rem', margin: '0 0 4px 0', lineHeight: 1.25 }}>{sheet.name}</h2>

                    {(sheet.subtitle || sheet.rank || sheet.class) && (
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary, #58a6ff)', marginBottom: '6px' }}>
                            {sheet.subtitle || sheet.rank || sheet.class}
                        </div>
                    )}

                    {/* Meta row: Country / Date / Details button */}
                    <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {(sheet.country || sheet.allegiance) && (
                                <span style={{ fontSize: '0.8rem', color: 'gray', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={13} />
                                    {sheet.country || sheet.allegiance}
                                </span>
                            )}
                            {battleDate && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <Calendar size={13} />
                                    {battleDate}
                                </span>
                            )}
                        </div>

                        {isCompact && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCallerServiceSheet(marker ? { sheet, marker, fromCompactPopup: true } : null);
                                    setSelectedSite(null);
                                    setSelectedServiceSheet(sheet);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--accent-primary, #58a6ff)',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    padding: 0
                                }}
                            >
                                Details &rarr;
                            </button>
                        )}
                    </div>

                    {/* COMPACT LEAFLET: Battle/Location Specific Details */}
                    {isCompact && marker && (
                        <div style={{
                            backgroundColor: 'rgba(128, 128, 128, 0.1)',
                            border: '1px solid var(--border-color, rgba(128, 128, 128, 0.25))',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            fontSize: '0.82rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            {battleName && (
                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
                                    <Swords size={14} style={{ color: '#ef5350', flexShrink: 0 }} />
                                    <span>{battleName}</span>
                                </div>
                            )}

                            {roleText && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <Crosshair size={13} style={{ marginTop: '2px', flexShrink: 0, color: '#888' }} />
                                    <div><strong>Role:</strong> {roleText}</div>
                                </div>
                            )}

                            {strengthText && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <Users size={13} style={{ marginTop: '2px', flexShrink: 0, color: '#4caf50' }} />
                                    <div><strong>Strength:</strong> {strengthText}</div>
                                </div>
                            )}

                            {casualtiesText && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <Skull size={13} style={{ marginTop: '2px', flexShrink: 0, color: '#ef5350' }} />
                                    <div><strong>Casualties:</strong> {casualtiesText}</div>
                                </div>
                            )}

                            {damageText && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                    <AlertCircle size={13} style={{ marginTop: '2px', flexShrink: 0, color: '#ff9800' }} />
                                    <div><strong>Damage:</strong> {damageText}</div>
                                </div>
                            )}

                            {captainName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <Anchor size={13} style={{ flexShrink: 0, color: '#0288d1' }} />
                                    <span><strong>{normalizedType === 'Commander' ? 'Unit / Ship:' : 'Captain:'}</strong></span>
                                    {captainSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(captainSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {captainName}
                                        </button>
                                    ) : (
                                        <span>{captainName}</span>
                                    )}
                                </div>
                            )}

                            {commanderName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <Shield size={13} style={{ flexShrink: 0, color: '#d97706' }} />
                                    <span><strong>Commander:</strong></span>
                                    {commanderSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(commanderSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {commanderName}
                                        </button>
                                    ) : (
                                        <span>{commanderName}</span>
                                    )}
                                </div>
                            )}

                            {brigadeText && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <Shield size={13} style={{ flexShrink: 0, color: '#8b949e' }} />
                                    <span><strong>Brigade:</strong></span>
                                    {brigadeSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(brigadeSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {brigadeText}
                                        </button>
                                    ) : (
                                        <span>{brigadeText}</span>
                                    )}
                                </div>
                            )}

                            {divisionText && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <Layers size={13} style={{ flexShrink: 0, color: '#8b949e' }} />
                                    <span><strong>Division:</strong></span>
                                    {divisionSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(divisionSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {divisionText}
                                        </button>
                                    ) : (
                                        <span>{divisionText}</span>
                                    )}
                                </div>
                            )}

                            {corpText && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <Swords size={13} style={{ flexShrink: 0, color: '#8b949e' }} />
                                    <span><strong>Corp:</strong></span>
                                    {corpSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(corpSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {corpText}
                                        </button>
                                    ) : (
                                        <span>{corpText}</span>
                                    )}
                                </div>
                            )}

                            {cincName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <User size={13} style={{ flexShrink: 0, color: '#d97706' }} />
                                    <span title="Commander in Chief"><strong>C-in-C:</strong></span>
                                    {cincSheet ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenLinkedServiceSheet(cincSheet);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            {cincName}
                                        </button>
                                    ) : (
                                        <span>{cincName}</span>
                                    )}
                                </div>
                            )}

                            {notesText && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #888)', marginTop: '2px', fontStyle: 'italic' }}>
                                    {notesText}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FULL DETAIL WINDOW */}
                    {!isCompact && (
                        <>
                            {sheet.description && (
                                <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.45', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    {sheet.description}
                                </div>
                            )}

                            <div className="card-external-links" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid rgba(128,128,128,0.2)'
                            }}>
                                {/* External Icon Links */}
                                {(sheet.wikipedia_link || sheet.site_link || sheet.more_info_link || sheet.moreInfo || sheet.link || sheet.youtube_link) && (
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        {sheet.wikipedia_link && sheet.wikipedia_link.trim() !== '' && (
                                            <a href={sheet.wikipedia_link} target="_blank" rel="noreferrer" title="Wikipedia" style={{ color: '#666' }}>
                                                <BookOpen size={22} />
                                            </a>
                                        )}
                                        {sheet.site_link && sheet.site_link.trim() !== '' && (
                                            <a href={sheet.site_link} target="_blank" rel="noreferrer" title="Official Site" style={{ color: '#666' }}>
                                                <Globe size={22} />
                                            </a>
                                        )}
                                        {sheet.more_info_link && sheet.more_info_link.trim() !== '' && (
                                            <a href={sheet.more_info_link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                                <ExternalLink size={22} />
                                            </a>
                                        )}
                                        {sheet.moreInfo && sheet.moreInfo.trim() !== '' && sheet.moreInfo !== sheet.more_info_link && (
                                            <a href={sheet.moreInfo} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                                <ExternalLink size={22} />
                                            </a>
                                        )}
                                        {sheet.link && sheet.link.trim() !== '' && sheet.link !== sheet.site_link && sheet.link !== sheet.wikipedia_link && sheet.link !== sheet.more_info_link && sheet.link !== sheet.moreInfo && (
                                            <a href={sheet.link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                                <ExternalLink size={22} />
                                            </a>
                                        )}
                                        {sheet.youtube_link && sheet.youtube_link.trim() !== '' && (
                                            <a href={sheet.youtube_link} target="_blank" rel="noreferrer" title="YouTube Video" style={{ color: '#ff0000' }}>
                                                <Youtube size={22} />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {flowerLink && flowerLink.trim() !== '' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                        <Flower2 size={18} style={{ color: '#e91e63', flexShrink: 0 }} />
                                        <a
                                            href={flowerLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            Leave a flower
                                            <ExternalLink size={12} style={{ opacity: 0.7 }} />
                                        </a>
                                    </div>
                                )}

                                {/* BATTLE MARKERS LINKS (with Battle Name as link title) */}
                                {Array.isArray(sheet.markers) && sheet.markers.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px',
                                        paddingTop: '4px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                            <Swords size={17} style={{ color: '#ef5350', flexShrink: 0 }} />
                                            <span>Battles ({sheet.markers.length}):</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '23px' }}>
                                            {sheet.markers.map((m, idx) => {
                                                const bName = resolveBattleName(m);
                                                return (
                                                    <button
                                                        key={m.id || idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleJumpToMarker(m);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'none',
                                                            padding: 0,
                                                            textAlign: 'left',
                                                            color: 'var(--accent-primary, #58a6ff)',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'underline',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}
                                                        title={`Locate ${sheet.name} at ${bName}`}
                                                    >
                                                        <span>{bName}</span>
                                                        {m.date && (
                                                            <span style={{ fontSize: '0.75rem', color: 'gray', fontWeight: 'normal', textDecoration: 'none' }}>
                                                                ({m.date})
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* BIRTHPLACE & GRAVE LINKS (for Captains / Commanders) */}
                                {(birthplaceRef || graveRef) && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        paddingTop: '4px'
                                    }}>
                                        {birthplaceRef && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                <Landmark size={17} style={{ color: '#ffb300', flexShrink: 0 }} />
                                                <span style={{ fontWeight: '600' }}>Birthplace:</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNavigateToSite(birthplaceRef.site);
                                                    }}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        padding: 0,
                                                        textAlign: 'left',
                                                        color: 'var(--accent-primary, #58a6ff)',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    {birthplaceRef.label}
                                                </button>
                                            </div>
                                        )}
                                        {graveRef && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                <Landmark size={17} style={{ color: '#607d8b', flexShrink: 0 }} />
                                                <span style={{ fontWeight: '600' }}>Grave site:</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNavigateToSite(graveRef.site);
                                                    }}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        padding: 0,
                                                        textAlign: 'left',
                                                        color: 'var(--accent-primary, #58a6ff)',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    {graveRef.label}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* RELATED SITES SECTION (for Commanders, Ships, Regiments, etc.) */}
                                {relatedList.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)',
                                        paddingTop: '4px'
                                    }}>
                                        <Link2 size={18} style={{ color: '#666', flexShrink: 0, marginTop: '2px' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                            <span style={{ fontWeight: '600' }}>Related sites:</span>
                                            {relatedList.map((relItem, idx) => {
                                                // Support linking either to a site in sites.json or another Service Sheet
                                                const sheetTargetId = typeof relItem === 'object' ? (relItem.service_sheet_id || relItem.serviceSheetId) : null;
                                                if (sheetTargetId) {
                                                    const linkedSheet = resolveLinkedServiceSheet(sheetTargetId, null);
                                                    const label = relItem.title || relItem.name || linkedSheet?.name || sheetTargetId;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (linkedSheet) handleOpenLinkedServiceSheet(linkedSheet);
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'none',
                                                                padding: 0,
                                                                textAlign: 'left',
                                                                color: 'var(--accent-primary, #58a6ff)',
                                                                cursor: linkedSheet ? 'pointer' : 'default',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.85rem',
                                                                textDecoration: 'underline'
                                                            }}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                }

                                                const targetId = String(relItem.id || relItem.siteId || relItem).trim();
                                                const targetSite = (allSites || []).find(s => String(s.id).trim() === targetId);
                                                const label = relItem.title || relItem.description || relItem.name || relItem.label || targetSite?.name || `Site #${targetId}`;

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (targetSite) {
                                                                handleNavigateToSite(targetSite);
                                                            }
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'none',
                                                            padding: 0,
                                                            textAlign: 'left',
                                                            color: 'var(--accent-primary, #58a6ff)',
                                                            cursor: targetSite ? 'pointer' : 'default',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ON-LINE READING SECTION */}
                                {(() => {
                                    const readings = getOnlineReadings(sheet);
                                    if (readings.length === 0) return null;
                                    return (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-primary)',
                                            marginTop: '4px'
                                        }}>
                                            <img
                                                src="/assets/Library.png"
                                                alt="Library"
                                                style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0, marginTop: '2px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: '600' }}>On-line reading:</span>
                                                {readings.map((item, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            color: 'var(--accent-primary, #58a6ff)',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.85rem',
                                                            textDecoration: 'underline',
                                                            lineHeight: '1.4'
                                                        }}
                                                    >
                                                        {item.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ServiceSheetCard;
