import { useState, useEffect } from 'react';
import API from '../api/axios';
import { formatDate } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      API.get('/stats/admin'),
      API.get('/admin/users'),
      API.get('/admin/listings'),
      API.get('/feedback'),
    ]).then(([s, u, l, f]) => {
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (u.status === 'fulfilled') setUsers(u.value.data);
      if (l.status === 'fulfilled') setListings(l.value.data);
      if (f.status === 'fulfilled') setFeedback(f.value.data);
      setLoading(false);
    });
  }, []);

  const removeUser = async (id) => {
    if (!confirm('Remove this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user');
    }
  };

  const removeListing = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      await API.delete(`/admin/listings/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="section">
      <div className="container">
        <h2 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h2>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['stats', 'users', 'listings', 'feedback'].map(t => (
            <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{v}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <thead><tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Joined</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Action</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{u.role !== 'admin' && <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => removeUser(u._id)}>Remove</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {listings.map(l => (
              <div key={l._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <strong>{l.foodName}</strong> <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>by {l.donor?.name || 'Unknown'} · {formatDate(l.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge status={l.status} />
                  <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => removeListing(l._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedback.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No feedback yet.</p> : feedback.map(f => (
              <div key={f._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{f.name || f.user?.name || 'Anonymous'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.type} · {formatDate(f.createdAt)}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
