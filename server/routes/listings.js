const express = require('express');
const FoodListing = require('../models/FoodListing');
const { auth } = require('../middleware/auth');
const role = require('../middleware/role');
const { listingRules } = require('../utils/validators');

const router = express.Router();

// Create listing
router.post('/', auth, role('donor', 'admin'), listingRules, async (req, res, next) => {
  try {
    const data = { ...req.body, donor: req.user._id };
    if (!data.pickupWindowStart) delete data.pickupWindowStart;
    if (!data.pickupWindowEnd) delete data.pickupWindowEnd;
    if (!data.photoUrl) delete data.photoUrl;
    const listing = await FoodListing.create(data);
    res.status(201).json(listing);
  } catch (err) { next(err); }
});

// Get available listings with filters
router.get('/', async (req, res, next) => {
  try {
    const { foodType, vegNonVeg, sort } = req.query;
    const filter = { status: 'available', expiresAt: { $gt: new Date() } };
    if (foodType) filter.foodType = foodType;
    if (vegNonVeg) filter.vegNonVeg = vegNonVeg;
    const sortOpt = sort === 'expiring' ? { expiresAt: 1 } : { createdAt: -1 };
    const listings = await FoodListing.find(filter).sort(sortOpt).populate('donor', 'name organisationName');
    res.json(listings);
  } catch (err) { next(err); }
});

// Nearby search
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (lat === undefined || lng === undefined || lat === '' || lng === '') {
      return res.status(400).json({ message: 'lat and lng required' });
    }
    const numLat = Number(lat);
    const numLng = Number(lng);
    const numRadius = Number(radius);

    if (isNaN(numLat) || isNaN(numLng) || isNaN(numRadius)) {
      return res.status(400).json({ message: 'lat, lng, and radius must be valid numbers' });
    }
    if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90, Longitude must be between -180 and 180' });
    }
    if (numRadius <= 0 || numRadius > 500) {
      return res.status(400).json({ message: 'Radius must be between 1 and 500 km' });
    }

    const listings = await FoodListing.find({
      status: 'available',
      expiresAt: { $gt: new Date() },
      location: { $near: { $geometry: { type: 'Point', coordinates: [numLng, numLat] }, $maxDistance: numRadius * 1000 } },
    }).populate('donor', 'name organisationName');
    res.json(listings);
  } catch (err) { next(err); }
});

// My listings (donor/admin)
router.get('/my', auth, role('donor', 'admin'), async (req, res, next) => {
  try {
    const listings = await FoodListing.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { next(err); }
});

// Single listing
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id).populate('donor', 'name organisationName phone address');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) { next(err); }
});

// Update listing
router.put('/:id', auth, role('donor', 'admin'), async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    const isOwner = listing.donor && listing.donor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    const updated = await FoodListing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { next(err); }
});

// Cancel listing
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    const isOwner = listing.donor && listing.donor.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    listing.status = 'cancelled';
    await listing.save();
    res.json({ message: 'Listing cancelled' });
  } catch (err) { next(err); }
});

module.exports = router;
