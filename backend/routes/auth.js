const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, doctorData } = req.body;

    const user = new User({ name, email, password, role, phone });
    await user.save();

    // If registering as doctor, create doctor profile
    if (role === 'doctor' && doctorData) {
      const doctor = new Doctor({
        userId: user._id,
        specialization: doctorData.specialty,
        qualifications: doctorData.qualifications ? [doctorData.qualifications] : [],
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        clinicName: doctorData.clinic?.name,
        address: doctorData.clinic?.address,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(doctorData.clinic?.longitude) || 0,
            parseFloat(doctorData.clinic?.latitude) || 0
          ]
        },
        clinic: doctorData.clinic,
        isAvailable: false,
        isVerified: false
      });
      await doctor.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If doctor, also fetch doctor profile
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      user,
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side mainly, but can invalidate token server-side if needed)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you might blacklist the token or create a logout log
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
