import React from 'react';
import { useAppContext } from '../context/AppContext';

const ArcFilter = ({ className, style }) => {
    const { filterCategory, showArcOnly, setShowArcOnly, theme } = useAppContext();

    const allowedCategories = ['Battle site', 'Battle landmark', 'Naval battle'];
    const isBattleOnly = filterCategory.length > 0 && filterCategory.every(c => allowedCategories.includes(c));

    if (!isBattleOnly) return null;

    return (
        <button
            // Applies 'filters-active-red' for the red border/background when active
            className={`arc-filter-btn glass-panel ${showArcOnly ? 'filters-active-red' : ''} ${className || ''}`}
            onClick={() => setShowArcOnly(!showArcOnly)}
            title="Show only sites listed at the Arch de Triomphe - Paris"
            style={style}
        >
            <img
                // Swapping files based on state
                src={showArcOnly ? "/assets/Arc_red.png" : "/assets/Arc.png"}
                alt="Arc Filter"
                style={{
                    height: '1.4em',
                    width: 'auto',
                    transition: 'all 0.2s',
                    // Only invert the original icon if it's inactive AND in dark mode
                    filter: (!showArcOnly && theme === 'dark') ? 'invert(1)' : 'none'
                }}
            />
        </button>
    );
};

export default ArcFilter;