const express = require('express');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const { auth } = require('../middleware/auth');
const role = require('../middleware/role');
const router = express.Router();

router.get('/impact', async (req, res, next) => {
  try {
    const [mealsRedistributed, activeDonors, ngosRegistered, totalListings] = await Promise.all([
      Claim.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'receiver', organisationName: { $exists: true, $ne: '' } }),
      FoodListing.countDocuments(),
    ]);
    res.json({ mealsRedistributed, activeDonors, ngosRegistered, totalListings });
  } catch (err) { next(err); }
});

router.get('/admin', auth, role('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalDonors, totalReceivers, totalListings, activeListings, completedDeliveries, pendingClaims] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'donor' }), User.countDocuments({ role: 'receiver' }),
      FoodListing.countDocuments(), FoodListing.countDocuments({ status: 'available' }),
      Claim.countDocuments({ status: 'completed' }), Claim.countDocuments({ status: 'claimed' }),
    ]);
    res.json({ totalUsers, totalDonors, totalReceivers, totalListings, activeListings, completedDeliveries, pendingClaims });
  } catch (err) { next(err); }
});

module.exports = router;
