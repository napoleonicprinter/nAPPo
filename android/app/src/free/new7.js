<div className="mobile-overlay-filters">
    {/*1. SMALL HELP TAG (?) */}
    <div className="custom-select-container help-select" style={{ position: 'relative', marginRight: '8px' }}>
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

    {/* 2. LOCATION SELECTOR */}
    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
        <CustomSimpleSelect
            options={[{ value: 'none', label: 'Location...' }, ...]}
            // ... rest of props
        />
    </div>
</div>