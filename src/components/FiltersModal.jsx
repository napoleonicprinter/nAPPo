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
        filterRadius, setFilterRadius,
        filterCountry, setFilterCountry,
        isFiltered, clearAllFilters,
        locationMode, handleLocationSelect,
        allSites,
        filterCoalition, setFilterCoalition,
        filterCampaign, setFilterCampaign
    } = useAppContext();

    // Derive unique categories and significances from allSites
    const categories = Array.from(new Set(allSites.map(s => s.category)));
    const significances = Array.from(new Set(allSites.map(s => s.significance)));
    const countries = Array.from(new Set(allSites.map(s => s.country))).filter(Boolean).sort();

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                {/* Header */}
                <div className="shopping-modal-header" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="modal-title-row">
                        <div className="modal-icon-container" style={{ background: 'var(--accent-primary)', color: '#000' }}>
                            <Filter size={24} />
                        </div>
                        <div className="modal-title-info">
                            <h2>Refine Map & List</h2>
                            <p>Customize your exploration filters.</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="calendar-modal-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {isFiltered && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
                            <button
                                className="glass-panel"
                                onClick={clearAllFilters}
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-danger)',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(248, 81, 73, 0.3)',
                                    background: 'rgba(248, 81, 73, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={14} /> Clear all filters
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Visit Status
                        </label>
                        <select
                            className="filter-select glass-panel"
                            value={filterVisited}
                            onChange={(e) => setFilterVisited(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                        >
                            <option value="all" style={{ background: 'var(--bg-color)' }}>All Status</option>
                            <option value="visited" style={{ background: 'var(--bg-color)' }}>Visited</option>
                            <option value="unvisited" style={{ background: 'var(--bg-color)' }}>Not Visited</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Country
                        </label>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All Countries' },
                                ...countries.map(c => ({ value: c, label: c }))
                            ]}
                            value={filterCountry}
                            onChange={setFilterCountry}
                            searchable={true}
                            title="Filter by Country"
                            placeholder="Select Country..."
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Coalition
                        </label>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All Coalitions' },
                                { value: '1', label: '1st Coalition' },
                                { value: '2', label: '2nd Coalition' },
                                { value: '3', label: '3rd Coalition' },
                                { value: '4', label: '4th Coalition' },
                                { value: '5', label: '5th Coalition' },
                                { value: '6', label: '6th Coalition' },
                                { value: '7', label: '100 Days' }
                            ]}
                            value={String(filterCoalition)}
                            onChange={setFilterCoalition}
                            title="Filter by Napoleonic Coalition"
                            placeholder="Select Coalition..."
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Campaign
                        </label>
                        <CampaignFilter />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={onClose}
                        style={{
                            marginTop: '1rem',
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            background: 'var(--accent-primary)',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 12px rgba(88, 166, 255, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FiltersModal;
