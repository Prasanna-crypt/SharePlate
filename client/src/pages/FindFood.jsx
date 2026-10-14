import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import API from '../api/axios';
import FoodCard from '../components/FoodCard';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const libraries = ['places'];
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const scriptOptions = apiKey ? { googleMapsApiKey: apiKey, libraries } : null;

const FindFoodInner = ({ isLoaded = false }) => {

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({
    foodType: '',
    vegNonVeg: '',
    sort: 'newest',
    maxDistance: 15, // km
  });
  const [userLocation, setUserLocation] = useState({ lat: 19.2137, lng: 72.8656 }); // Kandivali East default
  const [locating, setLocating] = useState(false);

  // Attempt HTML5 Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.foodType) params.set('foodType', filters.foodType);
    if (filters.vegNonVeg) params.set('vegNonVeg', filters.vegNonVeg);
    if (filters.sort === 'expiring') params.set('sort', 'expiring');

    API.get(`/listings?${params.toString()}`)
      .then((r) => {
        let results = r.data;
        // Filter by approximate distance if coords are available
        if (filters.maxDistance && userLocation) {
          results = results.filter((item) => {
            if (!item.location || !item.location.coordinates) return true;
            const [lng, lat] = item.location.coordinates;
            // Haversine distance
            const R = 6371; // km
            const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
            const dLng = ((lng - userLocation.lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLocation.lat * Math.PI) / 180) *
                Math.cos((lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            return d <= filters.maxDistance;
          });
        }
        setListings(results);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [filters, userLocation]);

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
              Find Surplus Food
            </h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
              Discover available food near Kandivali, Borivali, Malad, and Mumbai
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleDetectLocation}
              className="btn btn-outline btn-sm"
              title="Use current GPS position"
            >
              {locating ? 'Locating...' : '📍 Use My Location'}
            </button>
            <button
              className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView('list')}
            >
              📋 List View
            </button>
            <button
              className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setView('map')}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            alignItems: 'center',
            background: 'var(--surface)',
            padding: '1rem',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ minWidth: 140 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Food Type</label>
            <select
              className="form-select"
              value={filters.foodType}
              onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="cooked">Cooked Meals</option>
              <option value="packaged">Packaged</option>
              <option value="raw">Raw / Groceries</option>
              <option value="bakery">Bakery</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ minWidth: 140 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Dietary</label>
            <select
              className="form-select"
              value={filters.vegNonVeg}
              onChange={(e) => setFilters({ ...filters, vegNonVeg: e.target.value })}
            >
              <option value="">Veg & Non-Veg</option>
              <option value="veg">Vegetarian Only</option>
              <option value="nonveg">Non-Veg Only</option>
            </select>
          </div>

          <div style={{ minWidth: 140 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort By</label>
            <select
              className="form-select"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="newest">Recently Added</option>
              <option value="expiring">Expiring Soonest</option>
            </select>
          </div>

          <div style={{ minWidth: 160 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Radius: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', alignSelf: 'flex-end', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>{listings.length}</strong> available listings found
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loader />
        ) : listings.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No surplus food available nearby"
            message="Try widening your search radius or clearing dietary filters"
          />
        ) : view === 'list' ? (
          <div className="grid-3">
            {listings.map((l) => (
              <FoodCard key={l._id} listing={l} />
            ))}
          </div>
        ) : (
          <MapView
            listings={listings}
            center={userLocation}
            isLoaded={Boolean(apiKey && isLoaded)}
          />
        )}
      </div>
    </div>
  );
};

const FindFoodWithGoogle = () => {
  const { isLoaded } = useLoadScript(scriptOptions);
  return <FindFoodInner isLoaded={isLoaded} />;
};

const FindFood = apiKey ? FindFoodWithGoogle : () => <FindFoodInner isLoaded={false} />;

export default FindFood;
