import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Navigation } from 'lucide-react';

// Reusing same icon setup for standard markers just in case
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User location icon
const userIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Site location icon (blue)
const siteIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const MapFitter = ({ userCoords, site }) => {
    const map = useMap();
    useEffect(() => {
        if (userCoords && site) {
            const bounds = L.latLngBounds([
                [userCoords.lat, userCoords.lon],
                [site.latitude, site.longitude]
            ]);
            // Pad bounds to ensure markers aren't right on edge
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [userCoords, site, map]);
    return null;
};

const NavigationModal = ({ userCoords, site, onClose }) => {
    if (!userCoords || !site) return null;

    const linePositions = [
        [userCoords.lat, userCoords.lon],
        [site.latitude, site.longitude]
    ];

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} className="animate-fade-in" onClick={onClose}>

            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                border: '1px solid var(--border-color)'
            }} onClick={e => e.stopPropagation()}>

                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Navigation size={20} color="var(--accent-primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Navigating to {site.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer
                        center={[userCoords.lat, userCoords.lon]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        <MapFitter userCoords={userCoords} site={site} />

                        <Marker position={[userCoords.lat, userCoords.lon]} icon={userIcon}>
                            <Popup>Your Location</Popup>
                        </Marker>

                        <Marker position={[site.latitude, site.longitude]} icon={siteIcon}>
                            <Popup>{site.name}</Popup>
                        </Marker>

                        <Polyline
                            positions={linePositions}
                            color="var(--accent-primary)"
                            weight={4}
                            dashArray="10, 10"
                            opacity={0.8}
                        />
                    </MapContainer>
                </div>

                <div style={{ padding: '15px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Distance: <strong>{site.distance} km</strong> (Direct line)
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NavigationModal;
