import React from 'react';
import {
    MapPin, Calendar, Navigation, CheckCircle,
    BookOpen, Globe, Youtube, ExternalLink, Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// D:/nAPPo_trails/src/components/SiteCard.jsx

export const getCategoryColor = (category) => {
    const colors = {
        "Today's Battle": '#ff4500',   // Orange-Red
        'Battle site': '#ef5350',      // Red
        'Battle landmark': '#ff5e7e',  // Pink (Updated to match image)
        'Naval battle': '#26c6da',     // Cyan/Light Blue
        'Museum': '#9575cd',           // Purple
        'Artwork': '#ce93d8',          // Lavender/Light Purple
        'Monument': '#26a69a',         // Emerald/Teal
        'Landmark': '#ccff00',         // Lime Green (Updated to match image)
        'Building': '#795548',         // Brown
        'Movie tip': '#ffeb3b',        // Yellow
        'Store': '#9e9e9e'             // Grey
    };
    return colors[category] || '#58a6ff'; // Default to Blue
};

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const { toggleVisited, userCoords, geolocationEnabled, setView, setSiteToOpenPopup, setSelectedSite } = useAppContext();

    if (!site) return null;

    const renderSignificanceStars = (sig) => {
        const numStars = Number(sig) === 3 ? 3 : Number(sig) === 2 ? 2 : Number(sig) === 1 ? 1 : 0;
        if (numStars === 0) return null;
        return (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[...Array(numStars)].map((_, i) => (
                    <Star key={i} size={14} fill="#ffc107" stroke="#ffc107" strokeWidth={1.5} />
                ))}
            </div>
        );
    };

    return (
        <div className={`site-card ${site.visited ? 'visited' : ''}`}>
            {onClose && (
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="close-details-btn">
                    <span>×</span>
                </button>
            )}

            <div className="card-image-wrapper" style={{ position: 'relative' }}>
                <img src={site.image} alt={site.name} className="card-image" style={{ width: '100%', height: 'auto', display: 'block' }} />
                {site.isNew && (
                    <img
                        src="/assets/new-tag.png"
                        alt="New Site"
                        className="new-site-badge"
                        style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            width: '40px', // Adjust size as needed
                            height: 'auto',
                            zIndex: 20,
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge" style={{ backgroundColor: getCategoryColor(site.category), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {site.category}
                    </span>
                </div>
            </div>

            <div className="card-content" style={{ padding: '12px' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', paddingRight: '30px' }}>{site.name}</h2>

                <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderSignificanceStars(site.significance)}
                        {site.date && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center' }}>
                                <Calendar size={13} style={{ marginLeft: '6px', marginRight: '3px' }} />
                                {site.date}
                            </span>
                        )}
                    </div>

                    {isCompact && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!hideMapLink && (
                                <button onClick={(e) => { e.stopPropagation(); setSiteToOpenPopup(site); setView('map'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'gray', fontSize: '0.8rem', fontWeight: 'bold' }}>Map</button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); setSelectedSite(site); }} style={{ border: 'none', background: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>Details →</button>
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={13} style={{ marginRight: '4px' }} /> {site.location}, {site.country}
                </div>

                {!isCompact && (
                    <>
                        <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '15px', color: 'var(--text-primary)' }}>
                            {site.description}
                        </div>

                        {/* --- EXTERNAL LINKS BLOCK --- */}
                        <div className="card-external-links" style={{
                            display: 'flex',
                            gap: '20px',
                            marginTop: '15px',
                            paddingTop: '10px',
                            borderTop: '1px solid rgba(0,0,0,0.1)'
                        }}>
                            {site.wikipedia_link && (
                                <a href={site.wikipedia_link} target="_blank" rel="noreferrer" title="Wikipedia" style={{ color: '#666' }}>
                                    <BookOpen size={22} />
                                </a>
                            )}
                            {site.site_link && (
                                <a href={site.site_link} target="_blank" rel="noreferrer" title="Official Site" style={{ color: '#666' }}>
                                    <Globe size={22} />
                                </a>
                            )}
                            {site.youtube_link && (
                                <a href={site.youtube_link} target="_blank" rel="noreferrer" title="YouTube Video" style={{ color: '#ff0000' }}>
                                    <Youtube size={22} />
                                </a>
                            )}
                            {site.more_info_link && (
                                <a href={site.more_info_link} target="_blank" rel="noreferrer" title="More Info" style={{ color: '#666' }}>
                                    <ExternalLink size={22} />
                                </a>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SiteCard;