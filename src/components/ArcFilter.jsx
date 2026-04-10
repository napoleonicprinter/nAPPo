import React from 'react';
import { useAppContext } from '../context/AppContext';

const ArcFilter = ({ className, style }) => {
    const { filterCategory, showArcOnly, setShowArcOnly } = useAppContext();

    if (!filterCategory.includes('Battle site')) return null;

    return (
        <button
            className={`arc-filter-btn glass-panel ${className}`}
            onClick={() => setShowArcOnly(!showArcOnly)}
            title="Show only sites listed at the Arch de Triomphe - Paris"
            style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 12px',
                background: showArcOnly ? 'var(--accent-primary)' : 'var(--bg-acrylic)',
                border: showArcOnly ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '38px',
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
