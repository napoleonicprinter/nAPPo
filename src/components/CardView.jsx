import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ArrowDownAZ, Navigation, ChevronUp, CalendarDays } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import SiteCard from './SiteCard';
import CustomSimpleSelect from './CustomSimpleSelect';
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

const BATCH_SIZE = 30;

const CardView = () => {
    const {
        sites,
        selectedSite,
        setSelectedSite,
        setCallerSite,
        userCoords,
        filterCategory,
        filterMonth,
        setFilterMonth,
        availableMonths
    } = useAppContext();

    const isMonthFilterVisible = useMemo(() => {
        const allowed = ['Battle site', 'Naval battle', 'Birthplace', 'Grave site'];
        return Array.isArray(filterCategory) &&
            filterCategory.length > 0 &&
            filterCategory.every(c => allowed.includes(c));
    }, [filterCategory]);

    const monthOptions = useMemo(() => [
        { value: 'all', label: 'All Months' },
        ...(availableMonths || [])
    ], [availableMonths]);

    const [sortField, setSortField] = useState(() => {
        const saved = localStorage.getItem('listSortField');
        if (saved) return saved;
        return userCoords ? 'distance' : 'date';
    });
    const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('listSortOrder') || 'asc');
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

    const containerRef = useRef(null);
    const sentinelRef = useRef(null);
    const prevUserCoordsRef = useRef(userCoords);

    useBackHandler('detailViewCardView', !!selectedSite, () => setSelectedSite(null), 35);

    useEffect(() => {
        if (userCoords && !prevUserCoordsRef.current) {
            setSortField('distance');
        }
        prevUserCoordsRef.current = userCoords;
    }, [userCoords]);

    useEffect(() => {
        if (sortField === 'day' && (!isMonthFilterVisible || filterMonth === 'all')) {
            setSortField('date');
        }
    }, [isMonthFilterVisible, filterMonth, sortField]);

    useEffect(() => {
        localStorage.setItem('listSortField', sortField);
    }, [sortField]);

    useEffect(() => {
        localStorage.setItem('listSortOrder', sortOrder);
    }, [sortOrder]);

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            setShowTopBtn(scrollTop > 180);
            if (scrollTop + clientHeight >= scrollHeight - 400) {
                setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sites.length));
            }
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

    // Helper to get day of the month (1-31) from site.date (e.g. "1809-04-19" -> 19)
    const getDayValue = (site) => {
        if (site.date) {
            const parts = String(site.date).trim().split('-');
            if (parts.length >= 3) {
                const d = parseInt(parts[2], 10);
                if (!isNaN(d)) return d;
            }
        }
        return 999;
    };

    // Sort sites by selected field and order
    const sortedSites = useMemo(() => {
        return [...sites].sort((a, b) => {
            let result = 0;
            if (sortField === 'day') {
                const dayA = getDayValue(a);
                const dayB = getDayValue(b);
                if (dayA !== dayB) {
                    result = dayA - dayB;
                } else {
                    const dateA = getDateValue(a);
                    const dateB = getDateValue(b);
                    if (dateA !== dateB) {
                        result = dateA.localeCompare(dateB);
                    } else {
                        result = (a.name || '').localeCompare(b.name || '');
                    }
                }
            } else if (sortField === 'distance' && userCoords) {
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

    // Reset visible count when sites or sorting/filtering change
    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [sites, sortField, sortOrder, filterMonth, userCoords]);

    // Sentinel observer for progressive infinite loading
    useEffect(() => {
        const sentinelEl = sentinelRef.current;
        if (!sentinelEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, sortedSites.length));
                }
            },
            { root: containerRef.current, rootMargin: '300px' }
        );

        observer.observe(sentinelEl);
        return () => observer.disconnect();
    }, [sortedSites.length, visibleCount]);

    const visibleSites = useMemo(() => {
        return sortedSites.slice(0, visibleCount);
    }, [sortedSites, visibleCount]);

    return (
        <div className="card-view-wrapper animate-fade-in" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            <div className="card-view-container" ref={containerRef} onScroll={handleScroll}>
                <div className="card-view-header glass-panel">
                    <div className="sort-buttons-row">
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
                        {isMonthFilterVisible && (
                            <div className="sort-month-filter-wrapper">
                                <CustomSimpleSelect
                                    className={`sort-month-select ${filterMonth !== 'all' ? 'filters-active-red' : ''}`}
                                    options={monthOptions}
                                    value={filterMonth}
                                    onChange={setFilterMonth}
                                    placeholder="Month"
                                />
                            </div>
                        )}
                        {isMonthFilterVisible && filterMonth !== 'all' && (
                            <button
                                type="button"
                                className={`sort-tag-btn ${sortField === 'day' ? 'active' : ''}`}
                                onClick={() => {
                                    if (sortField === 'day') {
                                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                    } else {
                                        setSortField('day');
                                    }
                                }}
                                title="Sort by day within the month"
                            >
                                <CalendarDays size={14} style={{ marginRight: '4px' }} />
                                Day
                            </button>
                        )}
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
                        <div className="sort-arrows-group">
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
                </div>

                <div className="cards-grid">
                    {visibleSites.map(site => (
                        <SiteCard key={site.id} site={site} isCompact={true} />
                    ))}
                </div>

                {visibleCount < sortedSites.length && (
                    <div ref={sentinelRef} style={{ height: '20px', margin: '10px 0', pointerEvents: 'none' }} />
                )}
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
