/* Inside the style.innerHTML string in MapView.jsx */

.clear-filters-floating {
    display: flex !important;
    position: fixed !important;
    
    /* 1. INCREASE BOTTOM OFFSET */
    /* 90px-100px ensures it clears the mobile browser toolbar */
    bottom: 100px !important; 
    
    left: 20px !important;
    
    /* 2. ENSURE HIGH Z-INDEX */
    /* Leaflet markers use up to 1000; 9999 ensures it stays on top */
    z-index: 9999 !important;
    
    /* 3. ADD SAFE AREA SUPPORT */
    /* This handles the home bar on modern iPhones and Androids */
    margin-bottom: env(safe-area-inset-bottom) !important;

    /* Styling to match your screenshot */
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    color: #ff4444 !important;
    border: 2px solid #ff4444 !important;
    padding: 8px 16px !important;
    border-radius: 25px !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
    pointer-events: auto !important;
}


jsx
// ... inside the MapView return block ...

            </MapContainer>

            {/* --- MOVE THE BUTTON HERE (OUTSIDE MAPCONTAINER) --- */}
            {isMobileLike && isFiltered && (
                <button
                    className="clear-filters-floating animate-fade-in"
                    onClick={() => clearAllFilters()}
                >
                    <span>✕</span> CLEAR ALL
                </button>
            )}

            <HelpCard />
        </div>
    );
};

export default MapView;