import React from 'react';
import { useAppContext } from '../context/AppContext';

const YearFilter = ({ compact, style, className }) => {
    const { filterYear, setFilterYear, allSites } = useAppContext();
    
    // Extract unique years from sites, treating both strings and numbers properly
    const years = Array.from(
        new Set(
            allSites
                .map(s => s.year ? String(s.year).trim() : '')
                .filter(y => y !== '')
        )
    ).sort();

    return (
        <select
            className={`filter-select glass-panel year-filter-tag ${compact ? 'compact' : ''} ${className || ''}`}
            value={filterYear || 'all'}
            onChange={(e) => setFilterYear(e.target.value)}
            style={style}
            title="Filter by Year"
        >
            <option value="all">All years</option>
            {years.map(y => (
                <option key={y} value={y}>{y}</option>
            ))}
        </select>
    );
};

export default YearFilter;
