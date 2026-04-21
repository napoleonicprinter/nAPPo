import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import CustomSimpleSelect from './CustomSimpleSelect';

const CampaignFilter = ({ className, style }) => {
    const { allSites, filterCampaign, setFilterCampaign } = useAppContext();

    const campaigns = useMemo(() => {
        return Array.from(new Set(
            allSites
                .flatMap(s => s.special)
                .filter(val => {
                    if (!val || val === 'arc' || val === 'false' || val === false) return false;
                    // Check if it's a number 1-7
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 1 && num <= 7) return false;
                    return typeof val === 'string';
                })
        )).sort();
    }, [allSites]);

    if (campaigns.length === 0) return null;

    return (
        <div className={`campaign-filter ${className ?? ''}`} style={{ ...style }}>
            <CustomSimpleSelect
                options={[
                    { value: 'all', label: 'All Campaigns' },
                    ...campaigns.map(c => ({ value: c, label: c }))
                ]}
                value={filterCampaign}
                onChange={setFilterCampaign}
                searchable={true}
                placeholder="Campaign..."
                title="Filter by Military Campaign"
            />
        </div>
    );
};

export default CampaignFilter;
