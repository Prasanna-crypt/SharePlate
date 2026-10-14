const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const FoodListing = require('./models/FoodListing');
const seedData = require('./seed');

dotenv.config();
const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Support image uploads as data URLs up to 15MB
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 500,
  message: { message: 'Too many requests' },
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Auto-expire listings every 5 mins
setInterval(async () => {
  try {
    const r = await FoodListing.updateMany(
      { status: 'available', expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    );
    if (r.modifiedCount > 0) console.log(`Auto-expired ${r.modifiedCount} listings`);
  } catch (e) {
    console.error('Auto-expire error:', e.message);
  }
}, 5 * 60 * 1000);

// Serve frontend production build if available
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // If empty database, automatically seed demo data
  try {
    const count = await FoodListing.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Seeding initial demo data for Mumbai...');
      await seedData(false);
    }
  } catch (err) {
    console.warn('Seeding check warning:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
