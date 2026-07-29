import React from 'react';
import {
    MapPin,
    Calendar,
    Navigation,
    CheckCircle,
    BookOpen,
    Globe,
    Youtube,
    ExternalLink,
    Star
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Helper function to get category colors
export const getCategoryColor = (category) => {
    const colors = {
        'Battle site': '#ff4444',
        'Battle landmark': '#ff8c00',
        'Naval battle': '#00d4ff',
        'Museum': '#ffd700',
        'Artwork': '#e066ff',
        'Monument': '#00c853',
        'Building': '#795548',
        'Landmark': '#58a6ff',
        'Movie tip': '#ffeb3b',
        'Store': '#9e9e9e'
    };
    return colors[category] || '#58a6ff';
};

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const { toggleVisited, userCoords, geolocationEnabled, setView, setSiteToOpenPopup, setSelectedSite } = useAppContext();

    if (!site) return null;

    const renderSignificanceStars = (sig) => {
        const numStars = Number(sig) === 3 ? 3 : Number(sig) === 2 ? 2 : Number(sig) === 1 ? 1 : 0;
        if (numStars === 0) return null;
        return (
            <div className="significance-stars" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[...Array(numStars)].map((_, i) => (
                    <Star key={i} size={16} fill="#ffc107" stroke="#ffc107" strokeWidth={1.5} />
                ))}
            </div>
        );
    };

    return (
        <div className={`site-card glass-panel ${site.visited ? 'visited' : ''}`} style={{ position: 'relative', width: '100%', maxWidth: 'min(350px, 92vw)', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-color, white)', borderRadius: '12px' }}>

            {onClose && (
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="close-details-btn" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: '#ff4444', color: 'white', border: '2px solid white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '-2px' }}>×</span>
                </button>
            )}

            <div className="card-image-wrapper" style={{ position: 'relative' }}>
                <img src={site.image} alt={site.name} className="card-image" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge category-badge" style={{ backgroundColor: getCategoryColor(site.category), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {site.category}
                    </span>
                </div>
            </div>

            <div className="card-content" style={{ padding: '15px' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', paddingRight: '35px' }}>{site.name}</h2>

                {/* SINGLE ROW: Stars + Date on Left | Map + Details on Right */}
                <div className="card-badges" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    minHeight: '24px'
                }}>
                    {/* Left Side: Stars and Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderSignificanceStars(site.significance)}

                        {(site.category === 'Battle site' || site.category === 'Naval battle') && site.date && (
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Calendar
                                    size={14}
                                    style={{ marginLeft: '6px', marginRight: '4px', verticalAlign: 'middle' }}
                                />
                                {site.date}
                            </span>
                        )}
                    </div>

                    {/* Right Side: Map and Details Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isCompact && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
                {/* --- META: Only Location (Year removed from here to avoid duplication) --- */}
                <div className="card-meta" style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '10px' }}>
                    <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {site.location}, {site.country}
                </div>

                {!isCompact && (
                    <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '15px' }}>
                        {site.description}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteCard;