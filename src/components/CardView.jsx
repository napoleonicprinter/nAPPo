import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ArrowDownAZ, ArrowUp, ArrowDown } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import SiteCard from './SiteCard';
import './CardView.css';

const CardView = () => {
    const { sites, selectedSite, setSelectedSite, setCallerSite } = useAppContext();

    const [sortField, setSortField] = useState(() => localStorage.getItem('listSortField') || 'date');
    const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('listSortOrder') || 'asc');

    useBackHandler('detailViewCardView', !!selectedSite, () => setSelectedSite(null), 35);

    useEffect(() => {
        localStorage.setItem('listSortField', sortField);
    }, [sortField]);

    useEffect(() => {
        localStorage.setItem('listSortOrder', sortOrder);
    }, [sortOrder]);

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
            if (sortField === 'date') {
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
    }, [sites, sortField, sortOrder]);

    return (
        <div className="card-view-wrapper animate-fade-in" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            <div className="card-view-container">
                <div className="card-view-header glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="sort-label">Sort by:</span>
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('asc')}
                            title="Ascending Order"
                        >
                            <ArrowUp size={14} style={{ marginRight: '3px' }} />
                            Ascending
                        </button>
                        <button
                            type="button"
                            className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                            onClick={() => setSortOrder('desc')}
                            title="Descending Order"
                        >
                            <ArrowDown size={14} style={{ marginRight: '3px' }} />
                            Descending
                        </button>
                    </div>
                </div>

                <div className="cards-grid">
                    {sortedSites.map(site => (
                        <SiteCard key={site.id} site={site} isCompact={true} />
                    ))}
                </div>
            </div>

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
