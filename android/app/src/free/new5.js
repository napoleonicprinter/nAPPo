jsx
            <div className="filters-group">
                {/*
                   This container handles the horizontal scroll row.
                   We put Help + Location first so they are at the far left.
                */}
                <div className="mobile-overlay-filters">

                    {/* HELP + LOCATION GROUP - Grouped in a div to eliminate the gap */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* SMALL HELP TAG (?) */}
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

                        {/* LOCATION SELECTOR */}
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

                    {/* OTHER FILTERS (Categories, Stars, etc.) */}
                    <div className="mobile-tag-filter">
                        <CustomCategorySelect categories={categories} value={filterCategory} onChange={setFilterCategory} categoryCounts={categoryCounts} />
                    </div>

                    <div className="mobile-tag-filter">
                        <SignificanceFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <YearFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <CommanderFilter />
                    </div>

                    <div className="mobile-tag-filter">
                        <ArcFilter />
                    </div>

                    {/* FILTER MODAL BUTTON */}
                    <button
                        className={`custom-select-trigger filter-select glass-panel ${isModalFiltered ? 'filters-active-red' : ''}`}
                        onClick={() => setShowFilters(true)}
                        style={{ height: '40px', padding: '0 12px', minWidth: 'auto', borderRadius: '12px' }}
                    >
                        <Filter size={18} />
                        <span style={{ marginLeft: '6px' }}>Filters</span>
                    </button>

                    {/* NEWS BUTTON */}
                    <button
                        className="custom-select-trigger filter-select glass-panel"
                        onClick={() => setShowNews(true)}
                        style={{ height: '40px', padding: '0 12px', minWidth: 'auto', borderRadius: '12px' }}
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Newspaper size={18} />
                            {recentNewsCount > 0 && <span className="news-badge">{recentNewsCount}</span>}
                        </div>
                        <span style={{ marginLeft: '6px' }}>News</span>
                    </button>

                </div> {/* End mobile-overlay-filters */}
            </div> {/* End filters-group */}

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