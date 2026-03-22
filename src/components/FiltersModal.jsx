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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} className="animate-fade-in" onClick={onClose}>
            <div
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.2rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        background: 'var(--accent-primary)',
                        color: '#000',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Filter size={20} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        Refine Map & List
                    </h2>

                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Visit Status</label>
                        <select
                            className="filter-select glass-panel"
                            value={filterVisited}
                            onChange={(e) => setFilterVisited(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="all">All Status</option>
                            <option value="visited">Visited</option>
                            <option value="unvisited">Not Visited</option>
                        </select>
                    </div>

                </div>
                
                <button 
                    className="btn-primary" 
                    onClick={onClose}
                    style={{ margin: '1rem 1.5rem 1.5rem 1.5rem', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}
                >
                    Apply Filters
                </button>
            </div>
        </div>,
        document.body
    );
};

export default FiltersModal;
