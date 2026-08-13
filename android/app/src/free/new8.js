jsx
                <div className="desktop-filters custom-desktop-layout">
                    {locationMode !== 'none' && (
                        <div className="desktop-only">
                            <CustomSimpleSelect
                                options={[
                                    { value: 'all', label: 'All Areas' },
                                    { value: '1', label: '1 km' },
                                    { value: '5', label: '5 km' },
                                    { value: '10', label: '10 km' },
                                    { value: '25', label: '25 km' },
                                    { value: '50', label: '50 km' },
                                    { value: '100', label: '100 km' },
                                    { value: '500', label: '500 km' },
                                ]}
                                value={filterRadius}
                                onChange={setFilterRadius}
                            />
                        </div>
                    )}

                    <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>

                    <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                        <SignificanceFilter />
                    </div>

                    <YearFilter className="desktop-year-filter" />
                    <CommanderFilter className="desktop-commander-filter" />
                    <ArcFilter className="desktop-arc-filter" />

                    {isFiltered && <button className="desktop-clear-filters glass-panel" onClick={clearAllFilters}>Clear</button>}
                    {activeMapOverlays && activeMapOverlays.length > 0 && <button className="desktop-clear-filters glass-panel" onClick={clearMapOverlays}>Clear Maps</button>}

                    <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button className={`custom-select-trigger filter-select glass-panel
                            ${showFilters ? 'active' : ''}
                            ${isModalFiltered ? 'filters-active-red' : ''}`}
                            onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}
                            style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                            <div className="custom-select-value" style={{ gap: '4px' }}>
                                <Filter size={16} />
                                <span>Filters</span>
                            </div>
                        </button>

                        <button className="custom-select-trigger filter-select glass-panel" onClick={() => { setShowNews(true); }} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                            <div className="custom-select-value" style={{ gap: '4px' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Newspaper size={16} />
                                    {recentNewsCount > 0 && (
                                        <span className="news-badge">{recentNewsCount}</span>
                                    )}
                                </div>
                                <span>News</span>
                            </div>
                        </button>

                        <button className={`custom-select-trigger filter-select glass-panel ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                            <div className="custom-select-value" style={{ gap: '4px' }}>
                                <ShoppingCart size={16} />
                                <span>Market</span>
                            </div>
                        </button>

                        <button className={`custom-select-trigger filter-select glass-panel ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')} style={{ justifyContent: 'center', height: '40px', padding: '0 10px', minWidth: 'auto' }}>
                            <div className="custom-select-value" style={{ gap: '4px' }}>
                                <Ticket size={16} />
                                <span>Events</span>
                            </div>
                        </button>
                    </div>
                </div> {/* End desktop-filters */}
            </div> {/* End filters-group */}

            <div className="mobile-overlay-filters">
                {/* 1. SMALL HELP TAG (?) */}
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
                                 style={{ position: 'absolute', top: '110%', left: 0, zIndex: 1000, minWidth: '160px' }}>
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

                {/* 2. LOCATION SELECTOR (Mobile) */}
                <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                    <CustomSimpleSelect
                        options={[
                            { value: 'none', label: 'Location...' },
                            { value: 'geo', label: '⮞ My Location' },
                            ...EUROPEAN_CAPITALS.map(c => ({ value: c.name, label: c.name }))
                        ]}
                        value={locationMode}
                        onChange={handleLocationSelect}
                        searchable={true}
                        menuClassName="location-dropdown-menu"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
