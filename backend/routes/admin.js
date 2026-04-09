const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const router = express.Router();

// Verify admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
};

// Get all pending doctor verifications
router.get('/doctors/pending', auth, adminOnly, async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify a doctor
router.patch('/doctors/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const { isVerified } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor verification status updated', doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete/Deactivate a doctor
router.delete('/doctors/:id', auth, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Optionally delete associated user
    await User.findByIdAndDelete(doctor.userId);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin dashboard statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Top-rated doctors
    const topDoctors = await Doctor.find({ isVerified: true })
      .sort({ rating: -1 })
      .limit(5)
      .populate('userId', 'name');

    // Specialization distribution
    const specializations = await Doctor.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        doctors: totalDoctors,
        verifiedDoctors,
        pendingDoctors
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: totalAppointments - completedAppointments - cancelledAppointments
      },
      topDoctors,
      specializations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all doctors with filters
router.get('/doctors', auth, adminOnly, async (req, res) => {
  try {
    const { specialization, verified } = req.query;

    let filter = {};
    if (specialization) filter.specialization = specialization;
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;

    let filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
