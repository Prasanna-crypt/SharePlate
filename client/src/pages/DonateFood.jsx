import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';
import API from '../api/axios';
import LocationPicker from '../components/LocationPicker';
import FoodSafetyChecklist from '../components/FoodSafetyChecklist';

const libraries = ['places'];
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const scriptOptions = apiKey ? { googleMapsApiKey: apiKey, libraries } : null;

const DonateFoodInner = ({ isLoaded = false }) => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // Smart helper for local ISO string (YYYY-MM-DDTHH:mm)
  const formatDatetimeLocal = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const now = new Date();
  const defaultPrepared = formatDatetimeLocal(new Date(now.getTime() - 30 * 60 * 1000)); // 30 mins ago
  const defaultExpires = formatDatetimeLocal(new Date(now.getTime() + 6 * 3600 * 1000)); // 6 hours from now

  const [form, setForm] = useState({
    foodName: '',
    description: '',
    foodType: 'cooked',
    vegNonVeg: 'veg',
    quantity: '',
    preparedAt: defaultPrepared,
    expiresAt: defaultExpires,
    pickupAddress: 'Thakur Village, Kandivali East, Mumbai',
    pickupWindowStart: '',
    pickupWindowEnd: '',
    photoUrl: '',
    location: { type: 'Point', coordinates: [72.8656, 19.2137] },
    safetyChecklist: { freshlyPrepared: true, storedHygienically: true, notPreviouslyServed: true },
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageSize, setImageSize] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const checklistRef = useRef(null);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const allChecked =
    form.safetyChecklist.freshlyPrepared &&
    form.safetyChecklist.storedHygienically &&
    form.safetyChecklist.notPreviouslyServed;

  // Handle image compression and loading
  const handleImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp)');
      return;
    }

    // 10MB file limit check before compression
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    setIsCompressing(true);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.78 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        setImageSize(`${approxSizeKb} KB`);
        setImagePreview(compressedDataUrl);
        set('photoUrl', compressedDataUrl);
        setIsCompressing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setImagePreview('');
    setImageFileName('');
    setImageSize('');
    set('photoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodName.trim()) {
      setError('Please provide a Food Title.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (!form.quantity.trim()) {
      setError('Please provide the food quantity or servings.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (!form.pickupAddress.trim()) {
      setError('Please provide a pickup address or choose a location on the map.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (new Date(form.expiresAt) <= new Date(form.preparedAt)) {
      setError('The safe consumption expiry date must be later than the preparation time.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (!allChecked) {
      setError('⚠️ Please confirm all 3 safety points in the Food Safety Checklist below.');
      checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.pickupWindowStart) delete payload.pickupWindowStart;
      if (!payload.pickupWindowEnd) delete payload.pickupWindowEnd;
      if (!payload.photoUrl) delete payload.photoUrl;

      await API.post('/listings', payload);
      navigate('/dashboard/donor');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create food listing. Please check required fields.';
      setError(errMsg);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
    setLoading(false);
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 740, margin: '0 auto' }}>
        <h2 className="section-title">Donate Surplus Food</h2>
        <p className="section-subtitle">
          List your extra food so nearby NGOs, volunteers, and shelters can claim and collect it
        </p>

        <div className="disclaimer">
          ⚠️ <strong>Food Safety Notice:</strong> All food listed must be fresh, wholesome, and stored under sanitary conditions. Never donate spoiled or doubtful items.
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card" noValidate>
          <div className="form-group">
            <label className="form-label">Food Title *</label>
            <input
              className="form-input"
              value={form.foodName}
              onChange={(e) => set('foodName', e.target.value)}
              placeholder="e.g. Rajma Rice with Roti (from lunch catering)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Provide packing details, ingredients, or any heating instructions..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select className="form-select" value={form.foodType} onChange={(e) => set('foodType', e.target.value)}>
                <option value="cooked">Cooked Meal</option>
                <option value="packaged">Packaged</option>
                <option value="raw">Raw / Groceries</option>
                <option value="bakery">Bakery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dietary Type *</label>
              <select className="form-select" value={form.vegNonVeg} onChange={(e) => set('vegNonVeg', e.target.value)}>
                <option value="veg">🥬 Vegetarian</option>
                <option value="nonveg">🍗 Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity (Servings or Weight) *</label>
            <input
              className="form-input"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              placeholder="e.g. 25 servings or 8 kg"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Prepared / Cooked Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.preparedAt}
                onChange={(e) => set('preparedAt', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Safe to Consume Until *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.expiresAt}
                onChange={(e) => set('expiresAt', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pickup Window Start</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.pickupWindowStart}
                onChange={(e) => set('pickupWindowStart', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pickup Window End</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.pickupWindowEnd}
                onChange={(e) => set('pickupWindowEnd', e.target.value)}
              />
            </div>
          </div>

          {/* Upload Food Image Section */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📷 Food Photo (Upload Image)</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showUrlInput ? 'Switch to file upload' : 'Or paste image URL instead'}
              </button>
            </label>

            {!showUrlInput ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                />

                {!imagePreview ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #95D5B2',
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '1.75rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = '#f0faf4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#95D5B2';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '0.4rem' }}>📸</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Click to upload an image of the food
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      or drag and drop here (JPG, PNG, WebP up to 10MB)
                    </span>
                    {isCompressing && (
                      <p style={{ marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        ⏳ Optimizing photo...
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: '#f0faf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 12,
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Uploaded food preview"
                      style={{
                        width: '75px',
                        height: '75px',
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '2px solid white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>
                        {imageFileName || 'Uploaded Photo'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Optimized size: {imageSize} · Ready to publish
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.6rem',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fecaca',
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  className="form-input"
                  value={form.photoUrl}
                  onChange={(e) => {
                    set('photoUrl', e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {form.photoUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={form.photoUrl}
                      alt="URL preview"
                      style={{ maxHeight: '100px', borderRadius: 8, objectFit: 'cover' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Location Pin & Address *</label>
            <LocationPicker
              value={form.location.coordinates}
              onChange={(coords) => set('location', { type: 'Point', coordinates: coords })}
              address={form.pickupAddress}
              onAddressChange={(addr) => set('pickupAddress', addr)}
              isLoaded={Boolean(apiKey && isLoaded)}
            />
          </div>

          <div
            ref={checklistRef}
            className="form-group"
            style={{
              padding: '1.1rem',
              background: allChecked ? '#f0fdf4' : '#fffbeb',
              borderRadius: 10,
              border: `2px solid ${allChecked ? '#86efac' : '#f59e0b'}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            <FoodSafetyChecklist checklist={form.safetyChecklist} onChange={(c) => set('safetyChecklist', c)} />
          </div>

          {!allChecked && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#b45309', textAlign: 'center' }}>
              ⚠️ Please confirm the 3 safety checklist points above before publishing.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Publishing Food Listing...' : '🍽️ Publish Food Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

const DonateFoodWithGoogle = () => {
  const { isLoaded } = useLoadScript(scriptOptions);
  return <DonateFoodInner isLoaded={isLoaded} />;
};

const DonateFood = apiKey ? DonateFoodWithGoogle : () => <DonateFoodInner isLoaded={false} />;

export default DonateFood;
