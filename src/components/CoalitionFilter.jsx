import React from 'react';
import { useAppContext } from '../context/AppContext';

const CoalitionFilter = ({ className, style }) => {
    const { filterCoalition, setFilterCoalition } = useAppContext();

    const coalitions = [1, 2, 3, 4, 5, 6, 7];

    const handleClick = (num) => {
        if (String(filterCoalition) === String(num)) {
            setFilterCoalition('all');
        } else {
            setFilterCoalition(num);
        }
    };

    return (
        <div 
            className={`coalition-filter ${className ?? ''}`}
            style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                ...style
            }}
        >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '4px', textTransform: 'uppercase' }}>Col:</span>
            {coalitions.map((num) => (
                <button
                    key={num}
                    className="glass-panel"
                    onClick={() => handleClick(num)}
                    title={`Filter by Coalition ${num}`}
                    style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        padding: 0,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: String(filterCoalition) === String(num) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: String(filterCoalition) === String(num) ? '#000' : 'var(--text-primary)',
                        border: String(filterCoalition) === String(num) ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {num}
                </button>
            ))}
        </div>
    );
};

export default CoalitionFilter;
