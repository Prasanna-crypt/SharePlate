const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  foodType: { type: String, enum: ['cooked', 'packaged', 'raw', 'bakery', 'other'], required: true },
  vegNonVeg: { type: String, enum: ['veg', 'nonveg'], required: true },
  quantity: { type: String, required: true, trim: true },
  preparedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  pickupAddress: { type: String, required: true, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  pickupWindowStart: Date,
  pickupWindowEnd: Date,
  photoUrl: { type: String, trim: true },
  safetyChecklist: {
    freshlyPrepared: { type: Boolean, default: false },
    storedHygienically: { type: Boolean, default: false },
    notPreviouslyServed: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'pickedup', 'completed', 'expired', 'cancelled'],
    default: 'available',
  },
  createdAt: { type: Date, default: Date.now },
});

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
