import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const YearFilter = ({ compact, style, className }) => {
    const { filterYear, setFilterYear, availableYears, filterCategory, allSites } = useAppContext();

    const allowedCategories = ['Battle site', 'Naval battle', 'Battle landmark'];
    const showFilter = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));

    if (!showFilter) {
        return null;
    }

    const yearCounts = React.useMemo(() => {
        const counts = {};
        allSites.forEach(site => {
            if (site.year) {
                counts[site.year] = (counts[site.year] || 0) + 1;
            }
        });
        return counts;
    }, [allSites]);

    const options = [
        { value: 'all', label: 'All Years' },
        ...availableYears.map(y => ({ value: y, label: y, count: yearCounts[y] || 0 }))
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
