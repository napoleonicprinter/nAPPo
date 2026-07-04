import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { MapPin, Calendar, CheckCircle, Globe, Youtube, BookOpen, ExternalLink, X, Navigation, Star, Swords } from 'lucide-react';
import './CardView.css'; // Relying on existing CSS for site-card

// Map categories to dynamic colors
const getCategoryColor = (category) => {
    switch (category) {
        case 'Battle site': return '#f85149';
        case 'Naval battle': return '#38bdf8';
        case 'Battle landmark': return '#ff6092';
        case 'Museum': return '#a371f7';
        case 'Monument': return '#10b981';
        case 'Building': return '#ff7b72';
        case 'Artwork': return '#d2a8ff';
        case 'Event site': return '#fde047';
        case 'Landmark': return '#99f000';
        case 'Store': return '#ffffff';
        default: return '#8b949e';
    }
};

const renderSignificanceStars = (sig) => {
    const numStars = sig === 'Major' ? 3 : sig === 'Medium' ? 2 : sig === 'Minor' ? 1 : 0;
    if (numStars === 0) return null;
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginLeft: '4px' }} title={`${sig} Significance`}>
            {[...Array(numStars)].map((_, i) => (
                <Star key={i} size={16} fill="var(--accent-warning)" stroke="var(--accent-warning)" strokeWidth={1.5} />
            ))}
        </div>
    );
};

const SiteCard = ({ site, onClose, isCompact = false }) => {
    const {
        toggleVisited, userCoords, geolocationEnabled, setView, 
        setSiteToOpenPopup, theme, getPortalContainer, activeMapOverlays, toggleMapOverlay
    } = useAppContext();
    const [showNavigation, setShowNavigation] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(false);

    if (!site) return null;

    if (!site) return null;

    return (
        <div className={`site-card glass-panel ${site.visited ? 'visited' : ''}`} style={{ position: 'relative', width: '100%', maxWidth: '350px', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' }}>
            {onClose && (
                <button
                    onClick={onClose}
                    className="modal-close-btn"
                    title="Close"
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 20 }}
                >
                    <X size={20} />
                </button>
            )}

            <div className="card-image-wrapper">
                <img src={site.image} alt={site.name} className="card-image" />

                {site.isNew && (
                    <div className="new-site-badge">NEW</div>
                )}

                {/* Bottom-left corner elements (Mark as Visited, Distance, Navigation) */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    zIndex: 15,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px',
                    maxWidth: 'calc(100% - 100px)' // Leave room for category badge on right
                }}>
                    <button
                        className={`btn-visited ${site.visited ? 'active' : ''}`}
                        onClick={() => toggleVisited(site.id)}
                    >
                        <CheckCircle size={18} />
                        {site.visited ? 'Visited' : 'Mark as Visited'}
                    </button>

                    {site.distance !== undefined && (
                        <>
                            <div style={{
                                padding: '6px 10px',
                                background: 'rgba(0, 0, 0, 0.65)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                            }}>
                                <strong>{site.distance} km</strong> away
                            </div>

                            {geolocationEnabled && userCoords && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${site.latitude},${site.longitude}`;
                                        window.open(url, '_blank', 'noopener,noreferrer,width=1000,height=800,left=100,top=100');
                                    }}
                                    title="Navigate to site via Google Maps"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--accent-primary)',
                                        color: '#000',
                                        border: 'none',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <Navigation size={16} />
                                </button>
                            )}
                        </>
                    )}
                </div>
                {/* Category Badge - bottom-right corner */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge category-badge" style={{
                        backgroundColor: getCategoryColor(site.category),
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                        {site.category}
                    </span>
                </div>
            </div>

            <div className="card-content">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {site.special?.includes('arc') && (
                        <img src="/assets/Arc.png" alt="Listed at the Arch de Triomphe - Paris" className="arc-icon-invert" title="Listed at the Arch de Triomphe - Paris" style={{ height: '1.2em', width: 'auto', transition: 'all 0.2s' }} />
                    )}
                    {site.name}
                </h2>
                <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {renderSignificanceStars(site.significance)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>


                        {isCompact && (
                            <>
                                <button
                                    onClick={() => {
                                        setSiteToOpenPopup(site);
                                        setView('map');
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        padding: '0 4px',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = theme === 'light' ? '#ff0000' : '#fff'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                    title="Show on Map"
                                >
                                    <MapPin size={14} /> Map
                                </button>
                                <button
                                    onClick={() => setShowFullDetails(true)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--accent-primary)',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        padding: '0 4px',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = theme === 'light' ? '#ff0000' : '#fff'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                                >
                                    Details &rarr;
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="card-meta">
                    {site.year && String(site.year).trim() !== '' && (
                        <span className="meta-item"><Calendar size={14} /> {site.year}</span>
                    )}
                    <span className="meta-item"><MapPin size={14} /> {site.location}, {site.country}</span>
                </div>

                {!isCompact && (
                    <p className="description">{site.description}</p>
                )}



                {!isCompact && (site.wikipedia_link || site.site_link || site.youtube_link || site.more_info_link) && (
                    <div className="card-external-links">
                        {site.wikipedia_link && (
                            <a href={site.wikipedia_link} target="_blank" rel="noopener noreferrer" className="external-link" title="Wikipedia">
                                <BookOpen size={16} />
                            </a>
                        )}
                        {site.site_link && (
                            <a href={site.site_link} target="_blank" rel="noopener noreferrer" className="external-link" title="Official Site">
                                <Globe size={16} />
                            </a>
                        )}
                        {site.youtube_link && (
                            <a href={site.youtube_link} target="_blank" rel="noopener noreferrer" className="external-link youtube-link" title="YouTube">
                                <Youtube size={16} />
                            </a>
                        )}
                        {site.more_info_link && (
                            <a href={site.more_info_link} target="_blank" rel="noopener noreferrer" className="external-link" title="More Info">
                                <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                )}

                {/* The Details button was moved up to the badges section */}
            </div>

            {isCompact && showFullDetails && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} className="animate-fade-in" onClick={() => setShowFullDetails(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <SiteCard site={site} onClose={() => setShowFullDetails(false)} isCompact={false} />
                    </div>
                </div>,
                getPortalContainer()
            )}
        </div>
    );
};

export default SiteCard;
