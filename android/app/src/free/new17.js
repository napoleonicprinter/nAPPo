{/* HELP TAG - Small like the 'arc' tag */}
<div className="mobile-tag-filter" style={{ minWidth: 'auto', marginRight: '4px' }}>
    <div className="custom-select-container" style={{ position: 'relative' }}>
        <button
            className="glass-panel"
            onClick={() => setShowHelpDropdown(!showHelpDropdown)}
            style={{ 
                width: '40px', height: '40px', padding: 0, 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '12px'
            }}
        >
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>?</span>
        </button>

        {showHelpDropdown && (
            <div className="custom-select-dropdown glass-panel animate-fade-in"
                 style={{ position: 'absolute', top: '110%', left: 0, zIndex: 1000, minWidth: '180px' }}>
                {HELP_ITEMS.map((item) => (
                    <div key={item.id} className="custom-select-option"
                         onClick={() => { setSelectedHelpItem(item); setShowHelpDropdown(false); }}>
                        {item.title}
                    </div>
                ))}
            </div>
        )}
    </div>
</div>