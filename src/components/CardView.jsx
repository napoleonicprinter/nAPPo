import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Calendar, CheckCircle, Globe, Youtube, BookOpen, ExternalLink } from 'lucide-react';
import SiteCard from './SiteCard';
import './CardView.css';

// Map categories to dynamic colors (same as MapView)
const getCategoryColor = (category) => {
    switch (category) {
        case 'Battle site': return '#f85149';
        case 'Sea Battle': return '#38bdf8';
        case 'Battle landmark': return '#d29922';
        case 'Museum': return '#a371f7';
        case 'Monument': return '#10b981';
        case 'Building': return '#ff7b72';
        case 'Artwork': return '#d2a8ff';
        case 'Event site': return '#fde047';
        case 'Landmark': return '#7b5a25ff';
        case 'Store': return '#ffffff';
        default: return '#8b949e';
    }
};

const CardView = () => {
    const { sites, userCoords, geolocationEnabled } = useAppContext();

    // Sort sites primarily by distance if geolocation is enabled
    const sortedSites = React.useMemo(() => {
        let sorted = [...sites];
        if (geolocationEnabled && userCoords) {
            sorted = sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        return sorted;
    }, [sites, userCoords, geolocationEnabled]);

    return (
        <div className="card-view-container animate-fade-in">
            <div className="cards-grid">
                {sortedSites.map(site => (
                    <SiteCard key={site.id} site={site} isCompact={true} />
                ))}
            </div>
        </div>
    );
};

export default CardView;
