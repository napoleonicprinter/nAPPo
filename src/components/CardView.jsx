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
    const { sites, userCoords, geolocationEnabled, mapBounds } = useAppContext();

    // Sort sites primarily by bounds (if in map view bounds, rank higher), then distance if geolocation is enabled
    const sortedSites = React.useMemo(() => {
        let sorted = [...sites];

        // Helper to check if a site is in map bounds
        const isSiteInBounds = (site) => {
            if (!mapBounds) return false;
            const lat = site.latitude;
            const lng = site.longitude;
            const north = mapBounds.getNorth();
            const south = mapBounds.getSouth();
            const east = mapBounds.getEast();
            const west = mapBounds.getWest();

            // Handle map wrapping for longitude
            const inLng = west <= east 
                ? (lng >= west && lng <= east) 
                : (lng >= west || lng <= east);
                
            return lat >= south && lat <= north && inLng;
        };

        sorted = sorted.sort((a, b) => {
            if (mapBounds) {
                const aInBounds = isSiteInBounds(a);
                const bInBounds = isSiteInBounds(b);

                if (aInBounds && !bInBounds) return -1;
                if (!aInBounds && bInBounds) return 1;
            }

            if (geolocationEnabled && userCoords) {
                return (a.distance || 0) - (b.distance || 0);
            }
            return 0;
        });

        return sorted;
    }, [sites, userCoords, geolocationEnabled, mapBounds]);

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
