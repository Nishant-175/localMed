const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const router = express.Router();

// Get nearby doctors using geospatial query
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Convert radius from km to meters (MongoDB expects meters)
    const radiusInMeters = parseInt(radius) * 1000;

    const doctors = await Doctor.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('userId', 'name phone email');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctors by specialization
router.get('/specialization/:specialization', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      specialization: req.params.specialization,
      isAvailable: true,
      isVerified: true
    }).populate('userId', 'name phone email').sort({ rating: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search doctors by name or specialization
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const doctors = await Doctor.find({
      $or: [
        { specialization: { $regex: query, $options: 'i' } },
        { clinicName: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ],
      isVerified: true
    }).populate('userId', 'name phone email').sort({ rating: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor profile
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId }).populate('userId');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor dashboard data (doctor's view of appointments and slots)
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const Slot = require('../models/Slot');

    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctorId: req.params.id,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    })
      .populate('patientId', 'name phone email')
      .sort({ startTime: 1 });

    // Get available slots for today
    const todaySlots = await Slot.find({
      doctorId: req.params.id,
      date: { $gte: today, $lt: tomorrow },
      status: 'available'
    }).sort({ startTime: 1 });

    // Get stats
    const totalAppointments = await Appointment.countDocuments({
      doctorId: req.params.id,
      status: 'completed'
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctorId: req.params.id,
      status: 'pending'
    });

    res.json({
      doctor,
      todayAppointments,
      todaySlots,
      stats: {
        totalAppointments,
        pendingAppointments,
        totalReviews: doctor.totalReviews,
        rating: doctor.rating,
        currentQueueSize: doctor.currentQueueSize
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor profile (doctor only)
router.put('/:id', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const updates = req.body;
    
    // If clinic location is updated, sync to GeoJSON
    if (updates.clinic?.latitude && updates.clinic?.longitude) {
      updates.location = {
        type: 'Point',
        coordinates: [updates.clinic.longitude, updates.clinic.latitude]
      };
      updates.address = updates.clinic.address;
      updates.clinicName = updates.clinic.name;
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor availability
router.patch('/:id/availability', auth, roleCheck('doctor'), async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Availability updated', doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update verification status (admin only)
router.patch('/:id/verify', auth, async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json({ message: 'Verification status updated', doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unverified doctors (admin)
router.get('/admin/unverified', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
