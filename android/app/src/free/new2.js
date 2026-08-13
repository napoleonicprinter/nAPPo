// 1. Destructure at top
const { selectedHelpItem, setSelectedHelpItem } = useAppContext();
const [showHelpDropdown, setShowHelpDropdown] = useState(false);

// 2. Add inside your horizontal menu (to the left of Location)
<div className="custom-select-container help-select" style={{ position: 'relative' }}>
    <button 
        className={`custom-select-trigger glass-panel ${showHelpDropdown ? 'active' : ''}`}
        onClick={() => setShowHelpDropdown(!showHelpDropdown)}
        style={{ minWidth: '40px', padding: '0 12px' }}
    >
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>?</span>
    </button>

    {showHelpDropdown && (
        <div className="custom-select-dropdown glass-panel animate-fade-in" 
             style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, minWidth: '160px' }}>
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