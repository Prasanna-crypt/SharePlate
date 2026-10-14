export const formatDate = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeUntil = (d) => {
  if (!d) return 'N/A';
  const target = new Date(d);
  if (isNaN(target.getTime())) return 'N/A';
  const diff = target - new Date();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

export const foodTypeLabel = (t) => ({ cooked: 'Cooked Meal', packaged: 'Packaged', raw: 'Raw / Groceries', bakery: 'Bakery', other: 'Other' }[t] || t);

export const statusColor = (s) => ({ available: '#2D6A4F', claimed: '#E76F51', pickedup: '#E9C46A', completed: '#264653', expired: '#6B7280', cancelled: '#9B2226' }[s] || '#6B7280');
