            {/* MODAL DE DETALLE - Fixed to show "Visited" status immediately */}
            {selectedSite && (() => {
                // Find the "live" version of the site from the global array
                const liveSite = sites.find(s => s.id === selectedSite.id) || selectedSite;
                
                return (
                    <div style={{
                        position: 'fixed',
                        top: isMobileLike ? '145px' : '135px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '92%',
                        maxWidth: '400px',
                        zIndex: 2147483647,
                        pointerEvents: 'none' 
                    }}>
                        <div
                            className="animate-fade-in"
                            style={{
                                pointerEvents: 'auto',
                                padding: '10px 20px 80px 20px', 
                                maxHeight: isMobileLike ? 'calc(100dvh - 160px)' : '80vh',
                                overflowY: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                        >
                            <SiteCard
                                // FIX: Pass the liveSite instead of the stale selectedSite
                                site={liveSite}
                                onClose={() => setSelectedSite(null)}
                                isCompact={false}
                            />
                        </div>
                    </div>
                );
            })()}