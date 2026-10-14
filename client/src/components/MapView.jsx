import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { foodTypeLabel, timeUntil } from '../utils/helpers';

// Helper to create custom food pin icons for Leaflet
const createFoodPinIcon = (isVeg, _foodName) => {
  const bg = isVeg ? '#2D6A4F' : '#E76F51';
  const emoji = isVeg ? '🥬' : '🍗';

  return L.divIcon({
    className: 'custom-food-marker',
    html: `
      <div style="position: relative; width: 40px; height: 48px; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          background: ${bg};
          border: 2.5px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        ">
          <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">${emoji}</span>
        </div>
        <div style="
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -50],
  });
};

const MapView = ({ listings = [], center = { lat: 19.2137, lng: 72.8656 }, isLoaded = false }) => {
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState(null);

  // Leaflet refs
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  const hasGoogle = isLoaded && typeof window !== 'undefined' && window.google?.maps;

  // Cleanup Leaflet map instance on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (hasGoogle || !mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validListings = listings.filter(
      (l) => l.location?.coordinates && l.location.coordinates.length === 2
    );

    const bounds = [];

    validListings.forEach((l) => {
      const lat = l.location.coordinates[1];
      const lng = l.location.coordinates[0];
      bounds.push([lat, lng]);

      const isVeg = l.vegNonVeg === 'veg';
      const icon = createFoodPinIcon(isVeg, l.foodName);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Popup card content
      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Inter', sans-serif; padding: 4px;">
          ${
            l.photoUrl
              ? `<div style="height: 100px; width: 100%; margin-bottom: 8px; border-radius: 6px; overflow: hidden; background: #eee;">
                   <img src="${l.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${l.foodName}" />
                 </div>`
              : ''
          }
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="
              font-size: 11px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 12px;
              background: ${isVeg ? '#d4edda' : '#f8d7da'};
              color: ${isVeg ? '#155724' : '#721c24'};
            ">
              ${isVeg ? '● Veg' : '● Non-Veg'}
            </span>
            <span style="font-size: 11px; color: #6b7280;">${foodTypeLabel(l.foodType)}</span>
          </div>

          <h4 style="margin: 0 0 4px; font-size: 14px; color: #1b1b1b; font-weight: 700;">
            ${l.foodName}
          </h4>

          <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
            <strong>📦 Quantity:</strong> ${l.quantity}
          </div>

          <div style="font-size: 11px; color: #E76F51; font-weight: 600; margin-bottom: 6px;">
            ⏰ ${timeUntil(l.expiresAt)}
          </div>

          <div style="font-size: 11px; color: #6b7280; margin-bottom: 10px; line-height: 1.3;">
            📍 ${l.pickupAddress}
          </div>

          <button
            id="view-listing-${l._id}"
            style="
              width: 100%;
              background: #2D6A4F;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Claim Food Details ➔
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-listing-${l._id}`);
        if (btn) {
          btn.onclick = () => navigate(`/listing/${l._id}`);
        }
        setSelectedListing(l);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if we have multiple listings
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([center.lat, center.lng], 13);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [listings, center, hasGoogle, navigate]);

  // Center on a specific listing when clicked from the bottom list
  const handleFocusListing = (l) => {
    setSelectedListing(l);
    const lat = l.location.coordinates[1];
    const lng = l.location.coordinates[0];

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], 16, { duration: 1 });
      // Find marker and open popup
      const marker = markersRef.current.find((m) => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001;
      });
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Map Header & Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--surface)',
          padding: '0.75rem 1.25rem',
          borderRadius: 12,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
              Live Surplus Food Map ({listings.length} Available Pins)
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Click any pin to view meals, quantities, and direct pickup directions
            </span>
          </div>
        </div>

        {/* Map Legend */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 14, height: 14, background: '#2D6A4F', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>🥬 Vegetarian</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 14, height: 14, background: '#E76F51', borderRadius: '50%', display: 'inline-block' }}></span>
            <span>🍗 Non-Vegetarian</span>
          </div>
        </div>
      </div>

      {/* The Interactive Map Viewport */}
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid var(--border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {hasGoogle ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '520px' }}
            center={center}
            zoom={13}
          >
            {listings.map((l) => (
              <Marker
                key={l._id}
                position={{ lat: l.location.coordinates[1], lng: l.location.coordinates[0] }}
                onClick={() => setSelectedListing(l)}
                icon={{
                  url:
                    l.vegNonVeg === 'veg'
                      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                }}
              />
            ))}
            {selectedListing && (
              <InfoWindow
                position={{
                  lat: selectedListing.location.coordinates[1],
                  lng: selectedListing.location.coordinates[0],
                }}
                onCloseClick={() => setSelectedListing(null)}
              >
                <div style={{ maxWidth: 220, cursor: 'pointer' }} onClick={() => navigate(`/listing/${selectedListing._id}`)}>
                  <h4 style={{ margin: '0 0 4px' }}>{selectedListing.foodName}</h4>
                  <p style={{ margin: '0 0 4px', fontSize: '0.8rem' }}>
                    {foodTypeLabel(selectedListing.foodType)} · {selectedListing.quantity}
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#E76F51', fontWeight: 600 }}>
                    ⏰ {timeUntil(selectedListing.expiresAt)}
                  </p>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.75rem' }}>
                    View & Claim
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '520px', zIndex: 1 }}
          />
        )}
      </div>

      {/* Quick Location Pills under the map */}
      <div style={{ marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          🔍 Jump to Food Location Pin:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.6rem' }}>
          {listings.map((l) => {
            const isSelected = selectedListing?._id === l._id;
            return (
              <div
                key={l._id}
                onClick={() => handleFocusListing(l)}
                style={{
                  padding: '0.65rem 0.9rem',
                  background: isSelected ? '#f0faf4' : 'var(--surface)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>
                    {l.vegNonVeg === 'veg' ? '🟢' : '🔴'} {l.foodName}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    📍 {l.pickupAddress}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  {timeUntil(l.expiresAt)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapView;
