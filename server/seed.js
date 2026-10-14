const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const FoodListing = require('./models/FoodListing');
const Claim = require('./models/Claim');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');

const locs = [
  { name: 'Thakur Village, Kandivali East', lat: 19.2137, lng: 72.8656 },
  { name: 'Lokhandwala, Kandivali West', lat: 19.2094, lng: 72.8393 },
  { name: 'IC Colony, Borivali West', lat: 19.2308, lng: 72.8382 },
  { name: 'SV Road, Borivali West', lat: 19.2288, lng: 72.8410 },
  { name: 'Evershine Nagar, Malad West', lat: 19.1873, lng: 72.8340 },
  { name: 'Orlem, Malad West', lat: 19.1860, lng: 72.8361 },
  { name: 'Poisar, Kandivali West', lat: 19.2100, lng: 72.8420 },
  { name: 'Mahavir Nagar, Kandivali West', lat: 19.2050, lng: 72.8350 },
  { name: 'Dahisar East', lat: 19.2501, lng: 72.8620 },
  { name: 'Goregaon East', lat: 19.1650, lng: 72.8497 },
];

const jitter = () => (Math.random() - 0.5) * 0.006;
const hours = (h) => new Date(Date.now() + h * 3600000);

async function seedData(isStandalone = true) {
  try {
    if (isStandalone) {
      const connectDB = require('./config/db');
      await connectDB();
    }

    await Promise.all([
      User.deleteMany(),
      FoodListing.deleteMany(),
      Claim.deleteMany(),
      Notification.deleteMany(),
      Feedback.deleteMany(),
    ]);
    console.log('🧹 Cleared existing database records');

    await User.create({
      name: 'Admin',
      email: 'admin@surplusfood.in',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      address: 'Thakur Village, Kandivali East',
    });

    const donorData = [
      { name: 'Raj Sharma', email: 'raj@demo.com', phone: '9876543210', address: 'Thakur Village, Kandivali East' },
      { name: 'Priya Patel', email: 'priya@demo.com', phone: '9876543211', address: 'Lokhandwala, Kandivali West' },
      { name: 'Mumbai Tiffins', email: 'tiffins@demo.com', phone: '9876543212', address: 'IC Colony, Borivali West', organisationName: 'Mumbai Tiffins Caterers' },
      { name: 'Anand Bhavan', email: 'anand@demo.com', phone: '9876543213', address: 'SV Road, Borivali West', organisationName: 'Anand Bhavan Restaurant' },
      { name: 'Sunita Desai', email: 'sunita@demo.com', phone: '9876543214', address: 'Evershine Nagar, Malad West' },
      { name: 'Green Leaf Caterers', email: 'greenleaf@demo.com', phone: '9876543215', address: 'Orlem, Malad West', organisationName: 'Green Leaf Caterers' },
      { name: 'Amit Joshi', email: 'amit@demo.com', phone: '9876543216', address: 'Poisar, Kandivali West' },
      { name: 'Sai Krupa Society', email: 'saikrupa@demo.com', phone: '9876543217', address: 'Mahavir Nagar, Kandivali West', organisationName: 'Sai Krupa Housing Society' },
      { name: 'Deepak Mehta', email: 'deepak@demo.com', phone: '9876543218', address: 'Dahisar East' },
      { name: 'Taste of India', email: 'tasteofindia@demo.com', phone: '9876543219', address: 'Borivali West', organisationName: 'Taste of India Restaurant' },
    ];
    const donors = [];
    for (const d of donorData) {
      donors.push(await User.create({ ...d, password: 'password123', role: 'donor' }));
    }
    console.log('✅ Created 10 realistic Mumbai donors');

    const recData = [
      { name: 'Roti Foundation', email: 'roti@demo.com', phone: '9812345670', organisationName: 'Roti Foundation Mumbai', address: 'Borivali East' },
      { name: 'Anna Daan NGO', email: 'annadaan@demo.com', phone: '9812345671', organisationName: 'Anna Daan Charitable Trust', address: 'Kandivali East' },
      { name: 'Feed the Need', email: 'feedtheneed@demo.com', phone: '9812345672', organisationName: 'Feed the Need', address: 'Malad West' },
      { name: 'Share a Meal', email: 'shareameal@demo.com', phone: '9812345673', organisationName: 'Share a Meal Foundation', address: 'Goregaon East' },
      { name: 'Seva Kitchen', email: 'sevakitchen@demo.com', phone: '9812345674', organisationName: 'Seva Kitchen Trust', address: 'Dahisar East' },
    ];
    const receivers = [];
    for (const r of recData) {
      receivers.push(await User.create({ ...r, password: 'password123', role: 'receiver' }));
    }
    console.log('✅ Created 5 registered NGOs & community receivers');

    const foods = [
      { foodName: 'Dal Rice Combo', description: 'Freshly cooked dal with steamed rice.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '15 servings' },
      { foodName: 'Paneer Butter Masala + Roti', description: 'Rich paneer curry with butter rotis.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '10 servings' },
      { foodName: 'Chicken Biryani', description: 'Hyderabadi chicken biryani from catering event.', foodType: 'cooked', vegNonVeg: 'nonveg', quantity: '25 servings' },
      { foodName: 'Mixed Veg Pulao', description: 'Vegetable pulao with cucumber raita.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '20 servings' },
      { foodName: 'Bread & Butter Packets', description: 'Sealed bread loaves and butter packs.', foodType: 'packaged', vegNonVeg: 'veg', quantity: '30 packets' },
      { foodName: 'Fresh Fruits Basket', description: 'Bananas, apples, and seasonal oranges.', foodType: 'raw', vegNonVeg: 'veg', quantity: '10 kg' },
      { foodName: 'Cakes & Pastries', description: 'Assorted fresh pastries from bakery.', foodType: 'bakery', vegNonVeg: 'veg', quantity: '40 pieces' },
      { foodName: 'Rajma Chawal', description: 'Home-style Punjabi rajma with jeera rice.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '12 servings' },
      { foodName: 'Mumbai Vada Pav', description: 'Mumbai-style batata vada pav.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '50 pieces' },
      { foodName: 'Egg Curry + Rice', description: 'Boiled egg curry with steamed rice.', foodType: 'cooked', vegNonVeg: 'nonveg', quantity: '8 servings' },
      { foodName: 'Kanda Poha', description: 'Freshly made breakfast kanda poha.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '15 servings' },
      { foodName: 'Grain & Rice Sacks', description: 'Unopened 5kg rice bags from community drive.', foodType: 'raw', vegNonVeg: 'veg', quantity: '5 bags (25 kg)' },
      { foodName: 'Pav Bhaji Feast', description: 'Freshly prepared pav bhaji with amul butter.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '20 servings' },
      { foodName: 'Sandwich Platter', description: 'Veg grilled sandwiches from corporate lunch.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '30 pieces' },
      { foodName: 'Chole Bhature', description: 'Amritsari chole with fried bhature.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '18 servings' },
      { foodName: 'Fish Fry', description: 'Bombay-style fresh fish fry.', foodType: 'cooked', vegNonVeg: 'nonveg', quantity: '15 pieces' },
      { foodName: 'Digestive Biscuit Packs', description: 'Sealed biscuit cartons.', foodType: 'packaged', vegNonVeg: 'veg', quantity: '50 packs' },
      { foodName: 'Idli Sambar & Chutney', description: 'Steamed idlis with piping hot sambar.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '25 servings' },
      { foodName: 'Complete Veg Thali', description: 'Balanced meal with roti, dal, sabzi, rice.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '10 thalis' },
      { foodName: 'Moong Dal Khichdi', description: 'Nourishing khichdi with pure ghee.', foodType: 'cooked', vegNonVeg: 'veg', quantity: '15 servings' },
    ];

    const listings = [];
    for (let i = 0; i < 20; i++) {
      const loc = locs[i % locs.length];
      const listing = await FoodListing.create({
        donor: donors[i % donors.length]._id,
        ...foods[i],
        preparedAt: hours(-(Math.floor(Math.random() * 3) + 1)),
        expiresAt: hours(Math.floor(Math.random() * 6) + 3),
        pickupAddress: `${loc.name}, Mumbai`,
        location: { type: 'Point', coordinates: [loc.lng + jitter(), loc.lat + jitter()] },
        pickupWindowStart: hours(0),
        pickupWindowEnd: hours(4),
        safetyChecklist: { freshlyPrepared: true, storedHygienically: true, notPreviouslyServed: true },
        status: i < 16 ? 'available' : 'completed',
      });
      listings.push(listing);
    }
    console.log('✅ Created 20 food listings in Kandivali, Borivali, Malad');

    for (let i = 16; i < 20; i++) {
      await Claim.create({
        listing: listings[i]._id,
        claimedBy: receivers[i % 5]._id,
        status: 'completed',
        claimedAt: hours(-5),
        pickedUpAt: hours(-3),
        completedAt: hours(-2),
      });
    }
    console.log('✅ Created completed claims for impact counter');

    console.log('\n--- 🎉 Seed Successfully Completed ---');
    console.log('Admin:    admin@surplusfood.in / admin123');
    console.log('Donor:    raj@demo.com / password123');
    console.log('Receiver: roti@demo.com / password123\n');

    if (isStandalone) process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    if (isStandalone) process.exit(1);
    throw err;
  }
}

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
