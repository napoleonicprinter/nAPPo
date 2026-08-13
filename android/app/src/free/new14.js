jsx
<div className="mobile-overlay-filters">
    {/* --- GROUP: HELP + LOCATION (Eliminates the gap) --- */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* SMALL HELP TAG (?) */}
        <div className="custom-select-container help-select" style={{ position: 'relative' }}>
            <button
                className={`custom-select-trigger glass-panel ${showHelpDropdown ? 'active' : ''}`}
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                style={{
                    width: '40px', height: '40px', minWidth: '40px', padding: 0,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px'
                }}
            >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>?</span>
            </button>

            {showHelpDropdown && (
                <div className="custom-select-dropdown glass-panel animate-fade-in"
                     style={{ position: 'absolute', top: '110%', left: 0, zIndex: 1000, minWidth: '160px', maxHeight: '300px', overflowY: 'auto' }}>
                    {HELP_ITEMS.map((item) => (
                        <div key={item.id} className="custom-select-option"
                            onClick={() => { setSelectedHelpItem(item); setShowHelpDropdown(false); }}>
                            {item.title}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* LOCATION SELECTOR (Your existing code) */}
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

    {/* --- RADIUS FILTER (Your existing code) --- */}
    {locationMode !== 'none' && (
        <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
            <CustomSimpleSelect
                options={[
                    { value: 'all', label: 'All Areas' }, { value: '1', label: '1 km' },
                    { value: '5', label: '5 km' }, { value: '10', label: '10 km' },
                    { value: '25', label: '25 km' }, { value: '50', label: '50 km' },
                    { value: '100', label: '100 km' }, { value: '500', label: '500 km' },
                ]}
                value={filterRadius}
                onChange={setFilterRadius}
            />
        </div>
    )}

    {/* --- CATEGORIES (Your existing code) --- */}
    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
    </div>

    {/* --- SIGNIFICANCE, YEAR, COMMANDER, ARC (Your existing code) --- */}
    <SignificanceFilter className="mobile-tag-filter" />
    <YearFilter className="mobile-tag-filter year-filter-mobile" />
    <CommanderFilter className="mobile-tag-filter mobile-commander-filter" />
    <ArcFilter className="mobile-tag-filter mobile-arc-filter" />

    {/* --- FILTERS MODAL BUTTON (Your existing code) --- */}
    <div className="mobile-tag-filter">
        <button className={`custom-select-trigger mobile-icon-btn glass-panel ${showFilters ? 'active' : ''} ${isModalFiltered ? 'filters-active-red' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} />
                <span>Filters</span>
            </div>
        </button>
    </div>

    {/* --- NEWS BUTTON (Your existing code) --- */}
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

    {/* --- MARKET & EVENTS (Your existing code) --- */}
    <div className="mobile-tag-filter">
        <button className={`custom-select-trigger mobile-icon-btn glass-panel ${view === 'shopping' ? 'active' : ''}`} onClick={() => handleViewChange('shopping')}>
            <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={16} />
                <span>Market</span>
            </div>
        </button>
    </div>
    <div className="mobile-tag-filter">
        <button className={`custom-select-trigger mobile-icon-btn glass-panel ${view === 'calendar' ? 'active' : ''}`} onClick={() => handleViewChange('calendar')}>
            <div className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ticket size={16} />
                <span>Events</span>
            </div>
        </button>
    </div>
</div>
