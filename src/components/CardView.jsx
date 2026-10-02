import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ArrowDownAZ, Navigation, ChevronUp, CalendarDays, Camera } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import SiteCard from './SiteCard';
import CustomSimpleSelect from './CustomSimpleSelect';
import { getBelligerentStatus } from '../utils/filterValidation';
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
        allSites,
        selectedSite,
        setSelectedSite,
        setCallerSite,
        userCoords,
        filterCategory,
        filterMonth,
        setFilterMonth,
        availableMonths,
        filterCommander,
        filterCommanderRole,
        setFilterCommanderRole,
        filterBelligerent,
        setFilterBelligerent,
        availableOutcomeCounts,
        showOnlyNew
    } = useAppContext();

    const outcomeOptions = useMemo(() => {
        const hasCommander = filterCommander && filterCommander !== 'all';
        const hasBelligerent = filterBelligerent && filterBelligerent !== 'all';

        if (!hasCommander && !hasBelligerent) {
            return [
                { value: 'all', label: 'All battles' },
                { value: 'victor', label: 'Victories' },
                { value: 'loss', label: 'Defeats' },
                { value: 'tie', label: 'Inconclusive' }
            ];
        }

        const counts = availableOutcomeCounts || { total: 0, victor: 0, loss: 0, tie: 0 };

        return [
            { value: 'all', label: `All battles (${counts.total})` },
            { value: 'victor', label: `Victories (${counts.victor})` },
            { value: 'loss', label: `Defeats (${counts.loss})` },
            { value: 'tie', label: `Inconclusive (${counts.tie})` }
        ];
    }, [filterCommander, filterBelligerent, availableOutcomeCounts]);

    const isMonthFilterVisible = useMemo(() => {
        const allowed = ['Battle site', 'Naval battle', 'Birthplace', 'Grave site'];
        return Array.isArray(filterCategory) &&
            filterCategory.length > 0 &&
            filterCategory.every(c => allowed.includes(c));
    }, [filterCategory]);

    const monthOptions = useMemo(() => [
        { value: 'all', label: 'All Months' },
        ...(availableMonths || []).filter(m => (m.count || 0) > 0)
    ], [availableMonths]);

    const [sortField, setSortField] = useState(() => {
        if (userCoords) return 'distance';
        const saved = localStorage.getItem('listSortField');
        if (saved && saved !== 'distance') return saved;
        return 'date';
    });
    const [sortOrder, setSortOrder] = useState(() => {
        if (userCoords) return 'asc';
        return localStorage.getItem('listSortOrder') || 'asc';
    });
    const [showImages, setShowImages] = useState(() => {
        const saved = localStorage.getItem('cardViewShowImages');
        return saved !== 'false';
    });
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

    const containerRef = useRef(null);
    const sentinelRef = useRef(null);

    useBackHandler('detailViewCardView', !!selectedSite, () => setSelectedSite(null), 35);

    useEffect(() => {
        if (userCoords) {
            setSortField('distance');
            setSortOrder('asc');
        } else {
            setSortField(prev => (prev === 'distance' ? 'date' : prev));
        }
    }, [userCoords]);

    useEffect(() => {
        if (sortField === 'day' && (!isMonthFilterVisible || filterMonth === 'all')) {
            setSortField(userCoords ? 'distance' : 'date');
        }
    }, [isMonthFilterVisible, filterMonth, sortField, userCoords]);

    useEffect(() => {
        localStorage.setItem('listSortField', sortField);
    }, [sortField]);

    useEffect(() => {
        localStorage.setItem('listSortOrder', sortOrder);
    }, [sortOrder]);

    useEffect(() => {
        localStorage.setItem('cardViewShowImages', String(showImages));
    }, [showImages]);

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

    // Sort sites by selected field and order (or by createDate descending if only new sites filter is active)
    const sortedSites = useMemo(() => {
        if (showOnlyNew) {
            return [...sites].sort((a, b) => {
                const dateA = a.createDate ? new Date(a.createDate).getTime() : 0;
                const dateB = b.createDate ? new Date(b.createDate).getTime() : 0;
                if (dateB !== dateA) {
                    return dateB - dateA;
                }
                return (a.name || '').localeCompare(b.name || '');
            });
        }

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
    }, [sites, sortField, sortOrder, userCoords, showOnlyNew]);

    // Reset visible count when sites or sorting/filtering change
    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [sites, sortField, sortOrder, filterMonth, filterCommander, filterCommanderRole, filterBelligerent, userCoords, showOnlyNew]);

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

    const sortButtonsCount = useMemo(() => {
        let count = 2; // Alphabetic, Date
        if (userCoords) count += 1; // Distance
        if ((filterCommander && filterCommander !== 'all') || (filterBelligerent && filterBelligerent !== 'all')) count += 1; // Outcome
        if (isMonthFilterVisible) count += 1; // Month
        if (isMonthFilterVisible && filterMonth !== 'all') count += 1; // Day
        return count;
    }, [userCoords, filterCommander, filterBelligerent, isMonthFilterVisible, filterMonth]);

    const showScrollHint = sortButtonsCount > 2;

    return (
        <div className="card-view-wrapper animate-fade-in" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            <div className="card-view-container" ref={containerRef} onScroll={handleScroll}>
                {showScrollHint && (
                    <div className="card-view-scroll-hint" aria-hidden="true">
                        <svg className="scroll-hint-arrow" width="28" height="14" viewBox="0 0 28 14" fill="currentColor">
                            <path d="M10 0 L0 7 L10 14 L10 9 L28 9 L28 5 L10 5 Z" />
                        </svg>
                        <span className="scroll-hint-text">MENU</span>
                        <svg className="scroll-hint-arrow" width="28" height="14" viewBox="0 0 28 14" fill="currentColor">
                            <path d="M18 0 L28 7 L18 14 L18 9 L0 9 L0 5 L18 5 Z" />
                        </svg>
                    </div>
                )}
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
                        {((filterCommander && filterCommander !== 'all') || (filterBelligerent && filterBelligerent !== 'all')) && (
                            <div className="sort-commander-role-wrapper">
                                <CustomSimpleSelect
                                    className={`sort-commander-role-select ${filterCommanderRole !== 'all' ? 'filters-active-red' : ''}`}
                                    options={outcomeOptions}
                                    value={filterCommanderRole || 'all'}
                                    onChange={setFilterCommanderRole}
                                    placeholder="Outcome"
                                />
                            </div>
                        )}
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
                    </div>
                    <div className="sort-arrows-group">
                        <button
                            type="button"
                            className={`sort-order-btn image-mode-toggle-btn ${!showImages ? 'no-images-active' : ''}`}
                            onClick={() => setShowImages(prev => !prev)}
                            title={showImages ? "Images ON (Click to hide images)" : "No-Image Mode (Click to show images)"}
                            aria-label={showImages ? "Switch to No-Image Mode" : "Switch to Image Mode"}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px 6px'
                            }}
                        >
                            {showImages ? (
                                <Camera size={16} />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                    <path d="M19 19H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-2.5h5L16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                                    <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
                                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2.2" fill="none" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                                </svg>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('asc')}
                            title="Ascending Order"
                            aria-label="Ascending Order"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('desc')}
                            title="Descending Order"
                            aria-label="Descending Order"
                        >
                            ▼
                        </button>
                    </div>
                </div>

                <div className={`cards-grid ${!showImages ? 'no-images-grid' : ''}`}>
                    {visibleSites.map(site => (
                        <SiteCard key={site.id} site={site} isCompact={true} showImage={showImages} />
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
