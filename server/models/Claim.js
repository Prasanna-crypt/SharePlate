const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['claimed', 'pickedup', 'completed', 'cancelled'], default: 'claimed' },
  claimedAt: { type: Date, default: Date.now },
  pickedUpAt: Date,
  completedAt: Date,
  notes: { type: String, trim: true },
});

module.exports = mongoose.model('Claim', claimSchema);
