// Inside AuthModal.jsx
return createPortal(
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        // ADD THIS LINE TO OVERRIDE THE FILTERS DRAWER
        zIndex: 99999999, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        {/* Modal Content */}
    </div>,
    document.body
);