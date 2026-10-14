import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, foodTypeLabel } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/claims/my').then(r => { setClaims(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const updateStatus = async (id, action) => {
    try {
      await API.put(`/claims/${id}/${action}`);
      const r = await API.get('/claims/my'); setClaims(r.data);
    } catch (err) { alert(err.response?.data?.message || 'Action failed'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Receiver Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome, {user?.organisationName || user?.name}</p>
        </div>

        {claims.length === 0 ? <EmptyState icon="📦" title="No claims yet" message="Browse available food and claim items" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {claims.map(c => (
              <div key={c._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem' }}>{c.listing?.foodName || 'Food Item'}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {c.listing ? `${foodTypeLabel(c.listing.foodType)} · ${c.listing.quantity}` : ''} · Claimed {formatDate(c.claimedAt)}
                    </p>
                    {c.listing?.donor && c.status !== 'cancelled' && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                        📞 {c.listing.donor.name}: {c.listing.donor.phone} | {c.listing.donor.address}
                        {c.listing.location && (
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.listing.location.coordinates[1]},${c.listing.location.coordinates[0]}`} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>🗺️ Directions</a>
                        )}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <StatusBadge status={c.status} />
                    {c.listing && <Link to={`/listing/${c.listing._id}`} className="btn btn-outline btn-sm">View</Link>}
                    {c.status === 'claimed' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(c._id, 'pickup')}>Picked Up</button>}
                    {(c.status === 'claimed' || c.status === 'pickedup') && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(c._id, 'complete')}>Complete</button>}
                    {c.status === 'claimed' && <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => updateStatus(c._id, 'cancel')}>Cancel</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/find" className="btn btn-primary">Browse Available Food</Link>
        </div>
      </div>
    </div>
  );
};
export default ReceiverDashboard;
