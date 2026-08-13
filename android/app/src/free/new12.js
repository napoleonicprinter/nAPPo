
    const isModalFiltered = filterSearch !== '' || filterCountry !== 'all' || filterCoalition !== 'all' || filterCampaign !== 'all' || filterVisited !== 'all' || showOnlyNew || filterWithMaps;

    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    // ... rest of your existing logic ...

    /* Find the mobile-overlay-filters section at the bottom and ensure it is closed correctly: */
    return (
        <header className="app-header glass-header">
            {/* ... brand and logo ... */}
            
            <div className="filters-group">
                {/* ... desktop filters ... */}

                <div className="mobile-overlay-filters">
                    {/* HELP BUTTON (?) */}
                    <div className="mobile-tag-filter" style={{ minWidth: 'auto' }}>
                        <div className="custom-select-container help-select" style={{ position: 'relative' }}>
                            <button
                                className={`custom-select-trigger glass-panel ${showHelpDropdown ? 'active' : ''}`}
                                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    minWidth: '40px',
                                    padding: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '12px'
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>?</span>
                            </button>

                            {showHelpDropdown && (
                                <div className="custom-select-dropdown glass-panel animate-fade-in"
                                     style={{
                                        position: 'absolute',
                                        top: '110%',
                                        left: 0,
                                        zIndex: 1000,
                                        minWidth: '160px',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                     }}>
                                    {HELP_ITEMS.map((item) => (
                                        <div
                                            key={item.id}
                                            className="custom-select-option"
                                            onClick={() => {
                                                setSelectedHelpItem(item);
                                                setShowHelpDropdown(false);
                                            }}
                                        >
                                            {item.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LOCATION SELECTOR */}
                    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                        <CustomSimpleSelect
                            options={[{ value: 'none', label: 'Location...' }, { value: 'geo', label: '⮞ My Location' }, ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))]}
                            value={locationMode}
                            onChange={handleLocationSelect}
                            searchable={true}
                            menuClassName="location-dropdown-menu"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
