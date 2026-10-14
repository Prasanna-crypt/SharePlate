import { useState, useEffect } from 'react';
import API from '../api/axios';
import { formatDate, foodTypeLabel } from '../utils/helpers';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const VolunteerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/claims/volunteer-tasks').then(r => { setTasks(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const volunteer = async (id) => {
    try {
      await API.put(`/claims/${id}/volunteer`);
      setTasks(prev => prev.filter(t => t._id !== id));
      alert('Thank you for volunteering!');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Volunteer Tasks</h2>
        <p className="section-subtitle">Claimed food items that need a volunteer for delivery</p>
        {tasks.length === 0 ? <EmptyState icon="🚚" title="No tasks available" message="All deliveries are covered!" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(t => (
              <div key={t._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{t.listing?.foodName}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.listing ? foodTypeLabel(t.listing.foodType) : ''} · {t.listing?.quantity} · {t.listing?.pickupAddress}</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Claimed by: {t.claimedBy?.organisationName || t.claimedBy?.name} · {formatDate(t.claimedAt)}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => volunteer(t._id)}>🙋 Volunteer to Deliver</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default VolunteerTasks;
