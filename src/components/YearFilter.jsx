import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const YearFilter = ({ compact, style, className }) => {
    const { filterYear, setFilterYear, allSites } = useAppContext();
    
    const years = Array.from(
        new Set(
            allSites
                .map(s => s.year ? String(s.year).trim() : '')
                .filter(y => y !== '')
        )
    ).sort();

    const options = [
        { value: 'all', label: 'All Years' },
        ...years.map(y => ({ value: y, label: y }))
    ];

    return (
        <div style={style} className={className}>
            <CustomSimpleSelect
                options={options}
                value={filterYear || 'all'}
                onChange={(val) => setFilterYear(val)}
                placeholder="All Years"
                title="Filter by Year"
            />
        </div>
    );
};

export default YearFilter;
