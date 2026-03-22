import React from 'react';
import { Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './SignificanceFilter.css';

const SignificanceFilter = ({ compact = false }) => {
    const { filterSignificance, setFilterSignificance } = useAppContext();

    const handleStarClick = (rank) => {
        const significanceMap = {
            1: 'Minor',
            2: 'Medium',
            3: 'Major'
        };
        
        const selectedSignificance = significanceMap[rank];
        
        if (filterSignificance === selectedSignificance) {
            setFilterSignificance(''); // Deselect if clicking the same rank
        } else {
            setFilterSignificance(selectedSignificance);
        }
    };

    const getRank = (sig) => {
        if (sig === 'Minor') return 1;
        if (sig === 'Medium') return 2;
        if (sig === 'Major') return 3;
        return 0;
    };

    const currentRank = getRank(filterSignificance);

    return (
        <div className={`significance-filter glass-panel${compact ? ' significance-filter--compact' : ''}`}>
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
