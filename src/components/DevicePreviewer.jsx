import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, ZoomIn, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './DevicePreviewer.css';

const DevicePreviewer = () => {
    const { setView } = useAppContext();
    const [deviceType, setDeviceType] = useState('desktop');
    const [isLandscape, setIsLandscape] = useState(false);
    const [scale, setScale] = useState(0.8);
    const [iframeUrl, setIframeUrl] = useState('/');

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
        if (deviceType === 'phone') setScale(0.85);
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
            
            <header className="previewer-header">
                <div className="previewer-logo">
                    <div className="previewer-logo-icon">
                        <ShieldCheck size={20} />
                    </div>
                    <span>nAPPo Dev Preview</span>
                </div>

                <div className="device-selectors">
                    <button 
                        className={`selector-btn ${deviceType === 'phone' ? 'active' : ''}`}
                        onClick={() => setDeviceType('phone')}
                    >
                        <Smartphone size={16} />
                        <span>Mobile</span>
                    </button>
                    <button 
                        className={`selector-btn ${deviceType === 'tablet' ? 'active' : ''}`}
                        onClick={() => setDeviceType('tablet')}
                    >
                        <Tablet size={16} />
                        <span>Tablet</span>
                    </button>
                    <button 
                        className={`selector-btn ${deviceType === 'desktop' ? 'active' : ''}`}
                        onClick={() => setDeviceType('desktop')}
                    >
                        <Monitor size={16} />
                        <span>Desktop</span>
                    </button>
                </div>

                <div className="previewer-actions">
                    <button 
                        className="exit-btn"
                        onClick={handleExit}
                    >
                        <X size={16} />
                        <span>Exit Developer Mode</span>
                    </button>
                </div>
            </header>

            <main className="preview-stage">
                <div 
                    className="device-container" 
                    style={{ transform: deviceType !== 'desktop' ? `scale(${scale})` : 'none', transformOrigin: 'center center' }}
                >
                    <div className={getFrameClass()}>
                        {deviceType === 'phone' && <div className="phone-notch"></div>}
                        <iframe 
                            src={iframeUrl} 
                            className="preview-content"
                            title="Application Preview"
                        ></iframe>
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
