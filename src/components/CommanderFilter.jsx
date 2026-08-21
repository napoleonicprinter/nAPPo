import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const CommanderFilter = ({ className }) => {
    // 1. Grab the dynamic list from Context
    const { availableCommanders, filterCommander, setFilterCommander } = useAppContext();

    // 2. Format the options
    const options = [
        { value: 'all', label: 'All Commanders' },
        ...availableCommanders // No need to .map here, it's already formatted!
    ];

    return (
        <CustomSimpleSelect
            className={className}
            options={options}
            value={filterCommander}
            onChange={setFilterCommander}
            placeholder="Commander"
            searchable={true}
            menuClassName="custom-select-menu"
        />
    );
};

export default CommanderFilter;