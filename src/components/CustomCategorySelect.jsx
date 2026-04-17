import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomCategorySelect = ({ categories, value, onChange, categoryCounts = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Map categories to dynamic colors (same as MapView)
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Battle site': return '#f85149';
            case 'Naval battle': return '#38bdf8';
            case 'Battle landmark': return '#ff6092';
            case 'Museum': return '#a371f7';
            case 'Monument': return '#10b981';
            case 'Building': return '#ff7b72';
            case 'Artwork': return '#d2a8ff';
            case 'Event site': return '#fde047';
            case 'Landmark': return '#99f000';
            case 'Store': return '#ffffff';
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
                <div className="custom-select-menu animate-fade-in">
                    <button
                        className={`custom-select-option ${(!value || value.length === 0) ? 'selected' : ''}`}
                        onClick={() => handleSelect('')}
                        type="button"
                    >
                        <span className="category-dot" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }} />
                        <span style={{ flex: 1 }}>All Categories</span>
                        <span className="category-count-badge">
                            [{Object.values(categoryCounts).reduce((a, b) => a + b, 0)}]
                        </span>
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
                            <span style={{ flex: 1 }}>{cat}</span>
                            <span className="category-count-badge">
                                [{categoryCounts[cat] ?? 0}]
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomCategorySelect;
