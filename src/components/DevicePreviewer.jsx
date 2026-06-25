import React, { useState, useEffect, useRef } from 'react';
import MapView from './MapView';
import CardView from './CardView';
import Header from './Header';
import { Monitor, Tablet, Smartphone, RotateCw, ZoomIn, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './DevicePreviewer.css';

const DevicePreviewer = () => {
    const { setView, previewDevice, setPreviewDevice, portalContainerRef, innerView } = useAppContext();
    const deviceType = previewDevice;
    const [isLandscape, setIsLandscape] = useState(false);
    const [scale, setScale] = useState(0.8);
    const screenRef = useRef(null);

    // Point the global portal container at this device screen
    useEffect(() => {
        if (screenRef.current) {
            portalContainerRef.current = screenRef.current;
        }
        return () => { portalContainerRef.current = null; };
    }, [portalContainerRef]);

    const handleExit = () => {
        setView('map');
    };

    const toggleOrientation = () => {
        if (deviceType !== 'desktop') {
            setIsLandscape(!isLandscape);
        }
    };

    // Auto-adjust scale based on device selection
    useEffect(() => {
        if (deviceType === 'mobile') setScale(0.85);
        else if (deviceType === 'tablet') setScale(0.55);
        else setScale(1);
        setIsLandscape(false);
    }, [deviceType]);

    const getFrameClass = () => {
        let classes = `device-frame device-${deviceType}`;
        if (isLandscape && deviceType !== 'desktop') classes += ' landscape';
        return classes;
    };

    return (
        <div className="device-previewer-overlay animate-fade-in">
            <div className="previewer-grid-overlay"></div>
            
            
  {/* Unified header for all device types */}
  <header className="previewer-header">
    <div className="previewer-logo">
      <div className="previewer-logo-icon" style={deviceType !== 'desktop' ? {background: 'var(--accent-primary)'} : {}}>
        {deviceType === 'desktop' ? <ShieldCheck size={20} /> : deviceType === 'mobile' ? <Smartphone size={20} /> : <Tablet size={20} />}
      </div>
      <span>
        {deviceType === 'desktop' ? 'nAPPo Dev Preview' : deviceType === 'mobile' ? 'Mobile Preview' : 'Tablet Preview'}
      </span>
    </div>
    <div className="device-selectors">
      <button className={`selector-btn ${deviceType === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewDevice('desktop')}>PC</button>
      <button className={`selector-btn ${deviceType === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewDevice('mobile')}>Mobile</button>
      <button className={`selector-btn ${deviceType === 'tablet' ? 'active' : ''}`} onClick={() => setPreviewDevice('tablet')}>Tablet</button>
    </div>
    <div className="previewer-actions">
      <button className="exit-btn" onClick={handleExit}>
        <X size={16} />
        <span>
          {deviceType === 'desktop' ? 'Exit Developer Mode' : `Close ${deviceType === 'mobile' ? 'Mobile' : 'Tablet'} Preview`}
        </span>
      </button>
    </div>
  </header>


            <main className="preview-stage">
                <div 
                    className="device-container" 
                    style={{ transform: deviceType !== 'desktop' ? `scale(${scale})` : 'none', transformOrigin: 'center center' }}
                >
                    <div className={getFrameClass()}>
                        {deviceType === 'mobile' && <div className="phone-notch"></div>}
                        <div className="device-screen" ref={screenRef}>
                            <Header />
                            {innerView === 'map' ? <MapView /> : <CardView />}
                        </div>
                        {deviceType === 'mobile' && <div className="phone-home-indicator"></div>}
                    </div>
                </div>
            </main>

            <div className="preview-controls">
                {deviceType !== 'desktop' && (
                    <div className="control-item">
                        <span className="control-label">Orientation</span>
                        <button 
                            className="control-icon-btn" 
                            onClick={toggleOrientation}
                            title="Rotate Device"
                        >
                            <RotateCw size={18} />
                        </button>
                    </div>
                )}
                
                {deviceType !== 'desktop' && (
                    <div className="control-item">
                        <span className="control-label">Scale</span>
                        <input 
                            type="range" 
                            min="0.3" 
                            max="1.5" 
                            step="0.05" 
                            value={scale} 
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="zoom-slider"
                        />
                        <span className="zoom-value">{Math.round(scale * 100)}%</span>
                    </div>
                )}

                <div className="control-item">
                    <a 
                        href="/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="control-icon-btn"
                        title="Open App in New Tab"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DevicePreviewer;
