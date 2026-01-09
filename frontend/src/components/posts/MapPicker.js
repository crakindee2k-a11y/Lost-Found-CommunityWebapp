import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to prevent Leaflet from capturing external events
const MapEventsHandler = () => {
    const map = useMap();

    useEffect(() => {
        if (map && map._container) {
            const container = map._container;
            
            // Prevent events from propagating outside the map container
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            
            // Disable non-essential handlers
            if (map.boxZoom) map.boxZoom.disable();
            if (map.doubleClickZoom) map.doubleClickZoom.disable();
            if (map.keyboard) map.keyboard.disable();
            if (map.tap) map.tap.disable();
            if (map.touchZoom) map.touchZoom.disable();
            
            // CRITICAL FIX: Prevent Leaflet's dragging from adding global event listeners
            // that interfere with clicks outside the map
            if (map.dragging && map.dragging._draggable) {
                const draggable = map.dragging._draggable;
                
                // Override the draggable's finishDrag to prevent it from interfering
                const originalFinishDrag = draggable._onUp;
                draggable._onUp = function(e) {
                    if (originalFinishDrag) {
                        originalFinishDrag.call(this, e);
                    }
                    // Remove any lingering global event listeners
                    L.DomEvent.off(document, 'mousemove touchmove', draggable._onMove, draggable);
                    L.DomEvent.off(document, 'mouseup touchend', draggable._onUp, draggable);
                };
            }
        }
    }, [map]);

    return null;
};

const LocationMarker = ({ position, setPosition, setAddress }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            // Reverse geocode to get address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                })
                .catch(err => console.error('Geocoding error:', err));
        },
    });

    return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onLocationSelect, initialAddress = '' }) => {
    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState(initialAddress);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const mapRef = useRef();

    // Default center (you can change this to user's location or a default city)
    const defaultCenter = [40.7128, -74.0060]; // New York

    useEffect(() => {
        // Try to get user's current location
        if (navigator.geolocation && !position) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setPosition(userLocation);
                },
                (err) => {
                    console.log('Could not get user location:', err);
                }
            );
        }
    }, []);

    useEffect(() => {
        if (position && address) {
            onLocationSelect({
                address,
                coordinates: {
                    lat: position.lat,
                    lng: position.lng
                }
            });
        }
    }, [position, address, onLocationSelect]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const location = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setPosition(location);
                setAddress(data[0].display_name);
                
                // Pan map to the location
                if (mapRef.current) {
                    mapRef.current.setView(location, 15);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="map-picker-container">
            <div className="map-picker-header">
                <button
                    type="button"
                    className="map-toggle-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {isOpen ? 'Hide Map' : 'Pick Location on Map'}
                </button>
                
                {position && (
                    <div className="selected-location-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Location selected
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="map-picker-content">
                    <form onSubmit={handleSearch} className="map-search-form">
                        <input
                            type="text"
                            placeholder="Search for a location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="map-search-input"
                        />
                        <button type="submit" className="map-search-btn" disabled={isSearching}>
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className="map-instructions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Click anywhere on the map to select a location
                    </div>

                    <div className="map-wrapper">
                        <MapContainer
                            key={isOpen ? 'map-open' : 'map-closed'}
                            center={position || defaultCenter}
                            zoom={13}
                            style={{ height: '320px', width: '100%', borderRadius: '12px' }}
                            scrollWheelZoom={true}
                            dragging={true}
                            zoomControl={true}
                            doubleClickZoom={false}
                            closePopupOnClick={false}
                            trackResize={false}
                            boxZoom={false}
                            keyboard={false}
                            tap={false}
                            touchZoom={false}
                            whenCreated={(mapInstance) => {
                                mapRef.current = mapInstance;
                            }}
                        >
                            <MapEventsHandler />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker 
                                position={position} 
                                setPosition={setPosition}
                                setAddress={setAddress}
                            />
                        </MapContainer>
                    </div>

                    {address && (
                        <div className="selected-address">
                            <strong>Selected Location:</strong>
                            <p>{address}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MapPicker;

