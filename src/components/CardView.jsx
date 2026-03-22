import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Calendar, CheckCircle, Globe, Youtube, BookOpen, ExternalLink } from 'lucide-react';
import './CardView.css';

// Map categories to dynamic colors (same as MapView)
const getCategoryColor = (category) => {
    switch (category) {
        case 'Battle site': return '#f85149';
        case 'Battle site': return '#d29922';
        case 'Museum': return '#a371f7';
        case 'Monument': return '#58a6ff';
        case 'Building': return '#ff7b72';
        case 'Art work': return '#d2a8ff';
        case 'Event site': return '#79c0ff';
        case 'Battle landmark': return '#e3b341';
        case 'Landmark': return '#e6edf3';
        default: return '#8b949e';
    }
};

const isNewSite = (createDateStr, daysThreshold) => {
    if (!createDateStr || !daysThreshold) return false;
    const createDate = new Date(createDateStr);
    const today = new Date();
    // Calculate difference in days
    const diffTime = Math.abs(today - createDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
};

import SiteCard from './SiteCard';

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