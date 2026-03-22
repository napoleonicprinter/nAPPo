import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomCategorySelect = ({ categories, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Map categories to dynamic colors (same as MapView)
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Battle site': return '#f85149';
            case 'Battle landmark': return '#d29922';
            case 'Museum': return '#a371f7';
            case 'Monument': return '#58a6ff';
            case 'Building': return '#ff7b72';
            case 'Art work': return '#d2a8ff';
            case 'Event site': return '#79c0ff';
            case 'Landmark': return '#e6edf3';
            default: return '#8b949e';
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (category) => {
        if (category === '') {
            onChange([]);
            setIsOpen(false);
            return;
        }

        let newValue;
        if (value.includes(category)) {
            newValue = value.filter(c => c !== category);
        } else {
            newValue = [...value, category];
        }
        onChange(newValue);
    };

    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <button
                className={`custom-select-trigger filter-select glass-panel ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="custom-select-value">
                    {value && value.length > 0 ? (
                        <>
                            {value.length === 1 ? (
                                <>
                                    <span
                                        className="category-dot"
                                        style={{ backgroundColor: getCategoryColor(value[0]) }}
                                    />
                                    {value[0]}
                                </>
                            ) : (
                                `${value.length} Selected`
                            )}
                        </>
                    ) : (
                        "All Categories"
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="custom-select-menu animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
                    <button
                        className={`custom-select-option ${(!value || value.length === 0) ? 'selected' : ''}`}
                        onClick={() => handleSelect('')}
                        type="button"
                    >
                        <span className="category-dot" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }} />
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`custom-select-option ${(value && value.includes(cat)) ? 'selected' : ''}`}
                            onClick={() => handleSelect(cat)}
                            type="button"
                        >
                            <span
                                className="category-dot"
                                style={{ backgroundColor: getCategoryColor(cat) }}
                            />
                            {cat}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomCategorySelect;
