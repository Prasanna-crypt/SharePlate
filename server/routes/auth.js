const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { registerRules, loginRules } = require('../utils/validators');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'surplus_food_default_jwt_secret_shareplate_2026';
const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', registerRules, async (req, res, next) => {
  try {
    const { name, email, password, phone, role, organisationName, address } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, role, organisationName, address });
    res.status(201).json({ token: genToken(user._id), user });
  } catch (err) { next(err); }
});

// Login
router.post('/login', loginRules, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.json({ token: genToken(user._id), user });
  } catch (err) { next(err); }
});

// Get profile
router.get('/me', auth, (req, res) => res.json(req.user));

// Update profile
router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, phone, organisationName, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, organisationName, address }, { new: true });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
