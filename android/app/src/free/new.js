    // FIX: Ensure popups are always in the foreground and style the close button
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* 1. Force the entire Popup Pane to the absolute front */
            .leaflet-popup-pane {
                z-index: 100000 !important;
            }

            /* 2. Custom Red Close Button Style */
            .leaflet-popup-close-button {
                background-color: #ff4444 !important;
                color: white !important;
                border-radius: 50% !important;
                width: 28px !important;
                height: 28px !important;
                line-height: 28px !important;
                text-align: center !important;
                font-size: 20px !important;
                font-weight: bold !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
                border: 2px solid white !important;

                /* Position it slightly overlapping the top-right corner */
                top: 8px !important;
                right: 8px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: transform 0.2s ease;
            }

            .leaflet-popup-close-button:hover {
                background-color: #e63939 !important;
                transform: scale(1.1);
            }

            /* Remove the default 'x' styling to ensure our custom look works */
            .leaflet-popup-close-button span {
                color: white !important;
                font-family: Arial, sans-serif !important;
            }

            /* 3. Popup Container Styling */
            .leaflet-popup-content-wrapper {
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                border: 1px solid rgba(255,255,255,0.15) !important;
                padding: 0 !important;
                overflow: hidden !important;
                border-radius: 12px !important;
            }

            .leaflet-popup-tip {
                background: white !important;
            }

            /* 4. Lower the Z-Index of UI menus to ensure they stay BEHIND the popup */
            .app-header,
            .filters-group,
            .mobile-overlay-filters,
            .filters-line,
            .header-controls {
                z-index: 1000 !important; /* Standard UI layer */
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);