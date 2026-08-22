import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ArrowDownAZ, Navigation, ChevronUp } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import SiteCard from './SiteCard';
import './CardView.css';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);
    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return Infinity;

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

const CardView = () => {
    const { sites, selectedSite, setSelectedSite, setCallerSite, userCoords } = useAppContext();

    const [sortField, setSortField] = useState(() => {
        const saved = localStorage.getItem('listSortField');
        if (saved) return saved;
        return userCoords ? 'distance' : 'date';
    });
    const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('listSortOrder') || 'asc');
    const [showTopBtn, setShowTopBtn] = useState(false);

    const containerRef = useRef(null);
    const prevUserCoordsRef = useRef(userCoords);

    useBackHandler('detailViewCardView', !!selectedSite, () => setSelectedSite(null), 35);

    useEffect(() => {
        if (userCoords && !prevUserCoordsRef.current) {
            setSortField('distance');
        }
        prevUserCoordsRef.current = userCoords;
    }, [userCoords]);

    useEffect(() => {
        localStorage.setItem('listSortField', sortField);
    }, [sortField]);

    useEffect(() => {
        localStorage.setItem('listSortOrder', sortOrder);
    }, [sortOrder]);

    const handleScroll = () => {
        if (containerRef.current) {
            setShowTopBtn(containerRef.current.scrollTop > 180);
        }
    };

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Helper to get comparable date string (site.date > site.year > fallback)
    const getDateValue = (site) => {
        if (site.date) return String(site.date).trim();
        if (site.year) {
            const y = String(site.year).trim();
            return y.length === 4 ? `${y}-01-01` : y;
        }
        return '9999-99-99'; // Sites without date/year appear at the end
    };

    // Sort sites by selected field and order
    const sortedSites = useMemo(() => {
        return [...sites].sort((a, b) => {
            let result = 0;
            if (sortField === 'distance' && userCoords) {
                const distA = a.distance !== undefined ? a.distance : calculateDistance(userCoords.lat, userCoords.lon, a.latitude, a.longitude);
                const distB = b.distance !== undefined ? b.distance : calculateDistance(userCoords.lat, userCoords.lon, b.latitude, b.longitude);
                result = distA - distB;
            } else if (sortField === 'date') {
                const dateA = getDateValue(a);
                const dateB = getDateValue(b);
                if (dateA !== dateB) {
                    result = dateA.localeCompare(dateB);
                } else {
                    result = (a.name || '').localeCompare(b.name || '');
                }
            } else {
                result = (a.name || '').localeCompare(b.name || '');
                if (result === 0) {
                    const dateA = getDateValue(a);
                    const dateB = getDateValue(b);
                    result = dateA.localeCompare(dateB);
                }
            }
            return sortOrder === 'desc' ? -result : result;
        });
    }, [sites, sortField, sortOrder, userCoords]);

    return (
        <div className="card-view-wrapper animate-fade-in" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            <div className="card-view-container" ref={containerRef} onScroll={handleScroll}>
                <div className="card-view-header glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            className={`sort-tag-btn ${sortField === 'alphabetic' ? 'active' : ''}`}
                            onClick={() => setSortField('alphabetic')}
                        >
                            <ArrowDownAZ size={14} style={{ marginRight: '4px' }} />
                            Alphabetic
                        </button>
                        <button
                            type="button"
                            className={`sort-tag-btn ${sortField === 'date' ? 'active' : ''}`}
                            onClick={() => setSortField('date')}
                        >
                            <Calendar size={14} style={{ marginRight: '4px' }} />
                            Date
                        </button>
                        {userCoords && (
                            <button
                                type="button"
                                className={`sort-tag-btn ${sortField === 'distance' ? 'active' : ''}`}
                                onClick={() => setSortField('distance')}
                            >
                                <Navigation size={14} style={{ marginRight: '4px' }} />
                                Distance
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('asc')}
                            title="Ascending Order"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('desc')}
                            title="Descending Order"
                        >
                            ▼
                        </button>
                    </div>
                </div>

                <div className="cards-grid">
                    {sortedSites.map(site => (
                        <SiteCard key={site.id} site={site} isCompact={true} />
                    ))}
                </div>
            </div>

            {/* FLOATING TOP BUTTON AT BOTTOM RIGHT */}
            {showTopBtn && (
                <button
                    type="button"
                    className="scroll-to-top-btn glass-panel animate-fade-in"
                    onClick={scrollToTop}
                    title="Scroll to top"
                >
                    <ChevronUp size={16} style={{ marginRight: '4px' }} />
                    Top
                </button>
            )}

            {/* FULL DETAIL CARD MODAL CENTERED ON SCREEN */}
            {selectedSite && (() => {
                const liveSite = sites.find(s => s.id === selectedSite.id) || selectedSite;
                return (
                    <div
                        onClick={() => { setSelectedSite(null); if (setCallerSite) setCallerSite(null); }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2147483640,
                            padding: '16px'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="animate-fade-in"
                            style={{
                                width: '380px',
                                maxWidth: '92vw',
                                maxHeight: '85vh',
                                overflow: 'visible',
                                borderRadius: '16px'
                            }}
                        >
                            <SiteCard
                                site={liveSite}
                                onClose={() => { setSelectedSite(null); if (setCallerSite) setCallerSite(null); }}
                                isCompact={false}
                            />
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CardView;
