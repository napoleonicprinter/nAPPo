import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const YearFilter = ({ className }) => {
    const { availableYears, filterYear, setFilterYear } = useAppContext();

    // The "|| []" ensures the app doesn't crash (white screen) if data isn't ready
    const options = [
        { value: 'all', label: 'All Years' },
        ...availableYears // No need to .map here, it's already formatted!
    ];

    return (
        <CustomSimpleSelect
            className={className}
            options={options}
            value={filterYear}
            onChange={setFilterYear}
            placeholder="Year"
        />
    );
};
export default YearFilter;

