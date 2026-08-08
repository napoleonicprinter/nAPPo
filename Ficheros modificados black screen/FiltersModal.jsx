import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Filter } from 'lucide-react'; // Removed unused Navigation
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';
import CampaignFilter from './CampaignFilter';

const FiltersModal = ({ onClose }) => {
    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    // D:/nAPPo_trails/src/components/FiltersModal.jsx

const {
    filterCategory, setFilterCategory,
    filterSignificance, setFilterSignificance,
    filterVisited, setFilterVisited,
    filterRadius, setFilterRadius,
    filterCountry, setFilterCountry,
    allSites,
    filterCoalition, setFilterCoalition,
    filterCampaign, setFilterCampaign,
    filterSearch, setFilterSearch,
    showOnlyNew, setShowOnlyNew,
    filterWithMaps, setFilterWithMaps,
    showArcOnly, setShowArcOnly, // Ensure this is here
    isModalFiltered,             // Pull it here
    clearAllFilters              // Pull it here ONCE
} = useAppContext();

    // Derive unique data
    const countries = Array.from(new Set(allSites.map(s => s.country))).filter(Boolean).sort();

    const handleResetAll = () => {
        clearAllFilters(); // Resets everything globally (including checkboxes)
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
                <div className="settings-drawer-content">
                    {/* Search Section */}
                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Search Sites</h3>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search sites..."
                                value={filterSearch || ''}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Country</h3>
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
                        />
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Campaign</h3>
                        <CampaignFilter />
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Coalition</h3>
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
                            ]}
                            value={String(filterCoalition)}
                            onChange={setFilterCoalition}
                        />
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Battle Maps</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={filterWithMaps}
                                onChange={(e) => setFilterWithMaps(e.target.checked)}
                            />
                            <span>Only sites with battle maps</span>
                        </label>
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>Visit Status</h3>
                        <CustomSimpleSelect
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'visited', label: `Visited` },
                                { value: 'unvisited', label: `Not Visited` }
                            ]}
                            value={filterVisited}
                            onChange={setFilterVisited}
                        />
                    </div>

                    <div className="filter-group">
                        <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>New Sites</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                            <input
                                type="checkbox"
                                checked={showOnlyNew}
                                onChange={(e) => setShowOnlyNew(e.target.checked)}
                            />
                            <span>Only new sites</span>
                        </label>
                    </div>

                    <div className="reset-button-wrapper" style={{ marginTop: '20px', paddingBottom: '20px' }}>
                        <button
                            onClick={handleResetAll}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                border: '1px solid var(--accent-danger)',
                                background: 'rgba(248, 81, 73, 0.1)',
                                color: 'var(--accent-danger)',
                                cursor: isModalFiltered ? 'pointer' : 'default',
                                opacity: isModalFiltered ? 1 : 0.4,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textTransform: 'uppercase'
                            }}
                        >
                            <X size={18} style={{ marginRight: '6px' }} />
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default FiltersModal;