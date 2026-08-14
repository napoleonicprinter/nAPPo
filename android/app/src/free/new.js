/* Inside the style.innerHTML string in MapView.jsx */

.clear-filters-floating {display: flex !important; 
    position: fixed !important; 
    
    /* 1. INCREASE THIS VALUE */
    /* 25px is too low for real mobile browsers. 80px-100px is safer. */
    bottom: 90px !important; 
    
    left: 20px !important; 
    z-index: 9999 !important;
    
    /* 2. ADD SAFE AREA SUPPORT */
    /* This ensures it respects the home-bar on modern iPhones/Androids */
    margin-bottom: env(safe-area-inset-bottom) !important;

    background: rgba(255, 255, 255, 0.9) !important; 
    backdrop-filter: blur(8px) !important; 
    -webkit-backdrop-filter: blur(8px) !important;
    color: #ff4444 !important; 
    border: 1.5px solid #ff4444 !important; 
    padding: 8px 16px !important; 
    border-radius: 20px !important;
    font-weight: 700 !important; 
    font-size: 12px !important; 
    align-items: center !important; 
    justify-content: center !important;
    gap: 6px !important; 
    cursor: pointer !important; 
    pointer-events: auto !important; 
    text-transform: uppercase !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}