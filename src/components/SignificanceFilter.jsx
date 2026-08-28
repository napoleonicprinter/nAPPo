import React from 'react';
import { Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './SignificanceFilter.css';

const SignificanceFilter = ({ compact = false, className = '' }) => {
    const { filterSignificance, setFilterSignificance } = useAppContext();

    const handleStarClick = (rank) => {
        const significanceMap = {
            1: 1,
            2: 2,
            3: 3
        };

        const selectedSignificance = significanceMap[rank];

        if (filterSignificance === selectedSignificance) {
            setFilterSignificance(''); // Deselect if clicking the same rank
        } else {
            setFilterSignificance(selectedSignificance);
        }
    };

    const getRank = (sig) => {
        if (sig === 1) return 1;
        if (sig === 2) return 2;
        if (sig === 3) return 3;
        return 0;
    };

    const currentRank = getRank(filterSignificance);

    return (
        <div className={`significance-filter glass-panel${compact ? ' significance-filter--compact' : ''} ${currentRank > 0 ? 'filters-active-red' : ''} ${className}`.trim()}>
            {[1, 2, 3].map((star) => (
                <button
                    key={star}
                    className={`star-button ${star <= currentRank ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    title={`Filter by ${star === 1 ? 'Minor' : star === 2 ? 'Medium' : 'Major'} Significance`}
                >
                    <Star
                        size={18}
                        fill={star <= currentRank ? 'var(--accent-warning)' : 'rgba(0, 0, 0, 0.5)'}
                        stroke={star <= currentRank ? 'var(--accent-warning)' : 'white'}
                        strokeWidth={star <= currentRank ? 2 : 1.5}
                    />
                </button>
            ))}
        </div>
    );
};

export default SignificanceFilter;
