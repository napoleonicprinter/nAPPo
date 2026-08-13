jsx
{/* Header.jsx */}
<div className="mobile-overlay-filters">

    {/* 1. MOVE HELP TAG HERE */}
    <div className="mobile-tag-filter" style={{ minWidth: 'auto' }}>
        <div className="custom-select-container" style={{ position: 'relative' }}>
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
                    borderRadius: '12px',
                    backgroundColor: 'var(--accent-primary)', // To match your blue icon
                    border: 'none'
                }}
            >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>?</span>
            </button>

            {/* 2. FIX DROPDOWN Z-INDEX & POSITION */}
            {showHelpDropdown && (
                <div className="custom-select-dropdown glass-panel animate-fade-in"
                     style={{
                        position: 'absolute',
                        top: '100%',     // Right below button
                        left: '0',
                        zIndex: 9999,    // HIGHER THAN THE MAP
                        minWidth: '180px',
                        backgroundColor: 'white',
                        marginTop: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                     }}>
                    {HELP_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className="custom-select-option"
                            style={{ padding: '12px', color: '#333' }}
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

    {/* EXISTING LOCATION TAG SHOULD FOLLOW IMMEDIATELY */}
    <div className="mobile-tag-filter" style={{ minWidth: 'max-content' }}>
        <CustomSimpleSelect
            /* ... your location code ... */
        />
    </div>

    {/* EXISTING CATEGORY TAG */}
    <div className="mobile-tag-filter">
        {/* ... category code ... */}
    </div>
</div>