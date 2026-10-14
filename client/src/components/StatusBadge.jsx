import { statusColor } from '../utils/helpers';
const StatusBadge = ({ status }) => (
  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: '#fff', backgroundColor: statusColor(status), textTransform: 'capitalize' }}>
    {status === 'pickedup' ? 'Picked Up' : status}
  </span>
);
export default StatusBadge;
