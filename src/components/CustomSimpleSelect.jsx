import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
const CustomSimpleSelect = ({ options, value, onChange, placeholder = 'Select...', disabled = false, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(o => o.value === value);
    const label = selected ? selected.label : placeholder;

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-select-container" ref={dropdownRef} title={title}>
            <button
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

            {isOpen && (
                <div className="custom-select-menu animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
                    {options.map(opt => (
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
                </div>
            )}
        </div>
    );
};

export default CustomSimpleSelect;
