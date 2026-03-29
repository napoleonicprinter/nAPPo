import React from 'react';
// Filter for commanders specifically at battle sites
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const CommanderFilter = ({ compact, style, className }) => {
    const { filterCommander, setFilterCommander, allSites, filterCategory } = useAppContext();
    
    // Only show if "Battle site" is the only selected category
    if (!(filterCategory.length === 1 && filterCategory[0] === 'Battle site')) {
        return null;
    }

    const commanders = Array.from(
        new Set(
            allSites
                .filter(s => s.category === 'Battle site' && s.commanders)
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
