import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CustomCategorySelect = ({ categories, value, onChange, categoryCounts = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const { getPortalContainer } = useAppContext();

    // Map categories to dynamic colors (same as MapView)
    const getCategoryColor = (category) => {
        switch (category) {
            case "Today's Battle": return '#ff4500'; // Distinctive orange/red
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
            case 'Movie tip': return '#2c0d55ff';
            default: return '#8b949e';
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                menuRef.current && !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                if (!triggerRef.current) return;
                const rect = triggerRef.current.getBoundingClientRect();
                const container = getPortalContainer();
                const containerRect = container.getBoundingClientRect();
                
                const scale = rect.width / triggerRef.current.offsetWidth || 1;
                
                const isCloseToRightEdge = rect.left + 200 > containerRect.right;
                
                const style = {
                    position: 'absolute',
                    top: (rect.bottom - containerRect.top) / scale + 5,
                    minWidth: triggerRef.current.offsetWidth,
                    zIndex: 10005
                };
                
                if (isCloseToRightEdge) {
                    style.right = (containerRect.right - rect.right) / scale;
                    style.left = 'auto';
                } else {
                    style.left = (rect.left - containerRect.left) / scale;
                    style.right = 'auto';
                }
                
                setMenuStyle(style);
            };
            
            updatePosition();
            window.addEventListener('resize', updatePosition);
            
            const scrollContainer = triggerRef.current.closest('.mobile-overlay-filters');
            if (scrollContainer) {
                scrollContainer.addEventListener('scroll', updatePosition);
            }

            return () => {
                window.removeEventListener('resize', updatePosition);
                if (scrollContainer) {
                    scrollContainer.removeEventListener('scroll', updatePosition);
                }
            };
        }
    }, [isOpen, getPortalContainer]);

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
                ref={triggerRef}
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
                <ChevronDown size={14} style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.6, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {isOpen && createPortal(
                <div 
                    ref={menuRef}
                    className="custom-select-menu animate-fade-in"
                    style={menuStyle}
                >
                    <button
                        className={`custom-select-option ${(!value || value.length === 0) ? 'selected' : ''}`}
                        onClick={() => handleSelect('')}
                        type="button"
                    >
                        <span className="category-dot" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }} />
                        <span style={{ flex: 1 }}>All Categories</span>
                        <span className="category-count-badge">
                            [{Object.entries(categoryCounts).filter(([k]) => k !== "Today's Battle").reduce((a, [_, b]) => a + b, 0)}]
                        </span>
                    </button>
                    {categories.filter(cat => (categoryCounts[cat] || 0) > 0).map(cat => (
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
                </div>,
                getPortalContainer()
            )}
        </div>
    );
};

export default CustomCategorySelect;
