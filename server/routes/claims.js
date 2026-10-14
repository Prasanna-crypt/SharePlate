const express = require('express');
const Claim = require('../models/Claim');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

const notify = (userId, message, type, listingId) => {
  if (!userId) return Promise.resolve();
  return Notification.create({ user: userId, message, type, relatedListing: listingId }).catch((err) => {
    console.warn('Notification failed:', err.message);
  });
};

// Claim a listing
router.post('/', auth, role('receiver'), async (req, res, next) => {
  try {
    const { listingId, notes } = req.body;
    if (!listingId) return res.status(400).json({ message: 'Listing ID is required' });

    // Atomic update to prevent race conditions / double claiming
    const listing = await FoodListing.findOneAndUpdate(
      { _id: listingId, status: 'available', expiresAt: { $gt: new Date() } },
      { status: 'claimed' },
      { new: true }
    );

    if (!listing) {
      const existing = await FoodListing.findById(listingId);
      if (!existing) return res.status(404).json({ message: 'Listing not found' });
      if (existing.status !== 'available') return res.status(400).json({ message: 'Listing is no longer available' });
      if (new Date(existing.expiresAt) <= new Date()) return res.status(400).json({ message: 'Listing expired' });
      return res.status(400).json({ message: 'Could not claim listing' });
    }

    const claim = await Claim.create({ listing: listingId, claimedBy: req.user._id, notes });
    if (listing.donor) {
      await notify(listing.donor, `Your listing "${listing.foodName}" was claimed by ${req.user.name}`, 'claim', listing._id);
    }

    const populated = await Claim.findById(claim._id).populate('listing').populate('claimedBy', 'name phone organisationName');
    res.status(201).json(populated);
  } catch (err) { next(err); }
});

// My claims
router.get('/my', auth, async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id }).sort({ claimedAt: -1 })
      .populate({ path: 'listing', populate: { path: 'donor', select: 'name phone organisationName address' } });
    res.json(claims);
  } catch (err) { next(err); }
});

// Volunteer tasks
router.get('/volunteer-tasks', auth, async (req, res, next) => {
  try {
    const claims = await Claim.find({ status: 'claimed', volunteer: { $exists: false } })
      .sort({ claimedAt: -1 })
      .populate({ path: 'listing', populate: { path: 'donor', select: 'name organisationName' } })
      .populate('claimedBy', 'name organisationName');
    res.json(claims);
  } catch (err) { next(err); }
});

// Volunteer for delivery
router.put('/:id/volunteer', auth, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.volunteer) return res.status(400).json({ message: 'Volunteer already assigned' });
    claim.volunteer = req.user._id;
    await claim.save();
    const listing = await FoodListing.findById(claim.listing);
    if (listing) {
      await notify(claim.claimedBy, `${req.user.name} volunteered to deliver "${listing.foodName || 'Food'}"`, 'general', listing._id);
    }
    res.json({ message: 'Volunteered successfully' });
  } catch (err) { next(err); }
});

// Mark picked up
router.put('/:id/pickup', auth, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status !== 'claimed') return res.status(400).json({ message: 'Can only pick up claimed items' });
    claim.status = 'pickedup';
    claim.pickedUpAt = new Date();
    await claim.save();
    const listing = await FoodListing.findByIdAndUpdate(claim.listing, { status: 'pickedup' }, { new: true });
    if (listing && listing.donor) {
      await notify(listing.donor, `"${listing.foodName}" has been picked up`, 'pickup', listing._id);
    }
    res.json({ message: 'Marked as picked up' });
  } catch (err) { next(err); }
});

// Mark completed
router.put('/:id/complete', auth, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    claim.status = 'completed';
    claim.completedAt = new Date();
    await claim.save();
    const listing = await FoodListing.findByIdAndUpdate(claim.listing, { status: 'completed' }, { new: true });
    if (listing) {
      if (listing.donor) await notify(listing.donor, `"${listing.foodName}" delivered successfully!`, 'complete', listing._id);
      await notify(claim.claimedBy, `"${listing.foodName}" delivery complete. Thank you!`, 'complete', listing._id);
    }
    res.json({ message: 'Completed' });
  } catch (err) { next(err); }
});

// Cancel claim
router.put('/:id/cancel', auth, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.claimedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    claim.status = 'cancelled';
    await claim.save();
    const listing = await FoodListing.findByIdAndUpdate(claim.listing, { status: 'available' }, { new: true });
    if (listing && listing.donor) {
      await notify(listing.donor, `Claim on "${listing.foodName}" was cancelled`, 'cancel', listing._id);
    }
    res.json({ message: 'Claim cancelled' });
  } catch (err) { next(err); }
});

module.exports = router;
