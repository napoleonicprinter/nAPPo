import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const YearFilter = ({ compact, style, className }) => {
    const { filterYear, setFilterYear, allSites, filterCategory } = useAppContext();

    const allowedCategories = ['Battle site', 'Naval battle', 'Battle landmark'];
    const showFilter = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));

    if (!showFilter) {
        return null;
    }

    const years = Array.from(
        new Set(
            allSites
                .filter(s => allowedCategories.includes(s.category))
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
                searchable={true}
            />
        </div>
    );
};

export default YearFilter;
