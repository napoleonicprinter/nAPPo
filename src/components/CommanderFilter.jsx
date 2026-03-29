import React from 'react';
// Filter for commanders specifically at battle sites
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const CommanderFilter = ({ compact, style, className }) => {
    const { filterCommander, setFilterCommander, allSites, filterCategory } = useAppContext();
    
    const allowedCategories = ['Battle site', 'Sea Battle', 'Battle landmark'];
    const showFilter = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));
    
    // Only show if selected categories consist ONLY of the allowed battle types
    if (!showFilter) {
        return null;
    }

    const commanders = Array.from(
        new Set(
            allSites
                .filter(s => allowedCategories.includes(s.category) && s.commanders)
                .flatMap(s => s.commanders)
        )
    ).sort();

    const options = [
        { value: 'all', label: 'All Commanders' },
        ...commanders.map(c => ({ value: c, label: c }))
    ];

    return (
        <div style={style} className={className}>
            <CustomSimpleSelect
                options={options}
                value={filterCommander || 'all'}
                onChange={(val) => setFilterCommander(val)}
                placeholder="All Commanders"
                title="Filter by Commander"
                searchable={true}
            />
        </div>
    );
};

export default CommanderFilter;
