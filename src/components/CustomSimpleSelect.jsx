import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * A custom dropdown that matches the style of CustomCategorySelect.
 * Props:
 *   options: [{ value, label, color? }] — list of options
 *   value: string — current selected value
 *   onChange: (value) => void
 *   placeholder: string — shown when nothing is selected (value = '')
 *   disabled?: boolean
 *   title?: string
 */
const CustomSimpleSelect = ({ options, value, onChange, placeholder = 'Select...', disabled = false, title, searchable = false, persistentValues = ['all'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);
    const { getPortalContainer } = useAppContext();

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
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen, searchable]);

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
            
            // Re-calculate on scroll of the horizontal container
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

    const selected = options.find(o => o.value === value);
    const label = selected ? selected.label : placeholder;

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery('');
    };

    const filteredOptions = searchable 
        ? options.filter(opt => 
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (persistentValues && persistentValues.includes(opt.value))
          )
        : options;

    return (
        <div className="custom-select-container" ref={dropdownRef} title={title}>
            <button
                ref={triggerRef}
                className={`custom-select-trigger filter-select glass-panel ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                type="button"
                disabled={disabled}
                style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
            >
                <div className="custom-select-value">
                    {selected?.color && (
                        <span className="category-dot" style={{ backgroundColor: selected.color }} />
                    )}
                    {label}
                </div>
                <ChevronDown size={14} style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.6, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {isOpen && createPortal(
                <div 
                    ref={menuRef}
                    className="custom-select-menu animate-fade-in" 
                    style={menuStyle}
                >
                    {searchable && (
                        <div className="select-search-wrapper">
                            <Search size={14} className="select-search-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="select-search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {searchQuery && (
                                <button 
                                    className="select-search-clear" 
                                    onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                                    type="button"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="select-options-list">
                        {filteredOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt.value)}
                                type="button"
                            >
                                {opt.color && (
                                    <span className="category-dot" style={{ backgroundColor: opt.color }} />
                                )}
                                {opt.label}
                            </button>
                        ))}
                        {searchable && filteredOptions.length === 0 && (
                            <div className="no-options-found">No results found</div>
                        )}
                    </div>
                </div>,
                getPortalContainer()
            )}
        </div>
    );
};

export default CustomSimpleSelect;
