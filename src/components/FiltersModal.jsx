import React from 'react';
import { createPortal } from 'react-dom';
import { X, Filter, Navigation } from 'lucide-react';
import { useAppContext, EUROPEAN_CAPITALS } from '../context/AppContext';
import CustomCategorySelect from './CustomCategorySelect';
import CustomSimpleSelect from './CustomSimpleSelect';
import CampaignFilter from './CampaignFilter';

const FiltersModal = ({ onClose }) => {
    const {
        geolocationEnabled, requestGeolocation, disableGeolocation,
        filterCategory, setFilterCategory,
        filterSignificance, setFilterSignificance,
        filterVisited, setFilterVisited,
        isFiltered, clearAllFilters,
        filterRadius, setFilterRadius,
        filterCountry, setFilterCountry,
        locationMode, handleLocationSelect,
        allSites,
        filterCoalition, setFilterCoalition,
        filterCampaign, setFilterCampaign,
        filterSearch, setFilterSearch,
        showOnlyNew, setShowOnlyNew,
        newSitesDays, setNewSitesDays,
        countryCounts, coalitionCounts, visitedCounts
    } = useAppContext();
    const { getPortalContainer } = useAppContext();

    // Derive unique categories and significances from allSites
    const categories = Array.from(new Set(allSites.map(s => s.category)));
    const significances = Array.from(new Set(allSites.map(s => s.significance)));
    const countries = Array.from(new Set(allSites.map(s => s.country))).filter(Boolean).sort();

    const isModalFiltered = filterSearch !== '' || filterCountry !== 'all' || filterCoalition !== 'all' || filterCampaign !== 'all' || filterVisited !== 'all' || showOnlyNew;

    const clearModalFilters = () => {
        setFilterSearch('');
        setFilterCountry('all');
        setFilterCoalition('all');
        setFilterCampaign('all');
        setFilterVisited('all');
        setShowOnlyNew(false);
    };

    return createPortal(
        <>
            <div className="settings-drawer-backdrop open" onClick={onClose} />
            <div className="settings-drawer open" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-drawer-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                        <Filter size={20} />
                        Filters
                    </h3>
                    <button className="settings-drawer-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="settings-drawer-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Search Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>Search Sites</h3>
                        <div className="mobile-search-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="mobile-search-input"
                                placeholder="Search sites..."
                                value={filterSearch || ''}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 36px 10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            {filterSearch ? (
                                <button
                                    className="mobile-search-clear"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilterSearch('');
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            ) : (
                                <span className="mobile-search-icon" style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>Country</h3>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All' },
                                ...countries
                                    .filter(c => (countryCounts?.[c] || 0) > 0)
                                    .map(c => ({ value: c, label: `${c} (${countryCounts[c]})` }))
                            ]}
                            value={filterCountry}
                            onChange={setFilterCountry}
                            searchable={true}
                            title="Filter by Country"
                            placeholder="Select Country..."
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>Campaign</h3>
                        <CampaignFilter />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>Coalition</h3>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All' },
                                { value: '1', label: `1st Coalition` },
                                { value: '2', label: `2nd Coalition` },
                                { value: '3', label: `3rd Coalition` },
                                { value: '4', label: `4th Coalition` },
                                { value: '5', label: `5th Coalition` },
                                { value: '6', label: `6th Coalition` },
                                { value: '7', label: `100 Days` }
                            ]
                                .filter(opt => opt.value === 'all' || (coalitionCounts?.[opt.value] || 0) > 0)
                                .map(opt => opt.value === 'all' ? opt : { ...opt, label: `${opt.label} (${coalitionCounts[opt.value]})` })}
                            value={String(filterCoalition)}
                            onChange={setFilterCoalition}
                            title="Filter by Napoleonic Coalition"
                            placeholder="Select Coalition..."
                        />
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>Visit Status</h3>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'visited', label: `Visited` },
                                { value: 'unvisited', label: `Not Visited` }
                            ]
                                .filter(opt => opt.value === 'all' || (visitedCounts?.[opt.value] || 0) > 0)
                                .map(opt => opt.value === 'all' ? opt : { ...opt, label: `${opt.label} (${visitedCounts[opt.value]})` })}
                            value={filterVisited}
                            onChange={setFilterVisited}
                            title="Filter by Visit Status"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ marginBottom: '0', fontSize: '1.17em', fontWeight: 'bold', color: 'var(--text-primary)' }}>New Sites</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 0' }}>
                            <input
                                type="checkbox"
                                checked={showOnlyNew}
                                onChange={(e) => {
                                    setShowOnlyNew(e.target.checked);
                                    localStorage.setItem('showOnlyNew', e.target.checked);
                                }}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Only new sites</span>
                        </label>
                        
                        <CustomSimpleSelect
                            options={[
                                { value: '1', label: 'Last 1 day' },
                                { value: '7', label: 'Last 7 days' },
                                { value: '15', label: 'Last 15 days' },
                                { value: '30', label: 'Last 30 days' },
                                { value: '60', label: 'Last 60 days' },
                                { value: '90', label: 'Last 90 days' }
                            ]}
                            value={String(newSitesDays)}
                            onChange={(val) => {
                                const days = parseInt(val, 10);
                                setNewSitesDays(days);
                                localStorage.setItem('newSitesDays', days);
                            }}
                            title="Filter by number of days"
                            disabled={!showOnlyNew}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: 'auto',
                        paddingTop: '1.5rem'
                    }}>
                        <button
                            onClick={clearModalFilters}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                border: '1px solid var(--accent-danger)',
                                background: 'rgba(248, 81, 73, 0.1)',
                                color: 'var(--accent-danger)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: isModalFiltered ? 1 : 0.4,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                            onMouseOver={(e) => {
                                if (isModalFiltered) {
                                    e.currentTarget.style.background = 'rgba(248, 81, 73, 0.2)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(248, 81, 73, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <X size={18} style={{ marginRight: '6px' }} />
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>,
        getPortalContainer()
    );
};

export default FiltersModal;
