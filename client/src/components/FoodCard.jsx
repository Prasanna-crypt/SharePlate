import { Link } from 'react-router-dom';
import { foodTypeLabel, timeUntil } from '../utils/helpers';
import StatusBadge from './StatusBadge';

const FoodCard = ({ listing }) => {
  const expired = new Date(listing.expiresAt) < new Date();
  return (
    <Link to={`/listing/${listing._id}`} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg, #95D5B2, #2D6A4F)', position: 'relative' }}>
        {listing.photoUrl ? <img src={listing.photoUrl} alt={listing.foodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (listing.vegNonVeg === 'veg' ? '🥬' : '🍗')}
        <span style={{ position: 'absolute', top: 8, right: 8, padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: listing.vegNonVeg === 'veg' ? '#d4edda' : '#f8d7da', color: listing.vegNonVeg === 'veg' ? '#155724' : '#721c24' }}>
          {listing.vegNonVeg === 'veg' ? '● Veg' : '● Non-Veg'}
        </span>
      </div>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{listing.foodName}</h3>
          <StatusBadge status={expired && listing.status === 'available' ? 'expired' : listing.status} />
        </div>
        <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', background: '#f0f0e8', borderRadius: 4, fontSize: '0.75rem', color: 'var(--text-secondary)', width: 'fit-content' }}>{foodTypeLabel(listing.foodType)}</span>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>📦 {listing.quantity}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>📍 {listing.pickupAddress}</span>
          <span style={{ color: expired ? '#9B2226' : 'var(--secondary)', fontWeight: 600 }}>⏰ {timeUntil(listing.expiresAt)}</span>
        </div>
        {listing.donor && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>By {listing.donor.organisationName || listing.donor.name}</p>}
      </div>
    </Link>
  );
};
export default FoodCard;
