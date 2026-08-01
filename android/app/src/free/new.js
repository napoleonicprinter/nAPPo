/* Inside your style.innerHTML block */            /* 1. Remove Leaflet's default borders and frames */
            .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; border: none !important; }

            .leaflet-popup-content { margin: 0 !important; width: auto !important; overflow: visible !important; border: none !important; }

            /* 2. Deep Blurred Shadow for both Leaflet and Detail cards */
            .site-card {
                box-shadow: 0 30px 60px -12px ${shadowColor}, 0 18px 36px -18px ${shadowDeep} !important; border: none !important;
                border-radius: 12px !important; background: var(--bg-color, white) !important;
                             transform: none !important; transition: none !important;
            }

            .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; border: none !important; }
                        .leaflet-popup-content { margin: 0 !important; width: auto !important; overflow: visible !important; border: none !important; }
                        .site-card {
                            box-shadow: 0 30px 60px -12px ${shadowColor}, 0 18px 36px -18px ${shadowDeep} !important;
                            border: none !important; border-radius: 12px !important; background: var(--bg-color, white) !important;
                            transform: none !important; transition: none !important;
                        }