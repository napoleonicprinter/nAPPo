// D:/nAPPo_trails/src/components/SiteCard.jsx

// ... existing imports ...

const SiteCard = ({ site, onClose, isCompact = false, hideMapLink = false }) => {
    const { toggleVisited, userCoords, geolocationEnabled, setSelectedSite } = useAppContext();

    if (!site) return null;

    return (
        <div className={`site-card ${site.visited ? 'visited' : ''}`} style={{ position: 'relative' }}>
            
            {/* ... Red Close Button code ... */}

            <div className="card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={site.image} alt={site.name} className="card-image" style={{ width: '100%', display: 'block' }} />

                {/* NEW TAG (Upper Left) */}
                {site.isNew && (
                    <img src="/assets/new-tag.png" className="new-site-badge" alt="New" />
                )}

                {/* MARK AS VISITED (Lower Left of Image) */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    left: '10px', 
                    zIndex: 25 
                }}>
                    <button
                        className={`btn-visited ${site.visited ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleVisited(site.id);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.4)',
                            color: 'white',
                            backgroundColor: site.visited ? '#4caf50' : 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <CheckCircle size={14} />
                        {site.visited ? 'Visited' : 'Mark as Visited'}
                    </button>
                </div>

                {/* CATEGORY BADGE (Lower Right of Image) */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 15 }}>
                    <span className="badge" style={{ backgroundColor: getCategoryColor(site.category) }}>
                        {site.category}
                    </span>
                </div>
            </div>

            {/* ... Rest of card content ... */}
        </div>
    );
};