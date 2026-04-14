import React from 'react';
import { useAppContext } from '../context/AppContext';

const ArcFilter = ({ className, style }) => {
    const { filterCategory, showArcOnly, setShowArcOnly } = useAppContext();

    const isBattleSiteAlone = filterCategory.length === 1 && filterCategory[0] === 'Battle site';
    if (!isBattleSiteAlone) return null;

    return (
        <button
            className={`arc-filter-btn glass-panel ${className ?? ''}`}
            onClick={() => setShowArcOnly(!showArcOnly)}
            title="Show only sites listed at the Arch de Triomphe - Paris"
            style={{
                ...style,
                ...(showArcOnly ? {
                    background: 'var(--accent-primary)',
                    border: '1px solid var(--accent-primary)',
                    color: '#000',
                } : {}),
            }}
        >
            <img
                src="/assets/Arc.png"
                alt="Arc Filter"
                style={{
                    height: '1.4em',
                    width: 'auto',
                    filter: showArcOnly ? 'brightness(0)' : 'none',
                    transition: 'all 0.2s'
                }}
            />
        </button>
    );
};

export default ArcFilter;

