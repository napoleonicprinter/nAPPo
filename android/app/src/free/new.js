// Add these inside AppProvider
const [selectedHelpItem, setSelectedHelpItem] = useState(null);

// Add to return value
return (
    <AppContext.Provider value={{
        // ...
        selectedHelpItem,
        setSelectedHelpItem
    }}>