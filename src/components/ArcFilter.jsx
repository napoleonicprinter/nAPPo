import React from 'react';
import { useAppContext } from '../context/AppContext';

const ArcFilter = ({ className, style }) => {
    const { filterCategory, showArcOnly, setShowArcOnly, theme } = useAppContext();

    const allowedCategories = ['Battle site', 'Battle landmark'];
    const isBattleOnly = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));
    if (!isBattleOnly) return null;

    return (
        <button
            className={`arc-filter-btn glass-panel ${showArcOnly ? 'active' : ''} ${className ?? ''}`}
            onClick={() => setShowArcOnly(!showArcOnly)}
            title="Show only sites listed at the Arch de Triomphe - Paris"
            style={style}
        >

            <img
                src="/assets/Arc.png"
                alt="Arc Filter"
                style={{
                    height: '1.4em',
                    width: 'auto',
                    filter: (showArcOnly || theme === 'dark') ? 'brightness(0) invert(1)' : 'none',
                    transition: 'all 0.2s'
                }}
            />
        </button>
    );
};

export default ArcFilter;

