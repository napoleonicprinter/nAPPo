import React from 'react';
import {
    MapPin, Calendar, Navigation, CheckCircle,
    BookOpen, Globe, Youtube, Star, Palette, Swords
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const getCategoryColor = (category) => {
    const colors = {
        "Today's Battle": '#ff4500',
        'Battle site': '#ef5350',
        'Battle landmark': '#ff5e7e',
        'Naval battle': '#26c6da',
        'Museum': '#9575cd',
        'Artwork': '#ce93d8',
        'Monument': '#26a69a',
        'Landmark': '#ccff00',
        'Building': '#795548',
        'Movie tip': '#ffeb3b',
        'Store': '#9e9e9e'
    };
    return colors[category] || '#58a6ff';
};

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const {
        toggleVisited, userCoords, setView, setSiteToOpenPopup,
        allSites, setSelectedSite, callerSite, setCallerSite
    } = useAppContext();

    if (!site) return null;

    const handleBattleClick = (battleId) => {
        const targetId = String(battleId).trim();
        const battle = (allSites || []).find(s => String(s.id).trim() === targetId);
        if (battle) {
            setCallerSite(site);
            setSelectedSite(battle);
        }
    };

    const handleArtworkClick = (artId) => {
        const targetId = String(artId).trim();
        const art = (allSites || []).find(s => String(s.id).trim() === targetId);
        if (art) {
            setCallerSite(site);
            setSelectedSite(art);
        }
    };

    const handleInternalClose = (e) => {
        if (e) e.stopPropagation();
        if (callerSite) {
            setSelectedSite(callerSite);
            setCallerSite(null);
        } else {
            if (onClose) onClose();
        }
    };

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
            {onClose && (
                <button onClick={handleInternalClose} className="close-details-btn">
                    <span>×</span>
                </button>
            )}

            <div className="card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={site.image} alt={site.name} className="card-image" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge" style={{ backgroundColor: getCategoryColor(site.category), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {site.category}
                    </span>
                </div>
            </div>

            <div className="card-content" style={{ padding: '12px' }}>
                <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>{site.name}</h2>
                <div className="card-badges" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {renderSignificanceStars(site.significance)}
                        {site.date && <span style={{ fontSize: '0.8rem', color: '#666' }}>{site.date}</span>}
                    </div>
                </div>

                {!isCompact && (
                    <>
                        <div className="description" style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '15px' }}>
                            {site.description}
                        </div>
                        <div className="card-external-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            {callerSite && (
                                <button onClick={() => {
                                    const target = {...site};
                                    setCallerSite(null);
                                    setSelectedSite(null);
                                    setView('map');
                                    setSiteToOpenPopup(null);
                                    setTimeout(() => setSiteToOpenPopup(target), 150);
                                }} style={{ color: '#58a6ff', background: 'none', border: 'none', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Go to the Site on Map
                                </button>
                            )}
                            {site.battle_id && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Swords size={20} color="#666" />
                                    <button onClick={() => handleBattleClick(site.battle_id)} style={{ color: '#58a6ff', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Battle Site</button>
                                </div>
                            )}
                            {site.artwork_ids && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Palette size={20} color="#666" />
                                    {site.artwork_ids.map((id, index) => (
                                        <button key={id} onClick={() => handleArtworkClick(id)} style={{ color: '#58a6ff', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {site.artwork_ids.length === 1 ? 'Artwork' : index + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SiteCard;