import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!user) return;
    const f = () => API.get('/notifications').then(r => setNotifs(r.data)).catch(() => {});
    f(); const i = setInterval(f, 30000); return () => clearInterval(i);
  }, [user]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifs.filter(n => !n.read).length;
  const markAll = async () => { await API.put('/notifications/read-all'); setNotifs(p => p.map(n => ({ ...n, read: true }))); };

  if (!user) return null;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', position: 'relative', padding: '0.25rem' }} aria-label="Notifications">
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -6, background: 'var(--secondary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, width: 320, maxHeight: 400, overflowY: 'auto', background: 'var(--surface)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
            {unread > 0 && <button onClick={markAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Mark all read</button>}
          </div>
          {notifs.length === 0 ? <p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications yet</p> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notifs.slice(0, 20).map(n => (
                <li key={n._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : '#f0faf4' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
