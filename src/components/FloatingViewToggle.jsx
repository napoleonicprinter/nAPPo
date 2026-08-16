import React from 'react';
import { Map, List, X } from 'lucide-react'; // Added X icon
import { useAppContext } from '../context/AppContext';
import './FloatingViewToggle.css';

const FloatingViewToggle = ({ className = '', iconSize = 20 }) => {
    // 1. Add isMobileLike, isFiltered, and clearAllFilters to the destructuring
    const {
        view,
        setView,
        innerView,
        setInnerView,
        isMobileLike,
        isFiltered,
        clearAllFilters
    } = useAppContext();

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
        <>
            {/* 2. ADD THE CLEAR ALL BUTTON HERE */}
            {isMobileLike && isFiltered && (
                <button
                    className="clear-filters-floating animate-fade-in"
                    onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                    }}
                >
                    <X size={14} strokeWidth={3} /> CLEAR ALL
                </button>
            )}

            {/* The existing View Toggle Button */}
            <button
                className={`view-toggle-tag glass-panel ${className}`}
                onClick={handleToggle}
                title={isMap ? 'Switch to List View' : 'Switch to Map View'}
            >
                {isMap ? <List size={iconSize} /> : <Map size={iconSize} />}
            </button>
        </>
    );
};

export default FloatingViewToggle;
