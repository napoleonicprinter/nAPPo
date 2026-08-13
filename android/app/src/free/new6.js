{/* --- DESKTOP HELP TAG --- */}
<div className="desktop-only help-select-wrapper" style={{ marginRight: '8px' }}>
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