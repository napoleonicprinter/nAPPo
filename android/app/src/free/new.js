jsx
            {/* ... End of MapContainer ... */}
            </MapContainer>

            {/* MODAL DE DETALLE logic is here... */}

            {/* --- WRAP THE BUTTON IN A HIGH Z-INDEX CONTAINER --- */}
            <div style={{ position: 'relative', zIndex: 2147483647 }}>
                {isMobileLike && isFiltered && (
                    <button
                        className="clear-filters-floating animate-fade-in"
                        onClick={() => clearAllFilters()}
                    >
                        <span>✕</span> CLEAR ALL
                    </button>
                )}
            </div>

            <HelpCard />
        </div>
    );
};


            .clear-filters-floating {
                display: flex !important;
                position: fixed !important;
                /* Increased to 100px to clear the browser bottom bar + home indicator */
                bottom: 100px !important;
                left: 20px !important;
                /* Maximum possible Z-Index */
                z-index: 2147483647 !important;

                margin-bottom: env(safe-area-inset-bottom) !important;

                background: white !important; /* Solid white for better visibility */
                box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important; /* Strong shadow */

                color: #ff4444 !important;
                border: 2px solid #ff4444 !important;
                padding: 10px 20px !important; /* Slightly larger for easier tapping */
                border-radius: 30px !important;

                font-weight: 800 !important;
                font-size: 13px !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                cursor: pointer !important;
                pointer-events: auto !important;
                text-transform: uppercase !important;
            }