import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, timeUntil, foodTypeLabel } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import FoodSafetyChecklist from '../components/FoodSafetyChecklist';
import Loader from '../components/Loader';

const libraries = ['places'];
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const scriptOptions = apiKey ? { googleMapsApiKey: apiKey, libraries } : null;

const ListingDetailsInner = ({ isLoaded = false }) => {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    API.get(`/listings/${id}`)
      .then((r) => {
        setListing(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    setClaiming(true);
    setMsg({ type: '', text: '' });
    try {
      await API.post('/claims', { listingId: listing._id, notes });
      setMsg({
        type: 'success',
        text: '🎉 Food claimed successfully! Contact details are now unlocked below.',
      });
      const r = await API.get(`/listings/${id}`);
      setListing(r.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to claim food' });
    }
    setClaiming(false);
  };

  if (loading) return <Loader />;
  if (!listing)
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Listing not found</h2>
          <p>This food listing might have been removed or does not exist.</p>
          <Link to="/find" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Listings
          </Link>
        </div>
      </div>
    );

  const expired = new Date(listing.expiresAt) < new Date();
  const canClaim = user?.role === 'receiver' && listing.status === 'available' && !expired;
  const showContact = Boolean(user && listing.status !== 'available');
  const lat = listing.location?.coordinates?.[1] || 19.2137;
  const lng = listing.location?.coordinates?.[0] || 72.8656;
  const hasGoogle = Boolean(apiKey && isLoaded && typeof window !== 'undefined' && window.google?.maps);

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 840, margin: '0 auto' }}>
        <Link
          to="/find"
          style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.25rem',
          }}
        >
          ← Back to All Listings
        </Link>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: listing.vegNonVeg === 'veg' ? '#155724' : '#721c24',
                  background: listing.vegNonVeg === 'veg' ? '#d4edda' : '#f8d7da',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 20,
                  marginBottom: '0.5rem',
                }}
              >
                {listing.vegNonVeg === 'veg' ? '● Vegetarian' : '● Non-Vegetarian'}
              </span>
              <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{listing.foodName}</h1>
            </div>
            <StatusBadge status={expired && listing.status === 'available' ? 'expired' : listing.status} />
          </div>

          {listing.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {listing.description}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: 8,
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Category</span>
              <strong>{foodTypeLabel(listing.foodType)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Quantity</span>
              <strong>📦 {listing.quantity}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Cooked / Prepared</span>
              <span>{formatDate(listing.preparedAt)}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Safe Until</span>
              <strong style={{ color: expired ? '#9B2226' : 'var(--secondary)' }}>
                ⏰ {timeUntil(listing.expiresAt)}
              </strong>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📍 Pickup Details</h3>
            <p style={{ margin: 0 }}>
              <strong>Address:</strong> {listing.pickupAddress}
            </p>
            {listing.pickupWindowStart && (
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <strong>Pickup Window:</strong> {formatDate(listing.pickupWindowStart)} — {formatDate(listing.pickupWindowEnd)}
              </p>
            )}
          </div>

          {/* Location Map */}
          <div style={{ marginBottom: '1.5rem' }}>
            {hasGoogle ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '280px', borderRadius: 8 }}
                center={{ lat, lng }}
                zoom={15}
              >
                <Marker position={{ lat, lng }} />
              </GoogleMap>
            ) : (
              <div style={{ width: '100%', height: '240px', borderRadius: 8, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <iframe
                  title="Pickup Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.008}%2C${lng + 0.01}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
                ></iframe>
              </div>
            )}
          </div>

          {/* Donor Contact (Revealed after claim) */}
          {listing.donor && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1.25rem',
                background: showContact ? '#ecfdf5' : 'var(--bg-secondary)',
                border: showContact ? '1px solid #a7f3d0' : '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem', color: showContact ? '#065f46' : 'inherit' }}>
                👤 Donor Information
              </h4>
              <p style={{ margin: 0 }}>
                <strong>Name / Org:</strong> {listing.donor.organisationName || listing.donor.name}
              </p>

              {showContact ? (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <p style={{ margin: 0 }}>
                    <strong>📞 Phone:</strong> <a href={`tel:${listing.donor.phone}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{listing.donor.phone}</a>
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    🗺️ Open in Google Maps Directions
                  </a>
                </div>
              ) : (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  🔒 <em>Phone number and direct directions are locked until food is claimed to protect donor privacy.</em>
                </p>
              )}
            </div>
          )}

          {/* Food Safety Checklist */}
          {listing.safetyChecklist && (
            <div style={{ marginBottom: '1.5rem', background: '#fafafa', padding: '1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
              <FoodSafetyChecklist checklist={listing.safetyChecklist} readOnly />
            </div>
          )}

          {/* Food safety disclaimer */}
          <div className="disclaimer">
            🛡️ <strong>Safety Disclaimer:</strong> Please inspect the food upon pickup and ensure safe temperature maintenance during transit. SharePlate is a community facilitator connecting local donors with volunteers and organizations.
          </div>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {/* Actions */}
          {canClaim && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Claim this Food Listing</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Only registered NGOs and verified community receivers can claim food. Let the donor know any pickup ETA or volunteer details.
              </p>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional pickup notes: e.g. 'Arriving with insulated containers by 3:30 PM'..."
                style={{ marginBottom: '0.75rem' }}
              />
              <button
                onClick={handleClaim}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={claiming}
              >
                {claiming ? 'Processing Claim...' : '🤝 Confirm & Claim Food'}
              </button>
            </div>
          )}

          {!user && listing.status === 'available' && !expired && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Are you an NGO, volunteer, or receiver?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Login
                </Link>{' '}
                or{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Register as a Receiver
                </Link>{' '}
                to claim this surplus food.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Listing ID: <code>{listing._id}</code>
            </span>
            <Link
              to={`/contact?report=${listing._id}`}
              style={{ color: '#b91c1c', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}
            >
              🚩 Report an issue with this listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListingDetailsWithGoogle = () => {
  const { isLoaded } = useLoadScript(scriptOptions);
  return <ListingDetailsInner isLoaded={isLoaded} />;
};

const ListingDetails = apiKey ? ListingDetailsWithGoogle : () => <ListingDetailsInner isLoaded={false} />;

export default ListingDetails;
