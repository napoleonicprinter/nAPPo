import React from 'react';
import { createPortal } from 'react-dom';import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';

const HelpCard = () => {
    const { selectedHelpItem, setSelectedHelpItem } = useAppContext();
    if (!selectedHelpItem) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 3000000000, display: 'flex', justifyContent: 'center',
            alignItems: 'center', backdropFilter: 'blur(6px)', padding: '20px'
        }} onClick={() => setSelectedHelpItem(null)}>
            
            <div className="animate-fade-in glass-panel" style={{
                width: '100%', maxWidth: '450px', maxHeight: '90vh', 
                overflowY: 'auto', backgroundColor: 'var(--bg-panel)',
                borderRadius: '20px', position: 'relative', scrollbarWidth: 'thin'
            }} onClick={e => e.stopPropagation()}>
                
                <button onClick={() => setSelectedHelpItem(null)} style={{
                    position: 'absolute', top: '15px', right: '15px', zIndex: 10,
                    background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                    borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer'
                }}><X size={20} /></button>

                {/* TALL IMAGE */}
                <div style={{ width: '100%', height: '400px' }}>
                    <img src={selectedHelpItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ padding: '25px' }}>
                    <h2 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>{selectedHelpItem.title}</h2>
                    <div style={{ lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {selectedHelpItem.content}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default HelpCard;