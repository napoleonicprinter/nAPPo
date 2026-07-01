import React from 'react';
import { Map, List } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './FloatingViewToggle.css';

const FloatingViewToggle = ({ className = '', iconSize = 20 }) => {
    const { view, setView, innerView, setInnerView } = useAppContext();

    // Show for map, card, and preview views
    if (view !== 'map' && view !== 'card' && view !== 'preview') return null;

    const currentView = view === 'preview' ? innerView : view;
    const isMap = currentView === 'map';

    const handleToggle = () => {
        if (view === 'preview') {
            setInnerView(isMap ? 'card' : 'map');
        } else {
            setView(isMap ? 'card' : 'map');
        }
    };

    return (
        <button
            className={`view-toggle-tag glass-panel ${className}`}
            onClick={handleToggle}
            title={isMap ? 'Switch to List View' : 'Switch to Map View'}
        >
            {isMap ? <List size={iconSize} /> : <Map size={iconSize} />}
        </button>
    );
};

export default FloatingViewToggle;
