{/* HELP BUTTON (?) - Grouped with Location to avoid gaps */}
<div className="mobile-tag-filter" style={{ minWidth: 'auto' }}>
    <div className="custom-select-container" style={{ position: 'relative' }}>
        <button
            className="custom-select-trigger glass-panel"
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
