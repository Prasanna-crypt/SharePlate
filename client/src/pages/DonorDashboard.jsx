import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, foodTypeLabel } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/listings/my').then(r => { setListings(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this listing?')) return;
    await API.delete(`/listings/${id}`);
    setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'cancelled' } : l));
  };

  if (loading) return <Loader />;

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Donor Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome, {user?.name}</p>
          </div>
          <Link to="/donate" className="btn btn-primary">+ Donate Food</Link>
        </div>

        {listings.length === 0 ? <EmptyState icon="🍽️" title="No listings yet" message="Create your first food listing!" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {listings.map(l => (
              <div key={l._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{l.foodName}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{foodTypeLabel(l.foodType)} · {l.quantity} · {formatDate(l.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={l.status} />
                  <Link to={`/listing/${l._id}`} className="btn btn-outline btn-sm">View</Link>
                  {l.status === 'available' && <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => cancel(l._id)}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DonorDashboard;
