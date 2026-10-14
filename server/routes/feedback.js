const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const { auth, optionalAuth } = require('../middleware/auth');
const role = require('../middleware/role');
const { feedbackRules } = require('../utils/validators');
const router = express.Router();

router.post('/', optionalAuth, feedbackRules, async (req, res, next) => {
  try {
    const { name, email, type, listing, message } = req.body;
    const payload = {
      user: req.user?._id,
      name: name || req.user?.name,
      email: email || req.user?.email,
      type,
      message,
    };
    if (listing && mongoose.Types.ObjectId.isValid(listing)) {
      payload.listing = listing;
    }
    await Feedback.create(payload);
    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (err) { next(err); }
});

router.get('/', auth, role('admin'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).populate('user', 'name email').populate('listing', 'foodName');
    res.json(feedback);
  } catch (err) { next(err); }
});

module.exports = router;
