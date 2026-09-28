import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const BelligerentFilter = ({ className }) => {
    const { availableBelligerents, filterBelligerent, setFilterBelligerent } = useAppContext();

    const options = [
        { value: 'all', label: 'All Belligerents' },
        ...availableBelligerents
    ];

    return (
        <CustomSimpleSelect
            className={className}
            options={options}
            value={filterBelligerent || 'all'}
            onChange={setFilterBelligerent}
            placeholder="Belligerents"
            searchable={true}
            menuClassName="custom-select-menu"
        />
    );
};

export default BelligerentFilter;
