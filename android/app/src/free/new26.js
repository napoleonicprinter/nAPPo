jsx
{/* --- 1. LOCATION TAG --- */}
<div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
    <CustomSimpleSelect
        // Apply active class if locationMode is not 'none'
        className={locationMode !== 'none' ? 'filter-active' : ''}
        options={[...]}
        value={locationMode}
        onChange={handleLocationSelect}
        /* Style logic: Blue background if active */
        style={{
            backgroundColor: locationMode !== 'none' ? 'var(--accent-primary)' : 'white',
            color: locationMode !== 'none' ? 'white' : 'inherit'
        }}
    />
</div>

{/* --- 2. AREA (RADIUS) TAG --- */}
{locationMode !== 'none' && (
    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
        <CustomSimpleSelect
            className={filterRadius !== 'all' ? 'filter-active' : ''}
            options={[...]}
            value={filterRadius}
            onChange={setFilterRadius}
            style={{
                backgroundColor: filterRadius !== 'all' ? 'var(--accent-primary)' : 'white',
                color: filterRadius !== 'all' ? 'white' : 'inherit'
            }}
        />
    </div>
)}

{/* --- 3. CATEGORY TAG --- */}
<div className="mobile-tag-filter">
    <CustomCategorySelect
        className={filterCategory !== 'all' ? 'filter-active' : ''}
        categories={categories}
        value={filterCategory}
        onChange={setFilterCategory}
        style={{
            backgroundColor: filterCategory !== 'all' ? 'var(--accent-primary)' : 'white',
            color: filterCategory !== 'all' ? 'white' : 'inherit'
        }}
    />
</div>

{/* --- 4. YEARS TAG --- */}
<div className="mobile-tag-filter">
    <CustomSimpleSelect
        className={filterYear !== 'all' ? 'filter-active' : ''}
        options={YEAR_OPTIONS}
        value={filterYear}
        onChange={setFilterYear}
        style={{
            backgroundColor: filterYear !== 'all' ? 'var(--accent-primary)' : 'white',
            color: filterYear !== 'all' ? 'white' : 'inherit'
        }}
    />
</div>

{/* --- 5. COMMANDERS TAG --- */}
<div className="mobile-tag-filter">
    <CustomSimpleSelect
        className={filterCommander !== 'all' ? 'filter-active' : ''}
        options={COMMANDER_OPTIONS}
        value={filterCommander}
        onChange={setFilterCommander}
        style={{
            backgroundColor: filterCommander !== 'all' ? 'var(--accent-primary)' : 'white',
            color: filterCommander !== 'all' ? 'white' : 'inherit'
        }}
    />
</div>