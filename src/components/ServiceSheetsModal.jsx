import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Anchor, Shield, User, Swords, FileText, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { normalizeServiceSheetType, getServiceSheetTypeColor } from './ServiceSheetCard';

const getTypePluralLabel = (type) => {
    if (type === 'Ship') return 'Ships';
    if (type === 'Regiment') return 'Regiments';
    if (type === 'Commander') return 'Commanders';
    return type.endsWith('s') ? type : `${type}s`;
};

const ServiceSheetsModal = ({ onClose }) => {
    const {
        serviceSheets,
        serviceSheetTypes,
        allSites,
        setSelectedServiceSheet,
        setSelectedSite,
        setCallerServiceSheet,
        setServiceSheetMarkerToOpen,
        enableMapOverlay,
        setView,
        getPortalContainer
    } = useAppContext();

    const [activeType, setActiveType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const resolveBattleName = (m) => {
        if (!m) return '';
        if (m.battle_name || m.battle) return m.battle_name || m.battle;
        if (m.battle_id && Array.isArray(allSites)) {
            const found = allSites.find(s => String(s.id).trim() === String(m.battle_id).trim());
            if (found) return found.name;
        }
        return 'Battle Location';
    };

    const filteredSheets = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return (serviceSheets || []).filter(sheet => {
            const normType = normalizeServiceSheetType(sheet.type || sheet.category);
            if (activeType !== 'all' && normType !== activeType) return false;
            if (!q) return true;
            const inName = (sheet.name || '').toLowerCase().includes(q);
            const inSubtitle = (sheet.subtitle || '').toLowerCase().includes(q);
            const inCountry = (sheet.country || '').toLowerCase().includes(q);
            const inBattles = Array.isArray(sheet.markers) && sheet.markers.some(m => resolveBattleName(m).toLowerCase().includes(q));
            return inName || inSubtitle || inCountry || inBattles;
        });
    }, [serviceSheets, activeType, searchQuery, allSites]);

    const handleOpenDetail = (sheet) => {
        setCallerServiceSheet({ fromModal: true });
        setSelectedSite(null);
        setSelectedServiceSheet(sheet);
        onClose();
    };

    const handleJumpToMarker = (sheet, marker) => {
        const mapId = marker.map_id || marker.mapId;
        if (mapId && enableMapOverlay) {
            enableMapOverlay(mapId);
        }
        setSelectedServiceSheet(null);
        setSelectedSite(null);
        onClose();
        setTimeout(() => {
            setServiceSheetMarkerToOpen({
                sheetId: sheet.id,
                markerId: marker.id,
                latitude: Number(marker.latitude),
                longitude: Number(marker.longitude),
                mapId: mapId || null
            });
            setView('map');
        }, 30);
    };

    return createPortal(
        <div
            className="view-modal-overlay animate-fade-in"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2147483635,
                padding: '16px'
            }}
        >
            <div
                className="view-modal-content glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '560px',
                    maxWidth: '94vw',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-color, #161b22)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-color, rgba(128,128,128,0.25))'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} style={{ color: 'var(--accent-primary, #58a6ff)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Service Sheets
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="modal-close-btn close-details-btn"
                        title="Close"
                        style={{ position: 'static', width: '30px', height: '30px' }}
                    >
                        <X size={17} strokeWidth={2.5} color="white" />
                    </button>
                </div>

                {/* Type Tabs & Search */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color, rgba(128,128,128,0.2))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setActiveType('all')}
                            style={{
                                padding: '5px 12px',
                                borderRadius: '16px',
                                border: activeType === 'all' ? '1.5px solid var(--accent-primary, #58a6ff)' : '1px solid var(--border-color, rgba(128,128,128,0.3))',
                                backgroundColor: activeType === 'all' ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
                                color: activeType === 'all' ? 'var(--accent-primary, #58a6ff)' : 'var(--text-primary)',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            All ({(serviceSheets || []).length})
                        </button>
                        {(serviceSheetTypes || ['Ship', 'Regiment', 'Commander']).map(t => {
                            const count = (serviceSheets || []).filter(s => normalizeServiceSheetType(s.type || s.category) === t).length;
                            const isActive = activeType === t;
                            const color = getServiceSheetTypeColor(t);
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveType(t)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '16px',
                                        border: isActive ? `1.5px solid ${color}` : '1px solid var(--border-color, rgba(128,128,128,0.3))',
                                        backgroundColor: isActive ? `${color}28` : 'transparent',
                                        color: isActive ? color : 'var(--text-primary)',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {getTypePluralLabel(t)} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={15} style={{ position: 'absolute', left: '10px', color: 'gray' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ships, regiments, commanders, or battles..."
                            style={{
                                width: '100%',
                                padding: '7px 12px 7px 32px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, rgba(128,128,128,0.35))',
                                backgroundColor: 'rgba(128,128,128,0.1)',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{
                    padding: '12px 16px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {filteredSheets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'gray', fontSize: '0.9rem' }}>
                            No Service Sheets found.
                        </div>
                    ) : (
                        filteredSheets.map(sheet => {
                            const normType = normalizeServiceSheetType(sheet.type || sheet.category);
                            const badgeColor = getServiceSheetTypeColor(normType);
                            return (
                                <div
                                    key={sheet.id}
                                    style={{
                                        border: '1px solid var(--border-color, rgba(128,128,128,0.25))',
                                        borderRadius: '10px',
                                        padding: '10px 12px',
                                        backgroundColor: 'rgba(128,128,128,0.06)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    backgroundColor: badgeColor,
                                                    color: 'white',
                                                    padding: '2px 7px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {normType}
                                                </span>
                                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                                    {sheet.name}
                                                </strong>
                                            </div>
                                            {sheet.subtitle && (
                                                <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary, #58a6ff)', marginTop: '2px' }}>
                                                    {sheet.subtitle}
                                                </div>
                                            )}
                                            {sheet.country && (
                                                <div style={{ fontSize: '0.76rem', color: 'gray', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <MapPin size={12} />
                                                    {sheet.country}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenDetail(sheet)}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                color: 'var(--accent-primary, #58a6ff)',
                                                fontWeight: 'bold',
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                padding: '2px 4px'
                                            }}
                                        >
                                            Details &rarr;
                                        </button>
                                    </div>

                                    {Array.isArray(sheet.markers) && sheet.markers.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                            <Swords size={13} style={{ color: '#ef5350', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'gray' }}>Battles:</span>
                                            {sheet.markers.map((m, idx) => (
                                                <button
                                                    key={m.id || idx}
                                                    type="button"
                                                    onClick={() => handleJumpToMarker(sheet, m)}
                                                    style={{
                                                        border: '1px solid rgba(88, 166, 255, 0.35)',
                                                        backgroundColor: 'rgba(88, 166, 255, 0.12)',
                                                        color: 'var(--accent-primary, #58a6ff)',
                                                        borderRadius: '6px',
                                                        padding: '2px 8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="View on battle map"
                                                >
                                                    {resolveBattleName(m)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>,
        getPortalContainer ? getPortalContainer() : document.body
    );
};

export default ServiceSheetsModal;
