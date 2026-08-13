            {/* MODAL DE DETALLE */}
            {selectedSite && (() => {
                const liveSite = sites.find(s => s.id === selectedSite.id) || selectedSite;
                const isStrictMobile = previewDevice === 'mobile';
                return (
                    <div style={{
                        position: 'fixed',
                        top: isStrictMobile ? '145px' : '50%',
                        left: '50%',
                        transform: isStrictMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                        width: '92%',
                        maxWidth: '400px',
                        zIndex: 2147483640,
                        pointerEvents: 'none'
                    }}>
                        <div className="animate-fade-in" style={{
                            pointerEvents: 'auto',
                            padding: '10px 40px 80px 40px',
                            maxHeight: isStrictMobile ? 'calc(100dvh - 160px)' : '85vh',
                            overflowY: 'auto',
                            scrollbarWidth: 'none'
                        }}>
                            <SiteCard
                                site={liveSite}
                                onClose={() => { 
                                    setSelectedSite(null); 
                                    if (setCallerSite) setCallerSite(null); 
                                }}
                                isCompact={false}
                            />
                        </div>
                    </div>
                );
            })()}

            {/* --- FLOATING UI & MODALS --- */}
            {isMobileLike && isFiltered && (
                <button className="clear-filters-floating animate-fade-in" onClick={() => clearAllFilters()}>
                    <span>✕</span> CLEAR ALL
                </button>
            )}

            {showDeals && <DealsView onClose={() => setShowDeals(false)} />}
            
            {/* Help Card Modal (Portal) */}
            <HelpCard />
        </div>
    );
};

export default MapView;