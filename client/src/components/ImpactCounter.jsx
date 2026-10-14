import { useState, useEffect } from 'react';
import API from '../api/axios';

const ImpactCounter = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { API.get('/stats/impact').then(r => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return null;
  const items = [
    { label: 'Meals Shared', value: stats.mealsRedistributed, icon: '🍽️' },
    { label: 'Active Donors', value: stats.activeDonors, icon: '🤝' },
    { label: 'NGOs Registered', value: stats.ngosRegistered, icon: '🏛️' },
    { label: 'Total Listings', value: stats.totalListings, icon: '📋' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
      {items.map(c => (
        <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{c.value}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
};
export default ImpactCounter;
