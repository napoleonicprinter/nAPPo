jsx
                <div className="mobile-overlay-filters">
                    {/* --- GROUPED HELP + LOCATION (Eliminates the gap) --- */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* 1. SMALL HELP TAG (?) */}
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
                                     style={{ position: 'absolute', top: '110%', left: 0, zIndex: 1000, minWidth: '160px', maxHeight: '300px', overflowY: 'auto' }}>
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

                        {/* 2. LOCATION SELECTOR */}
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

                    {/* 3. RADIUS FILTER (Shown only if location is selected) */}
                    {locationMode !== 'none' && (
                        <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
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

                    {/* 4. ALL OTHER FILTERS */}
                    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>
                    <SignificanceFilter className="mobile-tag-filter" />
                    <YearFilter className="mobile-tag-filter year-filter-mobile" />
                    <CommanderFilter className="mobile-tag-filter mobile-commander-filter" />
                    <ArcFilter className="mobile-tag-filter mobile-arc-filter" />

                    <div className="mobile-tag-filter">
                        <button className={`custom-select-trigger mobile-icon-btn glass-panel ${showFilters ? 'active' : ''} ${isModalFiltered ? 'filters-active-red' : ''}`} onClick={() => { setShowFilters(!showFilters); setIsMenuOpen(false); }}>
                            <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Filter size={16} />
                                <span>Filters</span>
                            </div>
                        </button>
                    </div>

                    <div className="mobile-tag-filter">
                        <button className="custom-select-trigger mobile-icon-btn glass-panel" onClick={() => setShowNews(true)}>
                            <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Newspaper size={16} />
                                    {recentNewsCount > 0 && <span className="news-badge">{recentNewsCount}</span>}
                                </div>
                                <span>News</span>
                            </div>
                        </button>
                    </div>
                </div> {/* End mobile-overlay-filters */}
            </div> {/* End filters-group */}

            {/* Settings Dropdown */}
            <div ref={menuRef} className={`header-controls desktop-only hide-in-mobile-tablet ${showSettings ? 'mobile-open' : ''}`}>
                <div className="header-actions">
                    <button className="desktop-header-btn glass-panel" onClick={() => setShowEvents(true)}><Calendar size={20} /></button>
                    <FloatingViewToggle className="desktop-header-btn" />
                    <button
                        className={`desktop-header-btn glass-panel ${showSettings ? 'menu-open' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        {showSettings ? <X size={24} /> : <Settings size={24} />}
                    </button>
                </div>

                <div className="settings-wrapper">
                    {typeof document !== 'undefined' && createPortal(
                        <>
                            <div
                                className={`settings-drawer-backdrop ${showSettings ? 'open' : ''}`}
                                onClick={() => setShowSettings(false)}
                            />

                            <div className={`settings-drawer ${showSettings ? 'open' : ''}`}>
                                <div className="settings-drawer-header">
                                    <h3><Settings size={20} /> Settings</h3>
                                    <button className="settings-drawer-close" onClick={() => setShowSettings(false)}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="settings-drawer-content" style={{ paddingBottom: '2rem' }}>
                                    {/* Your Settings Content (Theme, Clusters, etc.) */}
                                    <div className="settings-section">
                                        <button onClick={toggleTheme} className="glass-panel" style={{ width: '100%', padding: '12px' }}>
                                            {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>,
                        getPortalContainer()
                    )}
                </div>
            </div>

            {/* Modals Rendering */}
            <NewsModal isOpen={showNews} onClose={() => setShowNews(false)} />
            <FiltersModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
            <EventsModal isOpen={showEvents} onClose={() => setShowEvents(false)} />
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

            {showCalendarView && <CalendarView onClose={() => setShowCalendarView(false)} />}
            {showShoppingView && <ShoppingView onClose={() => setShowShoppingView(false)} />}
        </header>
    );
};

export default Header;