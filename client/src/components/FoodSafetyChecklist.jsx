const items = [
  { key: 'freshlyPrepared', label: 'Food is freshly prepared and hygienic' },
  { key: 'storedHygienically', label: 'Food has been stored at safe temperature in clean containers' },
  { key: 'notPreviouslyServed', label: 'Food has not been previously served or tasted' },
];

const FoodSafetyChecklist = ({ checklist, onChange, readOnly = false }) => {
  const allChecked = items.every((it) => checklist[it.key]);

  const handleToggleAll = () => {
    if (readOnly) return;
    const targetState = !allChecked;
    const updated = {};
    items.forEach((it) => {
      updated[it.key] = targetState;
    });
    onChange(updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🛡️ Food Safety & Hygiene Checklist
          {allChecked && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: 12 }}>✓ All Confirmed</span>}
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={handleToggleAll}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
          >
            {allChecked ? 'Uncheck All' : '✓ Check All Safety Points'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map((it) => (
          <label
            key={it.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 6,
              background: checklist[it.key] ? '#f0fdf4' : '#fafafa',
              border: `1px solid ${checklist[it.key] ? '#86efac' : '#e5e7eb'}`,
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <input
              type="checkbox"
              checked={checklist[it.key] || false}
              disabled={readOnly}
              onChange={(e) => !readOnly && onChange({ ...checklist, [it.key]: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: readOnly ? 'default' : 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', color: checklist[it.key] ? '#14532d' : 'var(--text-primary)', fontWeight: checklist[it.key] ? 500 : 400 }}>
              {it.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default FoodSafetyChecklist;
