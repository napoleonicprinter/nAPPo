            activeDeals,
            activeMapOverlays,
            
            // --- HELP STATE EXPORTS ---
            selectedHelpItem,
            setSelectedHelpItem,
            
            // --- NAVIGATION MEMORY ---
            callerSite,
            setCallerSite
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;