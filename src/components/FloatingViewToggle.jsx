import React from 'react';
import { Map, List } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './FloatingViewToggle.css';

const FloatingViewToggle = ({ className = '' }) => {
    const { view, setView } = useAppContext();

    // Only show for map and card (list) views
    if (view !== 'map' && view !== 'card') return null;

    const isMap = view === 'map';

    return (
        <button
            className={`view-toggle-tag glass-panel ${className}`}
            onClick={() => setView(isMap ? 'card' : 'map')}
            title={isMap ? 'Switch to List View' : 'Switch to Map View'}
        >
            {isMap ? <List size={20} /> : <Map size={20} />}
        </button>
    );
};

export default FloatingViewToggle;
