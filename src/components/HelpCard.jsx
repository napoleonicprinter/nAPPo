import React from 'react';
import { useAppContext } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { HELP_ITEMS } from '../data/helpData'; // This pulls from the file we fixed in Step 1

const HelpCard = () => {
    const { selectedHelpItem, setSelectedHelpItem, isMobileLike } = useAppContext();

    if (!selectedHelpItem) return null;

    const currentIndex = HELP_ITEMS.findIndex(item => item.id === selectedHelpItem.id);

    const handlePrevious = (e) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + HELP_ITEMS.length) % HELP_ITEMS.length;
        setSelectedHelpItem(HELP_ITEMS[prevIndex]);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % HELP_ITEMS.length;
        setSelectedHelpItem(HELP_ITEMS[nextIndex]);
    };

    const displayImage = isMobileLike
        ? (selectedHelpItem.imageMobile || selectedHelpItem.image)
        : (selectedHelpItem.imagePc || selectedHelpItem.image);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 999999, padding: '20px'
        }} onClick={() => setSelectedHelpItem(null)}>
            <div className="glass-panel animate-pop-in" style={{
                position: 'relative', width: '100%', maxWidth: '400px',
                backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }} onClick={(e) => e.stopPropagation()}>

                <button onClick={() => setSelectedHelpItem(null)} style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '32px', height: '32px', backgroundColor: '#ff4444',
                    color: 'white', border: '2px solid white', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                }}>
                    <X size={18} strokeWidth={3} />
                </button>

                {displayImage && (
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#f0f0f0' }}>
                        <img src={displayImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <button onClick={handlePrevious} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <ChevronLeft size={28} color="#666" />
                        </button>
                        <h2 style={{ margin: 0, color: 'var(--accent-primary)', textAlign: 'center', flex: 1 }}>
                            {selectedHelpItem.title}
                        </h2>
                        <button onClick={handleNext} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <ChevronRight size={28} color="#666" />
                        </button>
                    </div>
                    <div style={{ lineHeight: '1.6', color: '#444', textAlign: 'center' }}>
                        {selectedHelpItem.content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCard;