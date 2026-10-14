const EmptyState = ({ icon = '📭', title = 'Nothing here yet', message = '' }) => (
  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6B7280' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{ marginBottom: '0.5rem', color: '#1B1B1B' }}>{title}</h3>
    {message && <p>{message}</p>}
  </div>
);
export default EmptyState;
