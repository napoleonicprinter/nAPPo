import React from 'react';

import {
    MapPin, Calendar, Navigation, CheckCircle,
    BookOpen, Globe, Youtube, ExternalLink, Star,
    Palette, Swords, Link2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { handleImageFallback } from '../utils/imageUtils';

export const getCategoryColor = (category) => {
    const colors = {
        "Today's Battle": '#ff4500',
        'Battle site': '#ef5350',
        'Battle landmark': '#ff9ebb',
        'Naval battle': '#26c6da',
        'Museum': '#9575cd',
        'Artwork': '#ce93d8',
        'Monument': '#26a69a',
        'Landmark': '#ccff00',
        'Restaurant': '#795548',
        'Store': '#001ECC',
        'Movie tip': '#2c0d55ff',
    };
    return colors[category] || '#8b949e';
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);
    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return undefined;

    const R = 6371; // Earth radius in km
    const dLat = (l2 - l1) * Math.PI / 180;
    const dLon = (ln2 - ln1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(l1 * Math.PI / 180) * Math.cos(l2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const formatDistanceTag = (dist) => {
    if (dist === undefined || dist === null || isNaN(dist)) return null;
    const d = Number(dist);
    return `${Math.round(d)} km`;
};

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const {
        theme,
        toggleVisited,
        userCoords,
        geolocationEnabled,
        setView,
        setSiteToOpenPopup,
        allSites,
        setSelectedSite,
        callerSite,
        setCallerSite
    } = useAppContext();

    if (!site) return null;

    const spec = site?.special || site?.Special;
    const isArc = spec
        ? (Array.isArray(spec) ? spec.includes('arc') : String(spec).toLowerCase().includes('arc'))
        : false;

    // Helper to render stars based on significance data
    const renderSignificanceStars = (sig) => {
        const numStars = Number(sig) === 3 ? 3 : Number(sig) === 2 ? 2 : Number(sig) === 1 ? 1 : 0;
        if (numStars === 0) return null;
        return (
            <div className="significance-stars" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[...Array(numStars)].map((_, i) => (
                    <Star key={i} size={14} fill="#ffc107" stroke="#ffc107" strokeWidth={1.5} />
                ))}
            </div>
        );
    };

    return (
        <div className={`site-card ${site.visited ? 'visited' : ''}`} style={{ position: 'relative' }}>

            {/* --- RED CLOSE BUTTON --- */}
            {onClose && (
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="close-details-btn"
                >
                    <span>×</span>
                </button>
            )}

            <div className="card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                    src={site.image}
                    alt={site.name}
                    className="card-image"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    onError={(e) => handleImageFallback(e, site.image)}
                />

                {/* NEW TAG (Upper Left) */}
                {site.isNew && (
                    <img
                        src="/assets/new-tag.png"
                        alt="New Site"
                        className="new-site-badge"
                        style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            width: '70px',
                            height: 'auto',
                            zIndex: 20,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                {/* --- MARK AS VISITED & NAVIGATION (Lower Left of Image) --- */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    zIndex: 25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <button
                        className={`btn-visited ${site.visited ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleVisited(site.id);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.4)',
                            color: 'white',
                            backgroundColor: site.visited ? '#4caf50' : 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <CheckCircle size={14} />
                        {site.visited ? 'Visited' : 'Mark as Visited'}
                    </button>

                </div>
                {/* DISTANCE TAG & NAVIGATION BUTTON (Above Category Badge) */}
                {userCoords && (site.distance !== undefined || (site.latitude && site.longitude)) && (() => {
                    const distVal = site.distance !== undefined
                        ? site.distance
                        : calculateDistance(userCoords.lat, userCoords.lon, site.latitude, site.longitude);
                    const formattedDist = formatDistanceTag(distVal);
                    if (!formattedDist) return null;

                    return (
                        <div style={{
                            position: 'absolute',
                            bottom: '38px',
                            right: '10px',
                            zIndex: 15,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                backdropFilter: 'blur(4px)',
                                color: '#ffffff',
                                padding: '3px 7px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                whiteSpace: 'nowrap'
                            }}>
                                {formattedDist}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${site.latitude},${site.longitude}`;
                                    window.open(url, '_blank');
                                }}
                                title="Navigate with Google Maps"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--accent-primary, #ef5350)',
                                    color: '#ffffff',
                                    border: 'none',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    padding: 0
                                }}
                            >
                                <Navigation size={12} />
                            </button>
                        </div>
                    );
                })()}

                {/* CATEGORY BADGE (Lower Right) */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge" style={{ backgroundColor: getCategoryColor(site.category), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {site.category}
                    </span>
                </div>
            </div>

            <div className="card-content"
                style={{
                    padding: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                {callerSite && callerSite.id !== site.id && (
                    <div style={{ marginBottom: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const prev = callerSite;
                                setCallerSite(null);
                                setSelectedSite(prev);
                            }}
                            style={{
                                border: 'none',
                                background: 'rgba(88, 166, 255, 0.15)',
                                color: 'var(--accent-primary, #58a6ff)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            &larr; Back to {callerSite.name}
                        </button>
                    </div>
                )}
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>{site.name}</h2>

                {/* --- STARS / DATE / DETAILS ROW --- */}
                <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isArc && (
                            <img
                                src="/assets/Arc.png"
                                alt="Arc de Triomphe"
                                title="Listed at the Arc de Triomphe"
                                style={{
                                    height: '15px',
                                    width: 'auto',
                                    marginRight: '2px',
                                    filter: theme === 'dark' ? 'invert(1)' : 'none',
                                    verticalAlign: 'middle'
                                }}
                            />
                        )}
                        {renderSignificanceStars(site.significance)}
                        {site.date && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center' }}>
                                <Calendar size={13} style={{ marginLeft: '6px', marginRight: '3px' }} />
                                {site.date}
                            </span>
                        )}
                    </div>

                    {isCompact && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {!hideMapLink && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSiteToOpenPopup(site); setView('map'); }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'gray', fontSize: '0.85rem', fontWeight: 'bold' }}
                                >
                                    Map
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedSite(site); }}
                                style={{ border: 'none', background: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Details &rarr;
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={13} style={{ marginRight: '4px' }} /> {site.location}, {site.country}
                </div>

                {!isCompact && (
                    <>
                        <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '8px', color: 'var(--text-primary)' }}>
                            {site.description}
                        </div>

                        {/* --- EXTERNAL LINKS BLOCK --- */}
                        <div className="card-external-links" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            marginTop: '8px',
                            paddingTop: '6px',
                            borderTop: '1px solid rgba(0,0,0,0.1)'
                        }}>
                            {/* Standard Icons Row */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {site.wikipedia_link && site.wikipedia_link.trim() !== '' && (
                                    <a href={site.wikipedia_link} target="_blank" rel="noreferrer" title="Wikipedia" style={{ color: '#666' }}>
                                        <BookOpen size={22} />
                                    </a>
                                )}
                                {site.site_link && site.site_link.trim() !== '' && (
                                    <a href={site.site_link} target="_blank" rel="noreferrer" title="Official Site" style={{ color: '#666' }}>
                                        <Globe size={22} />
                                    </a>
                                )}
                                {site.more_info_link && site.more_info_link.trim() !== '' && (
                                    <a href={site.more_info_link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                        <ExternalLink size={22} />
                                    </a>
                                )}
                                {site.moreInfo && site.moreInfo.trim() !== '' && site.moreInfo !== site.more_info_link && (
                                    <a href={site.moreInfo} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                        <ExternalLink size={22} />
                                    </a>
                                )}
                                {site.link && site.link.trim() !== '' && site.link !== site.site_link && site.link !== site.wikipedia_link && site.link !== site.more_info_link && site.link !== site.moreInfo && (
                                    <a href={site.link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                        <ExternalLink size={22} />
                                    </a>
                                )}
                                {site.youtube_link && site.youtube_link.trim() !== '' && (
                                    <a href={site.youtube_link} target="_blank" rel="noreferrer" title="YouTube Video" style={{ color: '#ff0000' }}>
                                        <Youtube size={22} />
                                    </a>
                                )}
                            </div>

                            {/* --- BATTLE SITE LINK (Crossed Sabres) --- */}
                            {site.battle_id && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    marginTop: '2px'
                                }}>
                                    <Swords size={20} color="#666" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // We convert both to String and trim to prevent "Editor ID" vs "Record ID" mismatches
                                            const targetId = String(site.battle_id).trim();
                                            const battleSite = (allSites || []).find(s => String(s.id).trim() === targetId);

                                            if (battleSite) {
                                                setCallerSite(site);      // Save the current card in memory
                                                setSelectedSite(battleSite); // Switch to the Battle Site record
                                            } else {
                                                console.warn("Battle site record not found for ID:", targetId);
                                            }
                                        }}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            padding: 0,
                                            color: '#58a6ff',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Go to Battle Site
                                    </button>
                                </div>
                            )}

                            {/* --- ARTWORK LINKS SECTION --- */}
                            {site.artwork_ids && site.artwork_ids.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    marginTop: '2px'
                                }}>
                                    <Palette size={20} style={{ color: '#666' }} />

                                    {site.artwork_ids.length === 1 ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const artSite = allSites.find(s => s.id === site.artwork_ids[0]);
                                                if (artSite) setSelectedSite(artSite);
                                            }}
                                            style={{ border: 'none', background: 'none', padding: 0, color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                                        >
                                            Artwork
                                        </button>
                                    ) : (
                                        <>
                                            <span style={{ fontWeight: '600' }}>Artwork:</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {site.artwork_ids.map((id, index) => (
                                                    <button
                                                        key={id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const artSite = allSites.find(s => s.id === id);
                                                            if (artSite) setSelectedSite(artSite);
                                                        }}
                                                        style={{
                                                            border: '1px solid var(--accent-primary)',
                                                            background: 'rgba(88, 166, 255, 0.1)',
                                                            color: 'var(--accent-primary)',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {/* --- RELATED SITES SECTION --- */}
                            {(() => {
                                const relatedList = Array.isArray(site.relatedSites)
                                    ? site.relatedSites
                                    : Array.isArray(site.related_sites)
                                        ? site.related_sites
                                        : Array.isArray(site.related)
                                            ? site.related
                                            : [];

                                if (!relatedList || relatedList.length === 0) return null;

                                return (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-primary)',
                                        marginTop: '0px'
                                    }}>
                                        <Link2 size={20} style={{ color: '#666', flexShrink: 0, marginTop: '2px' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '600' }}>Related site:</span>
                                            {relatedList.map((relItem, idx) => {
                                                const targetId = String(relItem.id || relItem.siteId || relItem).trim();
                                                const targetSite = (allSites || []).find(s => String(s.id).trim() === targetId);
                                                const label = relItem.title || relItem.description || relItem.name || relItem.label || targetSite?.name || `Site #${targetId}`;

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (targetSite) {
                                                                setSelectedSite(null);
                                                                setSiteToOpenPopup(targetSite);
                                                                setView('map');
                                                            } else {
                                                                console.warn("Related site record not found for ID:", targetId);
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
                                );
                            })()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SiteCard;