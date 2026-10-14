const express = require('express');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const { auth } = require('../middleware/auth');
const role = require('../middleware/role');
const router = express.Router();

router.get('/users', auth, role('admin'), async (req, res, next) => {
  try { res.json(await User.find().sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.delete('/users/:id', auth, role('admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }
    if (!(await User.findByIdAndDelete(req.params.id))) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (err) { next(err); }
});

router.get('/listings', auth, role('admin'), async (req, res, next) => {
  try { res.json(await FoodListing.find().sort({ createdAt: -1 }).populate('donor', 'name email')); } catch (err) { next(err); }
});

router.delete('/listings/:id', auth, role('admin'), async (req, res, next) => {
  try {
    if (!(await FoodListing.findByIdAndDelete(req.params.id))) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing removed' });
  } catch (err) { next(err); }
});

module.exports = router;
