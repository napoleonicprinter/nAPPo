import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { normalizeServiceSheetType } from './ServiceSheetCard';

const getTypePluralLabel = (type) => {
    if (type === 'Ship') return 'Ships';
    if (type === 'Regiment') return 'Regiments';
    if (type === 'Commander') return 'Commanders';
    return type.endsWith('s') ? type : `${type}s`;
};

const ServiceSheetFilter = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);

    const {
        serviceSheets,
        serviceSheetTypes,
        filterServiceSheet,
        setFilterServiceSheet,
        getPortalContainer
    } = useAppContext();

    const isFilterSelected = Boolean(filterServiceSheet && filterServiceSheet !== 'all');

    // Group Service Sheets by Country -> Subgroups (Ships, Regiments, Commanders, etc.)
    // Counts reflect ONLY the number of Service Sheets (ships, regiments, commanders), NOT related sites.
    const countryGroups = useMemo(() => {
        const map = new Map();
        const orderedTypes = serviceSheetTypes || ['Ship', 'Regiment', 'Commander'];

        (serviceSheets || []).forEach(sheet => {
            const country = String(sheet.country || sheet.allegiance || 'Other').trim();
            if (!country) return;
            const normType = normalizeServiceSheetType(sheet.type || sheet.category);

            if (!map.has(country)) {
                map.set(country, {
                    country,
                    totalCount: 0,
                    typeCounts: {},
                    sheetsByType: {}
                });
            }
            const group = map.get(country);
            group.totalCount += 1;
            group.typeCounts[normType] = (group.typeCounts[normType] || 0) + 1;
            if (!group.sheetsByType[normType]) {
                group.sheetsByType[normType] = [];
            }
            group.sheetsByType[normType].push(sheet);
        });

        return Array.from(map.values())
            .sort((a, b) => a.country.localeCompare(b.country))
            .map(group => {
                const subgroups = orderedTypes
                    .filter(t => (group.typeCounts[t] || 0) > 0)
                    .map(t => ({
                        type: t,
                        label: getTypePluralLabel(t),
                        count: group.typeCounts[t] || 0,
                        value: `subgroup:${group.country}|${t}`,
                        sheets: group.sheetsByType[t] || []
                    }));
                return {
                    country: group.country,
                    value: `country:${group.country}`,
                    totalCount: group.totalCount,
                    subgroups
                };
            });
    }, [serviceSheets, serviceSheetTypes]);

    const filteredCountryGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return countryGroups;

        return countryGroups
            .map(group => {
                const countryMatches = group.country.toLowerCase().includes(q);
                if (countryMatches) return group;

                const matchingSubgroups = group.subgroups.filter(sub =>
                    sub.label.toLowerCase().includes(q) ||
                    sub.sheets.some(s => (s.name || '').toLowerCase().includes(q))
                );

                if (matchingSubgroups.length > 0) {
                    return {
                        ...group,
                        subgroups: matchingSubgroups
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [countryGroups, searchQuery]);

    const selectedLabel = useMemo(() => {
        if (!filterServiceSheet || filterServiceSheet === 'all') {
            return 'Service Sheets';
        }
        if (filterServiceSheet.startsWith('country:')) {
            return filterServiceSheet.slice('country:'.length);
        }
        if (filterServiceSheet.startsWith('subgroup:')) {
            const [country, type] = filterServiceSheet.slice('subgroup:'.length).split('|');
            return `${country} - ${getTypePluralLabel(type || '')}`;
        }
        return 'Service Sheets';
    }, [filterServiceSheet]);

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
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                if (!triggerRef.current) return;
                const rect = triggerRef.current.getBoundingClientRect();
                const container = getPortalContainer();
                const containerRect = container.getBoundingClientRect();

                const scale = rect.width / triggerRef.current.offsetWidth || 1;
                const isCloseToRightEdge = rect.left + 230 > containerRect.right;

                const style = {
                    position: 'absolute',
                    top: (rect.bottom - containerRect.top) / scale + 5,
                    minWidth: Math.max(triggerRef.current.offsetWidth, 220),
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

    const handleSelect = (val) => {
        setFilterServiceSheet(val);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={`custom-select-container ${className.replace(/filters-active-red/g, '')}`.trim()} ref={dropdownRef}>
            <button
                ref={triggerRef}
                className={`custom-select-trigger filter-select glass-panel ${isOpen ? 'open' : ''} ${isFilterSelected ? 'filters-active-red' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="custom-select-value">
                    {selectedLabel}
                </div>
                <ChevronDown
                    size={14}
                    style={{
                        marginLeft: 'auto',
                        flexShrink: 0,
                        opacity: 0.6,
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    className="custom-select-menu animate-fade-in"
                    style={menuStyle}
                >
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

                    <div className="select-options-list">
                        <button
                            className={`custom-select-option ${(!filterServiceSheet || filterServiceSheet === 'all') ? 'selected' : ''}`}
                            onClick={() => handleSelect('all')}
                            type="button"
                        >
                            <span style={{ flex: 1 }}>All Service Sheets</span>
                        </button>

                        {filteredCountryGroups.map(group => (
                            <React.Fragment key={group.country}>
                                {/* Country Header Option */}
                                <button
                                    className={`custom-select-option ${filterServiceSheet === group.value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(group.value)}
                                    type="button"
                                    style={{ fontWeight: 600 }}
                                >
                                    <span style={{ flex: 1 }}>{group.country}</span>
                                    <span className="category-count-badge">
                                        [{group.totalCount}]
                                    </span>
                                </button>

                                {/* Indented Category Subgroups (Ships, Regiments, Commanders, etc.) */}
                                {group.subgroups.map(sub => (
                                    <button
                                        key={sub.value}
                                        className={`custom-select-option ${filterServiceSheet === sub.value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(sub.value)}
                                        type="button"
                                        style={{
                                            paddingLeft: '32px',
                                            paddingRight: '38px',
                                            fontSize: '0.88em'
                                        }}
                                    >
                                        <span style={{ flex: 1 }}>{sub.label}</span>
                                        <span className="category-count-badge">
                                            [{sub.count}]
                                        </span>
                                    </button>
                                ))}
                            </React.Fragment>
                        ))}

                        {filteredCountryGroups.length === 0 && (
                            <div className="no-options-found">No results found</div>
                        )}
                    </div>
                </div>,
                getPortalContainer()
            )}
        </div>
    );
};

export default ServiceSheetFilter;
