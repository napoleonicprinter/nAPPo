import React from 'react';
import { createPortal } from 'react-dom';
import { X, Filter, Navigation } from 'lucide-react';
import { useAppContext, EUROPEAN_CAPITALS } from '../context/AppContext';
import CustomCategorySelect from './CustomCategorySelect';

const FiltersModal = ({ onClose }) => {
    const {
        geolocationEnabled, requestGeolocation, disableGeolocation,
        filterCategory, setFilterCategory,
        filterSignificance, setFilterSignificance,
        filterVisited, setFilterVisited,
        filterRadius, setFilterRadius,
        locationMode, handleLocationSelect,
        allSites
    } = useAppContext();

    // Derive unique categories and significances from allSites
    const categories = Array.from(new Set(allSites.map(s => s.category)));
    const significances = Array.from(new Set(allSites.map(s => s.significance)));

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
