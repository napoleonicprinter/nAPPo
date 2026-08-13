import React from 'react';
import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';

const HelpCard = () => {
    const { selectedHelpItem, setSelectedHelpItem } = useAppContext();

    if (!selectedHelpItem) return null;

    return (
        /* The Overlay: Covers the whole screen */
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dims the background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999, // Stays above the map and header
            padding: '20px'
        }} onClick={() => setSelectedHelpItem(null)}>

            {/* The Card: Centered */}
            <div
                className="glass-panel animate-pop-in"
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside card
            >
                {/* Red Close Button */}
                <button
                    onClick={() => setSelectedHelpItem(null)}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <X size={18} strokeWidth={3} />
                </button>

                {selectedHelpItem.image && (
                    <div style={{ width: '100%', height: '200px' }}>
                        <img
                            src={selectedHelpItem.image}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}

                <div style={{ padding: '24px' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)' }}>
                        {selectedHelpItem.title}
                    </h2>
                    <p style={{ lineHeight: '1.6', color: '#444', margin: 0 }}>
                        {selectedHelpItem.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpCard;