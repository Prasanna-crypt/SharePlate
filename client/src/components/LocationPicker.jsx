import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customLeafletIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
      <div style="
        background: #2D6A4F;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">🍽️</span>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const mumbaiPresets = [
  { name: 'Thakur Village, Kandivali East', lat: 19.2137, lng: 72.8656 },
  { name: 'Lokhandwala, Kandivali West', lat: 19.2094, lng: 72.8393 },
  { name: 'IC Colony, Borivali West', lat: 19.2308, lng: 72.8382 },
  { name: 'SV Road, Borivali West', lat: 19.2288, lng: 72.8410 },
  { name: 'Evershine Nagar, Malad West', lat: 19.1873, lng: 72.8340 },
  { name: 'Orlem, Malad West', lat: 19.1860, lng: 72.8361 },
  { name: 'Dahisar East', lat: 19.2501, lng: 72.8620 },
  { name: 'Goregaon East', lat: 19.1650, lng: 72.8497 },
];

const LocationPicker = ({ value, onChange, address, onAddressChange, isLoaded = false }) => {
  const [pos, setPos] = useState(
    value && value.length === 2 ? { lat: value[1], lng: value[0] } : { lat: 19.2137, lng: 72.8656 }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [reverseStatus, setReverseStatus] = useState('');

  // Google Maps refs
  const googleAutoRef = useRef(null);

  // Leaflet refs
  const leafletContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);

  const hasGoogle = isLoaded && typeof window !== 'undefined' && window.google?.maps;

  // Reverse geocoding helper (Nominatim)
  const fetchAddressForCoords = useCallback(
    async (lat, lng) => {
      try {
        setReverseStatus('Fetching address for selected pin...');
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
        );
        const data = await res.json();
        if (data && data.display_name) {
          // Format a clean Indian address
          const parts = [
            data.address?.road || data.address?.suburb || data.address?.neighbourhood,
            data.address?.suburb !== data.address?.road ? data.address?.suburb : null,
            data.address?.city || data.address?.town || 'Mumbai',
            data.address?.postcode,
          ].filter(Boolean);
          const cleanAddr = parts.length > 0 ? parts.join(', ') : data.display_name;
          onAddressChange(cleanAddr);
          setReverseStatus('📍 Address updated from map!');
          setTimeout(() => setReverseStatus(''), 3000);
        }
      } catch (err) {
        console.warn('Reverse geocoding error:', err);
        setReverseStatus('');
      }
    },
    [onAddressChange]
  );

  // Update position everywhere
  const updatePosition = useCallback(
    (lat, lng, shouldFetchAddress = true) => {
      setPos({ lat, lng });
      onChange([lng, lat]);
      if (shouldFetchAddress) {
        fetchAddressForCoords(lat, lng);
      }
    },
    [onChange, fetchAddressForCoords]
  );

  // Initialize and handle Leaflet Map
  useEffect(() => {
    if (hasGoogle || !leafletContainerRef.current) return;

    // Destroy existing instance if container changed
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(leafletContainerRef.current, {
      center: [pos.lat, pos.lng],
      zoom: 15,
      zoomControl: true,
    });
    leafletMapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([pos.lat, pos.lng], {
      icon: customLeafletIcon,
      draggable: true,
    }).addTo(map);
    leafletMarkerRef.current = marker;

    // Free-will choice 1: Drag pin anywhere
    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      updatePosition(lat, lng, true);
    });

    // Free-will choice 2: Click anywhere on the map to jump marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
      updatePosition(lat, lng, true);
    });

    // Invalidate size in case of layout changes
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [hasGoogle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize Leaflet marker when pos changes externally
  useEffect(() => {
    if (leafletMarkerRef.current && leafletMapRef.current) {
      const current = leafletMarkerRef.current.getLatLng();
      if (Math.abs(current.lat - pos.lat) > 0.0001 || Math.abs(current.lng - pos.lng) > 0.0001) {
        leafletMarkerRef.current.setLatLng([pos.lat, pos.lng]);
        leafletMapRef.current.panTo([pos.lat, pos.lng]);
      }
    }
  }, [pos]);

  // Google Maps Handlers
  const handleGoogleDrag = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updatePosition(lat, lng, true);
    },
    [updatePosition]
  );

  const handleGoogleMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      updatePosition(lat, lng, true);
    },
    [updatePosition]
  );

  const handleGooglePlaceSelect = () => {
    if (googleAutoRef.current) {
      const place = googleAutoRef.current.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        updatePosition(lat, lng, false);
        onAddressChange(place.formatted_address || place.name);
      }
    }
  };

  // Search location by text (Nominatim free geocoder)
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = encodeURIComponent(`${searchQuery}, Mumbai, Maharashtra, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updatePosition(lat, lng, true);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 16);
        }
      } else {
        alert(`Location "${searchQuery}" not found. Try a nearby Mumbai landmark or area.`);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // GPS / Geolocation
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        updatePosition(lat, lng, true);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 17);
        }
        setIsLocating(false);
      },
      (err) => {
        alert(`Could not detect GPS location: ${err.message}`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Preset selector
  const handleSelectPreset = (e) => {
    const selected = mumbaiPresets.find((p) => p.name === e.target.value);
    if (selected) {
      updatePosition(selected.lat, selected.lng, false);
      onAddressChange(`${selected.name}, Mumbai`);
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([selected.lat, selected.lng], 16);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Interactive Controls Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleUseGPS}
          className="btn btn-outline btn-sm"
          disabled={isLocating}
          title="Detect and center pin on your current device GPS"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--primary)' }}
        >
          {isLocating ? '📡 Locating...' : '🎯 Locate My Exact Position (GPS)'}
        </button>

        <select
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
          onChange={handleSelectPreset}
          defaultValue=""
        >
          <option value="" disabled>
            ⚡ Jump to Mumbai Area
          </option>
          {mumbaiPresets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Free Search input if using Leaflet map */}
      {!hasGoogle && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation(e)}
            placeholder="Search landmark, society, or street in Mumbai (e.g. Thakur College, Poisar)..."
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSearchLocation}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : '🔍 Search on Map'}
          </button>
        </div>
      )}

      {/* Primary Google Maps Autocomplete if Google API is loaded */}
      {hasGoogle && (
        <Autocomplete
          onLoad={(a) => (googleAutoRef.current = a)}
          onPlaceChanged={handleGooglePlaceSelect}
          options={{ componentRestrictions: { country: 'in' } }}
        >
          <input
            type="text"
            placeholder="Search pickup location in Google Places..."
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="form-input"
            required
          />
        </Autocomplete>
      )}

      {/* The Interactive Map View */}
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {hasGoogle ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '360px' }}
            center={pos}
            zoom={15}
            onClick={handleGoogleMapClick}
          >
            <Marker position={pos} draggable onDragEnd={handleGoogleDrag} />
          </GoogleMap>
        ) : (
          <div
            ref={leafletContainerRef}
            style={{ width: '100%', height: '360px', zIndex: 1 }}
          />
        )}

        {/* Floating helper instruction pill */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            padding: '0.5rem 0.85rem',
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span>
            👉 <strong>Click anywhere</strong> or <strong>drag the pin 🍽️</strong> to choose your exact pickup point.
          </span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
            📍 {pos.lat.toFixed(5)}° N, {pos.lng.toFixed(5)}° E
          </span>
        </div>
      </div>

      {reverseStatus && (
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>
          {reverseStatus}
        </span>
      )}

      {/* Verified Pickup Address Input Field */}
      <div>
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Confirmed Pickup Address *</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
            (Auto-populated from map pin, you can refine it)
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. Building No. 4, Thakur Complex, Kandivali East, Mumbai"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="form-input"
          required
        />
      </div>
    </div>
  );
};

export default LocationPicker;
