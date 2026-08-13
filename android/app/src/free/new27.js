jsx
<div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
    {/* PC HELP BUTTON */}
    <button className="custom-select-trigger filter-select glass-panel"
            onClick={() => setShowHelpDropdown(!showHelpDropdown)}
            style={{ justifyContent: 'center', height: '40px', padding: '0 12px', minWidth: 'auto' }}>
        <div className="custom-select-value" style={{ gap: '6px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>?</span>
            <span>Help</span>
        </div>
    </button>

    {/* Desktop Dropdown */}
    {showHelpDropdown && (
        <div className="custom-select-dropdown glass-panel" style={{ position: 'absolute', top: '45px', left: 0, zIndex: 10000 }}>
             {HELP_ITEMS.map((item) => (
                <div key={item.id} className="custom-select-option" onClick={() => { setSelectedHelpItem(item); setShowHelpDropdown(false); }}>
                    {item.title}
                </div>
            ))}
        </div>
    )}
</div>